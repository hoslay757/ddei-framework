import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
import { has } from 'lodash';
import DDeiUtil from '../../util';
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
      let sample = data.sample
      let models = data.models;
      let stage = bus.ddInstance.stage;
      let fModel = null
      if (models[0].id.lastIndexOf("_shadow") != -1) {
        fModel = stage?.getModelById(models[0].id.substring(models[0].id, models[0].id.lastIndexOf("_shadow")))
      } else {
        fModel = models[0];
      }

      //横纵吸附
      let hAds = fModel.stage.render.helpLines?.hAds || fModel.stage.render.helpLines?.hAds == 0 ? fModel.stage.render.helpLines?.hAds : Infinity
      let vAds = fModel.stage.render.helpLines?.vAds || fModel.stage.render.helpLines?.vAds == 0 ? fModel.stage.render.helpLines?.vAds : Infinity
      let hAdsValue = Infinity;
      let vAdsValue = Infinity;
      if (hAds != Infinity) {
        //退出吸附状态
        if (stage.render.isHAds && Math.abs(stage.render.hAdsY - y) > bus.ddInstance.GLOBAL_ADV_WEIGHT) {
          stage.render.isHAds = false
          stage.render.hAdsY = Infinity
        }
        //持续吸附状态
        else if (stage.render.isHAds) {
          hAdsValue = 0
        }
        //进入吸附状态
        else {
          stage.render.isHAds = true
          hAdsValue = -hAds
          stage.render.hAdsY = y
        }
      }
      if (vAds != Infinity) {
        //退出吸附状态
        if (stage.render.isVAds && Math.abs(stage.render.vAdsX - x) > bus.ddInstance.GLOBAL_ADV_WEIGHT) {
          stage.render.isVAds = false
          stage.render.vAdsX = Infinity
        }
        //持续吸附状态
        else if (stage.render.isVAds) {
          vAdsValue = 0;
        }
        //进入吸附状态
        else {
          stage.render.isVAds = true
          vAdsValue = -vAds
          stage.render.vAdsX = x
        }
      }
      //移动窗口的大小
      let ignoreModelIds = [];
      models.forEach(model => {
        ignoreModelIds.push(model.id)
        let dx = 0
        let dy = 0
        if (dragObj && dragObj[model.id]) {
          dx = dragObj[model.id]?.dx ? dragObj[model.id]?.dx : 0;
          dy = dragObj[model.id]?.dy ? dragObj[model.id]?.dy : 0
        }
        let xm = x - model.cpv.x + dx;
        let ym = y - model.cpv.y + dy;
        if (hAdsValue != Infinity) {
          ym = hAdsValue
        }
        if (vAdsValue != Infinity) {
          xm = vAdsValue
        }

        let moveMatrix = new Matrix3(
          1, 0, xm,
          0, 1, ym,
          0, 0, 1,
        );
        model.transVectors(moveMatrix, { skipSample: sample == 1 ? false : true });
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
      DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", "DRAG", null, stage.ddInstance, evt)
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

export { DDeiBusCommandModelChangePosition }
export default DDeiBusCommandModelChangePosition
