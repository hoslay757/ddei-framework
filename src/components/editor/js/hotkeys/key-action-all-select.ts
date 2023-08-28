import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:全选
 * 全选所有控件
 */
class DDeiKeyActionAllSelect extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      //全选所有图形
      layer.models.forEach(item => {
        item.state = DDeiEnumControlState.SELECTED
      });
      //根据选中图形的状态更新选择器
      stageRender.selector.updatedBoundsBySelectedModels();
      //重新绘制
      ddInstance.render.drawShape()
    }
  }

}


export default DDeiKeyActionAllSelect
