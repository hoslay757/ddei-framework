import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusActionType from "@/components/framework/js/enums/bus-action-type";

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

        ddInstance.bus.push(DDeiEnumBusActionType.ModelChangeContainer, { oldContainer: optContainer, models: Array.from(selectedModels.values()) }, evt);

        //渲染图形
        ddInstance.bus.push(DDeiEnumBusActionType.RefreshShape, null, evt);

        ddInstance.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionRemoveModels
