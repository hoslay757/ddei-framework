import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiLayer from "@/components/framework/js/models/layer";

/**
 * 键行为:撤销
 * 撤销上一步操作
 */
class DDeiKeyActionRevoke extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {

      let hisData = ddInstance.stage.revokeHistroyData();
      if (hisData?.data) {
        let tempData = { "currentDdInstance": ddInstance, "currentStage": ddInstance.stage }
        tempData[ddInstance.stage.id] = ddInstance.stage
        let layers = [];
        hisData.data.layers.forEach(layer => {
          let model = DDeiLayer.loadFromJSON(layer, tempData);
          layers.push(model);
        })
        ddInstance.stage.layers = layers
        ddInstance.stage.initRender();
      }
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionRevoke
