import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { debounce } from 'lodash-es';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiStage from '../../models/stage';
import DDeiUtil from '../../util';
/**
 * 记录当前快照的总线Command
 */
class DDeiBusCommandAddHistroy extends DDeiBusCommand {


  static {
    DDeiBusCommandAddHistroy.addHistroy = debounce(DDeiBusCommandAddHistroy.addHistroy, 200, { trailing: true, leading: false });
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
    let stage = bus.ddInstance.stage;
    if (stage) {
      let data = JSON.stringify(stage.toJSON());
      let lastData = null;
      if (stage.histroyIdx != -1) {
        lastData = stage.histroy[stage.histroyIdx]
      }
      if (data != lastData) {
        DDeiBusCommandAddHistroy.addHistroy(stage, data)



      }
      return true;
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
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandAddHistroy({ code: DDeiEnumBusCommandType.AddHistroy, name: "", desc: "" })
  }

  static addHistroy(stage: DDeiStage, data: object) {
    stage.addHistroy(data)
  }
}

export { DDeiBusCommandAddHistroy }
export default DDeiBusCommandAddHistroy
