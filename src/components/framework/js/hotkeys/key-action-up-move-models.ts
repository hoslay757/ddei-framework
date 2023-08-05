import DDeiKeyAction from "./key-action";

/**
 * 键行为:移动模型
 * 批量移动模型
 */
class DDeiKeyActionUpMoveModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("键盘上移");
  }

}


export default DDeiKeyActionUpMoveModels
