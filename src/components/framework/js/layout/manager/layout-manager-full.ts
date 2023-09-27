import DDeiAbstractShape from "../../models/shape";
import DDeiLayoutManager from "../layout-manager";

/**
 * 填充布局
 */
class DDeiLayoutManagerFull extends DDeiLayoutManager {

  // ============================ 方法 ===============================
  /**
  * 校验控件是否可以进入容器
  */
  valid(): boolean {
    //填充布局，只允许一个元素
    if (this.container.models.size == 0) {
      return true
    } else {
      return false
    }
  }



  /**
   * 修改模型的位置和大小
   */
  changeSubModelBounds(): void {
    if (this.container.models.size == 1) {
      let model = Array.from(this.container.models.values())[0];
      model.x = 0;
      model.y = 0;
      model.width = this.container.width
      model.height = this.container.height
      model.rotate = 0
    }
  }

  canConvertLayout(oldLayout: string): boolean {
    //填充布局，只允许一个元素
    if (this.container.models.size <= 1) {
      return true
    } else {
      return false
    }
  }

  convertLayout(oldLayout: string): void {

  }


  updateLayout(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): void {
  }

  canChangePosition(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): boolean {
    return false;
  }

  canChangeSize(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    return false;
  }

  canChangeRotate(): boolean {
    return false;
  }


  // ============================ 静态方法 ============================
  /**
   * 返回当前实例
   */
  static newInstance(model: DDeiAbstractShape): DDeiLayoutManager {
    return new DDeiLayoutManagerFull(model);
  }

}

export default DDeiLayoutManagerFull
