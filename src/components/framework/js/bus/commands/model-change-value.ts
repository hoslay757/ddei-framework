import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 设置属性值的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandModelChangeValue extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 具体行为,设置属性值
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    if (stage && data?.mids?.length > 0 && data?.paths?.length > 0) {
      //模型Id
      let mids = data.mids;
      //属性
      let paths = data.paths;
      //值
      let value = data.value;
      if (data?.paths?.indexOf('layout') != -1) {

      } else {
        mids.forEach(modelId => {
          if (modelId) {
            //从bus中获取实际控件
            let model = stage?.getModelById(modelId);
            if (model) {
              //根据code以及mapping设置属性值
              DDeiUtil.setAttrValueByPath(model, paths, value)
            }
          }
        });
      }
      return true;
    }
    return false;
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    //如果修改的是layout属性，则同步修改layoutmanager，并重新计算布局
    if (data?.paths?.indexOf('layout') != -1) {
      //更新选择器
      bus?.insert(DDeiEnumBusCommandType.ChangeLayout, data, evt);
    }
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeValue({ code: DDeiEnumBusCommandType.ModelChangeValue, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeValue
