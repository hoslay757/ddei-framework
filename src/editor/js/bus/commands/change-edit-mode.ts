
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiActiveType from '../../enums/active-type';
import DDeiFileState from '../../enums/file-state';
import DDeiEnumBusCommandType from '@ddei-core/framework/js/enums/bus-command-type';
/**
 * 修改编辑状态总线Command
 */
class DDeiEditorCommandChangeEditMode extends DDeiBusCommand {
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
    let editor = bus.invoker;
    if (data?.mode) {
      editor.changeEditMode(data.mode);
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
    bus.insert(DDeiEnumBusCommandType.ChangeEditMode, data, evt)
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiEditorCommandChangeEditMode({ code: DDeiEditorEnumBusCommandType.ChangeEditMode, name: "", desc: "" })
  }

}
export {DDeiEditorCommandChangeEditMode }

export default DDeiEditorCommandChangeEditMode
