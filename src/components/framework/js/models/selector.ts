import DDeiConfig from '../config';
import DDei from '../ddei';
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';
import { clone, cloneDeep } from 'lodash'
import { Matrix3, Vector3 } from 'three';
import DDeiModelArrtibuteValue from './attribute/attribute-value';
import DDeiEnumOperateState from '../enums/operate-state';

/**
 * selector选择器，用来选择界面上的控件，选择器不是一个实体控件,不会被序列化
 * 选择器有两种状态一种是选择中（默认default)，一种是选择后selected
 * 选择中状态时，随鼠标的拖选而放大缩小
 * 选择后状态时，为所有选中图形的外接矩形
 * 选择器主体上是一个矩形，因此可以继承自Rectangle
 */
class DDeiSelector extends DDeiRectangle {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
    this.paddingWeight = props.paddingWeight;
    this.operateIconFill = props.operateIconFill;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiSelector {
    let shape = new DDeiSelector(json);
    return shape;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiSelector";
  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiSelector';
  // 本模型的基础图形
  baseModelType: string = 'DDeiSelector';

  //间隔宽度，根据选中单个控件、选中多个控件，间隔宽度可以有所变化
  paddingWeight: object;

  //操作区域的填充样式，根据选中和未选中状态可以有所变化
  operateIconFill: object;

  //当前操作触发pass的下标，-1为未激活，1～8按，1:中上，2右上顺时针计数，9为旋转
  passIndex: number = -1;

  //当前操作触发操作点下标
  opvsIndex: number = -1;

  //当前操作触发pass的类别，缺省空代表矩形，line代表线，不同passType下的passIndex，操作不一样
  passType: string = '';

  //当前操作触发pass的是否发生变化
  passChange: boolean = false;

  // ============================ 方法 ===============================

  /**
   * 设置passindex
   * @param index pass值
   */
  setPassIndex(passType: string, passIndex: number, opvsIndex: number) {
    if (this.passType != passType || this.passIndex != passIndex || this.opvsIndex != opvsIndex) {
      this.passIndex = passIndex;
      this.passType = passType
      this.opvsIndex = opvsIndex
      this.passChange = true;
    }
  }







  /**
   * 重制状态
   */
  resetState(x: number = -1, y: number = -1): void {
    //重置选择器状态
    this.startX = x
    this.startY = y
    this.updatePVSByRect(0, 0, 0, 0);
    this.setState(DDeiEnumControlState.DEFAULT);
  }

  /**
   * 获取当前选择器包含的模型
   * @returns 
   */
  getIncludedModels(): Map<string, DDeiAbstractShape> {
    //选中选择器区域内控件
    let rectPVS = this.pvs;
    let selectBounds = DDeiAbstractShape.pvsToOutRect(rectPVS);

    let looseWeight = 2;
    selectBounds.x -= looseWeight
    selectBounds.y -= looseWeight
    selectBounds.x1 += 2 * looseWeight
    selectBounds.y1 += 2 * looseWeight
    let models = new Map();
    this.stage.layers[this.stage.layerIndex].models.forEach((item, key) => {
      //实际区域减小一定百分比，宽松选择
      if (item.id != this.id) {
        let pvs = item.pvs;
        //在框内的向量点数量
        let inRectNum = 0;
        pvs.forEach(pv => {
          //如果控件在选择区域内，选中控件
          if (selectBounds.x <= pv.x && selectBounds.y < pv.y
            && selectBounds.x1 >= pv.x && selectBounds.y1 >= pv.y) {
            inRectNum++
          }
        });
        if (pvs.length > 3 && inRectNum >= pvs.length - 1) {
          models.set(item.id, item)
        } else if (inRectNum == pvs.length) {
          models.set(item.id, item)
        }
      }
    });
    return models;
  }

  /**
  * 获取画布缩放比率
  */
  getStageRatio(): number {
    return DDeiConfig.STAGE_RATIO
  }


  updatePVSByRect(x: number, y: number, w: number, h: number): void {
    let pvs = [];
    pvs.push(new Vector3(x, y, 1))
    pvs.push(new Vector3(x + w, y, 1))
    pvs.push(new Vector3(x + w, y + h, 1))
    pvs.push(new Vector3(x, y + h, 1))
    this.cpv = this.cpv = new Vector3(x + w / 2, y + h / 2, 1);
    this.pvs = pvs;
    this.initHPV()
    this.calRotate();
    this.calOPVS();
    this.calLoosePVS();
  }
  /**
   * 根据已选择的控件更新向量信息
   * @param pContainerModel 上层容器控件
   */
  updatePVSByModels(models: Map<string, DDeiAbstractShape> | Array<DDeiAbstractShape>): void {
    if (!models) {
      models = this.stage?.selectedModels;
    }

    if (!models) {
      let pContainerModel = this.stage.layers[this.stage.layerIndex];
      models = pContainerModel.getSelectedModels();
    }
    if (models?.size > 0 || models?.length > 0) {
      if (models.set) {
        models = Array.from(models.values());
      }
      //获取间距设定
      let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
      let paddingWeight = 0;
      if (models.length > 1) {
        paddingWeight = paddingWeightInfo.multiple;
      } else {
        paddingWeight = paddingWeightInfo.single;
      }
      //计算多个图形的顶点最大范围，根据顶点范围构建一个最大的外接矩形，规则的外接矩形，可以看作由4个顶点构成的图形
      let pvs = null;
      let exeCalLoosePVS = true
      if (models.length == 1) {

        if (models[0].baseModelType == "DDeiLine") {
          exeCalLoosePVS = false
          pvs = cloneDeep(models[0].pvs);
          this.cpv = cloneDeep(models[0].cpv)
        } else if (models[0].baseModelType == "DDeiContainer" && models[0].layout == 'compose') {

          pvs = cloneDeep(models[0].pvs)
          this.cpv = cloneDeep(models[0].cpv)
          let defineSample = DDeiUtil.getControlDefine(models[0])?.define?.sample;
          this.eqrat = models[0]?.sample?.eqrat || defineSample?.eqrat
        } else {
          pvs = DDeiUtil.pointsToZero(models[0].operatePVS, models[0].cpv, models[0].rotate)
          let oct = DDeiAbstractShape.pvsToOutRect(pvs);
          pvs = [new Vector3(oct.x, oct.y, 1), new Vector3(oct.x1, oct.y, 1), new Vector3(oct.x1, oct.y1, 1), new Vector3(oct.x, oct.y1, 1)]
          pvs = DDeiUtil.zeroToPoints(pvs, models[0].cpv, models[0].rotate)
          this.cpv = clone(models[0].cpv)
          let defineSample = DDeiUtil.getControlDefine(models[0])?.define?.sample;
          this.eqrat = models[0]?.sample?.eqrat || defineSample?.eqrat
        }
      } else {
        this.eqrat = false
        for (let i = 0; i < models.length; i++) {
          let defineSample = DDeiUtil.getControlDefine(models[i])?.define?.sample;
          if (models[i]?.sample?.eqrat || defineSample?.eqrat) {
            this.eqrat = true
            break;
          }
        }

        let outRectBounds = DDeiAbstractShape.getOutRectByPV(models);
        pvs = DDeiAbstractShape.getOutPV(models);
        let stageRatio = this.stage.getStageRatio()
        pvs[0].x -= paddingWeight * stageRatio
        pvs[0].y -= paddingWeight * stageRatio
        pvs[1].x += paddingWeight * stageRatio
        pvs[1].y -= paddingWeight * stageRatio
        pvs[2].x += paddingWeight * stageRatio
        pvs[2].y += paddingWeight * stageRatio
        pvs[3].x -= paddingWeight * stageRatio
        pvs[3].y += paddingWeight * stageRatio
        this.cpv = new Vector3(outRectBounds.x + outRectBounds.width / 2, outRectBounds.y + outRectBounds.height / 2, 1);
      }
      this.pvs = pvs;
      this.initHPV()
      this.calRotate();

      this.calOPVS();
      if (exeCalLoosePVS) {
        this.calLoosePVS();
      }
      //设置选择器状态为选中后
      this.setState(DDeiEnumControlState.SELECTED);
    } else {
      this.resetState();
    }
  }


  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean }): void {
    this.cpv.applyMatrix3(matrix);
    this.pvs.forEach(pv => {
      pv.applyMatrix3(matrix)
    });
    for (let i in this.exPvs) {
      let pv = this.exPvs[i];
      pv.applyMatrix3(matrix)
    };
    this.initHPV();
    this.calRotate()
    this.calOPVS()
    this.calLoosePVS();

  }


  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    let stageRatio = this.stage?.getStageRatio();
    //宽松判定区域的宽度
    let looseWeight = DDeiConfig.SELECTOR.OPERATE_ICON.weight / 2;
    //复制当前向量
    let tempPVS = cloneDeep(this.pvs)
    let move1Matrix = new Matrix3(
      1, 0, -this.cpv.x,
      0, 1, -this.cpv.y,
      0, 0, 1);
    tempPVS.forEach(fpv => {
      fpv.applyMatrix3(move1Matrix)
    });
    //获取旋转角度
    if (this.rotate && this.rotate != 0) {
      let angle = DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      tempPVS.forEach(fpv => {
        fpv.applyMatrix3(rotateMatrix)
      });
    }
    //计算宽、高信息，该值为不考虑缩放的大小
    this.x = tempPVS[0].x / stageRatio
    this.y = tempPVS[0].y / stageRatio
    let models = null;
    if (this.stage?.selectedModels?.size > 0) {
      models = Array.from(this.stage.selectedModels.values())
    }
    if (this.stage.render.operateState == DDeiEnumOperateState.SELECT_WORKING || !((models?.length == 1 && models[0]?.baseModelType == "DDeiLine") || tempPVS.length == 2)) {
      this.width = (tempPVS[1].x - tempPVS[0].x) / stageRatio
      this.height = (tempPVS[3].y - tempPVS[0].y) / stageRatio
      //记录缩放后的大小以及坐标
      this.essBounds = { x: tempPVS[0].x, y: tempPVS[0].y, width: tempPVS[1].x - tempPVS[0].x, height: tempPVS[3].y - tempPVS[0].y }
      this.loosePVS = []
      this.loosePVS[0] = new Vector3(tempPVS[0].x - looseWeight, tempPVS[0].y - looseWeight, 1)
      this.loosePVS[1] = new Vector3(tempPVS[0].x + (tempPVS[1].x - tempPVS[0].x) / 2 - looseWeight, tempPVS[0].y - looseWeight, 1)
      this.loosePVS[2] = new Vector3(this.loosePVS[1].x, this.loosePVS[1].y - 40, 1)
      this.loosePVS[3] = new Vector3(this.loosePVS[2].x + 2 * looseWeight, this.loosePVS[2].y, 1)
      this.loosePVS[4] = new Vector3(this.loosePVS[3].x, this.loosePVS[3].y - 40, 1)
      this.loosePVS[5] = new Vector3(tempPVS[1].x + looseWeight, tempPVS[1].y - looseWeight, 1)
      this.loosePVS[6] = new Vector3(this.loosePVS[5].x, tempPVS[2].y + looseWeight, 1)
      this.loosePVS[7] = new Vector3(tempPVS[3].x - looseWeight, this.loosePVS[6].y, 1)
    } else if ((models?.length == 1 && models[0]?.baseModelType == "DDeiLine") || tempPVS.length == 2) {
      this.width = (tempPVS[1].x - tempPVS[0].x) / stageRatio
      this.height = (tempPVS[1].y - tempPVS[0].y) / stageRatio
      //记录缩放后的大小以及坐标
      this.essBounds = { x: tempPVS[0].x, y: tempPVS[0].y, width: tempPVS[1].x - tempPVS[0].x, height: tempPVS[1].y - tempPVS[0].y }
      this.loosePVS = []
      this.loosePVS[0] = new Vector3(tempPVS[0].x - looseWeight, tempPVS[0].y - looseWeight, 1)
      this.loosePVS[1] = new Vector3(tempPVS[1].x + looseWeight, tempPVS[0].y - looseWeight, 1)
      this.loosePVS[2] = new Vector3(tempPVS[1].x + looseWeight, tempPVS[1].y + looseWeight, 1)
      this.loosePVS[3] = new Vector3(tempPVS[0].x - looseWeight, tempPVS[1].y + looseWeight, 1)


    }




    //旋转并位移回去
    if (this.rotate && this.rotate != 0) {
      let angle = -DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      this.loosePVS.forEach(fpv => {
        fpv.applyMatrix3(rotateMatrix)
      });
    }
    let move2Matrix = new Matrix3(
      1, 0, this.cpv.x,
      0, 1, this.cpv.y,
      0, 0, 1);
    this.loosePVS.forEach(fpv => {
      fpv.applyMatrix3(move2Matrix)
    });
    this.x += this.cpv.x / stageRatio
    this.y += this.cpv.y / stageRatio
    //记录缩放后的大小以及坐标
    this.essBounds.x += this.cpv.x
    this.essBounds.y += this.cpv.y
  }

  /**
   * 根据向量点计算操作图标的向量点
   */
  calOPVS(): void {
    let models = null;
    if (this.stage?.selectedModels?.size > 0) {
      models = Array.from(this.stage.selectedModels.values())
    }
    if (models?.length == 1 && models[0]?.baseModelType == "DDeiLine") {
      //计算线的操作点
      let lineModel = models[0];
      let type = DDeiModelArrtibuteValue.getAttrValueByState(lineModel, "type", true);
      let { startDX, startDY, endDX, endDY } = lineModel.render.getPointShapeSize();
      let opvs = [];
      let opvsType = [];
      //开始点
      let pvs = lineModel.pvs;
      opvs.push(pvs[0])
      opvsType.push(1);

      switch (type) {
        case 2: {
          for (let i = 1; i < pvs.length; i++) {
            let x = (pvs[i].x + pvs[i - 1].x) / 2
            let y = (pvs[i].y + pvs[i - 1].y) / 2

            opvs.push(new Vector3(x, y, 1))
            opvsType.push(3);

            if (i != pvs.length - 1) {
              opvs.push(pvs[i])
              opvsType.push(2);
            }
          }
          break;
        }
        case 3: {
          if (pvs.length >= 4) {
            //曲线
            for (let i = 4; i <= pvs.length; i += 3) {
              let i0 = i - 4;
              let i1 = i - 3;
              let i2 = i - 2;
              let i3 = i - 1;
              //输出中间控制点
              if (i0 != 0) {
                opvs.push(new Vector3(pvs[i0].x, pvs[i0].y, 1))
                opvsType.push(4);
              }
              let stratX = pvs[i0].x
              let stratY = pvs[i0].y
              let endX = pvs[i3].x
              let endY = pvs[i3].y
              if (i0 == 0) {
                stratX = pvs[i0].x + startDX
                stratY = pvs[i0].y + startDY
              }
              if (i == pvs.length) {
                endX = pvs[i3].x + endDX
                endY = pvs[i3].y + endDY
              }
              //计算三次贝赛尔曲线的落点，通过落点来操作图形
              let btx = stratX * DDeiUtil.p331t3 + DDeiUtil.p331t2t3 * pvs[i1].x + DDeiUtil.p33t21t3 * pvs[i2].x + DDeiUtil.p33t3 * endX
              let bty = stratY * DDeiUtil.p331t3 + DDeiUtil.p331t2t3 * pvs[i1].y + DDeiUtil.p33t21t3 * pvs[i2].y + DDeiUtil.p33t3 * endY
              opvs.push(new Vector3(btx, bty, 1))
              opvsType.push(4);
              btx = stratX * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].x + DDeiUtil.p66t21t3 * pvs[i2].x + DDeiUtil.p66t3 * endX
              bty = stratY * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].y + DDeiUtil.p66t21t3 * pvs[i2].y + DDeiUtil.p66t3 * endY
              opvs.push(new Vector3(btx, bty, 1))
              opvsType.push(4);

            }
          }
          break;
        }
      }
      //结束点
      opvs.push(pvs[pvs.length - 1])
      opvsType.push(1);
      this.opvs = opvs;
      this.opvsType = opvsType;
    } else {
      //计算矩形的操作点
      let pvs = this.pvs;
      let opvs = [];
      let opvsType = []
      let lockWidth = 0
      let scale = 0
      if (models?.length == 1) {
        scale = models[0]?.render?.getCachedValue("textStyle.scale");
        if (scale == 3) {
          lockWidth = models[0]?.render?.getCachedValue("textStyle.lockWidth");
        }
      }

      if (pvs?.length > 0) {
        if (scale == 3) {
          if (lockWidth == 1) {
            opvs[3] = { x: (pvs[1].x + pvs[2].x) / 2, y: (pvs[1].y + pvs[2].y) / 2 };
            opvs[7] = { x: (pvs[0].x + pvs[3].x) / 2, y: (pvs[0].y + pvs[3].y) / 2 };
          }
        } else {
          opvs[1] = { x: (pvs[0].x + pvs[1].x) / 2, y: (pvs[0].y + pvs[1].y) / 2 };
          opvs[3] = { x: (pvs[1].x + pvs[2].x) / 2, y: (pvs[1].y + pvs[2].y) / 2 };
          opvs[5] = { x: (pvs[2].x + pvs[3].x) / 2, y: (pvs[2].y + pvs[3].y) / 2 };
          opvs[7] = { x: (pvs[0].x + pvs[3].x) / 2, y: (pvs[0].y + pvs[3].y) / 2 };
          if (!this.eqrat) {
            opvs[2] = { x: pvs[1].x, y: pvs[1].y };
            opvs[4] = { x: pvs[2].x, y: pvs[2].y };
            opvs[6] = { x: pvs[3].x, y: pvs[3].y };
            opvs[8] = { x: pvs[0].x, y: pvs[0].y };
          }
        }
        let v1 = new Vector3(pvs[1].x, pvs[1].y, 1);
        let moveMatrix = new Matrix3(
          1, 0, -(pvs[0].x + pvs[1].x) / 2,
          0, 1, -(pvs[0].y + pvs[1].y) / 2,
          0, 0, 1);
        //归到原点，求夹角
        v1.applyMatrix3(moveMatrix)
        //基于构建一个向量，经过旋转90度+角度，再平移到目标位置
        let angle1 = (new Vector3(1, 0, 0).angleTo(new Vector3(v1.x, v1.y, 0)) * 180 / Math.PI).toFixed(4);

        //判断移动后的线属于第几象限
        //B.构建旋转矩阵。旋转linvV和pointV
        let angle = 0;
        if (v1.x >= 0 && v1.y >= 0) {
          angle = (angle1 * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (v1.x <= 0 && v1.y >= 0) {
          angle = (angle1 * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (v1.x <= 0 && v1.y <= 0) {
          angle = (- angle1 * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (v1.x >= 0 && v1.y <= 0) {
          angle = ((- angle1) * DDeiConfig.ROTATE_UNIT).toFixed(4);
        }
        let angleR1 = (90 * DDeiConfig.ROTATE_UNIT).toFixed(4) - angle
        v1 = new Vector3(20, 0, 1)

        let rotateMatrix = new Matrix3(
          Math.cos(angleR1), Math.sin(angleR1), 0,
          -Math.sin(angleR1), Math.cos(angleR1), 0,
          0, 0, 1);
        v1.applyMatrix3(rotateMatrix);


        let removeMatrix = new Matrix3(
          1, 0, (pvs[0].x + pvs[1].x) / 2,
          0, 1, (pvs[0].y + pvs[1].y) / 2,
          0, 0, 1);


        v1.applyMatrix3(removeMatrix);
        opvs[9] = v1;

        let v2 = new Vector3(25, 0, 1)
        let angleR2 = (135 * DDeiConfig.ROTATE_UNIT).toFixed(4) - angle
        let rotateMatrix2 = new Matrix3(
          Math.cos(angleR2), Math.sin(angleR2), 0,
          -Math.sin(angleR2), Math.cos(angleR2), 0,
          0, 0, 1);
        v2.applyMatrix3(rotateMatrix2);

        let removeMatrix2 = new Matrix3(
          1, 0, pvs[0].x,
          0, 1, pvs[0].y,
          0, 0, 1);


        v2.applyMatrix3(removeMatrix2);
        opvs[10] = v2;
        this.opvs = opvs;
        this.opvsType = opvsType
      }


    }
  }

  /**
   * 返回当前坐标是否在操作点上，并返回操作点的类型
   * @param direct 操作点下标
   * @param x 
   * @param y
   */
  isOpvOnLine(x: number, y: number): { type: number, index: number } {
    //操作图标的宽度
    let weight = DDeiConfig.SELECTOR.OPERATE_ICON.weight;
    let halfWeigth = weight * 0.5;
    for (let i = 0; i < this.opvs.length; i++) {
      let pv = this.opvs[i];
      if (DDeiAbstractShape.isInsidePolygon(
        [
          { x: pv.x - halfWeigth, y: pv.y - halfWeigth },
          { x: pv.x + halfWeigth, y: pv.y - halfWeigth },
          { x: pv.x + halfWeigth, y: pv.y + halfWeigth },
          { x: pv.x - halfWeigth, y: pv.y + halfWeigth }
        ]
        , { x: x, y: y })) {
        return { type: this.opvsType[i], index: i }
      }
    }
    return null;
  }

  /**
   * 判断是否在某个操作点上
   * @param direct 操作点下标
   * @param x 
   * @param y
   */
  isOpvOn(direct: number, x: number, y: number): boolean {
    if (this.opvs && this.opvs[direct]) {
      let pv = this.opvs[direct];
      if (pv) {
        //操作图标的宽度
        let width = DDeiConfig.SELECTOR.OPERATE_ICON.weight;
        let halfWidth = width * 0.5;
        return DDeiAbstractShape.isInsidePolygon(
          [
            { x: pv.x - halfWidth, y: pv.y - halfWidth },
            { x: pv.x + halfWidth, y: pv.y - halfWidth },
            { x: pv.x + halfWidth, y: pv.y + halfWidth },
            { x: pv.x - halfWidth, y: pv.y + halfWidth }
          ]
          , { x: x, y: y });
      }
    }
    return false;
  }

  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x
   * @param y
   * @param loose 宽松判定,默认false
   * @returns 是否在区域内
   */
  isInAreaLoose(x: number | undefined = undefined, y: number | undefined = undefined, loose: boolean = false): boolean {
    //判断当前坐标是否位于操作按钮上
    let models = null;
    if (this.stage?.selectedModels?.size > 0) {
      models = Array.from(this.stage.selectedModels.values())
    }
    if (models?.length == 1 && models[0]?.baseModelType == "DDeiLine") {
      return models[0].isInAreaLoose(x, y, loose)
    } else {
      return super.isInAreaLoose(x, y, loose)
    }
  }

}


export default DDeiSelector
