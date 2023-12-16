import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
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
      let parentContainer = data?.models[0].pModel;
      let stage = bus.ddInstance.stage;

      //拖拽前的原始信息
      let originData = stage.render.dragObj?.originData
      //除以缩放比例
      let stageRatio = stage?.getStageRatio()
      deltaWidth = deltaWidth
      deltaHeight = deltaHeight
      deltaX = deltaX
      deltaY = deltaY

      //计算外接矩形

      let originRect: object = {
        x: selector.x, y: selector.y, width: selector.width, height: selector.height
      }
      let paddingWeightInfo = selector.paddingWeight?.selected ? selector.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
      let paddingWeight = 0;
      if (models.length > 1) {
        paddingWeight = paddingWeightInfo.multiple;
      } else {
        paddingWeight = paddingWeightInfo.single;
      }
      //当存在多个控件选中时，采用去掉selector周围多出来的空间，再进行计算
      originRect.x = (originRect.x + paddingWeight) * stageRatio;
      originRect.y = (originRect.y + paddingWeight) * stageRatio;
      originRect.width = (originRect.width - 2 * paddingWeight) * stageRatio;
      originRect.height = (originRect.height - 2 * paddingWeight) * stageRatio;

      //计算预先实际移动后的区域

      let movedBounds = { x: originRect.x + deltaX, y: originRect.y + deltaY, width: originRect.width + deltaWidth, height: originRect.height + deltaHeight }
      //记录每一个图形的向量在原始矩形中的比例
      let originPosMap: Map<string, object> = new Map();
      //获取模型在原始模型中的位置比例
      for (let i = 0; i < models.length; i++) {
        let item = models[i]
        let id = item.id;
        if (item.id.indexOf("_shadow") != -1) {
          item = stage?.getModelById(item.id.substring(0, item.id.lastIndexOf("_shadow")));
        }
        //构建位移和旋转矩阵将item的各个点拿到原点旋转后，再去和rect的width、height求比例
        let m1 = new Matrix3();
        let move1Matrix = new Matrix3(
          1, 0, -item.cpv.x,
          0, 1, -item.cpv.y,
          0, 0, 1);
        m1.premultiply(move1Matrix);
        if (item.rotate && item.rotate != 0) {
          let angle = (item.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          m1.premultiply(rotateMatrix);
        }
        let move2Matrix = new Matrix3(
          1, 0, item.cpv.x,
          0, 1, item.cpv.y,
          0, 0, 1);
        m1.premultiply(move2Matrix);
        let move3Matrix = new Matrix3(
          1, 0, -originRect.x,
          0, 1, -originRect.y,
          0, 0, 1);
        m1.premultiply(move3Matrix);

        //计算并记录item在矩形中的位置比例
        this.setPVR(id, item, m1, originRect, originPosMap)

      }
      //计算好原始比例后，按照增量扩展控件大小，并按照其旋转数字施加一个变换
      models.forEach(item => {
        this.syncPVS(item, movedBounds, originPosMap)
      })
      return true;
    }
    return false;
  }

  syncPVS(item, movedBounds, originPosMap) {
    item.cpv.x = parseFloat((movedBounds.x + movedBounds.width * originPosMap.get(item.id).cpvR.xR).toFixed(4))
    item.cpv.y = parseFloat((movedBounds.y + movedBounds.height * originPosMap.get(item.id).cpvR.yR).toFixed(4))

    for (let xi = 0; xi < item.textArea?.length; xi++) {
      let pv = item.textArea[xi];
      let pvR = originPosMap.get(item.id).textPvsR[xi];
      pv.x = parseFloat((movedBounds.x + movedBounds.width * pvR.xR).toFixed(4))
      pv.y = parseFloat((movedBounds.y + movedBounds.height * pvR.yR).toFixed(4))
    }
    for (let xi = 0; xi < item.pvs.length; xi++) {
      let pv = item.pvs[xi];
      let pvR = originPosMap.get(item.id).pvsR[xi];
      pv.x = parseFloat((movedBounds.x + movedBounds.width * pvR.xR).toFixed(4))
      pv.y = parseFloat((movedBounds.y + movedBounds.height * pvR.yR).toFixed(4))
    }

    for (let xi in item.exPvs) {
      let pv = item.exPvs[xi];
      let pvR = originPosMap.get(item.id).exPvsR[xi];
      pv.x = parseFloat((movedBounds.x + movedBounds.width * pvR.xR).toFixed(4))
      pv.y = parseFloat((movedBounds.y + movedBounds.height * pvR.yR).toFixed(4))

    }

    if (item.poly == 2) {
      let pv = item.bpv;
      let pvR = originPosMap.get(item.id).bpvR;
      pv.x = parseFloat((movedBounds.x + movedBounds.width * pvR.xR).toFixed(4))
      pv.y = parseFloat((movedBounds.y + movedBounds.height * pvR.yR).toFixed(4))
    }
    //组合控件
    if (item.composes?.length > 0) {
      for (let i = 0; i < item.composes.length; i++) {
        let cPVRMap = originPosMap.get(item.id).composesPVR[i];
        let comp = item.composes[i];
        this.syncPVS(comp, movedBounds, cPVRMap)
      }
    }
    if (item.rotate && item.rotate != 0) {
      //旋转
      let m1 = new Matrix3();
      let move1Matrix = new Matrix3(
        1, 0, -item.cpv.x,
        0, 1, -item.cpv.y,
        0, 0, 1);
      m1.premultiply(move1Matrix);
      let angle = -(item.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      m1.premultiply(rotateMatrix);
      let move2Matrix = new Matrix3(
        1, 0, item.cpv.x,
        0, 1, item.cpv.y,
        0, 0, 1);
      m1.premultiply(move2Matrix);
      for (let xi = 0; xi < item.pvs.length; xi++) {
        let pv = item.pvs[xi];
        pv.applyMatrix3(m1)
      }
    }

    item.calRotate()
    item.calLoosePVS();
  }

  setPVR(id: string, item: DDeiAbstractShape, m1: Matrix3, originRect: object, originPosMap: Map<string, object>) {
    //中心点比例
    let cpvTemp = new Vector3(item.cpv.x, item.cpv.y, 1);
    cpvTemp.applyMatrix3(m1)

    let cpvR = { xR: parseFloat((cpvTemp.x / originRect.width).toFixed(4)), yR: parseFloat((cpvTemp.y / originRect.height).toFixed(4)) }
    let pvsR = [];
    let exPvsR = {}
    let textPvsR = []
    let composesPVR = []
    //组合控件
    item.composes?.forEach(comp => {
      let comOriginPosMap = new Map()
      this.setPVR(comp.id, comp, m1, originRect, comOriginPosMap)
      composesPVR.push(comOriginPosMap)
    });
    item.pvs.forEach(pv => {
      let pvTemp = new Vector3(pv.x, pv.y, 1);
      pvTemp.applyMatrix3(m1)
      pvsR.push({ xR: parseFloat((pvTemp.x / originRect.width).toFixed(4)), yR: parseFloat((pvTemp.y / originRect.height).toFixed(4)) })
    });
    item.textArea?.forEach(pv => {
      let pvTemp = new Vector3(pv.x, pv.y, 1);
      pvTemp.applyMatrix3(m1)
      textPvsR.push({ xR: parseFloat((pvTemp.x / originRect.width).toFixed(4)), yR: parseFloat((pvTemp.y / originRect.height).toFixed(4)) })

    });



    for (let i in item.exPvs) {
      let pv = item.exPvs[i];
      let pvTemp = new Vector3(pv.x, pv.y, 1);
      pvTemp.applyMatrix3(m1)
      exPvsR[i] = { xR: parseFloat((pvTemp.x / originRect.width).toFixed(4)), yR: parseFloat((pvTemp.y / originRect.height).toFixed(4)) }
    }

    let bpvR = null
    if (item.poly == 2) {
      let pvTemp = new Vector3(item.bpv.x, item.bpv.y, 1);
      pvTemp.applyMatrix3(m1)
      bpvR = { xR: pvTemp.x / originRect.width, yR: pvTemp.y / originRect.height }
    }

    originPosMap.set(id, { cpvR: cpvR, pvsR: pvsR, exPvsR: exPvsR, textPvsR: textPvsR, bpvR: bpvR, composesPVR: composesPVR });

  }





  /**
   * 后置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    //更新选择器
    // let stage = bus.ddInstance.stage;
    // bus?.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, { models: stage?.layers[stage?.layerIndex]?.shadowControls }, evt);
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
