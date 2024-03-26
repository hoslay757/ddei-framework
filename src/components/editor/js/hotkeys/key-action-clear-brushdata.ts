import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiEditor from "../editor";
import DDeiEditorState from "../enums/editor-state";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";

/**
 * 键行为:清除格式刷格式
 */
class DDeiKeyActionClearBrushData extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //记录当前格式信息，修改状态为刷子状态
    if (ddInstance && ddInstance.stage) {
      let stage = ddInstance.stage
      if (stage) {
        stage.brushData = null;
        ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' })
        ddInstance?.bus?.executeAll();
      }
    }
  }

}


export default DDeiKeyActionClearBrushData
