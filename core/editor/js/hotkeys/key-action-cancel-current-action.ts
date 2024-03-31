import DDei from "@ddei-core/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEditorState from "../enums/editor-state";
import DDeiEditor from "../editor";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";

/**
 * 键行为:取消当前正在进行的动作
 * 取消当前正在进行的动作
 */
class DDeiKeyActionCancelCurrentAction extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei, editor: DDeiEditor): void {
    if (editor.state == DDeiEditorState.DESIGNING) {
      let stage = ddInstance.stage;
      let layer = stage.layers[stage?.layerIndex];
      if (layer) {
        layer.opPoints = []
        if (layer.opLine?.render) {
          layer.opLine.render.enableRefreshShape()
        }
        delete layer.opLine;
        //清空shadows
        layer.shadowControls?.forEach(c => {
          c.destroyed()
        })
        layer.shadowControls = [];
        stage.render.operateState = DDeiEnumOperateState.NONE;
        //清空临时变量
        ddInstance.bus.push(DDeiEnumBusCommandType.ClearTemplateVars, null, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt);
        //渲染图形
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        //排序并执行所有action
        ddInstance.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionCancelCurrentAction