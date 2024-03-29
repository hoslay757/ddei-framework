
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
/**
 * 修改编辑状态总线Command
 */
class DDeiCommandChangeEditMode extends DDeiBusCommand {
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
    let ddInstance = bus.ddInstance;
    if (ddInstance && data?.mode) {
      ddInstance.changeEditMode(data.mode);
    }
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
    return new DDeiCommandChangeEditMode({ code: DDeiEnumBusCommandType.ChangeEditMode, name: "", desc: "" })
  }

}


export default DDeiCommandChangeEditMode
