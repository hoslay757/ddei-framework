import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 改变模型选择状态的总线Command
 */
class DDeiBusCommandModelChangeSelect extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Command无需校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为，设置当前控件的选中状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (Array.isArray(data)) {
      let models = data;
      let stage = bus.ddInstance.stage;
      for (let i = 0; i < models.length; i++) {
        if (models[i]) {
          let newData = models[i];
          let newValue = newData.value;
          //从bus中获取实际控件
          let model = stage?.getModelById(newData.id);
          if (model) {
            if (model.state != newValue) {
              model.state = newValue;
            }
          }
        }
      }
      return true;
    } else if (typeof (data) == "object") {
      let models = data.models;
      let state = data.value;
      let stage = bus.ddInstance.stage;
      if (models) {
        models.forEach(item => {
          item.state = state;
        });
      }

      return true;
    } else {
      return false;
    }

  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    // bus.insert(DDeiEnumBusCommandType.StageChangeSelectModels, {}, evt, 0);
    bus.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, {}, evt, 1);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeSelect({ code: DDeiEnumBusCommandType.ModelChangeSelect, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeSelect
