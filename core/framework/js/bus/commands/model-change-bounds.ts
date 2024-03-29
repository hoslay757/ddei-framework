import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import { cloneDeep, clone } from 'lodash'
import DDeiUtil from '../../util';
import DDeiEnumOperateType from '../../enums/operate-type';
/**
 * 改变模型坐标以及大小的总线Command
 */
class DDeiBusCommandModelChangeBounds extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }


  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (data?.models?.length > 0) {
      let mouseOpSPI = DDeiUtil.getConfigValue(
        "EVENT_MOUSE_OPERATING",
        bus.ddInstance
      );
      if (mouseOpSPI) {
        mouseOpSPI("CHANGE_BOUNDS", data.models, bus.ddInstance, evt);
      }
      DDeiAbstractShape.changeModelBoundByRect(data.models, data.selector, data)
      return true;
    }
    return false;

  }
  /**
   * 后置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    //更新选择器
    let stage = bus.ddInstance.stage;
    bus?.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, { models: stage?.layers[stage?.layerIndex]?.shadowControls }, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeBounds({ code: DDeiEnumBusCommandType.ModelChangeBounds, name: "", desc: "" })
  }
}


export default DDeiBusCommandModelChangeBounds
