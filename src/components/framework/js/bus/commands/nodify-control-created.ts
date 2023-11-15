import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { debounce } from 'lodash';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiStage from '../../models/stage';
import DDeiUtil from '../../util';
import DDeiEnumOperateType from '../../enums/operate-type';
/**
 * 通知控件被创建的总线Command
 */
class DDeiBusCommandNodifyControlCreated extends DDeiBusCommand {


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
    if (data?.models) {
      //加载事件的配置
      let createAfter = DDeiUtil.getConfigValue(
        "EVENT_CONTROL_CREATE_AFTER",
        bus.ddInstance
      );
      //选中前
      if (createAfter) {
        createAfter(DDeiEnumOperateType.CREATE, data?.models, bus.ddInstance)
      }
    }
    return true
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
    return new DDeiBusCommandNodifyControlCreated({ code: DDeiEnumBusCommandType.NodifyControlCreated, name: "", desc: "" })
  }

}


export default DDeiBusCommandNodifyControlCreated
