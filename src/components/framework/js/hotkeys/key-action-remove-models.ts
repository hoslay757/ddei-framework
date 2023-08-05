import DDeiKeyAction from "./key-action";

/**
 * 键行为:删除模型
 * 删除模型
 */
class DDeiKeyActionRemoveModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("删除模型");
  }

}


export default DDeiKeyActionRemoveModels
