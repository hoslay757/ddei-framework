import DDeiConfig from "@ddei-core/framework/js/config";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";
import DDeiRectContainer from "@ddei-core/framework/js/models/rect-container";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";

/**
 * 键行为:组合
 * 组合已选择的图形，至少两个图形才可以完成组合
 */
class DDeiKeyActionCompose extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance) {
      //当前激活的图层
      ddInstance.bus.push(DDeiEnumBusCommandType.ModelMerge, null, evt);
      ddInstance.bus.executeAll();

    }
  }

}


export default DDeiKeyActionCompose
