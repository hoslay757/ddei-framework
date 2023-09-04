import DDeiEnumBusActionType from '../enums/bus-action-type';
import DDeiEnumOperateState from '../enums/operate-state';
import DDeiBus from './bus';
import DDeiBusAction from './bus-action';
/**
 * 清空临时变量的总线Action
 */
class DDeiBusActionClearTemplateVars extends DDeiBusAction {
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
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {

    let stage = bus.ddInstance.stage;
    if (stage) {
      //当前操作控件：无
      stage.render.currentOperateShape = null;
      //当前操作状态:无
      stage.render.operateState = DDeiEnumOperateState.NONE;
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


export default DDeiBusActionClearTemplateVars
