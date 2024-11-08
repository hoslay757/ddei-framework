import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 清空临时变量的总线Command
 */
class DDeiBusCommandClearTemplateVars extends DDeiBusCommand {
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
      //当前操作控件：无
      stage.render.currentOperateShape = null;
      //当前操作状态:无
      stage.render.operateState = DDeiEnumOperateState.NONE;
      //渲染图形
      stage.render.dragObj = null

      //吸附状态
      stage.render.isHAds = false;
      stage.render.isVAds = false;
      stage.render.vAdsX = Infinity
      stage.render.hAdsY = Infinity
      stage.render.tempSX = null;
      stage.render.tempSY = null;

      stage.ddInstance.render.inEdge = 0;

      //清除作为临时变量dragX、dargY、dragObj
      stage.render.selector.setPassIndex("", -1, -1);

      delete stage.tempStartOPpoint
      delete stage.tempCursorOPpoint
      delete stage.render.linePathData

      delete stage.ddInstance.render.inAreaControls
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
    return new DDeiBusCommandClearTemplateVars({ code: DDeiEnumBusCommandType.ClearTemplateVars, name: "", desc: "" })
  }

}

export { DDeiBusCommandClearTemplateVars }
export default DDeiBusCommandClearTemplateVars
