import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { cloneDeep } from 'lodash'
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiTable from '../../models/table';
import DDeiAbstractShape from '../../models/shape';
import DDeiRectContainer from '../../models/rect-container';
import DDeiEnumControlState from '../../enums/control-state';
import stage from '@/components/editor/configs/stage';
/**
 * 组合控件的总线Command
 */
class DDeiBusCommandModelMerge extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    let ddInstance = bus.ddInstance;
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 1) {
        return true
      }
    }
    return false;
  }

  /**
   * 具体行为,设置属性值
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let ddInstance = bus.ddInstance;
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRatio = ddInstance.stage.getStageRatio()
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 1) {
        let models = Array.from(selectedModels.values());

        //获取选中图形的外接矩形
        let outRect = DDeiAbstractShape.getOutRectByPV(models);
        //创建一个容器，添加到画布,其坐标等于外接矩形
        let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
          id: "comp_" + ddInstance.stage.idIdx,
          initCPV: {
            x: outRect.x + outRect.width / 2,
            y: outRect.y + outRect.height / 2,
            z: 1
          },
          layout: "compose",
          modelCode: "100201",
          width: outRect.width / stageRatio,
          height: outRect.height / stageRatio
        },
          {
            currentLayer: layer,
            currentStage: ddInstance.stage,
            currentContainer: layer
          });
        //下标自增1
        ddInstance.stage.idIdx++;

        ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: ddInstance.stage.layers[ddInstance.stage.layerIndex], models: [container], skipValid: true }, evt, 0);
        ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, oldContainer: layer, models: models, skipValid: true }, evt, 1);
        ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeSelect, { models: [container], value: DDeiEnumControlState.SELECTED }, evt, 2);
        ddInstance.bus.insert(DDeiEnumBusCommandType.ClearTemplateVars, null, evt, 3);
        ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
        ddInstance.bus.insert(DDeiEnumBusCommandType.AddHistroy, null, evt, 4);
        //渲染图形
        ddInstance.bus.insert(DDeiEnumBusCommandType.RefreshShape, null, evt, 5);
        return true;
      }
    }
    return false;
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelMerge({ code: DDeiEnumBusCommandType.ModelMerge, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelMerge
