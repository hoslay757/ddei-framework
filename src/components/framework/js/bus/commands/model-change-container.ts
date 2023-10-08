import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
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
      let models = data.models;
      let loAbsPos = null;
      let loAbsRotate = null;

      models.forEach((item, key) => {
        if (item.id.lastIndexOf("_shadow") != -1) {
          let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
          item = bus.ddInstance.stage.getModelById(id);
        }
        //转换坐标，获取最外层的坐标
        let itemAbsPos = item.getAbsPosition();
        let itemAbsRotate = item.getAbsRotate();
        if (oldContainer) {
          oldContainer.removeModel(item);
        }
        if (newContainer) {
          if (!loAbsPos) {
            loAbsPos = newContainer.getAbsPosition();
            loAbsRotate = newContainer.getAbsRotate();
          }
          item.setPosition(itemAbsPos.x - loAbsPos.x, itemAbsPos.y - loAbsPos.y)
          item.rotate = itemAbsRotate - loAbsRotate
          newContainer.addModel(item);
          //绑定并初始化渲染器
          item.initRender();
        }
      });
      if (oldContainer) {
        //检查老容器中是否只有一个元素，如果有，则将其移动到上层容器
        if (oldContainer.baseModelType != 'DDeiLayer' && oldContainer.models.size == 1) {
          bus.insert(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: oldContainer, newContainer: oldContainer.pModel, models: Array.from(oldContainer.models.values()) }, evt);
        }
        //TODO 如果移动后，老容器中没有元素，则移除，将来考虑手工创建的容器和组合后产生的容器，组合后的容器才销毁，手工的容器不销毁
        if (oldContainer.baseModelType != 'DDeiLayer' && oldContainer.models.size == 0) {
          oldContainer.pModel.removeModel(oldContainer);
        }
        else {
          //更新老容器大小
          oldContainer.changeParentsBounds();
        }
      }
      //更新新容器大小
      newContainer?.changeParentsBounds()
      //重新设置布局
      newContainer?.layoutManager?.updateLayout(evt.offsetX, evt.offsetY, Array.from(data?.models));
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
