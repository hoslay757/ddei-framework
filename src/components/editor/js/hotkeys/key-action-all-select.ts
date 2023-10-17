import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:全选
 * 全选所有控件
 */
class DDeiKeyActionAllSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let models = Array.from(ddInstance.stage.selectedModels?.values());
      if (models?.length == 1 && models[0].baseModelType == 'DDeiTable' && models[0].curRow != -1 && models[0].curCol != -1) {
        //选中当前表格所有单元格
        for (let i = 0; i < models[0].rows.length; i++) {
          let rowObj = models[0].rows[i];
          for (let j = 0; j < rowObj.length; j++) {
            rowObj[j].setState(DDeiEnumControlState.SELECTED)
          }
        }
      } else {
        //当前激活的图层
        let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]

        ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: layer.models, value: DDeiEnumControlState.SELECTED }, evt);
      }
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionAllSelect
