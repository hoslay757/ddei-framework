import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 模型放置层级的总线Action
 * 图形类action一般在普通action之后执行
 */
class DDeiBusActionModelPush extends DDeiBusAction {
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
    if (data?.container && data?.type) {
      if (data?.type == "top" || data?.type == "bottom" || data?.type == "up" || data?.type == "down") {
        let selectedModels = data?.container.getSelectedModels();
        if (selectedModels?.size > 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let selectedModels = data?.container.getSelectedModels();
    if (data?.type == "top") {
      data.container.pushTop(Array.from(selectedModels.values()));
    } else if (data?.type == "bottom") {
      data.container.pushBottom(Array.from(selectedModels.values()));
    } else if (data?.type == "up") {
      data.container.pushUp(Array.from(selectedModels.values()));
    } else if (data?.type == "down") {
      data.container.pushDown(Array.from(selectedModels.values()));
    }
    return true;
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

}


export default DDeiBusActionModelPush
