import DDeiConfig from '../config';
import DDei from '../ddei';
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';
import { clone, cloneDeep } from 'lodash'
import { Matrix3, Vector3 } from 'three';

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

  //当前操作触发pass的是否发生变化
  passChange: boolean = false;

  // ============================ 方法 ===============================

  /**
   * 设置passindex
   * @param index pass值
   */
  setPassIndex(index: number) {
    if (this.passIndex != index) {
      this.passIndex = index;
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

  // /**
  //  * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
  //  * @param x0
  //  * @param y0
  //  * @param loose 宽松判定
  //  * @returns 是否在区域内
  //  */
  // isInAreaLoose(x0: number | undefined = undefined, y0: number | undefined = undefined, loose: boolean = false): boolean {
  //   if (x0 === undefined || y0 === undefined) {
  //     return false
  //   }    //遍历所有点，求得最大、最小的x、y
  //   if (this.currentOPVS?.length > 0) {
  //     let x: number = Infinity, y: number = Infinity, x1: number = 0, y1: number = 0;
  //     //找到最大、最小的x和y
  //     this.currentOPVS.forEach(p => {
  //       if (p) {
  //         x = Math.min(Math.floor(p.x), x)
  //         x1 = Math.max(Math.floor(p.x), x1)
  //         y = Math.min(Math.floor(p.y), y)
  //         y1 = Math.max(Math.floor(p.y), y1)
  //       }
  //     })
  //     return DDeiAbstractShape.isInsidePolygon(
  //       [
  //         { x: x - looseWeight, y: y - looseWeight },
  //         { x: x1 + looseWeight, y: y - looseWeight },
  //         { x: x1 + looseWeight, y: y1 + looseWeight },
  //         { x: x - looseWeight, y: y1 + looseWeight },
  //       ], { x: x0, y: y0 });
  //   }


  //   return false;
  // }

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
      if (models.length == 1) {
        pvs = cloneDeep(models[0].pvs);
        this.cpv = cloneDeep(models[0].cpv)
      } else {
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
      this.calLoosePVS();
      //设置选择器状态为选中后
      this.setState(DDeiEnumControlState.SELECTED);
    } else {
      this.resetState();
    }
  }


  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3): void {
    this.cpv.applyMatrix3(matrix);
    this.pvs.forEach(pv => {
      pv.applyMatrix3(matrix)
    });
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
      let angle = (this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
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

    //旋转并位移回去
    if (this.rotate && this.rotate != 0) {
      let angle = -(this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
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
    let pvs = this.pvs;
    let opvs = [];
    if (pvs?.length > 0) {
      opvs[1] = { x: (pvs[0].x + pvs[1].x) / 2, y: (pvs[0].y + pvs[1].y) / 2 };
      opvs[2] = { x: pvs[1].x, y: pvs[1].y };
      opvs[3] = { x: (pvs[1].x + pvs[2].x) / 2, y: (pvs[1].y + pvs[2].y) / 2 };
      opvs[4] = { x: pvs[2].x, y: pvs[2].y };
      opvs[5] = { x: (pvs[2].x + pvs[3].x) / 2, y: (pvs[2].y + pvs[3].y) / 2 };
      opvs[6] = { x: pvs[3].x, y: pvs[3].y };
      opvs[7] = { x: (pvs[0].x + pvs[3].x) / 2, y: (pvs[0].y + pvs[3].y) / 2 };
      opvs[8] = { x: pvs[0].x, y: pvs[0].y };
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
    }
  }


  /**
   * 判断是否在某个操作点上
   * @param direct 操作点下标
   * @param x 
   * @param y
   */
  isOpvOn(direct: number, x: number, y: number): boolean {
    if (this.opvs[direct]) {
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

}


export default DDeiSelector
