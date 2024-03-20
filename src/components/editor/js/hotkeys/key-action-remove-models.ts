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
          let models = Array.from(selectedModels.values())
          models[0].layer.opPoints = [];
          models[0].layer.opLine = null;
          optContainer.removeModels(models, true)
          optContainer.cascadeRemoveSelf()


          ddInstance.bus.push(DDeiEnumBusCommandType.UpdatePaperArea);
          ddInstance.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels);
          ddInstance.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
          ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
          ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy);
          ddInstance.bus.push(DDeiEnumBusCommandType.ChangeStageWPV, {
            dragObj: { dx: 0, dy: 0 }, x: 0, y: 0
          })
          //渲染图形
          ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);

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
