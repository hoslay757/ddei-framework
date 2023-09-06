import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 修改选择器大小以及位置的的总线Command
 */
class DDeiBusCommandUpdateSelectorBounds extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Command无需校验
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
      let optContainer = stage.render.currentOperateContainer;
      let selector = stage.render.selector;
      if (selector) {
        if (data?.operateState == DDeiEnumOperateState.SELECT_WORKING) {
          let x = selector.startX;
          let y = selector.startY;
          let width, height
          if (evt.offsetX < x) {
            width = x - evt.offsetX
            x = evt.offsetX
          } else {
            width = evt.offsetX - x
          }
          if (evt.offsetY < y) {
            height = y - evt.offsetY
            y = evt.offsetY
          } else {
            height = evt.offsetY - y
          }
          selector.setBounds(x, y, width, height);
        } else {
          selector.updatedBoundsBySelectedModels(optContainer);
        }
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

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandUpdateSelectorBounds({ code: DDeiEnumBusCommandType.UpdateSelectorBounds, name: "", desc: "" })
  }

}


export default DDeiBusCommandUpdateSelectorBounds