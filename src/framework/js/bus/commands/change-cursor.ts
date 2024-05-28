import DDeiEditorUtil from '../../../../editor/js/editor-util';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumState from '../../enums/ddei-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 改变光标总线Command
 */
class DDeiBusCommandChangeCursor extends DDeiBusCommand {
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
    if (data?.passIndex || data?.cursor || data?.image) {
      if (data.image) {
        document.body.style.cursor = "url(" + DDeiEditorUtil.ICONS[data.image] + "),auto"
      }
      if (data.cursor) {
        document.body.style.cursor = data.cursor;
      } else if (data.passIndex) {
        if (bus.ddInstance.state != DDeiEnumState.IN_ACTIVITY) {
          let type = data?.type;
          switch (type) {
            case 'line': {

              switch (data.passIndex) {
                case 1:
                  document.body.style.cursor = 'grab';
                  break;
                case 2:
                  document.body.style.cursor = 'grab';
                  break;
                case 3:
                  document.body.style.cursor = data?.direct == 1 ? 'ns-resize' : 'ew-resize';
                  break;
                case 4:
                  document.body.style.cursor = 'grab';
                  break;
                default:
                  document.body.style.cursor = 'all-scroll';
                  break;
              }
            } break;
            default: {
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
                case 13:
                  document.body.style.cursor = 'all-scroll';
                  break;
                default:
                  document.body.style.cursor = 'default';
                  break;
              }
            }
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

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeCursor({ code: DDeiEnumBusCommandType.ChangeCursor, name: "", desc: "" })
  }

}

export { DDeiBusCommandChangeCursor }
export default DDeiBusCommandChangeCursor
