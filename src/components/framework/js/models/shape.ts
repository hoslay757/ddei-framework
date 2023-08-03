import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'

/**
 * 抽象的图形类，定义了大多数图形都有的属性和方法
 */
class AbstractShape {
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

}


export default AbstractShape
