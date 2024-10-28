import DDeiAbstractShape from "../../models/shape";
import DDeiLayoutManager from "../layout-manager";
import { Matrix3, Vector3 } from 'three';
import DDeiConfig from "../../config";

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
      //基于当前容器构建缩放矩阵，将内部控件的向量，缩放到当前容器的大小，再位移到容器中心
      let m1 = new Matrix3()
      //移动到原点
      let moveZeroMatrix = new Matrix3(
        1, 0, - model.cpv.x,
        0, 1, - model.cpv.y,
        0, 0, 1);
      m1.premultiply(moveZeroMatrix)
      //旋转到0度
      if (model.rotate) {
        let angle = (model.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix)
      }
      //构建缩放矩阵
      let scaleMatrix = new Matrix3(
        this.container.width / model.width, 0, 0,
        0, this.container.height / model.height, 0,
        0, 0, 1);
      m1.premultiply(scaleMatrix)
      //旋转到回原始角度
      if (model.rotate) {
        let angle = -(model.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix)
      }
      //位移到contain点
      let moveContainerMatrix = new Matrix3(
        1, 0, this.container.cpv.x,
        0, 1, this.container.cpv.y,
        0, 0, 1);
      m1.premultiply(moveContainerMatrix)
      //应用变换
      model.transVectors(m1)

    }
  }

  transVectors(matrix): void {
    this.container.transVectors(matrix)
  }

  /**
   * 根据子模型大小，修改自身大小
   */
  changeParentsBounds(): void {

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
    if (this.container.models.size == 1) {
      oldModel = Array.from(this.container.models.values())[0];
    }
    let oldContainer = item.pModel;
    let newContainer = this.container;
    //将元素从就容器移出
    oldContainer.removeModel(item,false);
    newContainer.addModel(item,false);
    //绑定并初始化渲染器
    item.initRender();
    //如果已有控件，则交换两个控件的位置
    if (oldModel) {
      newContainer.removeModel(oldModel,false);

      //交换
      oldContainer.addModel(oldModel,false);
      //坐标为移入控件的坐标
      if (item.originCPV && item.originPVS) {
        oldModel.cpv = item.originCPV
        oldModel.pvs = item.originPVS
        let rotate = oldModel.rotate
        oldModel.initPVS();
        oldModel.setRotate(rotate)
        item.originCPV = null;
        item.originPVS = null;

      } else {
        oldModel.syncVectors(item, true)
      }
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

export { DDeiLayoutManagerFull }
export default DDeiLayoutManagerFull
