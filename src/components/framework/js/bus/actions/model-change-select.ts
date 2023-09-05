import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 改变模型选择状态的总线Action
 */
class DDeiBusActionModelChangeSelect extends DDeiBusAction {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Action无需校验
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
    if (data) {
      let models = data;
      let stage = bus.ddInstance.stage;
      debugger
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
    bus.insert(DDeiEnumBusActionType.StageChangeSelectModels, {}, evt, 0);
    bus.insert(DDeiEnumBusActionType.UpdateSelectorBounds, {}, evt, 1);
    return true;
  }

}


export default DDeiBusActionModelChangeSelect
