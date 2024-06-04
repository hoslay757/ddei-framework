import DDeiLayoutManager from "../layout-manager";

/**
 * 自由布局
 */
class DDeiLayoutManagerFree extends DDeiLayoutManager {

  // ============================ 方法 ===============================

  /**
   * 修改模型的位置和大小
   */
  changeSubModelBounds(): void {

  }
  canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    //获取当前容器的上级，形成链路，直到layer
    let parentControls = this.container.getParents();
    //检测，拖入对象不能为自身容器以及自身容器子控件
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
      if(model){
        if (model.id.indexOf("_shadow") != -1) {
          let id = model.id.substring(model.id, model.id.lastIndexOf("_shadow"))
          model = this.container.stage?.getModelById(id)
        }
        if (model == this.container) {
          return false;
        } else if (parentControls.indexOf(model) != -1) {
          return false;
        }
      }
    }
    return true;
  }

  append(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    models.forEach(item => {
      if(item){
        let oldContainer = item.pModel;
        let newContainer = this.container;
        if (oldContainer) {
          //将元素从旧容器移出
          oldContainer.removeModel(item);
        }
        newContainer.addModel(item,false);
        //绑定并初始化渲染器
        item.initRender();
      }
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


export { DDeiLayoutManagerFree }

export default DDeiLayoutManagerFree
