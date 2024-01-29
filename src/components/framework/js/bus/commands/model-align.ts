import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3 } from 'three';
import DDeiAbstractShape from '../../models/shape';
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
        let baseOutRect = DDeiAbstractShape.getOutRectByPV([baseModel])
        let hasChange = false;
        for (let i = 1; i < models.length; i++) {
          let model = models[i];
          let moveMatrix = null;
          //取得外接矩形
          let outRect = DDeiAbstractShape.getOutRectByPV([model])
          if (data.value == "left") {
            moveMatrix = new Matrix3(
              1, 0, baseOutRect.x - outRect.x,
              0, 1, 0,
              0, 0, 1);
          } else if (data.value == "center") {
            moveMatrix = new Matrix3(
              1, 0, baseOutRect.x + baseOutRect.width / 2 - outRect.x - outRect.width / 2,
              0, 1, 0,
              0, 0, 1);
          } else if (data.value == "right") {
            moveMatrix = new Matrix3(
              1, 0, baseOutRect.x + baseOutRect.width - outRect.x - outRect.width,
              0, 1, 0,
              0, 0, 1);
          } else if (data.value == "top") {
            moveMatrix = new Matrix3(
              1, 0, 0,
              0, 1, baseOutRect.y - outRect.y,
              0, 0, 1);
          } else if (data.value == "middle") {
            moveMatrix = new Matrix3(
              1, 0, 0,
              0, 1, baseOutRect.y + baseOutRect.height / 2 - outRect.y - outRect.height / 2,
              0, 0, 1);
          } else if (data.value == "bottom") {
            moveMatrix = new Matrix3(
              1, 0, 0,
              0, 1, baseOutRect.y + baseOutRect.height - outRect.y - outRect.height,
              0, 0, 1);
          }
          if (moveMatrix) {
            model.transVectors(moveMatrix)
            hasChange = true;
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
    return new DDeiBusCommandModelAlign({ code: DDeiEnumBusCommandType.ModelAlign, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelAlign
