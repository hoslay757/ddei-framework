import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusActionType from "@/components/framework/js/enums/bus-action-type";

/**
 * 键行为:全选
 * 全选所有控件
 */
class DDeiKeyActionAllSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]

      ddInstance?.bus?.push(DDeiEnumBusActionType.ModelChangeSelect, { models: layer.models, value: DDeiEnumControlState.SELECTED }, evt);
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusActionType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionAllSelect
