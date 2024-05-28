import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 更新临时变量dragObj总线Command
 */
class DDeiBusCommandUpdateDragObj extends DDeiBusCommand {
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
    if (stage) {
      if (data?.dragObj) {
        stage.render.dragObj = data.dragObj;
      } else {
        if (data.deltaX) {
          stage.render.dragObj.x += data.deltaX;
        }
        if (data.deltaY) {
          stage.render.dragObj.y += data.deltaY;
        }
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

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandUpdateDragObj({ code: DDeiEnumBusCommandType.UpdateDragObj, name: "", desc: "" })
  }

}

export { DDeiBusCommandUpdateDragObj }
export default DDeiBusCommandUpdateDragObj
