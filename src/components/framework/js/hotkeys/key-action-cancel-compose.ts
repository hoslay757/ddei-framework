import DDeiConfig from "../config";
import DDei from "../ddei";
import DDeiEnumControlState from "../enums/control-state";
import DDeiEnumOperateState from "../enums/operate-state";
import DDeiRectContainer from "../models/rect-container";
import DDeiAbstractShape from "../models/shape";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:取消组合
 * 取消已组合的图形，必须是容器类图形才能被取消组合
 */
class DDeiKeyActionCancelCompose extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 0) {
        let models = Array.from(selectedModels.values());
        //添加元素到容器,并从当前layer移除元素
        models.forEach(item => {
          if (item.baseModelType == "DDeiContainer") {
            if (item.models && item.models.size > 0) {
              layer.removeModel(item);
              item.state = DDeiEnumControlState.DEFAULT;
              item.models.forEach((m, key) => {
                item.removeModel(m);
                layer.addModel(m);
                //修改坐标，将其移到画布
                m.x = m.x + item.x
                m.y = m.y + item.y
                DDeiConfig.bindRender(m);
                m.render.init();
                m.state = DDeiEnumControlState.SELECTED;
              });
            }
          }
        });
        stageRender.selector.updatedBoundsBySelectedModels()
        //重新绘制
        stageRender.drawShape()
      }
      stageRender.operate = DDeiEnumOperateState.NONE;
    }
  }

}


export default DDeiKeyActionCancelCompose
