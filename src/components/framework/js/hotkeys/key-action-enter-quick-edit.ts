import DDeiKeyAction from "./key-action";

/**
 * 键行为:确认快捷编辑
 * 确认快捷编辑
 */
class DDeiKeyActionEnterQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("确认快捷编辑");
  }

}


export default DDeiKeyActionEnterQuickEdit
