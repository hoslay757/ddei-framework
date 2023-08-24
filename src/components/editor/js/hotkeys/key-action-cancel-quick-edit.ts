import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:取消快捷编辑
 * 取消快捷编辑
 */
class DDeiKeyActionCancelQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    console.log("取消快捷编辑");
  }

}


export default DDeiKeyActionCancelQuickEdit
