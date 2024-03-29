import DDeiConfig from "@ddei-core/framework/js/config";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";
import DDeiRectContainer from "@ddei-core/framework/js/models/rect-container";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiUtil from "@ddei-core/framework/js/util";
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
