import DDei from "../ddei";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:开启快捷编辑
 * 开启快捷编辑
 */
class DDeiKeyActionStartQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    console.log("开启快捷编辑");
  }

}


export default DDeiKeyActionStartQuickEdit
