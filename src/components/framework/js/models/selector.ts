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
    this.setState(DDeiEnumControlState.DEFAULT);
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
  updatedBoundsByModels(models: Map<string, DDeiAbstractShape> | Array<DDeiAbstractShape>): void {
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
      this.setState(DDeiEnumControlState.SELECTED);
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
