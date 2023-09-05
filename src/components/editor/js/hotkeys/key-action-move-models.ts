import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusActionType from "@/components/framework/js/enums/bus-action-type";
import DDeiAbstractShape from "@/components/framework/js/models/shape";

/**
 * 键行为:移动模型
 * 批量移动模型
 */
class DDeiKeyActionDownMoveModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let optContainer = stageRender.currentOperateContainer;
      if (optContainer) {
        let selectedModels = optContainer.getSelectedModels();
        let moveSize = 1;
        let isShift = DDei.KEY_DOWN_STATE.get("shift");
        if (!isShift && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
          //辅助对齐线宽度
          moveSize = DDeiConfig.GLOBAL_HELP_LINE_WEIGHT;
        }
        let models = Array.from(selectedModels.values());
        let outRect = DDeiAbstractShape.getOutRect(models);
        let deltaX, deltaY
        //上
        if (evt.keyCode == 38) {
          let mod = 0;
          //如果开启辅助对齐线，则跳回到对齐线上
          if (!isShift && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
            if (outRect.y % moveSize > 0) {
              mod = moveSize - (outRect.y % moveSize);
            }
          }
          deltaY = - moveSize + mod
        }
        //下
        else if (evt.keyCode == 40) {
          let mod = 0;
          if (!isShift && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
            mod = outRect.y % moveSize;
          }
          deltaY = moveSize - mod
        }
        //左
        else if (evt.keyCode == 37) {
          let mod = 0;
          //如果开启辅助对齐线，则跳回到对齐线上
          if (!isShift && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
            if (outRect.x % moveSize > 0) {
              mod = moveSize - (outRect.x % moveSize);
            }
          }
          deltaX = - moveSize + mod
        }
        //右
        else if (evt.keyCode == 39) {
          let mod = 0;
          if (!isShift && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
            mod = outRect.x % moveSize;
          }
          deltaX = moveSize - mod
        }
        ddInstance.bus.push(DDeiEnumBusActionType.ModelChangeBounds, { models: models, deltaX: deltaX, deltaY: deltaY }, evt);
        //渲染图形
        ddInstance.bus.push(DDeiEnumBusActionType.RefreshShape, null, evt);

        ddInstance.bus.executeAll();
      }
    }
  }

}


export default DDeiKeyActionDownMoveModels
