import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { cloneDeep } from 'lodash'
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiTable from '../../models/table';
/**
 * 多个控件对齐的总线Command
 */
class DDeiBusCommandModelAlign extends DDeiBusCommand {
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
    let stage = bus.ddInstance.stage;
    if (stage && data?.models?.length > 0 && data?.value) {
      let models = data.models;
      if (models?.length > 1) {
        let baseModel = models[0];
        let hasChange = false;
        for (let i = 1; i < models.length; i++) {
          let model = models[i];
          let x = -Infinity, y = -Infinity;
          if (data.value == "left") {
            x = baseModel.x;
          } else if (data.value == "center") {
            x = baseModel.x + baseModel.width / 2 - model.width / 2
          } else if (data.value == "right") {
            x = baseModel.x + baseModel.width - model.width
          } else if (data.value == "top") {
            y = baseModel.y;
          } else if (data.value == "middle") {
            y = baseModel.y + baseModel.height / 2 - model.height / 2
          } else if (data.value == "bottom") {
            y = baseModel.y + baseModel.height - model.height
          }
          if (model.x != x && x != -Infinity) {
            model.x = x;
            hasChange = true;
          } else if (model.y != y && y != -Infinity) {
            model.y = y;
            hasChange = true;
          }

        }

        if (hasChange) {
          bus.insert(DDeiEnumBusCommandType.AddHistroy);
        }
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
    return new DDeiBusCommandModelAlign({ code: DDeiEnumBusCommandType.ModelAlign, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelAlign
