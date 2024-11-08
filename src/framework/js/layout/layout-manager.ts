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
   * 修改模型的位置和大小
   */
  abstract changeSubModelBounds(): void


  abstract transVectors(matrix):void
  
  /**
   *  根据子模型大小，修改自身大小
   */
  abstract changeParentsBounds(): void

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
  abstract canChangeRotate(): boolean

  /**
   * 改变布局信息
   * @param x 
   * @param y 
   * @param models 
   */
  abstract updateLayout(x: number, y: number, models: DDeiAbstractShape[]): void;


  /**
   * 是否允许新控件移入
   * @param x 移入的坐标
   * @param y 移入的坐标
   * @param models 移入的控件
   * @return 是否允许移入
   */
  abstract canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean;
  /**
   * 新控件移入
   * @param x 移入的坐标
   * @param y 移入的坐标
   * @param models 移入的控件
   * @return 是否成功移入
   */
  abstract append(x: number, y: number, models: DDeiAbstractShape[]): boolean;

  /**
  * 计算时拖入待确认时的显示图形的向量
  */
  calDragInPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    //获取向量
    if (this.container.layer) {
      let pvs = this.container.pvs;
      this.container.layer.dragInPoints = pvs;
    }
  }

  /**
  * 计算时拖出确认时的显示图形的向量
  */
  calDragOutPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    if (this.container.layer) {
      let pvs = this.container.pvs;
      this.container.layer.dragOutPoints = pvs;
    }
  }

  /**
     * 获取实际的内部容器控件
     * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
     */
  getAccuContainer(): DDeiAbstractShape {
    return this.container;
  }

  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainerByPos(x: number, y: number): DDeiAbstractShape {
    return this.container;
  }

  /**
   * 获取切分区域的点，超出区域的范围不会显示内容
   */
  getAreasPVS(rotated: boolean = true): object[][] {
    return [this.container.pvs];
  }

}

export { DDeiLayoutManager }
export default DDeiLayoutManager
