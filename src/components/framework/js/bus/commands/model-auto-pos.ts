import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { Matrix3 } from 'three';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiAbstractShape from '../../models/shape';
/**
 * 多个控件等距离分布自动排版的总线Command
 */
class DDeiBusCommandModelAutoPos extends DDeiBusCommand {
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
        let weight = 10;
        let baseModel = models[0];
        let baseOutRect = DDeiAbstractShape.getOutRectByPV([baseModel])
        let hasChange = false;
        let startValue = -Infinity;
        for (let i = 1; i < models.length; i++) {
          let model = models[i];
          let outRect = DDeiAbstractShape.getOutRectByPV([model])
          if (data.value == 1) {
            if (startValue == -Infinity) {
              startValue = baseOutRect.x + baseOutRect.width
            }
            startValue += weight
            if (outRect.x != startValue) {
              let dx = startValue - outRect.x
              let moveMatrix = new Matrix3(
                1, 0, dx,
                0, 1, 0,
                0, 0, 1);
              model.transVectors(moveMatrix);
              hasChange = true;
            }
            startValue += outRect.width
          } else if (data.value == 2) {
            if (startValue == -Infinity) {
              startValue = baseOutRect.y + baseOutRect.height
            }
            startValue += weight
            if (outRect.y != startValue) {
              let dy = startValue - outRect.y
              let moveMatrix = new Matrix3(
                1, 0, 0,
                0, 1, dy,
                0, 0, 1);
              model.transVectors(moveMatrix);
              hasChange = true;
            }
            startValue += outRect.height
          }
        }

        if (hasChange) {
          bus.push(DDeiEnumBusCommandType.NodifyChange);
          bus.insert(DDeiEnumBusCommandType.AddHistroy);
        }
        bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
        bus.push(DDeiEnumBusCommandType.RefreshShape);
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
    return new DDeiBusCommandModelAutoPos({ code: DDeiEnumBusCommandType.ModelAutoPos, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelAutoPos
