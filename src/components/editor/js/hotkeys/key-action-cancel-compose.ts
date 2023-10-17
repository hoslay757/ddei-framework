import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:取消组合
 * 取消已组合的图形，必须是容器类图形才能被取消组合
 */
class DDeiKeyActionCancelCompose extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 0) {
        let models = Array.from(selectedModels.values());
        //添加元素到容器,并从当前layer移除元素
        models.forEach(item => {
          if (item.baseModelType == "DDeiContainer") {
            if (item.models && item.models.size > 0) {
              ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: layer, models: [item] }, evt);
              ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [item], value: DDeiEnumControlState.DEFAULT }, evt);
              let models = Array.from(item.models.values());
              ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, oldContainer: item, models: models }, evt);
              ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: models, value: DDeiEnumControlState.SELECTED }, evt);
            }
          }
        });
        ddInstance.bus.push(DDeiEnumBusCommandType.ClearTemplateVars, null, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
        //渲染图形
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        ddInstance.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionCancelCompose
