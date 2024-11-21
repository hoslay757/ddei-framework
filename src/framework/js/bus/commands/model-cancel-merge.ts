import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiEnumControlState from '../../enums/control-state';
/**
 * 取消组合控件的总线Command
 */
class DDeiBusCommandModelCancelMerge extends DDeiBusCommand {
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
    return true;
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
      //当前激活的图层
      let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      let selectedModels = layer.getSelectedModels();
      if (selectedModels.size > 0) {
        let models = Array.from(selectedModels.values());
        //添加元素到容器,并从当前layer移除元素
        let insertIndex = 0;
        models.forEach(item => {
          if (item.baseModelType == "DDeiContainer") {
            if (item.models && item.models.size > 0) {
              ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: layer, models: [item], skpiValid: true }, evt, insertIndex);
              insertIndex++
              ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeSelect, { models: [item], value: DDeiEnumControlState.DEFAULT }, evt, insertIndex);
              insertIndex++
              let models = Array.from(item.models.values());
              ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, oldContainer: item, models: models, skpiValid: true }, evt, insertIndex);
              insertIndex++
              ddInstance.bus.insert(DDeiEnumBusCommandType.ModelChangeSelect, { models: models, value: DDeiEnumControlState.SELECTED }, evt, insertIndex);
              insertIndex++
              ddInstance.bus.insert(DDeiEnumBusCommandType.StageChangeSelectModels, null, evt, insertIndex);
              insertIndex++
              ddInstance.bus.insert(DDeiEnumBusCommandType.ModelRemove, { models: [item], destroy: true }, evt, insertIndex);
              insertIndex++
            }
          }
        });

        ddInstance.bus.insert(DDeiEnumBusCommandType.ClearTemplateVars, null, evt, insertIndex);
        insertIndex++
        ddInstance.bus.insert(DDeiEnumBusCommandType.AddHistroy, null, evt, insertIndex);

        ddInstance.bus.insert(DDeiEnumBusCommandType.NodifyChange, null, evt, insertIndex);
        insertIndex++

        //渲染图形
        ddInstance.bus.insert(DDeiEnumBusCommandType.RefreshShape, null, evt, insertIndex);
        return true
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
    return new DDeiBusCommandModelCancelMerge({ code: DDeiEnumBusCommandType.ModelCancelMerge, name: "", desc: "" })
  }

}

export { DDeiBusCommandModelCancelMerge }
export default DDeiBusCommandModelCancelMerge
