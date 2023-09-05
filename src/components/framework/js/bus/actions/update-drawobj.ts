import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 更新临时变量dragObj总线Action
 */
class DDeiBusActionUpdateDragObj extends DDeiBusAction {
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

    let stage = bus.ddInstance.stage;
    if (stage && stage.render.dragObj) {
      if (data.deltaX) {
        stage.render.dragObj.x += data.deltaX;
      }
      if (data.deltaY) {
        stage.render.dragObj.y += data.deltaY;
      }

    }
    return true;

  }

  /**
   * 后置行为，分发
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

}


export default DDeiBusActionUpdateDragObj
