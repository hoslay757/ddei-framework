import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 键行为:移动到表格下一列
 */
class DDeiKeyActionTableNextCol extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let models = Array.from(ddInstance.stage.selectedModels?.values());
      if (models?.length == 1 && models[0].baseModelType == 'DDeiTable' && models[0].curRow != -1 && models[0].curCol != -1) {
        if (models[0].curCol < models[0].cols.length - 1) {
          if (models[0].tempDragCell) {
            models[0].tempDragCell.setState(DDeiEnumControlState.DEFAULT)
          }
          models[0].curCol++;
          models[0].tempDragCell = models[0].rows[models[0].curRow][models[0].curCol]
          models[0].tempDragCell.setState(DDeiEnumControlState.SELECTED)
        }
      }
      //渲染图形
      ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

      ddInstance?.bus?.executeAll();
    }
  }

}


export default DDeiKeyActionTableNextCol
