import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 改变模型旋转的总线Command
 */
class DDeiBusCommandModelChangeRotate extends DDeiBusCommand {
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
      if (selectedModels.set) {
        selectedModels = Array.from(selectedModels.values());
      }
      for (let i = 0; i < selectedModels.length; i++) {
        let parentContainer = selectedModels[i].pModel;
        if (parentContainer?.layoutManager) {
          if (!parentContainer.layoutManager.canChangeRotate()) {
            return false;
          }
        }
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
        }
        //当前图形的圆心x1和y1
        let rcc = { x: item.x + item.width * 0.5, y: item.y + item.height * 0.5 };
        //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置，坐标系为笛卡尔坐标系，计算机中y要反转计算
        let dcc = DDeiUtil.computePosition(occ, rcc, angle);
        //修改坐标与旋转角度
        item.setPosition(dcc.x - item.width * 0.5, dcc.y - item.height * 0.5)
        item.rotate = item.rotate + angle
      }



      selector.rotate = selector.rotate + angle
      selector.calRotatePointVectors();
      //清空旋转矩阵
      selector.currentPointVectors = selector.pointVectors;
      selector.pointVectors = null;
      selector.currentLoosePointVectors = selector.loosePointVectors;
      selector.loosePointVectors = null;
      selector.calRotateOperateVectors();




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

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeRotate({ code: DDeiEnumBusCommandType.ModelChangeRotate, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeRotate
