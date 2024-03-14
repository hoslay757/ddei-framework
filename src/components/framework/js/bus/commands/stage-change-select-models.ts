import DDeiEditorEnumBusCommandType from '@/components/editor/js/enums/editor-command-type';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiUtil from '../../util';
import DDeiEnumOperateType from '../../enums/operate-type';
/**
 * 改变Stage已选控件的总线Command
 */
class DDeiBusCommandStageChangeSelectModels extends DDeiBusCommand {
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
      //获取当前选中控件
      //当前激活的图层
      let optContainer = stage.render.currentOperateContainer;
      if (!optContainer) {
        optContainer = stage.layers[stage.layerIndex]
      }
      let selectedModels = optContainer.getSelectedModels();
      stage.changeSelecetdModels(selectedModels);
      let selectAfter = DDeiUtil.getConfigValue("EVENT_CONTROL_SELECT_AFTER", bus.ddInstance);
      if (selectAfter) {
        selectAfter(DDeiEnumOperateType.SELECT, Array.from(selectedModels.values()), null, bus.ddInstance, evt);
      }
      return true;
    }
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
      parts: ["topmenu"],
    });

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandStageChangeSelectModels({ code: DDeiEnumBusCommandType.StageChangeSelectModels, name: "", desc: "" })
  }

}


export default DDeiBusCommandStageChangeSelectModels
