import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 改变模型所属容器的总线Command
 */
class DDeiBusCommandModelChangeContainer extends DDeiBusCommand {
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
    if (data?.models) {
      let oldContainer = data.oldContainer;
      let newContainer = data.newContainer;

      if (newContainer) {
        let models = data.models;
        let operateModels = []
        models.forEach((item, key) => {
          if (item.id.lastIndexOf("_shadow") != -1) {
            let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
            item = bus.ddInstance.stage.getModelById(id);
          }
          operateModels.push(item)
        });
        if (operateModels.length > 0) {
          if (!oldContainer && operateModels[0].pModel) {
            oldContainer = operateModels[0].pModel;
          }
          if (newContainer.baseModelType == "DDeiLayer" && !newContainer.layoutManager) {
            let freeLayoutManager = DDeiLayoutManagerFactory.getLayoutInstance("free");
            freeLayoutManager.container = newContainer;
            newContainer.layoutManager = freeLayoutManager;
          }
          if (newContainer.layoutManager?.canAppend(evt.offsetX, evt.offsetY, operateModels)) {
            //交由新容器的布局管理器进行控件移入或交换
            let successAppend = newContainer.layoutManager?.append(evt.offsetX, evt.offsetY, operateModels);
            if (successAppend) {
              if (oldContainer) {
                //更新老容器大小
                oldContainer.changeParentsBounds();
              }
              //更新新容器大小
              newContainer?.changeParentsBounds()
              //重新设置布局
              newContainer?.layoutManager?.updateLayout(evt.offsetX, evt.offsetY, operateModels);
            }
          }
        }

      }

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
    //更新选择器
    bus?.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeContainer({ code: DDeiEnumBusCommandType.ModelChangeContainer, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeContainer
