import DDeiEnumBusActionType from '../enums/bus-action-type';
import DDeiBus from './bus';
import DDeiBusAction from './bus-action';
/**
 * 修改选择器大小以及位置的的总线Action
 */
class DDeiBusActionUpdateSelectorBounds extends DDeiBusAction {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Action无需校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为，设置当前控件的选中状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    if (stage) {
      //获取当前选中控件
      //当前激活的图层
      let optContainer = stage.render.currentOperateContainer;
      let selector = stage.render.selector;;
      if (selector) {
        selector.updatedBoundsBySelectedModels(optContainer);
      }
    }
    return true;
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

}


export default DDeiBusActionUpdateSelectorBounds
