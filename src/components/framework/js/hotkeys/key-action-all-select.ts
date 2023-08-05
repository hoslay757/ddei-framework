import DDeiKeyAction from "./key-action";

/**
 * 键行为:全选
 * 全选所有控件
 */
class DDeiKeyActionAllSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("全选");
  }

}


export default DDeiKeyActionAllSelect
