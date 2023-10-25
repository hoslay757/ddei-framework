import { MODEL_CLS } from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
/**
 * 修改画布的窗口坐标总线Command
 */
class DDeiBusCommandChangeStageWPV extends DDeiBusCommand {
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
      let rat1 = stage.ddInstance.render.ratio
      let stageRatio = stage.getStageRatio()
      let ratio = rat1 * stageRatio;
      //修改stage的视窗位置
      let x = data.x;
      let y = data.y;
      let dragObj = data.dragObj;
      stage.wpv.x += (x - dragObj.dx) / ratio
      stage.wpv.y += (y - dragObj.dy) / ratio
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
    bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'grabbing' });
    bus.push(DDeiEnumBusCommandType.RefreshShape)
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeStageWPV({ code: DDeiEnumBusCommandType.ChangeStageWPV, name: "", desc: "" })
  }

}


export default DDeiBusCommandChangeStageWPV
