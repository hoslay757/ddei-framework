import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
/**
 * 改变模型坐标的总线Command
 */
class DDeiBusCommandModelChangePosition extends DDeiBusCommand {
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
    if (data?.models?.length > 0) {
      let models = data.models;
      for (let i = 0; i < models.length; i++) {
        let parentContainer = data?.models[i].pModel;
        if (parentContainer?.layoutManager) {
          if (!parentContainer.layoutManager.canChangePosition(data.x, data.y, models, data.isAlt)) {
            bus?.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'not-allowed' }, evt);
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (data?.models?.length > 0) {

      let x = data.x ? data.x : 0;
      let y = data.y ? data.y : 0;
      let dragObj = data.dragObj;
      let changeContainer = data.changeContainer ? data.changeContainer : false;
      let newContainer = data.newContainer;
      let oldContainer = data.oldContainer;

      let models = data.models;
      let stage = bus.ddInstance.stage;

      models.forEach(model => {
        let dx = 0
        let dy = 0
        if (dragObj && dragObj[model.id]) {
          dx = dragObj[model.id]?.dx ? dragObj[model.id]?.dx : 0;
          dy = dragObj[model.id]?.dy ? dragObj[model.id]?.dy : 0
        }
        let moveMatrix = new Matrix3(
          1, 0, x - model.cpv.x + dx,
          0, 1, y - model.cpv.y + dy,
          0, 0, 1,
        );
        model.transVectors(moveMatrix);
      });

      models[0].layer.dragInPoints = []
      models[0].layer.dragOutPoints = []
      //设置移入移出效果的向量
      if (oldContainer && newContainer && oldContainer != newContainer) {
        oldContainer?.layoutManager?.calDragOutPVS(data.x, data.y, models);
        newContainer?.layoutManager?.calDragInPVS(data.x, data.y, models);
      } else if (oldContainer) {
        oldContainer?.layoutManager?.calDragOutPVS(data.x, data.y, models);
        oldContainer?.layoutManager?.calDragInPVS(data.x, data.y, models);
      }
      //如果移动过程中需要改变容器，一般用于拖拽时的逻辑
      if (stage.render.selector.passIndex == 10 || stage.render.selector.passIndex == 13 || stage.render.selector.passIndex == 11) {
        if (changeContainer) {
          if (newContainer.baseModelType == "DDeiLayer" && !newContainer.layoutManager) {
            let freeLayoutManager = DDeiLayoutManagerFactory.getLayoutInstance("free");
            freeLayoutManager.container = newContainer;
            newContainer.layoutManager = freeLayoutManager;
          }
          //如果最小层容器不是当前容器，则修改鼠标样式，代表可能要移入
          if (newContainer.id != oldContainer.id) {
            if (newContainer?.layoutManager?.canAppend(data.x, data.y, models)) {
              bus?.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 11 }, evt);
            } else {
              bus?.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'not-allowed' }, evt);
            }
          } else {
            bus?.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 10 }, evt);
          }
        } else {
          bus?.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: stage.render.selector.passIndex }, evt);
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
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangePosition({ code: DDeiEnumBusCommandType.ModelChangePosition, name: "", desc: "" })
  }
}


export default DDeiBusCommandModelChangePosition
