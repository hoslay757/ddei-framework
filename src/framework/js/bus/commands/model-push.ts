import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 模型放置层级的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandModelPush extends DDeiBusCommand {
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
    if (data?.container && data?.type) {
      if (data?.type == "top" || data?.type == "bottom" || data?.type == "up" || data?.type == "down") {
        let selectedModels = data?.container.getSelectedModels();
        if (selectedModels?.size > 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let selectedModels = data?.container.getSelectedModels();
    let hasChange = false;
    if (data?.type == "top") {
      data.container.pushTop(Array.from(selectedModels.values()));
      hasChange = true
    } else if (data?.type == "bottom") {
      data.container.pushBottom(Array.from(selectedModels.values()));
      hasChange = true
    } else if (data?.type == "up") {
      data.container.pushUp(Array.from(selectedModels.values()));
      hasChange = true
    } else if (data?.type == "down") {
      data.container.pushDown(Array.from(selectedModels.values()));
      hasChange = true
    }
    if (hasChange) {
      bus.push(DDeiEnumBusCommandType.NodifyChange);
      bus.insert(DDeiEnumBusCommandType.AddHistroy, null, evt);
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
    return new DDeiBusCommandModelPush({ code: DDeiEnumBusCommandType.ModelPush, name: "", desc: "" })
  }

}

export { DDeiBusCommandModelPush }
export default DDeiBusCommandModelPush
