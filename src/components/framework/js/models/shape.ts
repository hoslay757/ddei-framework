import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'
import DDeiUtil from '../util'

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
    this.rotate = props.rotate ? props.rotate : null;
    this.zoom = props.zoom ? props.zoom : null;
  }
  // ============================ 静态方法 ============================

  /**
    * 通过射线法判断点是否在图形内部
    * @param pps 多边形顶点 
    * @param point 测试点
    * @returns
    */
  static isInsidePolygon(polygon: object[], point: { x: number, y: number }): boolean {
    var x = point.x, y = point.y;
    var inside = false;
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

    if (rotate && rotate > 0) {
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
      if (item.rotate && item.rotate > 0) {
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
   * 获取某个容器下选中区域的所有控件,如果控件已被选中，且是一个容器，则继续向下直到最底层
   * @param area 选中区域
   * @returns 
   */
  static findBottomModelsByArea(container, x = undefined, y = undefined, width = 0, height = 0): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      container.models.forEach((item) => {
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
      });
    }
    //TODO 对控件进行排序，按照zIndex > 添加顺序
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
  // 本模型的唯一名称
  modelType: string = 'AbastractShape';
  // 本模型的基础图形
  baseModelType: string = 'AbastractShape';
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
  // 缩放,1/null，不缩放,默认1
  zoom: number;
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
    return DDeiAbstractShape.isInsidePolygon(this.getRotatedPoints(looseWeight), { x: x, y: y });
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
   * 获取旋转后的点集合
   * @param looseWeight 宽松的判断矩阵
   */
  getRotatedPoints(looseWeight: number = 0): object[] {
    //对当前图形，按照rotate进行旋转，求得新的四个点的位置
    let ps = this.getPoints(looseWeight);
    if (this.rotate && this.rotate > 0) {
      let points = [];
      //按圆心进行旋转rotate度，得到绘制出来的点位
      //当前item的圆心
      let occ = { x: this.x + this.width * 0.5, y: this.y + this.height * 0.5 };
      ps.forEach(oldPoint => {
        //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置
        let newPoint = DDeiUtil.computePosition(occ, oldPoint, this.rotate);
        points.push(newPoint);
      })
      return points;
    } else {
      return ps;
    }
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
   * 获取控件大小
   */
  getSize() {
    return { width: this.width, height: this.height }
  }

}


export default DDeiAbstractShape
