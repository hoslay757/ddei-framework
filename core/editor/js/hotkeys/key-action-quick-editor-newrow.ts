import DDei from "@ddei-core/framework/js/ddei";
import DDeiEditor from "../editor";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:新行
 * 确认快捷编辑
 */
class DDeiKeyActionNewRowQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    editor.quickEditorInput.value += '\n'
    editor.quickEditorInput.selectionEnd = editor.quickEditorInput.value.length
  }

}


export default DDeiKeyActionNewRowQuickEdit
