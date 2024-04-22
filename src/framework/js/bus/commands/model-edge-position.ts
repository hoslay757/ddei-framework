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
 * 拖拽到边缘的position
 */
class DDeiBusCommandModelEdgePosition extends DDeiBusCommand {
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
    if (data?.models?.length > 0) {
      let dx = data.dx ? data.dx : 0;
      let dy = data.dy ? data.dy : 0;
      let dragObj = data.dragObj;
      let models = data.models;
      let stage = bus.ddInstance.stage;
      //获取鼠标在屏幕上的位置
      let ddRender = stage?.ddInstance.render
      let canvas = ddRender.canvas;
      let rat1 = ddRender?.ratio;

      let fModel = null
      if (models[0].id.lastIndexOf("_shadow") != -1) {
        fModel = stage?.getModelById(models[0].id.substring(models[0].id, models[0].id.lastIndexOf("_shadow")))
      } else {
        fModel = models[0];
      }

      //移动窗口的大小
      let ignoreModelIds = [];

      //移动控件以及窗口
      models.forEach(model => {
        ignoreModelIds.push(model.id)
        let moveMatrix = new Matrix3(
          1, 0, dx,
          0, 1, dy,
          0, 0, 1,
        );
        model.transVectors(moveMatrix);
      });
      //自动移动视窗以及扩展画布大小
      if (dx || dy) {
        stage.wpv.x -= dx
        stage.wpv.y -= dy
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
            stage?.spv.applyMatrix3(moveMatrix)
            let mds = stage.getLayerModels(ignoreModelIds);
            mds.forEach(item => {
              item.transVectors(moveMatrix)
            });
            models.forEach(item => {
              item.transVectors(moveMatrix)
            });
            stage.render.selector?.transVectors(moveMatrix)
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
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelEdgePosition({ code: DDeiEnumBusCommandType.ModelEdgePosition, name: "", desc: "" })
  }
}

export { DDeiBusCommandModelEdgePosition }
export default DDeiBusCommandModelEdgePosition
