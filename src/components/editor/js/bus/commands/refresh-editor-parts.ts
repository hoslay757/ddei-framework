
import type DDeiBus from '@/components/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@/components/framework/js/bus/bus-command';
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
        editor.editorViewer?.forceRefreshBottomMenu();
      }
      if (data.parts?.indexOf("openfiles") != -1) {
        editor.editorViewer?.forceRefreshOpenFilesView();
      }
      if (data.parts?.indexOf("topmenu") != -1) {
        editor.editorViewer?.forceRefreshTopMenuView();
      }
      if (data.parts?.indexOf("property") != -1) {
        editor.editorViewer?.forcePropertyView();
      }
      if (data.parts?.indexOf("toolbox") != -1) {
        editor.editorViewer?.forceToolBox();
      }

    } else {
      editor.editorViewer?.forceRefreshBottomMenu();
      editor.editorViewer?.forceRefreshOpenFilesView();
      editor.editorViewer?.forceRefreshTopMenuView();
      editor.editorViewer?.forcePropertyView();
      editor.editorViewer?.forceToolBox();

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
