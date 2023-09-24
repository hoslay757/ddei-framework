import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'
import DDeiUtil from '../util'
import { Matrix3, Vector3 } from 'three';
import { cloneDeep } from 'lodash'
/**
 * 抽象的图形类，定义了大多数图形都有的属性和方法
 */
abstract class DDeiAbstractShape {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    //坐标与宽高，实际的图形区域，根据这四个属性用来绘制图形
    this.x = props.x ? props.x : 0
    this.y = props.y ? props.y : 0
    this.width = props.width ? props.width : 0
    this.height = props.height ? props.height : 0
    this.zIndex = props.zIndex ? props.zIndex : null
    this.rotate = props.rotate ? props.rotate : null
    this.modelCode = props.modelCode ? props.modelCode : null
    this.unicode = props.unicode ? props.unicode : DDeiUtil.getUniqueCode()
  }
  // ============================ 静态方法 ============================

  /**
   * 得到点在图形连接线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @returns 投影点的坐标
   */
  getProjPoint(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: -5, out: 15 }, direct: number = 1): { x: number, y: number } | null {
    let x0 = point.x;
    let y0 = point.y;
    //判断鼠标是否在某个控件的范围内
    if (this?.currentPointVectors?.length > 0) {
      let st, en;
      for (let j = 0; j < this.currentPointVectors.length; j++) {
        //点到直线的距离
        let plLength = Infinity;
        if (j == this.currentPointVectors.length - 1) {
          st = j;
          en = 0;
        } else {
          st = j;
          en = j + 1;
        }
        let x1 = this.currentPointVectors[st].x;
        let y1 = this.currentPointVectors[st].y;
        let x2 = this.currentPointVectors[en].x;
        let y2 = this.currentPointVectors[en].y;
        //获取控件所有向量
        if (x1 == x2 && y1 == y2) {
          plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
        } else {
          //根据向量外积计算面积
          let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
          //计算直线上两点之间的距离
          let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          plLength = s / d
        }
        let flag = false;
        //plLength > 0时，方向向外,满足内外部条件
        if (direct == 1) {
          if (plLength >= distance.in && plLength <= distance.out) {
            flag = true;
          }
        } else if (direct == 2) {
          if (plLength <= distance.in && plLength >= distance.out) {
            flag = true;
          }
        }
        //进一步判断：1.点的投影是否在线段中间，2.点的投影的坐标位置
        if (flag) {
          //A.求得线向量与直角坐标系的夹角
          let lineV = new Vector3(x2, y2, 1);
          let pointV = new Vector3(x0, y0, 1);
          let toZeroMatrix = new Matrix3(
            1, 0, -x1,
            0, 1, -y1,
            0, 0, 1);
          //归到原点，求夹角
          lineV.applyMatrix3(toZeroMatrix)
          pointV.applyMatrix3(toZeroMatrix)
          let lineAngle = (new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0)) * 180 / Math.PI).toFixed(4);
          //判断移动后的线属于第几象限
          //B.构建旋转矩阵。旋转linvV和pointV
          let angle = 0;
          if (lineV.x >= 0 && lineV.y >= 0) {
            angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x <= 0 && lineV.y >= 0) {
            angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x <= 0 && lineV.y <= 0) {
            angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x >= 0 && lineV.y <= 0) {
            angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          }
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          lineV.applyMatrix3(rotateMatrix);
          pointV.applyMatrix3(rotateMatrix);

          //C.判断两个向量的关系，pointV.x必须大于0，且小于lineV.x
          if (pointV.x >= 0 && pointV.x <= lineV.x) {
            //D.投影点=（pointV.x,0)，通过旋转+位移到达目标点
            let v1 = new Vector3(pointV.x, 0, 1);
            angle = -angle;
            let rotateMatrix = new Matrix3(
              Math.cos(angle), Math.sin(angle), 0,
              -Math.sin(angle), Math.cos(angle), 0,
              0, 0, 1);
            v1.applyMatrix3(rotateMatrix);
            let removeMatrix = new Matrix3(
              1, 0, x1,
              0, 1, y1,
              0, 0, 1);
            v1.applyMatrix3(removeMatrix);
            //返回投影点
            return v1;
          }
        }
      }
    }
    return null;
  }

  /**
    * 通过射线法判断点是否在图形内部
    * @param pps 多边形顶点 
    * @param point 测试点
    * @returns
    */
  static isInsidePolygon(polygon: object[], point: { x: number, y: number }): boolean {
    let x = point.x, y = point.y;
    let inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i].x, yi = polygon[i].y;
      var xj = polygon[j].x, yj = polygon[j].y;
      var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * 获取旋转后的点集合
   * @param model 模型
   * @param rotate 旋转角度
   * @param looseWeight 宽松判定区域
   */
  static getRotatedPoints(model: object, rotate: number = 0, looseWeight: number = 0): object[] {
    let ps = [];
    ps.push({ x: model.x - looseWeight, y: model.y - looseWeight });
    ps.push({ x: model.x + model.width + 2 * looseWeight, y: model.y - looseWeight });
    ps.push({ x: model.x + model.width + 2 * looseWeight, y: model.y + model.height + 2 * looseWeight });
    ps.push({ x: model.x - looseWeight, y: model.y + model.height + 2 * looseWeight });

    if (rotate && rotate != 0) {
      let points = [];
      let occ = { x: model.x + model.width * 0.5 + looseWeight, y: model.y + model.height * 0.5 + looseWeight }
      //按圆心进行旋转rotate度，得到绘制出来的点位
      ps.forEach(oldPoint => {
        //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置
        let newPoint = DDeiUtil.computePosition(occ, oldPoint, rotate);
        points.push(newPoint);
      })
      return points;
    } else {
      return ps;
    }

  }

  /**
     * 是否左对齐
     * 源图形的左上顶点与图形的左边线或右边线处于一个x
     * @param {*} sourceP 源图形位置 { x }
     * @param {*} distP 目标图形位置 { x, width }
     * @returns
     */
  static isLeftAlign(sourceP, distP): boolean {
    return sourceP.x === distP.x || sourceP.x === distP.x + distP.width
  }

  /**
   * 是否右对齐
   * 源图形的右上顶点与图形的左边线或右边线处于一个x
   * @param {*} sourceP 源图形位置 { x, width }
   * @param {*} distP 目标图形位置 { x, width }
   * @returns
   */
  static isRightAlign(sourceP, distP): boolean {
    return sourceP.x + sourceP.width === distP.x || sourceP.x + sourceP.width === distP.x + distP.width
  }

  /**
   * 是否顶部对齐
   * 源图形的右上顶点与图形的上边线或下边线处于一个y
   * @param {*} sourceP 源图形位置 { y }
   * @param {*} distP 目标图形位置 { y, height }
   * @returns
   */
  static isTopAlign(sourceP, distP): boolean {
    return sourceP.y === distP.y || sourceP.y === distP.y + distP.height
  }

  /**
   * 是否低部对齐
   * 源图形的右上顶点与图形的上边线或下边线处于一个y
   * @param {*} sourceP 源图形位置 { y, height }
   * @param {*} distP 目标图形位置 { y, height }
   * @returns
   */
  static isBottomAlign(sourceP, distP): boolean {
    return sourceP.y + sourceP.height === distP.y || sourceP.y + sourceP.height === distP.y + distP.height
  }

  /**
   * 水平居中对齐
   * @param {*} sourceP 源图形位置 { y, height }
   * @param {*} distP 目标图形位置 { y, height }
   * @returns true/false
   */
  static isHorizontalCenterAlign(sourceP, distP): boolean {
    return sourceP.y + sourceP.height / 2 === distP.y + distP.height / 2
  }

  /**
   * 垂直居中对齐
   * @param {*} sourceP 源图形位置 { x, width }
   * @param {*} distP 目标图形位置 { x, width }
   * @returns true/false
   */
  static isVerticalCenterAlign(sourceP, distP): boolean {
    return sourceP.x + sourceP.width / 2 === distP.x + distP.width / 2
  }

  /**
   * 获取一组图形模型的宽高
   * @param models
   */
  static getModelsPosition(...models): object {
    models = models.filter(item => !!item)
    if (!models.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    let x = Infinity
    let y = Infinity
    let width = 0
    let height = 0
    models.forEach(item => {
      x = Math.min(+item.x, x)
      y = Math.min(+item.y, y)
    })
    models.forEach(item => {
      width = Math.max(Math.floor(+item.x + +item.width - x), width)
      height = Math.max(Math.floor(+item.y + +item.height - y), height)
    })
    return { x, y, width, height, x1: x + width, y1: y + height }
  }


  /**
   * 判断一组模型的旋转值是否相等
   * @param models
   */
  static isSameRotate(models: Array<DDeiAbstractShape>): boolean {
    if (!models || models.length < 1) {
      return true;
    }
    let upValues = models[0].rotate
    if (!upValues) {
      upValues = 0;
    }
    for (let i = 1; i < models.length; i++) {
      let r = models[i].rotate;
      if (!r) {
        r = 0
      }
      if (upValues != r) {
        return false;
      }
    }
    return true;
  }


  /**
   * 获取一组图形模型的宽高
   * @param models
   */
  static getOutRect(models: Array<DDeiAbstractShape>): object {
    models = models.filter(item => !!item)
    if (!models.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    //按照rotate对图形进行旋转，求的旋转后的四个点坐标
    //遍历所有点，求得最大、最小的x、y
    let points: object[] = [];
    models.forEach(item => {
      //对当前图形，按照rotate进行旋转，求得新的四个点的位置
      let ps = item.getPoints();
      //按圆心进行旋转rotate度，得到绘制出来的点位
      if (item.rotate && item.rotate != 0) {
        //当前item的圆心
        let occ = { x: item.x + item.width * 0.5, y: item.y + item.height * 0.5 };
        ps.forEach(oldPoint => {
          //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置
          let newPoint = DDeiUtil.computePosition(occ, oldPoint, item.rotate);
          points.push(newPoint);
        })
      } else {
        points = points.concat(ps)
      }
    })
    let x: number = Infinity, y: number = Infinity, x1: number = 0, y1: number = 0;
    //找到最大、最小的x和y
    points.forEach(p => {
      x = Math.min(Math.floor(p.x), x)
      x1 = Math.max(Math.floor(p.x), x1)
      y = Math.min(Math.floor(p.y), y)
      y1 = Math.max(Math.floor(p.y), y1)
    })
    return {
      x: x, y: y, width: x1 - x, height: y1 - y, x1: x1, y1: y1
    }
  }




  /**
  * 基于向量点获取一组图形模型的宽高
  * @param models
  */
  static getOutRectByPV(models: Array<DDeiAbstractShape>): object {
    models = models.filter(item => !!item)
    if (!models.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    //按照rotate对图形进行旋转，求的旋转后的四个点坐标
    //遍历所有点，求得最大、最小的x、y
    let points: object[] = [];
    models.forEach(item => {
      let ps = null;
      //对当前图形，按照rotate进行旋转，求得新的四个点的位置
      if (item.currentPointVectors?.length > 0) {
        ps = cloneDeep(item.currentPointVectors);
      } else {
        ps = item.getPoints();
      }
      //按圆心进行旋转rotate度，得到绘制出来的点位
      points = points.concat(ps)
    })
    let x: number = Infinity, y: number = Infinity, x1: number = 0, y1: number = 0;
    //找到最大、最小的x和y
    points.forEach(p => {
      x = Math.min(Math.floor(p.x), x)
      x1 = Math.max(Math.floor(p.x), x1)
      y = Math.min(Math.floor(p.y), y)
      y1 = Math.max(Math.floor(p.y), y1)
    })
    return {
      x: x, y: y, width: x1 - x, height: y1 - y, x1: x1, y1: y1
    }
  }


  /**
  * 获取最靠外部的一组pv
  * @param models
  */
  static getOutPV(models: Array<DDeiAbstractShape>): object {
    let o = DDeiAbstractShape.getOutRectByPV(models);
    return [
      { x: o.x, y: o.y },
      { x: o.x1, y: o.y },
      { x: o.x1, y: o.y1 },
      { x: o.x, y: o.y1 },
    ]
  }



  /**
   * 获取某个容器下选中区域的所有控件,如果控件已被选中，且是一个容器，则继续向下直到最底层
   * @param area 选中区域
   * @returns 
   */
  static findBottomModelsByArea(container, x = undefined, y = undefined, width = 0, height = 0): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      for (let mg = container.midList.length - 1; mg >= 0; mg--) {
        let item = container.models.get(container.midList[mg]);
        //如果射线相交，则视为选中
        if (DDeiAbstractShape.isInsidePolygon(item.getRotatedPoints(), { x: x, y: y })) {
          //如果当前控件状态为选中，且是容器，则往下寻找控件，否则返回当前控件
          if (item.state == DDeiEnumControlState.SELECTED && item.baseModelType == "DDeiContainer") {
            let subControls = DDeiAbstractShape.findBottomModelsByArea(item, x - item.x, y - item.y, width, height);
            if (subControls && subControls.length > 0) {
              controls = controls.concat(subControls);
            } else {
              controls.push(item);
            }
          } else {
            controls.push(item);
          }
        }
      }
      // });
    }
    //TODO 对控件进行排序，按照zIndex > 添加顺序
    return controls;
  }


  /**
   * 获取某个容器下选中区域的最底层容器
   * @param area 选中区域
   * @returns 
   */
  static findBottomContainersByArea(container, x = undefined, y = undefined, width = 0, height = 0): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      for (let mg = container.midList.length - 1; mg >= 0; mg--) {
        let item = container.models.get(container.midList[mg]);
        //如果射线相交，则视为选中
        if (DDeiAbstractShape.isInsidePolygon(item.getRotatedPoints(), { x: x, y: y })) {
          //如果当前控件状态为选中，且是容器，则往下寻找控件，否则返回当前控件
          if (item.baseModelType == "DDeiContainer") {
            let subControls = DDeiAbstractShape.findBottomContainersByArea(item, x - item.x, y - item.y, width, height);
            if (subControls && subControls.length > 0) {
              controls = controls.concat(subControls);
            } else {
              controls.push(item);
            }
          }
        }
      }
    }
    return controls;
  }

  /**
   * 判断图形是否在一个区域内
   * @param area 矩形区域
   * @returns 是否在区域内
   */
  static isInArea(x: number, y: number, area: object): boolean {
    if (x === undefined || y === undefined || area === undefined) {
      return false
    }
    // 对角判断
    let modelX = area.x
    let modelX1 = area.x + area.width
    let modelY = area.y
    let modelY1 = area.y + area.height
    return modelX <= x &&
      modelY <= y &&
      modelX1 >= x &&
      modelY1 >= y
  }


  // ============================ 属性 ===============================
  id: string;
  //坐标与宽高，实际的图形区域，根据这四个属性用来绘制图形
  x: number;
  y: number;
  width: number;
  height: number;
  // 本模型的编码,用来却分modelType相同，但业务含义不同的模型
  modelCode: string;
  // 本模型的唯一名称
  modelType: string = 'AbstractShape';
  // 本模型的基础图形
  baseModelType: string = 'AbstractShape';
  // 当前控件的状态
  state: DDeiEnumControlState = DDeiEnumControlState.DEFAULT;
  // 当前模型所在的layer
  layer: DDeiLayer | null;
  // 当前模型所在的父模型
  pModel: any = null;
  // 当前模型所在的stage
  stage: DDeiStage | null;
  // 当前图形在当前图层的层次
  zIndex: number | null;
  // 旋转,0/null 不旋转，默认0
  rotate: number | null;

  //唯一表示码，运行时临时生成
  unicode: string;
  // ============================ 方法 ===============================


  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x
   * @param y
   * @param looseWeight 宽松判定的宽度，默认0
   * @returns 是否在区域内
   */
  isInAreaLoose(x: number | undefined = undefined, y: number | undefined = undefined, looseWeight: number = 0): boolean {
    if (x === undefined || y === undefined) {
      return false
    }
    let ps = this.getRotatedPoints(looseWeight);

    let mx: number = Infinity, my: number = Infinity, mx1: number = 0, my1: number = 0;
    //找到最大、最小的x和y
    ps.forEach(p => {
      if (p) {
        mx = Math.min(Math.floor(p.x), mx)
        mx1 = Math.max(Math.floor(p.x), mx1)
        my = Math.min(Math.floor(p.y), my)
        my1 = Math.max(Math.floor(p.y), my1)
      }
    })
    return DDeiAbstractShape.isInsidePolygon(
      [
        { x: mx - looseWeight, y: my - looseWeight },
        { x: mx1 + looseWeight, y: my - looseWeight },
        { x: mx1 + looseWeight, y: my1 + looseWeight },
        { x: mx - looseWeight, y: my1 + looseWeight },
      ], { x: x, y: y });
  }

  /**
   * 设置控件坐标
   * @param x 
   * @param y 
   */
  setPosition(x: number, y: number) {
    if (x !== undefined) {
      this.x = x
    }
    if (y !== undefined) {
      this.y = y
    }
  }

  /**
   * 设置大小
   * @param w
   * @param h
   */
  setSize(w: number, h: number) {
    if (w !== undefined) {
      this.width = w
    }
    if (h !== undefined) {
      this.height = h
    }
  }

  /**
   * 设置控件坐标以及位置
   * @param x 
   * @param y 
   */
  setBounds(x: number, y: number, w: number, h: number) {
    this.setPosition(x, y)
    this.setSize(w, h)
  }

  /**
   * 获取控件坐标以及位置
   */
  getBounds() {
    return {
      x: this.x, y: this.y, width: this.width, height: this.height,
      x1: this.x + this.width, y1: this.y + this.height
    }
  }

  /**
   * 获取图形上所有的点
   * @param looseWeight 宽松判定区域
   */
  getPoints(looseWeight: number = 0): object[] {
    let returnVal = []
    let bounds = this.getBounds();
    returnVal.push({ x: bounds.x - looseWeight, y: bounds.y - looseWeight });
    returnVal.push({ x: bounds.x1 + 2 * looseWeight, y: bounds.y - looseWeight });
    returnVal.push({ x: bounds.x1 + 2 * looseWeight, y: bounds.y1 + 2 * looseWeight });
    returnVal.push({ x: bounds.x - looseWeight, y: bounds.y1 + 2 * looseWeight });
    return returnVal;
  }


  /**
   * 获取当前图形的绝对旋转坐标值
   */
  getAbsRotate(): number {
    let rotate = 0;
    if (this.rotate) {
      rotate += this.rotate
    }
    if (this.pModel && this.pModel.baseModelType != "DDeiLayer") {
      rotate += this.pModel.getAbsRotate();
    }
    return rotate;
  }

  /**
   * 获取旋转后的点集合
   * @param looseWeight 宽松的判断矩阵
   */
  getRotatedPoints(looseWeight: number = 0): object[] {
    //对当前图形，按照rotate进行旋转，求得新的四个点的位置
    let ps = null;
    //对当前图形，按照rotate进行旋转，求得新的四个点的位置
    if (this.currentPointVectors?.length > 0) {
      ps = cloneDeep(this.currentPointVectors);
    } else {
      ps = this.getPoints(looseWeight);
    }
    return ps;
  }

  /**
   * 获取控件坐标
   */
  getPosition() {
    return { x: this.x, y: this.y }
  }

  /**
   * 获取绝对的控件坐标
   */
  getAbsPosition(pm): object {
    if (!pm) {
      pm = this;
    }
    let rp = pm.getPosition();
    if (!pm.pModel || pm.pModel.modelType == "DDeiLayer") {
      return rp;
    } else {
      let mp = pm.getAbsPosition(pm.pModel);
      rp.x = rp.x + mp.x
      rp.y = rp.y + mp.y
      return rp;
    }
  }


  /**
   * 获取绝对的bounds
   */
  getAbsBounds(pm): object {
    if (!pm) {
      pm = this;
    }
    let rp = pm.getBounds();
    if (!pm.pModel || pm.pModel.modelType == "DDeiLayer") {
      return rp;
    } else {
      let mp = pm.getAbsPosition(pm.pModel);
      rp.x = rp.x + mp.x
      rp.y = rp.y + mp.y
      rp.x1 = rp.x1 + mp.x
      rp.y1 = rp.y1 + mp.y
      return rp;
    }
  }

  /**
   * 计算当前图形旋转后的顶点，根据位移以及层次管理
   */
  calRotatePointVectors(): void {

    let pointVectors = [];
    let centerPointVector = null;
    let halfWidth = this.width * 0.5;
    let halfHeight = this.height * 0.5;

    if (!this.pointVectors || this.pointVectors?.length == 0) {
      let absBoundsOrigin = this.getAbsBounds();
      //顺序中心、上右下左,记录的是PC坐标
      centerPointVector = new Vector3(absBoundsOrigin.x + this.width * 0.5, absBoundsOrigin.y + this.height * 0.5, 1);
      let pv1 = new Vector3(centerPointVector.x - halfWidth, centerPointVector.y - halfHeight, 1);
      let pv2 = new Vector3(centerPointVector.x + halfWidth, centerPointVector.y - halfHeight, 1);
      let pv3 = new Vector3(centerPointVector.x + halfWidth, centerPointVector.y + halfHeight, 1);
      let pv4 = new Vector3(centerPointVector.x - halfWidth, centerPointVector.y + halfHeight, 1);

      pointVectors.push(pv1)
      pointVectors.push(pv2)
      pointVectors.push(pv3)
      pointVectors.push(pv4)
      this.pointVectors = pointVectors;
      this.centerPointVector = centerPointVector;
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

  /**
   * 获取控件大小
   */
  getSize() {
    return { width: this.width, height: this.height }
  }

  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    let skipFields = DDeiConfig.SERI_FIELDS[this.modelType]?.SKIP;
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.SKIP;
    }
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.SKIP;
    }

    let toJSONFields = DDeiConfig.SERI_FIELDS[this.modelType]?.TOJSON;
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.TOJSON;
    }
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.TOJSON;
    }

    for (let i in this) {
      if ((!skipFields || skipFields?.indexOf(i) == -1)) {
        if (toJSONFields && toJSONFields.indexOf(i) != -1 && this[i]) {
          if (Array.isArray(this[i])) {
            let array = [];
            this[i].forEach(element => {
              if (element?.toJSON) {
                array.push(element.toJSON());
              } else {
                array.push(element);
              }
            });
            json[i] = array;
          } else if (this[i].set) {
            let map = {};
            this[i].forEach((element, key) => {
              if (element?.toJSON) {
                map[key] = element.toJSON();
              } else {
                map[key] = element;
              }
            });
            json[i] = map;
          } else if (this[i].toJSON) {
            json[i] = this[i].toJSON();
          } else {
            json[i] = this[i];
          }
        } else {
          json[i] = this[i];
        }
      }
    }
    return json;
  }

}


export default DDeiAbstractShape
