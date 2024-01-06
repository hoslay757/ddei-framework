import DDeiEnumBusCommandType from "../../enums/bus-command-type";
import DDeiAbstractShape from "../../models/shape";
import DDeiLayoutManager from "../layout-manager";

/**
 * 组合，仅用于控件组合
 */
class DDeiLayoutManagerCompose extends DDeiLayoutManager {

  // ============================ 方法 ===============================

  /**
   * 修改模型的位置和大小
   */
  changeSubModelBounds(): void {
  }
  canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    return false;
  }

  append(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    models.forEach(item => {
      let oldContainer = item.pModel;
      let newContainer = this.container;
      if (oldContainer) {
        //将元素从旧容器移出
        oldContainer.removeModel(item);
      }
      newContainer.addModel(item);
      //绑定并初始化渲染器
      item.initRender();
    })
    return true;
  }


  /**
   * 修改布局信息
   */
  updateLayout(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): void {
  }

  canConvertLayout(oldLayout: string): boolean {
    return false;
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
    return new DDeiLayoutManagerCompose();
  }

}

export default DDeiLayoutManagerCompose
