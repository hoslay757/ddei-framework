
import type DDeiBus from '@/components/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@/components/framework/js/bus/bus-command';
/**
 * 改变光标总线Command
 */
class DDeiEditorCommandClearTemplateUI extends DDeiBusCommand {
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
    //清除最外层的combox:dialog
    {
      let dialogs = [];
      for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i].className == "ddei_combox_show_dialog") {
          dialogs.push(document.body.children[i]);
        }
      }
      dialogs.forEach(dialog => {
        dialog.style.display = "none";
      })
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
    return new DDeiEditorCommandClearTemplateUI({ code: DDeiEditorEnumBusCommandType.ClearTemplateUI, name: "", desc: "" })
  }

}


export default DDeiEditorCommandClearTemplateUI
