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
    // let models: DDeiAbstractShape[] = Array.from(this.container.models.values());
    // let originRect = DDeiAbstractShape.pvsToOutRect(DDeiAbstractShape.getOutPV(models))
    // originRect.cpv = { x: (originRect.x1 + originRect.x) / 2, y: (originRect.y1 + originRect.y) / 2 }
    // let newRect = DDeiAbstractShape.pvsToOutRect(DDeiAbstractShape.getOutPV([this.container]))
    // this.container.stage?.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeBounds, { models: models, selector: originRect, deltaX: newRect.x - originRect.x, deltaY: newRect.y - originRect.y, deltaWidth: newRect.width - originRect.width, deltaHeight: newRect.height - originRect.height });
    // this.container.stage?.ddInstance.bus?.executeAll();
  }
  canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean {

    //获取当前容器的上级，形成链路，直到layer
    let parentControls = this.container.getParents();
    //检测，拖入对象不能为自身容器以及自身容器子控件
    for (let i = 0; i < models.length; i++) {
      let model = models[i];
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
    return true;
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
    return false;
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
