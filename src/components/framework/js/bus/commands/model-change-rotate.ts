import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
/**
 * 改变模型旋转的总线Command
 */
class DDeiBusCommandModelChangeRotate extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    if (data?.deltaX && data?.container) {
      //更改已选择控件的旋转
      let selector = bus.ddInstance.stage.render.selector;
      let movedNumber = data.deltaX;
      let pContainerModel = data.container;
      let selectedModels = pContainerModel.getSelectedModels();
      if (!selectedModels || selector.passIndex == -1 || movedNumber == 0) {
        return false;
      }
      if (selectedModels.set) {
        selectedModels = Array.from(selectedModels.values());
      }
      for (let i = 0; i < selectedModels.length; i++) {
        let parentContainer = selectedModels[i].pModel;
        if (parentContainer?.layoutManager) {
          if (!parentContainer.layoutManager.canChangeRotate()) {
            return false;
          }
        }
      }
      return true
    }
    return false;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (data?.deltaX && data?.container) {
      //更改已选择控件的旋转
      let selector = bus.ddInstance.stage.render.selector;
      let movedNumber = data.deltaX;
      let pContainerModel = data.container;
      let selectedModels = pContainerModel.getSelectedModels();

      let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
      //获取当前选择控件外接矩形
      let originRect: object = DDeiAbstractShape.getOutRectByPV(models);
      //外接矩形的中心occ
      let occ = { x: originRect.x + originRect.width * 0.5, y: originRect.y + originRect.height * 0.5 };
      //基于中心构建旋转矩阵，旋转所有向量点
      //计算旋转角度
      let rotate = movedNumber * 0.75;
      let angle = -(rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let move1Matrix = new Matrix3(
        1, 0, -occ.x,
        0, 1, -occ.y,
        0, 0, 1);
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      let move2Matrix = new Matrix3(
        1, 0, occ.x,
        0, 1, occ.y,
        0, 0, 1);
      let m1 = new Matrix3().premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix);
      //对所有选中图形进行位移并旋转
      for (let i = 0; i < models.length; i++) {
        let item = models[i]
        item.transVectors(m1)
        item.updateLinkModels();
      }
      selector.transVectors(m1)

      //同步更新上层容器其大小和坐标
      pContainerModel.changeParentsBounds()
      return true
    }
    return false;
  }

  /**
   * 后置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeRotate({ code: DDeiEnumBusCommandType.ModelChangeRotate, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeRotate
