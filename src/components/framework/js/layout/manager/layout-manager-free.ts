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

  append(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    models.forEach(item => {
      let oldContainer = item.pModel;
      let newContainer = this.container;
      //转换坐标，获取最外层的坐标
      let itemAbsPos = item.getAbsPosition();
      let itemAbsRotate = item.getAbsRotate();
      if (oldContainer) {
        //将元素从旧容器移出
        oldContainer.removeModel(item);
      }
      let loAbsPos = newContainer.getAbsPosition();
      let loAbsRotate = newContainer.getAbsRotate();
      item.setPosition(itemAbsPos.x - loAbsPos.x, itemAbsPos.y - loAbsPos.y)
      item.rotate = itemAbsRotate - loAbsRotate
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
