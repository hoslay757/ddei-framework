import DDei from "@/components/framework/js/ddei";
import DDeiEditor from "../editor";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:确认快捷编辑
 * 确认快捷编辑
 */
class DDeiKeyActionEnterQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    editor.quickEditorInput?.enterValue();

  }

}


export default DDeiKeyActionEnterQuickEdit
