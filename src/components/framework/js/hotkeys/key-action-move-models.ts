import DDeiConfig from "../config";
import DDei from "../ddei";
import DDeiKeyAction from "./key-action";

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
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      //获取当前选择的控件
      let selectedModels = layer.getSelectedModels();
      if (layer && selectedModels.size > 0) {
        let moveSize = 1;
        if (!DDei.KEY_DOWN_STATE.get("ctrl") && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
          //辅助对齐线宽度
          moveSize = DDeiConfig.GLOBAL_HELP_LINE_WEIGHT;
        }
        selectedModels.forEach((item, key) => {
          //上
          if (evt.keyCode == 38) {
            let mod = 0;
            //如果开启辅助对齐线，则跳回到对齐线上
            if (!DDei.KEY_DOWN_STATE.get("ctrl") && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
              if (item.y % moveSize > 0) {
                mod = moveSize - (item.y % moveSize);
              }
            }
            item.setPosition(item.x, item.y - moveSize + mod)
          }
          //下
          else if (evt.keyCode == 40) {
            let mod = 0;
            if (!DDei.KEY_DOWN_STATE.get("ctrl") && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
              mod = item.y % moveSize;
            }
            item.setPosition(item.x, item.y + moveSize - mod)
          }
          //左
          else if (evt.keyCode == 37) {
            let mod = 0;
            //如果开启辅助对齐线，则跳回到对齐线上
            if (!DDei.KEY_DOWN_STATE.get("ctrl") && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
              if (item.x % moveSize > 0) {
                mod = moveSize - (item.x % moveSize);
              }
            }
            item.setPosition(item.x - moveSize + mod, item.y)
          }
          //右
          else if (evt.keyCode == 39) {
            let mod = 0;
            if (!DDei.KEY_DOWN_STATE.get("ctrl") && DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
              mod = item.x % moveSize;
            }
            item.setPosition(item.x + moveSize - mod, item.y)
          }
        });
        //根据选中图形的状态更新选择器
        stageRender.selector.updatedBoundsBySelectedModels();
        //重新绘制
        stageRender.drawShape()
      }
    }
  }

}


export default DDeiKeyActionDownMoveModels
