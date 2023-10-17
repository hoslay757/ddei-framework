import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:撤销
 * 撤销上一步操作
 */
class DDeiKeyActionRevoke extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      console.log("撤销")
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionRevoke
