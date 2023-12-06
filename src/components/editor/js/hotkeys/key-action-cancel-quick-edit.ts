import DDei from "@/components/framework/js/ddei";
import DDeiEditor from "../editor";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";
import DDeiEditorState from "../enums/editor-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:取消快捷编辑
 * 取消快捷编辑
 */
class DDeiKeyActionCancelQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    let inputEle = editor.quickEditorInput;
    inputEle.value = "";
    ddInstance.stage.render.editorShadowControl = null;
    editor.quickEditorModel = null
    editor.changeState(DDeiEditorState.DESIGNING);
    editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
    editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
    editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, { parts: ["topmenu", "property"], });
    editor.bus.executeAll();
  }

}


export default DDeiKeyActionCancelQuickEdit
