import DDeiRectContainer from "../models/rect-container";
import DDeiAbstractShape from "../models/shape"

/**
 * 定义了布局管理器的接口
 * 布局管理器需要用到模型的布局数据，并根据布局修改数据
 * 布局管理器，不进行持久化，布局信息由模型的布局数据进行记录
 */
abstract class DDeiLayoutManager {

  constructor(container: DDeiAbstractShape | null = null) {
    this.container = container;
  }

  //容器
  container: DDeiAbstractShape | null
  // ============================ 方法 ===============================
  /**
  * 校验控件是否可以进入容器
  */
  abstract valid(): boolean

  /**
   * 修改模型的位置和大小
   */
  abstract changeSubModelBounds(): void

  /**
   * 验证是否可以从其他布局转换为本布局
   * @param oldLayout 旧布局
   */
  abstract canConvertLayout(oldLayout: string): boolean

  /**
   * 将其他布局转换为本布局
   * @param oldLayout 旧布局
   */
  abstract convertLayout(oldLayout: string): void

  /**
   * 是否可以自由修改控件的位置
   */
  abstract canChangePosition(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean): boolean
  /**
   * 是否可以自由修改控件的大小
   */
  abstract canChangeSize(x: number, y: number, models: DDeiAbstractShape[]): boolean

  /**
  * 是否可以自由旋转
  */
  abstract canChangeRoate(): boolean

  /**
   * 改变布局信息
   * @param x 
   * @param y 
   * @param models 
   * @param isAlt 
   */
  abstract updateLayout(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean): void;

  /**
  * 计算时拖入待确认时的显示图形的向量
  */
  calDragInPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    //获取向量
    if (this.container.layer) {
      let pvs = this.container.currentPointVectors;

      this.container.layer.dragInPoints = pvs;
    }
  }

  /**
  * 计算时拖入出确认时的显示图形的向量
  */
  calDragOutPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    if (this.container.layer) {
      let pvs = this.container.currentPointVectors;
      this.container.layer.dragOutPoints = pvs;
    }
  }

}

export default DDeiLayoutManager
