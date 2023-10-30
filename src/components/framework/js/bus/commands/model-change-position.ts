import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
import { has } from 'lodash';
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
      let fModel = null
      if (models[0].id.lastIndexOf("_shadow") != -1) {
        fModel = stage?.getModelById(models[0].id.substring(models[0].id, models[0].id.lastIndexOf("_shadow")))
      } else {
        fModel = models[0];
      }

      //横纵吸附
      let hAds = fModel.layer.render.helpLines?.hAds || fModel.layer.render.helpLines?.hAds == 0 ? fModel.layer.render.helpLines?.hAds : Infinity
      let vAds = fModel.layer.render.helpLines?.vAds || fModel.layer.render.helpLines?.vAds == 0 ? fModel.layer.render.helpLines?.vAds : Infinity
      let hAdsValue = Infinity;
      let vAdsValue = Infinity;
      if (hAds != Infinity) {
        //退出吸附状态
        if (stage.render.isHAds && Math.abs(stage.render.hAdsY - y) > DDeiConfig.GLOBAL_ADV_WEIGHT) {
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
        if (stage.render.isVAds && Math.abs(stage.render.vAdsX - x) > DDeiConfig.GLOBAL_ADV_WEIGHT) {
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
      let exWpvX = 0;
      let exWpvY = 0;
      let rat1 = stage.ddInstance.render.ratio
      let canvas = stage?.ddInstance.render.canvas;
      let wpvx = -stage.wpv.x;
      let wpvy = -stage.wpv.y;
      let wpvx1 = wpvx + canvas.width / rat1;
      let wpvy1 = wpvy + canvas.height / rat1;
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

        model.transVectors(moveMatrix);

        //判断如果model的某个点到了边缘，则移动窗口视图
        model.pvs.forEach(pv => {
          if (pv.y >= wpvy1) {
            exWpvY = Math.max(pv.y - wpvy1, exWpvY)
          } else if (pv.y <= wpvy) {
            exWpvY = Math.min(pv.y - wpvy, exWpvY)
          }
          if (pv.x >= wpvx1) {
            exWpvX = Math.max(pv.x - wpvx1, exWpvX)
          } else if (pv.x <= wpvx) {
            exWpvX = Math.min(pv.x - wpvx, exWpvX)
          }
        });

      });
      //自动移动视窗以及扩展画布大小
      //如果是创建中，且第一次触碰边缘，则不会触发
      debugger
      if (stage.render.operateState == DDeiEnumOperateState.CONTROL_CREATING && !(dragObj.num > 10)) {
        exWpvX = 0
        exWpvY = 0
        dragObj.num++
      }
      if (exWpvX || exWpvY) {
        let exr = exWpvX
        let eyr = exWpvY
        stage.wpv.x -= exr
        stage.wpv.y -= eyr
        let extW = 0;
        let moveW = 0;
        let hScrollWidth = stage.render.hScroll?.width ? stage.render.hScroll?.width : 0
        let vScrollHeight = stage.render.vScroll?.height ? stage.render.vScroll?.height : 0
        if (stage.wpv.x > 0) {
          if (DDeiConfig.EXT_STAGE_WIDTH) {
            extW = stage.wpv.x
            moveW = extW
          }
          stage.wpv.x = 0
        } else if (stage.wpv.x < -stage.width + hScrollWidth) {
          if (DDeiConfig.EXT_STAGE_WIDTH) {
            extW = -stage.width + hScrollWidth - stage.wpv.x
          } else {
            stage.wpv.x = -stage.width + hScrollWidth
          }
        }
        let extH = 0;
        let moveH = 0;
        if (stage.wpv.y > 0) {
          if (DDeiConfig.EXT_STAGE_HEIGHT) {
            extH = stage.wpv.y
            moveH = extH
          }
          stage.wpv.y = 0
        } else if (stage.wpv.y < -stage.height + vScrollHeight) {
          if (DDeiConfig.EXT_STAGE_HEIGHT) {
            extH = -stage.height + vScrollHeight - stage.wpv.y
          } else {
            stage.wpv.y = -stage.height + vScrollHeight
          }
        }
        if (extW || extH) {
          stage.width += extW
          stage.height += extH
          if (moveW || moveH) {
            let moveMatrix = new Matrix3(
              1, 0, extW,
              0, 1, extH,
              0, 0, 1,
            );
            let mds = stage.getLayerModels(ignoreModelIds);
            mds.forEach(item => {
              item.transVectors(moveMatrix)
            });
            stage.render.selector?.transVectors(moveMatrix)
          }
        }
      }
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
