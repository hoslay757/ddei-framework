import DDei from "@/components/framework/js/ddei";
import DDeiEditor from "../editor";
import DDeiEditorState from "../enums/editor-state";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:取消快捷编辑
 * 取消快捷编辑
 */
class DDeiKeyActionCancelQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    let inputEle = editor.quickEditorInput;
    inputEle.style.display = "none";
    inputEle.style.left = "0px";
    inputEle.style.top = "0px";
    inputEle.value = "";
    editor.quickEditorModel = null
    editor.changeState(DDeiEditorState.DESIGNING);
  }

}


export default DDeiKeyActionCancelQuickEdit
