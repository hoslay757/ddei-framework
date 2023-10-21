import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
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

    if (data?.models?.length > 0) {
      let models = data.models;
      for (let i = 0; i < models.length; i++) {
        let parentContainer = data?.models[i].pModel;
        if (parentContainer?.layoutManager) {
          if (!parentContainer.layoutManager.canChangeSize(data.x, data.y, models)) {
            return false;
          }
        }
      }
    }

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

      let deltaX = data.deltaX ? data.deltaX : 0;
      let deltaY = data.deltaY ? data.deltaY : 0;
      let deltaWidth = data.deltaWidth ? data.deltaWidth : 0;
      let deltaHeight = data.deltaHeight ? data.deltaHeight : 0;
      let selector = data.selector;
      let models = data.models;
      let parentContainer = data?.models[0].pModel;
      let stage = bus.ddInstance.stage;
      //除以缩放比例
      let stageRatio = stage?.getStageRatio()
      deltaWidth = deltaWidth / stageRatio
      deltaHeight = deltaHeight / stageRatio
      deltaX = deltaX / stageRatio
      deltaY = deltaY / stageRatio
      //如果当前控件的父控件存在旋转，则需要换算成未旋转时的移动量
      let cx = 0;
      let cy = 0;
      if (parentContainer.baseModelType != "DDeiLayer") {
        cx = parentContainer.currentPointVectors[0].x;
        cy = parentContainer.currentPointVectors[0].y;
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
        //当存在多个控件选中时，采用去掉selector周围多出来的空间，再进行计算
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
        let id = item.id;
        if (item.id.indexOf("_shadow") != -1) {
          item = stage?.getModelById(item.id.substring(0, item.id.lastIndexOf("_shadow")));
        }

        originPosMap.set(id, {
          xR: ((item.x - originRect.x) / originRect.width),
          yR: ((item.y - originRect.y) / originRect.height),
          wR: (item.width / originRect.width),
          hR: (item.height / originRect.height)
        });
      }
      //考虑paddingWeight，计算预先实际移动后的区域

      console.log(models[0].x + " .  " + originRect.x + " .  " + originPosMap.get(models[0].id).xR)
      let movedBounds = { x: originRect.x + deltaX, y: originRect.y + deltaY, width: originRect.width + deltaWidth, height: originRect.height + deltaHeight }
      models.forEach(item => {
        let originBound = { x: item.x, y: item.y, width: item.width, height: item.height };
        let x = parseFloat((movedBounds.x + movedBounds.width * originPosMap.get(item.id).xR).toFixed(4))
        let width = parseFloat((movedBounds.width * originPosMap.get(item.id).wR).toFixed(4))
        let y = parseFloat((movedBounds.y + movedBounds.height * originPosMap.get(item.id).yR).toFixed(4))
        let height = parseFloat((movedBounds.height * originPosMap.get(item.id).hR).toFixed(4))
        item.setBounds(x, y, width, height)
        if (models.length > 1) {
          //去掉这一句后，多个控件拖拽时坐标会出现问题，加上则会导致旋转后嵌套容器显示不正常,因此控制一下，只在多个控件时才这样处理
          item.calRotatePointVectors();
          //清空旋转矩阵
          item.currentPointVectors = item.pointVectors;
          item.pointVectors = null;
          item.currentLoosePointVectors = item.loosePointVectors;
          item.loosePointVectors = null;
        }

        //如果当前是修改坐标，并且不改变容器大小，则按照容器比例更新子元素的大小
        if (stage.render.selector.passIndex != 10 && stage.render.selector.passIndex != 11) {
          //获取真实的容器控件
          if (item.baseModelType == "DDeiContainer" || item.baseModelType == "DDeiTable") {
            let changedBound = { x: item.x, y: item.y, width: item.width, height: item.height };
            item.changeChildrenBounds(originBound, changedBound)
            item.changeParentsBounds();
          };
          //pContainerModel修改上层容器直至layer的大小
          parentContainer.changeParentsBounds()
          parentContainer.setModelChanged()
        }
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
