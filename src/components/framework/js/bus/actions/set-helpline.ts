import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 设置辅助线的总线Action
 */
class DDeiBusActionSetHelpLine extends DDeiBusAction {
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
        //显示辅助对齐线、坐标文本等图形
        layer.render.helpLines = {
          "bounds": stage.render.currentOperateShape?.getAbsBounds(),
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

}


export default DDeiBusActionSetHelpLine
