import { MODEL_CLS } from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
/**
 * 缩放画布总线Command
 * 图形类Command一般在普通Command之后执行
 */
class DDeiBusCommandChangeStageRatio extends DDeiBusCommand {
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
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {

    let stage = bus.ddInstance.stage;
    if (stage && data.oldValue && data.newValue && data.oldValue != data.newValue) {
      let scaleSize = data.newValue / data.oldValue
      //缩放矩阵
      let scaleMatrix = new Matrix3(
        scaleSize, 0, 0,
        0, scaleSize, 0,
        0, 0, 1);

      stage.layers.forEach(layer => {
        layer.midList.forEach(mid => {
          let model = layer.models.get(mid);
          model.transVectors(scaleMatrix)
        })
      });
      let vbn = stage.wpv.y / stage.height;
      let hbn = stage.wpv.x / stage.width;
      stage.width = stage.width * scaleSize
      stage.height = stage.height * scaleSize
      //计算位置比例,保持位置比例
      stage.wpv.y = stage.height * vbn
      stage.wpv.x = stage.width * hbn



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
    bus.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt)
    bus.push(DDeiEnumBusCommandType.RefreshShape);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeStageRatio({ code: DDeiEnumBusCommandType.ChangeStageRatio, name: "", desc: "" })
  }

}


export default DDeiBusCommandChangeStageRatio
