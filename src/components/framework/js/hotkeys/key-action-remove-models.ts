import DDei from "../ddei";
import DDeiKeyAction from "./key-action";

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
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      //获取当前选择的控件
      let selectedModels = layer.getSelectedModels();
      if (layer && selectedModels.size > 0) {

        selectedModels.forEach((item, key) => {
          layer.removeModel(item);
        });
        //根据选中图形的状态更新选择器
        stageRender.selector.updatedBoundsBySelectedModels();
        //重新绘制
        stageRender.drawShape()
      }
    }
  }

}


export default DDeiKeyActionRemoveModels
