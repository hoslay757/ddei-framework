
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiUtil from '@ddei-core/framework/js/util';
import DDeiEditorUtil from '../../util/editor-util';
/**
 * 清理临时UI总线Command
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
        if (document.body.children[i].className == "ddei-combox-show-dialog") {
          dialogs.push(document.body.children[i]);
        }
      }
      dialogs.forEach(dialog => {
        dialog.style.display = "none";
      })
    }

    //清除弹框
    {
      DDeiEditorUtil.closeDialogs(["bottom-dialog", "property-dialog", "top-dialog", "toolbox-dialog"])
    }

    //清除右键弹出框
    {
      //关闭菜单
      let menuDialogId = DDeiUtil.getMenuControlId(bus.invoker);
      let menuEle = document.getElementById(menuDialogId);
      if (menuEle) {
        menuEle.style.display = "none";
      }
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
