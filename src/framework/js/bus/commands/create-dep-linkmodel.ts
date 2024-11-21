import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiEnumOperateType from '../../enums/operate-type';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3 } from "three"
import { cloneDeep } from "lodash"
import DDeiModelLink from '../../models/modellink';
/**
 * 模型放置层级的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandCreateDepLinkModel extends DDeiBusCommand {
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
    return true
  }

  /**
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let ddInstance = bus.ddInstance
    let stage = ddInstance.stage;
    let text = data.text
    let model = data.model ? data.model : stage.selectedModels.size == 1 ? Array.from(stage.selectedModels.values())[0] : null
    DDeiUtil.createDepLinkModel(model,text)
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
    return new DDeiBusCommandCreateDepLinkModel({ code: DDeiEnumBusCommandType.CreateDepLinkModel, name: "", desc: "" })
  }

}

export { DDeiBusCommandCreateDepLinkModel }
export default DDeiBusCommandCreateDepLinkModel
