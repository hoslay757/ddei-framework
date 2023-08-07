import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'

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
  }
  // ============================ 静态方法 ============================
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
   * 获取一组图形模型的宽高
   * @param models
   */
  static getOutRect(models: Array<DDeiAbstractShape>): object {
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
    // 对角判断
    let modelX = this.x - looseWeight
    let modelX1 = this.x + this.width + looseWeight
    let modelY = this.y - looseWeight
    let modelY1 = this.y + this.height + looseWeight

    return modelX <= x &&
      modelY <= y &&
      modelX1 >= x &&
      modelY1 >= y

  }
  /**
   * 判断图形是否在一个区域内
   * @param area 矩形区域
   * @returns 是否在区域内
   */
  isInSelectArea(x = undefined, y = undefined, width = 0, height = 0): boolean {
    if (x === undefined || y === undefined) {
      return false
    }
    // 对角判断
    let modelX = this.x
    let modelX1 = this.x + this.width
    let modelY = this.y
    let modelY1 = this.y + this.height
    if (!width || !height) {
      return modelX <= x &&
        modelY <= y &&
        modelX1 >= x &&
        modelY1 >= y
    }
    let x1 = x + width
    let y1 = x + height
    return modelX <= x &&
      modelY <= y &&
      modelX1 <= x1 &&
      modelY1 <= y1
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
   * 获取控件坐标
   */
  getPosition() {
    return { x: this.x, y: this.y }
  }

  /**
   * 获取控件大小
   */
  getSize() {
    return { width: this.width, height: this.height }
  }

}


export default DDeiAbstractShape
