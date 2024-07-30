import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value';
import DDeiAbstractShape from '../../models/shape';
/**
 * 将画布居中显示
 */
class DDeiBusCommandCenterStageWPV extends DDeiBusCommand {
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
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    if (stage) {
      let maxOutRect = DDeiAbstractShape.getOutRectByPV(
        stage.getLayerModels()
      );
      //获取canvas窗体大小
      let canvas = bus.ddInstance.render.canvas;
      let rat1 = bus.ddInstance.render.ratio;
      let stageRatio = stage.getStageRatio()
      let ruleDisplay
      if (stage.ruler?.display) {
        ruleDisplay = stage.ruler.display;
      } else if (stage.ddInstance.ruler != null && stage.ddInstance.ruler != undefined) {
        if (typeof (stage.ddInstance.ruler) == 'boolean') {
          ruleDisplay = stage.ddInstance.ruler ? 1 : 0;
        } else {
          ruleDisplay = stage.ddInstance.ruler.display;
        }
      } else {
        ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(stage, "ruler.display", true);
      }
      let ruleWeight = 0;
      if (ruleDisplay == 1 || ruleDisplay == "1") {
        ruleWeight = 16;
      }
      let centerX = stage.width / 2 - (maxOutRect.x + maxOutRect.width / 2) * stageRatio
      let centerY = stage.height / 2 - (maxOutRect.y + maxOutRect.height / 2) * stageRatio
      stage.wpv.x =
        -stage.width / 2 +
        canvas.width / rat1 / 2 +
        ruleWeight + centerX

      stage.wpv.y =
        -stage.height / 2 +
        canvas.height / rat1 / 2 +
        ruleWeight + centerY
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
    bus.push(DDeiEnumBusCommandType.RefreshShape)
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandCenterStageWPV({ code: DDeiEnumBusCommandType.CenterStageWPV, name: "", desc: "" })
  }

}

export { DDeiBusCommandCenterStageWPV }
export default DDeiBusCommandCenterStageWPV
