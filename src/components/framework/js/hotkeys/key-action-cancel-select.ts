import DDei from "../ddei";
import DDeiEnumControlState from "../enums/control-state";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:取消全选
 * 取消选择所有控件
 */
class DDeiKeyActionCancelSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      //取消选择所有图形
      layer.cancelSelectModels();
      //根据选中图形的状态更新选择器
      stageRender.selector.updatedBoundsBySelectedModels();
      //重新绘制
      stageRender.drawShape()
    }
  }

}


export default DDeiKeyActionCancelSelect
