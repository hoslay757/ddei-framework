import DDeiAbstractShape from "../../models/shape";
import DDeiLayoutManager from "../layout-manager";

/**
 * 填充布局
 */
class DDeiLayoutManagerFull extends DDeiLayoutManager {

  // ============================ 方法 ===============================

  /**
   * 修改模型的位置和大小
   */
  changeSubModelBounds(): void {
    if (this.container.models.size == 1) {
      let model = Array.from(this.container.models.values())[0];
      model.setBounds(0, 0, this.container.width, this.container.height)
      if (model.changeChildrenBounds) {
        model.changeChildrenBounds();
      }
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
    //刷新子元素位置
    this.changeSubModelBounds();
  }

  canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    if (models?.length == 1) {
      //获取当前容器的上级，形成链路，直到layer
      let parentControls = this.container.getParents();
      //检测，拖入对象不能为自身容器以及自身容器子控件
      let model = models[0];
      if (model.id.indexOf("_shadow") != -1) {
        let id = model.id.substring(model.id, model.id.lastIndexOf("_shadow"))
        model = this.container.stage?.getModelById(id)
      }
      if (model == this.container) {
        return false;
      } else if (parentControls.indexOf(model) != -1) {
        return false;
      }
      return true;
    }
    return false;
  }

  append(x: number, y: number, models: DDeiAbstractShape[]): boolean {

    let item = models[0];
    let oldModel = null;
    let itemOriginPosition = null;
    if (this.container.models.size == 1) {
      oldModel = Array.from(this.container.models.values())[0];
    }
    let oldContainer = item.pModel;
    let newContainer = this.container;
    //转换坐标，获取最外层的坐标
    let itemAbsPos = item.getAbsPosition();
    let itemAbsRotate = item.getAbsRotate();
    //将元素从就容器移出
    oldContainer.removeModel(item);
    let loAbsPos = newContainer.getAbsPosition();
    let loAbsRotate = newContainer.getAbsRotate();
    item.setPosition(itemAbsPos.x - loAbsPos.x, itemAbsPos.y - loAbsPos.y)
    item.rotate = itemAbsRotate - loAbsRotate
    newContainer.addModel(item);
    //绑定并初始化渲染器
    item.initRender();
    //如果已有控件，则交换两个控件的位置
    if (oldModel) {
      newContainer.removeModel(oldModel);
      //坐标为移入控件的坐标
      if (item.dragOriginX || item.dragOriginX == 0) {
        oldModel.setBounds(item.dragOriginX, item.dragOriginY, item.dragOriginWidth, item.dragOriginHeight);
        item.dragOriginX = null;
        item.dragOriginY = null;
        item.dragOriginWidth = null;
        item.dragOriginHeight = null;
      } else if (itemOriginPosition) {
        oldModel.setPosition(itemOriginPosition.x, itemOriginPosition.y);
      }

      //交换
      oldContainer.addModel(oldModel);
      //绑定并初始化渲染器
      oldModel.initRender();
      let oldAbsPos = oldContainer.getAbsPosition();
      oldContainer.layoutManager?.updateLayout(oldAbsPos.x, oldAbsPos.y, [oldModel]);
    }
    return true;
  }

  canChangePosition(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): boolean {
    if (isAlt) {
      return true;
    }
    return false
  }

  canChangeSize(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    return false;
  }

  canChangeRotate(): boolean {
    return true;
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
