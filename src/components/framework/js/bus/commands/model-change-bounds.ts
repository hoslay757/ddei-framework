import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import { cloneDeep, clone } from 'lodash'
import DDeiUtil from '../../util';
/**
 * 改变模型坐标以及大小的总线Command
 */
class DDeiBusCommandModelChangeBounds extends DDeiBusCommand {
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
      let deltaX = data.deltaX ? data.deltaX : 0;
      let deltaY = data.deltaY ? data.deltaY : 0;
      let deltaWidth = data.deltaWidth ? data.deltaWidth : 0;
      let deltaHeight = data.deltaHeight ? data.deltaHeight : 0;
      let selector = data.selector;
      let models = data.models;

      //计算平移和缩放矩阵
      let selectCPVXDelta = deltaX == 0 ? deltaWidth / 2 : deltaX / 2
      let selectCPVYDelta = deltaY == 0 ? deltaHeight / 2 : deltaY / 2
      let scaleWRate = deltaWidth / selector.width
      let scaleHRate = deltaHeight / selector.height

      //得到宽高的增加比率，构建缩放矩阵
      let m1 = new Matrix3(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1);
      let moveMatrix = new Matrix3(
        1, 0, -selector.cpv.x,
        0, 1, -selector.cpv.y,
        0, 0, 1);
      let scaleMatrix = new Matrix3(
        1 + scaleWRate, 0, 0,
        0, 1 + scaleHRate, 0,
        0, 0, 1);

      let move1Matrix = new Matrix3(
        1, 0, selector.cpv.x,
        0, 1, selector.cpv.y,
        0, 0, 1);
      m1.premultiply(moveMatrix)
      m1.premultiply(scaleMatrix)
      m1.premultiply(move1Matrix)
      let move2Matrix = new Matrix3(
        1, 0, selectCPVXDelta,
        0, 1, selectCPVYDelta,
        0, 0, 1);
      m1.premultiply(move2Matrix)
      models.forEach(item => {
        //单独计算bpv和hpv要考虑旋转后的缩放情况
        if (item.bpv) {
          let itemBPV = DDeiUtil.pointsToZero([item.bpv], item.cpv, item.rotate)[0]
          itemBPV.x = itemBPV.x * (1 + scaleWRate)
          itemBPV.y = itemBPV.y * (1 + scaleHRate)
          itemBPV = DDeiUtil.zeroToPoints([itemBPV], item.cpv, item.rotate)[0]
          item.bpv = itemBPV
        }
        if (item.hpv) {
          let itemHPV = DDeiUtil.pointsToZero(item.hpv, item.cpv, item.rotate)
          itemHPV.forEach(hpv => {
            hpv.x = hpv.x * (1 + scaleWRate)
            hpv.y = hpv.y * (1 + scaleHRate)
          })

          itemHPV = DDeiUtil.zeroToPoints(itemHPV, item.cpv, item.rotate)
          item.hpv = itemHPV
        }
        //记录CPV增量，同步到BPV上
        let cpvX = item.cpv.x
        let cpvY = item.cpv.y
        item.transVectors(m1, { ignoreBPV: true, ignoreHPV: true })
        if (item.bpv) {
          item.bpv.x += item.cpv.x - cpvX
          item.bpv.y += item.cpv.y - cpvY
        }
        if (item.hpv) {
          item.hpv.forEach(hpv => {
            hpv.x += item.cpv.x - cpvX
            hpv.y += item.cpv.y - cpvY
          })

        }
        item.initPVS()
      })

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
    let stage = bus.ddInstance.stage;
    bus?.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, { models: stage?.layers[stage?.layerIndex]?.shadowControls }, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeBounds({ code: DDeiEnumBusCommandType.ModelChangeBounds, name: "", desc: "" })
  }
}


export default DDeiBusCommandModelChangeBounds
