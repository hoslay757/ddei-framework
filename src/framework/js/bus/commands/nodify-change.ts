
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
/**
 * 用于通知变化的总线Command
 * 在变化后发出通知，让外部拦截器捕获
 */
class DDeiCommandChangeNodifyChange extends DDeiBusCommand {
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
    return true;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;

  }

  /**
   * 后置行为，分发
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
    return new DDeiCommandChangeNodifyChange({ code: DDeiEnumBusCommandType.NodifyChange, name: "", desc: "" })
  }

}

export { DDeiCommandChangeNodifyChange }
export default DDeiCommandChangeNodifyChange
