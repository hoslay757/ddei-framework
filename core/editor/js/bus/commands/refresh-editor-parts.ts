
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
/**
 * 刷新编辑器各个部件总线Command
 */
class DDeiEditorCommandRefreshEditorParts extends DDeiBusCommand {
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
    if (data?.parts?.length > 0) {
      if (data.parts?.indexOf("bottommenu") != -1) {
        editor.layoutViewer?.forceRefreshBottomMenu();
      }
      if (data.parts?.indexOf("openfiles") != -1) {
        editor.layoutViewer?.forceRefreshOpenFilesView();
      }
      if (data.parts?.indexOf("topmenu") != -1) {
        editor.layoutViewer?.forceRefreshTopMenuView();
      }
      if (data.parts?.indexOf("property") != -1) {
        editor.layoutViewer?.forcePropertyView();
      }
      if (data.parts?.indexOf("toolbox") != -1) {
        editor.layoutViewer?.forceToolBox();
      }

    } else {
      editor.layoutViewer?.forceRefreshBottomMenu();
      editor.layoutViewer?.forceRefreshOpenFilesView();
      editor.layoutViewer?.forceRefreshTopMenuView();
      editor.layoutViewer?.forcePropertyView();
      editor.layoutViewer?.forceToolBox();

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
    return new DDeiEditorCommandRefreshEditorParts({ code: DDeiEditorEnumBusCommandType.RefreshEditorParts, name: "", desc: "" })
  }

}


export default DDeiEditorCommandRefreshEditorParts
