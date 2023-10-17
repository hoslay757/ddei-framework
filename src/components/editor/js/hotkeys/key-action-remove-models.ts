import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

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

        ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: optContainer, models: Array.from(selectedModels.values()) }, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
        //渲染图形
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

        ddInstance.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionRemoveModels
