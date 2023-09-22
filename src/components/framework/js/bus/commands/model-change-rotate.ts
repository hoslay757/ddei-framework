import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
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


      //计算旋转角度
      let angle = movedNumber * 0.5;
      let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
      //对所有选中图形进行位移并旋转
      for (let i = 0; i < models.length; i++) {
        let item = models[i]
        item.rotate = item.rotate + angle
      }

      selector.rotate = selector.rotate + angle

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
    //更新选择器
    bus?.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt);
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
