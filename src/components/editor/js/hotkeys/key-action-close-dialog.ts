import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiRectContainer from "@/components/framework/js/models/rect-container";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditorUtil from "../util/editor-util";

/**
 * 键行为:关闭弹出框
 * 关闭已打开的的弹出框
 */
class DDeiKeyActionCloseDialog extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    DDeiEditorUtil.closeDialogs(["bottom-dialog", "property-dialog", "top-dialog", "toolbox-dialog"])
  }

}


export default DDeiKeyActionCloseDialog
