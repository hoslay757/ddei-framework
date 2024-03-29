import DDei from "@ddei-core/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEditorState from "../enums/editor-state";
import DDeiEditor from "../editor";

/**
 * 键行为:取消控件创建
 * 取消控件创建
 */
class DDeiKeyActionCancelControlCreate extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei, editor: DDeiEditor): void {
    if (editor.state == DDeiEditorState.CONTROL_CREATING) {
      if (editor.creatingControls) {
        let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
        //从layer中移除控件
        layer.removeModels(editor.creatingControls);
        editor.creatingControls = null
        layer.opPoints = [];
        if (layer.opLine?.render) {
          layer.opLine.render.enableRefreshShape()
        }
        delete layer.opLine;
        //清除临时变量
        editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
        //渲染图形
        editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        editor.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionCancelControlCreate
