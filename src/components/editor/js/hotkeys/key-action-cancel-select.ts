import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusActionType from "@/components/framework/js/enums/bus-action-type";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";

/**
 * 键行为:取消全选
 * 取消选择所有控件
 */
class DDeiKeyActionCancelSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]

      ddInstance?.bus?.push(DDeiEnumBusActionType.CancelCurLevelSelectedModels, { container: layer, curLevel: true }, evt);
      ddInstance?.bus?.push(DDeiEnumBusActionType.UpdateSelectorBounds, null, evt);
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusActionType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionCancelSelect
