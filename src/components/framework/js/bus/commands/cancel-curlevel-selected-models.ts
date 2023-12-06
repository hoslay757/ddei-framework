import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 取消所有选中控件层级的总线Command
 */
class DDeiBusCommandCancelCurLevelSelectedModels extends DDeiBusCommand {
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
    let stage = bus.ddInstance.stage;
    if (stage) {
      let ignoreModels = data?.ignoreModels;
      let optContainer = data?.container;
      if (!optContainer) {
        optContainer = stage.render.currentOperateContainer;
      }
      if (optContainer) {
        if (data?.curLevel == true) {
          optContainer.cancelSelectModels(null, ignoreModels);
        } else {
          optContainer.cancelAllLevelSelectModels(ignoreModels);
        }
        return true;
      }

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
    // bus.insert(DDeiEnumBusCommandType.StageChangeSelectModels, {}, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandCancelCurLevelSelectedModels({ code: DDeiEnumBusCommandType.CancelCurLevelSelectedModels, name: "", desc: "" })
  }
}


export default DDeiBusCommandCancelCurLevelSelectedModels
