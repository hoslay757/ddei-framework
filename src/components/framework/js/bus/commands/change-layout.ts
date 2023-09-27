import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 设置布局的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandChangeLayout extends DDeiBusCommand {
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
    let stage = bus.ddInstance.stage;
    if (stage && data?.mids?.length > 0) {
      //模型Id
      let mids = data.mids;
      //值
      let value = data.value;
      for (let i = 0; i < mids.length; i++) {
        let modelId = mids[i]
        if (modelId) {
          //从bus中获取实际控件
          let model = stage?.getModelById(modelId);
          if (model) {
            //设置layoutmanager并重新布局
            let oldLayout = model.layout;
            let newLayoutManager = DDeiLayoutManagerFactory.getLayoutInstance(value);
            newLayoutManager.container = model;
            //执行新旧两个布局之间的转换
            let canConvert = newLayoutManager.canConvertLayout(oldLayout);
            if (!canConvert) {
              return false;
            }
          }
        }
      };
      return true;
    }
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
      //值
      let value = data.value;
      mids.forEach(modelId => {
        if (modelId) {
          //从bus中获取实际控件
          let model = stage?.getModelById(modelId);
          if (model) {
            //设置layoutmanager并重新布局
            let oldLayout = model.layout;
            model.layout = value;
            model.layoutManager = DDeiLayoutManagerFactory.getLayoutInstance(value);
            model.layoutManager.container = model;
            //执行新旧两个布局之间的转换
            model.layoutManager.convertLayout(oldLayout);
            //重新布局
            model.layoutManager.changeSubModelBounds();
          }
        }
      });
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
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeLayout({ code: DDeiEnumBusCommandType.ChangeLayout, name: "", desc: "" })
  }

}


export default DDeiBusCommandChangeLayout
