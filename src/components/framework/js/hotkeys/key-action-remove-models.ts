import DDeiConfig from "../config";
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
      let optContainer = stageRender.currentOperateContainer;
      if (optContainer) {
        let selectedModels = optContainer.getSelectedModels();
        selectedModels.forEach((item, key) => {
          optContainer.removeModel(item);
        });
        //检查老容器中是否只有一个元素，如果有，则将其移动到上层容器，并销毁老容器
        if (optContainer.baseModelType != 'DDeiLayer' && optContainer.models.size == 1) {
          let onlyModel = Array.from(optContainer.models.values())[0];
          let itemAbsPos = onlyModel.getAbsPosition();
          let itemAbsRotate = onlyModel.getAbsRotate();
          let loAbsPos = optContainer.pModel.getAbsPosition()
          let loAbsRotate = optContainer.pModel.getAbsRotate()
          onlyModel.x = itemAbsPos.x - loAbsPos.x
          onlyModel.y = itemAbsPos.y - loAbsPos.y
          onlyModel.rotate = itemAbsRotate - loAbsRotate
          optContainer.removeModel(onlyModel);
          optContainer.pModel.addModel(onlyModel);
          //绑定并初始化渲染器
          DDeiConfig.bindRender(onlyModel);
          onlyModel.render.init();
        }
        //TODO 将来考虑手工创建的容器和组合后产生的容器，组合后的容器才销毁，手工的容器不销毁
        if (optContainer.baseModelType != 'DDeiLayer' && optContainer.models.size == 0) {
          let pModel = optContainer.pModel;
          pModel.removeModel(optContainer);
          pModel.changeParentsBounds();
          //根据选中图形的状态更新选择器
          stageRender.selector.updatedBoundsBySelectedModels(pModel);
        } else {
          //更新老容器大小
          optContainer.changeParentsBounds();
          //根据选中图形的状态更新选择器
          stageRender.selector.updatedBoundsBySelectedModels(optContainer);
        }


        //重新绘制
        stageRender.drawShape()
      }
    }
  }

}


export default DDeiKeyActionRemoveModels
