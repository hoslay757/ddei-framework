import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
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
    let deltaX = data.deltaX ? data.deltaX : 0;
    let deltaY = data.deltaY ? data.deltaY : 0;
    let deltaWidth = data.deltaWidth ? data.deltaWidth : 0;
    let deltaHeight = data.deltaHeight ? data.deltaHeight : 0;
    let selector = data.selector;
    let models = data.models;
    //计算外接矩形
    let originRect: object = null;
    let paddingWeight = 0;
    if (selector) {
      originRect = selector.getAbsBounds();
      let paddingWeightInfo = selector.paddingWeight?.selected ? selector.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
      if (models.length > 1) {
        paddingWeight = paddingWeightInfo.multiple;
      } else {
        paddingWeight = paddingWeightInfo.single;
      }
      originRect.x = originRect.x + paddingWeight;
      originRect.y = originRect.y + paddingWeight;
      originRect.width = originRect.width - 2 * paddingWeight;
      originRect.height = originRect.height - 2 * paddingWeight;
    } else {
      originRect = DDeiAbstractShape.getOutRect(models);
    }
    //考虑paddingWeight，计算预先实际移动后的区域
    let movedBounds = { x: originRect.x + deltaX, y: originRect.y + deltaY, width: originRect.width + deltaWidth, height: originRect.height + deltaHeight }
    //校验，如果拖拽后图形消失不见，则停止拖拽
    if (models?.size <= 0 || selector?.passIndex == -1 || movedBounds.height <= paddingWeight || movedBounds.width <= paddingWeight) {
      return false
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
      let dx = data.dx ? data.dx : 0;
      let dy = data.dy ? data.dy : 0;
      let deltaX = data.deltaX ? data.deltaX : 0;
      let deltaY = data.deltaY ? data.deltaY : 0;

      let deltaWidth = data.deltaWidth ? data.deltaWidth : 0;
      let deltaHeight = data.deltaHeight ? data.deltaHeight : 0;
      let changeContainer = data.changeContainer ? data.changeContainer : false;
      let newContainer = data.newContainer;
      let selector = data.selector;
      let models = data.models;
      let parentContainer = data?.models[0].pModel;
      let stage = bus.ddInstance.stage;
      //如果当前控件的父控件存在旋转，则需要换算成未旋转时的移动量
      x = x + dx;
      y = y + dy;
      let cx = 0;
      let cy = 0;
      if (parentContainer.baseModelType == "DDeiContainer") {
        cx = parentContainer.currentPointVectors[0].x;
        cy = parentContainer.currentPointVectors[0].y;
      }
      if (parentContainer) {
        //绝对旋转量，构建旋转矩阵
        let parentAbsRotate = parentContainer.getAbsRotate();
        //变换坐标系，将最外部的坐标系，变换到容器坐标系，目前x和y都是相对于外部坐标的坐标
        //注意由于外部容器存在旋转，因此减去的是外部容器的第一个点
        let angle = (parentAbsRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        let vc1 = new Vector3(x - cx, y - cy, 1);
        vc1.applyMatrix3(rotateMatrix)
        x = parseFloat(vc1.x.toFixed(4))
        y = parseFloat(vc1.y.toFixed(4))
      }

      //计算外接矩形
      let originRect: object = null;
      if (selector) {
        originRect = selector.getAbsBounds();
        let paddingWeightInfo = selector.paddingWeight?.selected ? selector.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
        let paddingWeight = 0;
        if (models.length > 1) {
          paddingWeight = paddingWeightInfo.multiple;
        } else {
          paddingWeight = paddingWeightInfo.single;
        }
        originRect.x = originRect.x + paddingWeight;
        originRect.y = originRect.y + paddingWeight;
        originRect.width = originRect.width - 2 * paddingWeight;
        originRect.height = originRect.height - 2 * paddingWeight;
      } else {
        originRect = DDeiAbstractShape.getOutRect(models);
      }

      //记录每一个图形在原始矩形中的比例
      let originPosMap: Map<string, object> = new Map();
      //获取模型在原始模型中的位置比例
      for (let i = 0; i < models.length; i++) {
        let item = models[i]

        originPosMap.set(item.id, {
          xR: ((item.x + cx - originRect.x) / originRect.width),
          yR: ((item.y + cy - originRect.y) / originRect.height),
          wR: (item.width / originRect.width),
          hR: (item.height / originRect.height)
        });
      }

      //考虑paddingWeight，计算预先实际移动后的区域
      let movedBounds = { x: x - originRect.width / 2, y: y - originRect.height / 2, width: originRect.width + deltaWidth, height: originRect.height + deltaHeight }

      models.forEach(item => {
        let originBound = { x: item.x, y: item.y, width: item.width, height: item.height };
        item.x = Math.floor(movedBounds.x - cx + movedBounds.width * originPosMap.get(item.id).xR)
        item.width = Math.floor(movedBounds.width * originPosMap.get(item.id).wR)
        item.y = Math.floor(movedBounds.y - cy + movedBounds.height * originPosMap.get(item.id).yR)
        item.height = Math.floor(movedBounds.height * originPosMap.get(item.id).hR)
        item.calRotatePointVectors();
        //清空旋转矩阵
        item.currentPointVectors = item.pointVectors;
        item.pointVectors = null;

        //如果当前是修改坐标，并且不改变容器大小，则按照容器比例更新子元素的大小
        if (!changeContainer && stage.render.selector.passIndex != 10 && stage.render.selector.passIndex != 11) {
          if (item.baseModelType == "DDeiContainer") {
            let changedBound = { x: item.x, y: item.y, width: item.width, height: item.height };
            item.changeChildrenBounds(originBound, changedBound)
            item.changeParentsBounds();
          };
          //pContainerModel修改上层容器直至layer的大小
          parentContainer.changeParentsBounds()
        }
      })

      //如果移动过程中需要改变容器，一般用于拖拽时的逻辑
      if (stage.render.selector.passIndex == 10 || stage.render.selector.passIndex == 11) {
        if (!changeContainer) {
          //同步更新上层容器其大小和坐标
          parentContainer.changeParentsBounds()
        } else {
          //如果最小层容器不是当前容器，则修改鼠标样式，代表可能要移入
          if (newContainer.id != parentContainer.id) {
            bus?.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 11 }, evt);
          } else {
            bus?.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 10 }, evt);
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
    return new DDeiBusCommandModelChangeBounds({ code: DDeiEnumBusCommandType.ModelChangeBounds, name: "", desc: "" })
  }
}


export default DDeiBusCommandModelChangeBounds
