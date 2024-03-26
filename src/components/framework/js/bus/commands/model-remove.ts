import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 删除模型的总线Command
 */
class DDeiBusCommandModelRemove extends DDeiBusCommand {
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
    let models = data?.models
    let destroy = data?.destroy || data?.destroy == false ? data.destroy : true
    if (models?.length > 0) {
      models.forEach(model => {
        model.pModel.removeModel(model, destroy)
      });
      return true;
    }
    return false;
  }

  /**
   * 后置行为
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
    return new DDeiBusCommandModelRemove({ code: DDeiEnumBusCommandType.ModelRemove, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelRemove
