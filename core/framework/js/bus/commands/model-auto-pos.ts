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
      let filtedModels = []
      models.forEach(m => {
        if (m.baseModelType != 'DDeiLine') {
          filtedModels.push(m)
        }
      });
      if (filtedModels?.length > 1) {
        let weight = 0;
        let hasChange = false;
        let startValue = -Infinity;
        let ourRects = []
        for (let i = 0; i < filtedModels.length; i++) {
          let model = filtedModels[i]
          let outRect = DDeiAbstractShape.getOutRectByPV([model])
          outRect.model = model
          ourRects.push(outRect)
        }
        if (data.value == 1) {
          // 内部控件排序,按照X排序
          ourRects.sort((m1, m2) => {
            return m1.model.x - m2.model.x
          })
        } else if (data.value == 2) {
          // 内部控件排序,按照Y排序
          ourRects.sort((m1, m2) => {
            return m1.model.y - m2.model.y
          })
        }

        let sumWeight = 0
        for (let i = 0; i < ourRects.length - 1; i++) {
          let m1 = ourRects[i]
          let m2 = ourRects[i + 1]
          if (data.value == 1) {
            sumWeight += m2.x - (m1.x + m1.width)
          } else if (data.value == 2) {
            sumWeight += m2.y - (m1.y + m1.height)
          }
        }
        weight = sumWeight / (ourRects.length - 1)
        for (let i = 1; i < ourRects.length; i++) {
          let outRect = ourRects[i]
          let model = outRect.model;
          if (data.value == 1) {
            if (startValue == -Infinity) {
              startValue = ourRects[0].x1
            }
            startValue += weight
            if (outRect.x != startValue) {
              let dx = startValue - outRect.x
              let moveMatrix = new Matrix3(
                1, 0, dx,
                0, 1, 0,
                0, 0, 1);
              model.transVectors(moveMatrix);
              model.updateLinkModels();
              hasChange = true;
            }
            startValue += outRect.width
          } else if (data.value == 2) {
            if (startValue == -Infinity) {
              startValue = ourRects[0].y1
            }
            startValue += weight
            if (outRect.y != startValue) {
              let dy = startValue - outRect.y
              let moveMatrix = new Matrix3(
                1, 0, 0,
                0, 1, dy,
                0, 0, 1);
              model.transVectors(moveMatrix);
              model.updateLinkModels();
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
