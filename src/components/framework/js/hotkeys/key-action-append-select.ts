import DDeiKeyAction from "./key-action";

/**
 * 键行为:追加选择
 * 追加选择的控件
 */
class DDeiKeyActionAppendSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event): void {
    console.log("追加选择");
  }

}


export default DDeiKeyActionAppendSelect
