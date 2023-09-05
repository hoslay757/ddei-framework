import DDeiConfig from '../../config';
import DDeiEnumBusActionType from '../../enums/bus-action-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusAction from '../bus-action';
/**
 * 改变模型旋转的总线Action
 */
class DDeiBusActionModelChangeRotate extends DDeiBusAction {
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
    if (data?.deltaX && data?.container) {
      //更改已选择控件的旋转
      let selector = bus.ddInstance.stage.render.selector;
      let movedNumber = data.deltaX;
      let pContainerModel = data.container;
      let selectedModels = pContainerModel.getSelectedModels();
      if (!selectedModels || selector.passIndex == -1 || movedNumber == 0) {
        return false;
      }
      return true
    }
    return false;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (data?.deltaX && data?.container) {
      //更改已选择控件的旋转
      let selector = bus.ddInstance.stage.render.selector;
      let movedNumber = data.deltaX;
      let pContainerModel = data.container;
      let selectedModels = pContainerModel.getSelectedModels();

      //更新旋转器角度
      if (!selector.rotate) {
        selector.rotate = 0;
        selector.originX = selector.x;
        selector.originY = selector.y;
      }
      //计算旋转角度
      let angle = movedNumber * 0.5;
      let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
      //获取当前选择控件外接矩形
      let originRect: object = DDeiAbstractShape.getOutRect(models);
      //外接矩形的圆心x0和y0
      let occ = { x: originRect.x + originRect.width * 0.5, y: originRect.y + originRect.height * 0.5 };
      //对所有选中图形进行位移并旋转
      for (let i = 0; i < models.length; i++) {
        let item = models[i]
        if (!item.rotate) {
          item.rotate = 0;
          item.originX = item.x;
          item.originY = item.y;
        }
        //当前图形的圆心x1和y1
        let rcc = { x: item.x + item.width * 0.5, y: item.y + item.height * 0.5 };
        //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置，坐标系为笛卡尔坐标系，计算机中y要反转计算
        let dcc = DDeiUtil.computePosition(occ, rcc, angle);
        //修改坐标与旋转角度
        item.setPosition(dcc.x - item.width * 0.5, dcc.y - item.height * 0.5)
        item.rotate = item.rotate + angle
        if (item.rotate >= 360 || item.rotate <= -360) {
          item.rotate = null
          item.x = item.originX;
          item.y = item.originY;
        }
      }

      selector.rotate = selector.rotate + angle
      if (selector.rotate >= 360 || selector.rotate <= -360) {
        selector.rotate = 0
        selector.x = selector.originX;
        selector.y = selector.originY;
      }
      //同步更新上层容器其大小和坐标
      pContainerModel.changeParentsBounds()
      return true
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
    bus?.insert(DDeiEnumBusActionType.UpdateSelectorBounds, null, evt);
    return true;
  }

}


export default DDeiBusActionModelChangeRotate
