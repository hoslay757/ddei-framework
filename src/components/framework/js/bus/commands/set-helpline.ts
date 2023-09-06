import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 设置辅助线的总线Command
 */
class DDeiBusCommandSetHelpLine extends DDeiBusCommand {
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
    if (stage && (data?.models?.size > 0 || data?.container)) {
      let layer = data.layer;
      if (!layer) {
        layer = stage.layers[stage.layerIndex];
      }
      let models = data?.models;
      if (!models && data?.container) {
        models = data?.container.getSelectedModels();
      }
      if (models?.size > 0) {
        let control = data?.control;
        if (!control) {
          control = stage.render.currentOperateShape;
        }
        if (!control) {
          control = Array.from(models.values())[0];
        }
        //显示辅助对齐线、坐标文本等图形
        layer.render.helpLines = {
          "bounds": control?.getAbsBounds(),
          models: data?.models
        };
        return true;
      }
    }

    return false;

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
    return new DDeiBusCommandSetHelpLine({ code: DDeiEnumBusCommandType.SetHelpLine, name: "", desc: "" })
  }

}


export default DDeiBusCommandSetHelpLine
