import DDeiLayoutManager from "../layout-manager";

/**
 * 自由布局
 */
class DDeiLayoutManagerFree extends DDeiLayoutManager {

  // ============================ 方法 ===============================
  /**
  * 校验控件是否可以进入容器
  */
  valid(): boolean {
    return true;
  }

  /**
   * 修改模型的位置和大小
   */
  changeSubModelBounds(): void {

  }

  /**
   * 修改布局信息
   */
  updateLayout(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): void {
  }

  canConvertLayout(oldLayout: string): boolean {
    return true;
  }

  convertLayout(oldLayout: string): void {

  }

  canChangePosition(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): boolean {
    return true;
  }

  canChangeSize(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    return true;
  }

  canChangeRotate(): boolean {
    return true;
  }




  // ============================ 静态方法 ============================
  /**
   * 返回当前实例
   */
  static newInstance(model: DDeiAbstractShape): DDeiLayoutManager {
    return new DDeiLayoutManagerFree();
  }

}

export default DDeiLayoutManagerFree
