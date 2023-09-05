import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumState from '../../enums/ddei-state';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 改变光标总线Action
 */
class DDeiBusActionChangeCursor extends DDeiBusAction {
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
    if (data?.passIndex || data?.cursor) {
      if (data.cursor) {
        document.body.style.cursor = data.cursor;
      } else if (data.passIndex) {
        if (bus.ddInstance.state != DDeiEnumState.IN_ACTIVITY) {
          switch (data.passIndex) {
            case 1:
              document.body.style.cursor = 'ns-resize';
              break;
            case 2:
              document.body.style.cursor = 'nesw-resize';
              break;
            case 3:
              document.body.style.cursor = 'ew-resize';
              break;
            case 4:
              document.body.style.cursor = 'nwse-resize';
              break;
            case 5:
              document.body.style.cursor = 'ns-resize';
              break;
            case 6:
              document.body.style.cursor = 'nesw-resize';
              break;
            case 7:
              document.body.style.cursor = 'ew-resize';
              break;
            case 8:
              document.body.style.cursor = 'nwse-resize';
              break;
            case 9:
              document.body.style.cursor = 'alias';
              break;
            case 10:
              document.body.style.cursor = 'all-scroll';
              break;
            case 11:
              document.body.style.cursor = 'alias';
              break;
            default:
              document.body.style.cursor = 'default';
              break;
          }
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

}


export default DDeiBusActionChangeCursor
