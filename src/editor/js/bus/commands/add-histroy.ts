
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiActiveType from '../../enums/active-type';
import { debounce } from 'lodash';
import DDeiFile from '../../file';
/**
 * 记录当前快照的总线Command
 */
class DDeiEditorCommandAddHistroy extends DDeiBusCommand {

  static {
    DDeiEditorCommandAddHistroy.addHistroy = debounce(DDeiEditorCommandAddHistroy.addHistroy, 200, { trailing: true, leading: false });
  }
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
    let editor = bus.invoker;
    if (editor?.files.length > 0 && (editor.currentFileIndex == 0 || editor.currentFileIndex)) {
      let file = editor?.files[editor.currentFileIndex]
      if (file?.active == DDeiActiveType.ACTIVE) {
        let data = JSON.stringify(file.toJSON());
        let lastData = null;
        if (file.histroyIdx != -1) {
          lastData = file.histroy[file.histroyIdx]
        }
        if (data != lastData) {
          DDeiEditorCommandAddHistroy.addHistroy(file, data)
        }

      }
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

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiEditorCommandAddHistroy({ code: DDeiEditorEnumBusCommandType.AddFileHistroy, name: "", desc: "" })
  }


  static addHistroy(file: DDeiFile, data: object) {
    file.addHistroy(data)
  }
}

export {DDeiEditorCommandAddHistroy }
export default DDeiEditorCommandAddHistroy
