import DDeiConfig from '../config';
import DDei from '../ddei';
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';
import _, { cloneDeep } from 'lodash'
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
   * 计算移动后的坐标
   * @param dx x的增量
   * @param dy y的增量
   * @param er 是否等比
   */
  getMovedBounds(dx: number, dy: number, er: boolean = false): object {
    if (!dx && !dy) {
      return null;
    }
    let returnBounds = { x: this.x, y: this.y, width: this.width, height: this.height }

    switch (this.passIndex) {
      //上中
      case 1: {
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        if (er) {
          returnBounds.x = returnBounds.x + dy * 0.5
          returnBounds.width = returnBounds.width - dy
        }
        break;
      }
      //上右
      case 2: {
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        returnBounds.width = returnBounds.width + dx
        break;
      }
      //中右
      case 3: {
        returnBounds.width = returnBounds.width + dx
        if (er) {
          returnBounds.y = returnBounds.y - dx * 0.5
          returnBounds.height = returnBounds.height + dx
        }
        break;
      }
      //下右
      case 4: {
        returnBounds.width = returnBounds.width + dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //下中
      case 5: {
        returnBounds.height = returnBounds.height + dy
        if (er) {
          returnBounds.x = returnBounds.x - dy * 0.5
          returnBounds.width = returnBounds.width + dy
        }
        break;
      }
      //下左
      case 6: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //中左
      case 7: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        if (er) {
          returnBounds.y = returnBounds.y + dx * 0.5
          returnBounds.height = returnBounds.height - dx
        }
        break;
      }
      //上左
      case 8: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        break;
      }
      default: {
        break;
      }
    }
    return returnBounds;
  }


  /**
   * 根据移动后的坐标，调整选中控件的旋转角度
   * @param movedNumber 
   */
  changeSelectedModelRotate(movedNumber: number = 0) {
    return false;
    //计算上级控件的大小
    let pContainerModel = this.stage.render.currentOperateContainer;
    if (!pContainerModel) {
      pContainerModel = this.stage.layers[this.stage.layerIndex];
    }
    let selectedModels = pContainerModel.getSelectedModels();

    if (!selectedModels || this.passIndex == -1 || movedNumber == 0) {
      return false;
    }
    //更新旋转器角度
    if (!this.rotate) {
      this.rotate = 0;
      this.originX = this.x;
      this.originY = this.y;
    }
    //计算旋转角度
    let angle = movedNumber * 0.5;
    let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
    //获取当前选择控件外接矩形
    let originRect: object = DDeiAbstractShape.getOutRect(models);
    //外接矩形的圆心x0和y0
    let occ = { x: originRect.x + originRect.width * 0.5, y: originRect.y + originRect.height * 0.5 };
    //对所有选中图形进行位移并旋转
    for (let i = 0; i < models.length; i++) {
      let item = models[i]
      if (!item.rotate) {
        item.rotate = 0;
        item.originX = item.x;
        item.originY = item.y;
      }
      //当前图形的圆心x1和y1
      let rcc = { x: item.x + item.width * 0.5, y: item.y + item.height * 0.5 };
      //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置，坐标系为笛卡尔坐标系，计算机中y要反转计算
      let dcc = DDeiUtil.computePosition(occ, rcc, angle);
      //修改坐标与旋转角度
      item.setPosition(dcc.x - item.width * 0.5, dcc.y - item.height * 0.5)
      item.rotate = item.rotate + angle
      if (item.rotate >= 360 || item.rotate <= -360) {
        item.rotate = null
        item.x = item.originX;
        item.y = item.originY;
      }
    }

    this.rotate = this.rotate + angle
    if (this.rotate >= 360 || this.rotate <= -360) {
      this.rotate = 0
      this.x = this.originX;
      this.y = this.originY;
    }
  }
  /**
   * 根据移动后的选择器，等比缩放图形
   * @return 是否成功改变，校验失败则会终止改变
   */
  changeSelectedModelBounds(pContainerModel: DDeiAbstractShape, movedBounds: object): boolean {
    return false;
    if (!pContainerModel) {
      pContainerModel = this.stage.layers[this.stage.layerIndex];;
    }
    let selectedModels = pContainerModel.getSelectedModels();
    if (!selectedModels || this.passIndex == -1 || !movedBounds) {
      return false;
    }
    let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
    //原始路径,绝对坐标
    let originRect: object = null;
    // if (this.rotate != 0) {
    originRect = this.getAbsBounds();
    let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
    let paddingWeight = 0;
    if (selectedModels.size > 1) {
      paddingWeight = paddingWeightInfo.multiple;
    } else {
      paddingWeight = paddingWeightInfo.single;
    }
    originRect.x = originRect.x + paddingWeight;
    originRect.y = originRect.y + paddingWeight;
    originRect.width = originRect.width - 2 * paddingWeight;
    originRect.height = originRect.height - 2 * paddingWeight;
    // } else {
    //   originRect = DDeiAbstractShape.getOutRect(models);
    // }

    //容器所在的坐标，容器内元素加上容器坐标才是绝对坐标，绝对坐标剪去容器坐标才是相对坐标
    let cx = 0;
    let cy = 0;
    if (pContainerModel.baseModelType == "DDeiContainer") {
      let cAbsBound = pContainerModel.getAbsBounds();
      cx = cAbsBound.x;
      cy = cAbsBound.y;
    }
    //记录每一个图形在原始矩形中的比例
    let originPosMap: Map<string, object> = new Map();
    //获取模型在原始模型中的位置比例
    for (let i = 0; i < models.length; i++) {
      let item = models[i]

      originPosMap.set(item.id, {
        xR: ((item.x + cx - originRect.x) / originRect.width),
        yR: ((item.y + cy - originRect.y) / originRect.height),
        wR: (item.width / originRect.width),
        hR: (item.height / originRect.height)
      });
    }

    //考虑paddingWeight，计算实际移动后的区域
    movedBounds.y = movedBounds.y + paddingWeight
    movedBounds.height = movedBounds.height - 2 * paddingWeight
    movedBounds.x = movedBounds.x + paddingWeight
    movedBounds.width = movedBounds.width - 2 * paddingWeight
    //校验，如果拖拽后图形消失不见，则停止拖拽
    if (this.passIndex == -1 || movedBounds.height <= paddingWeight || movedBounds.width <= paddingWeight) {
      return false
    }


    //同步多个模型到等比缩放状态
    //TODO 未来考虑精度问题
    selectedModels.forEach((item, key) => {
      let originBound = { x: item.x, y: item.y, width: item.width, height: item.height };
      item.x = Math.floor(movedBounds.x - cx + movedBounds.width * originPosMap.get(item.id).xR)
      item.width = Math.floor(movedBounds.width * originPosMap.get(item.id).wR)
      item.y = Math.floor(movedBounds.y - cy + movedBounds.height * originPosMap.get(item.id).yR)
      item.height = Math.floor(movedBounds.height * originPosMap.get(item.id).hR)

      //如果当前模型是容器，则按照容器比例更新子元素的大小
      if (item.baseModelType == "DDeiContainer") {
        let changedBound = { x: item.x, y: item.y, width: item.width, height: item.height };
        item.changeChildrenBounds(originBound, changedBound)
        item.changeParentsBounds();
      };

      //pContainerModel修改上层容器直至layer的大小
      pContainerModel.changeParentsBounds()
    })

    return true;
  }
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
    this.x = x
    this.y = y
    this.width = 0
    this.height = 0
    this.rotate = 0
    this.state = DDeiEnumControlState.DEFAULT;
  }

  /**
   * 获取当前选择器包含的模型
   * @returns 
   */
  getIncludedModels(): Map<string, DDeiAbstractShape> {
    //选中选择器区域内控件
    let selectBounds = this.getBounds();
    let models = new Map();
    this.stage.layers[this.stage.layerIndex].models.forEach((item, key) => {
      //实际区域减小一定百分比，宽松选择
      let curModel = item;
      if (curModel.id != this.id) {
        let x = curModel.x + curModel.width * 0.1;
        let y = curModel.y + curModel.height * 0.1;
        let x1 = curModel.x + curModel.width * 0.9;
        let y1 = curModel.y + curModel.height * 0.9;
        //如果控件在选择区域内，选中控件
        if (selectBounds.x <= x && selectBounds.y < y
          && selectBounds.x1 >= x1 && selectBounds.y1 >= y1) {
          models.set(curModel.id, curModel);
        }
      }
    });
    return models;
  }

  /**
   * 获取旋转后的点集合
   * @param looseWeight 宽松的判断矩阵
   */
  getRotatedPoints(looseWeight: number = 0): object[] {
    let ps = null;
    if (this.currentPointVectors?.length > 0) {
      ps = [this.currentPointVectors[0], this.currentOPVS[9], this.currentPointVectors[1], this.currentPointVectors[2], this.currentPointVectors[3]]
    }
    return ps;
  }

  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x0
   * @param y0
   * @param looseWeight 宽松判定的宽度，默认0
   * @returns 是否在区域内
   */
  isInAreaLoose(x0: number | undefined = undefined, y0: number | undefined = undefined, looseWeight: number = 0): boolean {
    if (x0 === undefined || y0 === undefined) {
      return false
    }    //遍历所有点，求得最大、最小的x、y
    if (this.currentOPVS?.length > 0) {
      let x: number = Infinity, y: number = Infinity, x1: number = 0, y1: number = 0;
      //找到最大、最小的x和y
      this.currentOPVS.forEach(p => {
        if (p) {
          x = Math.min(Math.floor(p.x), x)
          x1 = Math.max(Math.floor(p.x), x1)
          y = Math.min(Math.floor(p.y), y)
          y1 = Math.max(Math.floor(p.y), y1)
        }
      })
      return DDeiAbstractShape.isInsidePolygon(
        [
          { x: x - looseWeight, y: y - looseWeight },
          { x: x1 + looseWeight, y: y - looseWeight },
          { x: x1 + looseWeight, y: y1 + looseWeight },
          { x: x - looseWeight, y: y1 + looseWeight },
        ], { x: x0, y: y0 });
    }


    return false;
  }

  /**
   * 根据已选择的控件更新坐标和状态
   * @param pContainerModel 上层容器控件
   */
  updatedBoundsBySelectedModels(pContainerModel: DDeiAbstractShape): void {
    if (!pContainerModel) {
      pContainerModel = this.stage.layers[this.stage.layerIndex];
    }
    let selectedModels = pContainerModel.getSelectedModels();
    if (selectedModels && selectedModels.size > 0) {
      let models = Array.from(selectedModels.values());
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
      if (models.length == 1 && models[0].currentPointVectors?.length > 0) {
        pvs = cloneDeep(models[0].currentPointVectors);
        this.centerPointVector = models[0].centerPointVector
        this.setBounds(models[0].x, models[0].y, models[0].width, models[0].height);
        this.rotate = models[0].getAbsRotate();
      } else {
        let outRectBounds = DDeiAbstractShape.getOutRectByPV(models);
        pvs = DDeiAbstractShape.getOutPV(models);
        let paddingWeight = 0;
        let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
        if (models.length > 1) {
          paddingWeight = paddingWeightInfo.multiple;
        } else {
          paddingWeight = paddingWeightInfo.single;
        }
        pvs[0].x -= paddingWeight
        pvs[0].y -= paddingWeight
        pvs[1].x += paddingWeight
        pvs[1].y -= paddingWeight
        pvs[2].x += paddingWeight
        pvs[2].y += paddingWeight
        pvs[3].x -= paddingWeight
        pvs[3].y += paddingWeight
        this.centerPointVector = { x: outRectBounds.x + outRectBounds.width / 2, y: outRectBounds.y + outRectBounds.height / 2, z: 1 };
        this.setBounds(outRectBounds.x - paddingWeight, outRectBounds.y - paddingWeight, outRectBounds.width + 2 * paddingWeight, outRectBounds.height + 2 * paddingWeight);
        this.rotate = 0;
      }

      this.currentPointVectors = pvs;
      this.calRotateOperateVectors();



      //设置选择器状态为选中后
      this.state = DDeiEnumControlState.SELECTED;
    } else {
      this.resetState();
    }
  }


  /**
   * 计算当前图形旋转后的顶点，根据位移以及层次管理
   */
  calRotatePointVectors(): void {

    let pointVectors = [];
    let centerPointVector = this.centerPointVector;
    let halfWidth = this.width * 0.5;
    let halfHeight = this.height * 0.5;

    if (!this.pointVectors || this.pointVectors?.length == 0) {
      //顺序中心、上右下左,记录的是PC坐标
      let pv1 = new Vector3(centerPointVector.x - halfWidth, centerPointVector.y - halfHeight, 1);
      let pv2 = new Vector3(centerPointVector.x + halfWidth, centerPointVector.y - halfHeight, 1);
      let pv3 = new Vector3(centerPointVector.x + halfWidth, centerPointVector.y + halfHeight, 1);
      let pv4 = new Vector3(centerPointVector.x - halfWidth, centerPointVector.y + halfHeight, 1);

      pointVectors.push(pv1)
      pointVectors.push(pv2)
      pointVectors.push(pv3)
      pointVectors.push(pv4)
      this.pointVectors = pointVectors;
    }
    pointVectors = this.pointVectors;
    centerPointVector = this.centerPointVector;

    //执行旋转
    //合并旋转矩阵
    let moveMatrix = new Matrix3(
      1, 0, -centerPointVector.x,
      0, 1, -centerPointVector.y,
      0, 0, 1);
    let angle = -(this.rotate ? this.rotate : 0) * DDeiConfig.ROTATE_UNIT
    let rotateMatrix = new Matrix3(
      Math.cos(angle), Math.sin(angle), 0,
      -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 1);
    let removeMatrix = new Matrix3(
      1, 0, centerPointVector.x,
      0, 1, centerPointVector.y,
      0, 0, 1);
    let m1 = new Matrix3().premultiply(moveMatrix).premultiply(rotateMatrix).premultiply(removeMatrix);
    this.rotateMatrix = m1;
    pointVectors.forEach(pv => {
      pv.applyMatrix3(m1);
    });
  }


  calRotateOperateVectors(): void {
    let pvs = this.currentPointVectors;
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
      angle = (90 * DDeiConfig.ROTATE_UNIT).toFixed(4) - angle
      v1 = new Vector3(20, 0, 1)

      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      v1.applyMatrix3(rotateMatrix);
      let removeMatrix = new Matrix3(
        1, 0, (pvs[0].x + pvs[1].x) / 2,
        0, 1, (pvs[0].y + pvs[1].y) / 2,
        0, 0, 1);
      v1.applyMatrix3(removeMatrix);
      opvs[9] = v1;
      this.currentOPVS = opvs;
    }
  }

}


export default DDeiSelector
