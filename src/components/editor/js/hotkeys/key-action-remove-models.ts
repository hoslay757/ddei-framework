import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiUtil from "@/components/framework/js/util";
import DDeiEnumOperateType from "@/components/framework/js/enums/operate-type";

/**
 * 键行为:删除模型
 * 删除模型
 */
class DDeiKeyActionRemoveModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      let optContainer = stageRender.currentOperateContainer;
      if (optContainer) {
        let selectedModels = optContainer.getSelectedModels();
        //加载事件的配置
        let removeBefore = DDeiUtil.getConfigValue(
          "EVENT_CONTROL_DEL_BEFORE",
          ddInstance
        );

        if (!removeBefore || removeBefore(DDeiEnumOperateType.DEL, Array.from(selectedModels.values()), null, ddInstance, evt)) {
          optContainer.removeModels(Array.from(selectedModels.values()), true)
          ddInstance.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels);
          ddInstance.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt);
          ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
          ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
          //渲染图形
          ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

          ddInstance.bus.executeAll();
          //加载事件的配置
          let removeAfter = DDeiUtil.getConfigValue(
            "EVENT_CONTROL_DEL_AFTER",
            ddInstance
          );
          if (removeAfter) {
            removeAfter(DDeiEnumOperateType.DEL, Array.from(selectedModels.values()), null, ddInstance, evt)
          }
        }
      }
    }
  }

}


export default DDeiKeyActionRemoveModels
