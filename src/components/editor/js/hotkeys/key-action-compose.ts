import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiRectContainer from "@/components/framework/js/models/rect-container";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:组合
 * 组合已选择的图形，至少两个图形才可以完成组合
 */
class DDeiKeyActionCompose extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 1) {
        let models = Array.from(selectedModels.values());

        //获取选中图形的外接矩形
        let outRect = DDeiAbstractShape.getOutRect(models);
        //创建一个容器，添加到画布,其坐标等于外接矩形
        let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: outRect.x,
          y: outRect.y,
          modelCode: "100201",
          width: outRect.width,
          height: outRect.height,
          linkChild: true,
          linkSelf: true
        });
        //下标自增1
        ddInstance.stage.idIdx++;

        ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: ddInstance.stage.layers[ddInstance.stage.layerIndex], models: [container] }, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, oldContainer: layer, models: models }, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [container], value: DDeiEnumControlState.SELECTED }, evt);
        ddInstance.bus.push(DDeiEnumBusCommandType.ClearTemplateVars, null, evt);
        //渲染图形
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        ddInstance.bus.executeAll();
      } else {
        console.warn("组合操作至少需要两个图形")
      }
    }
  }

}


export default DDeiKeyActionCompose
