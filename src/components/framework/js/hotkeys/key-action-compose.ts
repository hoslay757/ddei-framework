import DDeiConfig from "../config";
import DDei from "../ddei";
import DDeiEnumControlState from "../enums/control-state";
import DDeiEnumOperateState from "../enums/operate-state";
import DDeiRectContainer from "../models/rect-container";
import DDeiAbstractShape from "../models/shape";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:组合
 * 组合已选择的图形，至少两个图形才可以完成组合
 */
class DDeiKeyActionCompose extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 1) {
        let models = Array.from(selectedModels.values());

        //获取选中图形的外接矩形
        let outRect = DDeiAbstractShape.getOutRect(models);
        //创建一个容器，添加到画布,其坐标等于外接矩形
        //创建一个矩形
        let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: outRect.x,
          y: outRect.y,
          width: outRect.width,
          height: outRect.height,
          linkChild: true,
          linkSelf: true
        });
        container.state = DDeiEnumControlState.SELECTED;
        //下标自增1
        ddInstance.stage.idIdx++;
        //添加模型到图层
        ddInstance.stage.addModel(container);
        //绑定并初始化渲染器
        DDeiConfig.bindRender(container);
        container.render.init();
        //添加元素到容器,并从当前layer移除元素
        models.forEach(item => {
          layer.removeModel(item);
          container.addModel(item);
          //修改item的坐标，将其移动到容器里面
          item.x = item.x - container.x
          item.y = item.y - container.y
          DDeiConfig.bindRender(item);
          item.render.init();
          item.state = DDeiEnumControlState.DEFAULT;
        });
        stageRender.selector.updatedBoundsBySelectedModels()
        //重新绘制
        stageRender.drawShape()
      } else {
        console.warn("组合操作至少需要两个图形")
      }
      stageRender.operate = DDeiEnumOperateState.NONE;
    }
  }

}


export default DDeiKeyActionCompose
