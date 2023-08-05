import DDeiKeyAction from "./key-action";

/**
 * 键行为:移动模型
 * 批量移动模型
 */
class DDeiKeyActionLeftMoveModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("键盘左移");
  }

}


export default DDeiKeyActionLeftMoveModels
