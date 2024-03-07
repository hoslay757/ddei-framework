import DDeiConfig, { MODEL_CLS } from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiUtil from '../../util';
import DDeiLine from '../../models/line';
import { debounce } from 'lodash';
/**
 * 缩放画布总线Command
 * 图形类Command一般在普通Command之后执行
 */
class DDeiBusCommandChangeStageRatio extends DDeiBusCommand {
  static {
    DDeiBusCommandChangeStageRatio.calLineCross = debounce(DDeiLine.calLineCross, 30)
  }

  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Command无需校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    if (DDeiUtil.getConfigValue("GLOBAL_ALLOW_STAGE_RATIO", bus.ddInstance)) {
      let stage = bus.ddInstance.stage;

      if (stage && data.oldValue && data.newValue && data.oldValue != data.newValue) {
        let scaleSize = data.newValue / data.oldValue
        //缩放矩阵
        let scaleMatrix = new Matrix3(
          scaleSize, 0, 0,
          0, scaleSize, 0,
          0, 0, 1);
        stage?.spv.applyMatrix3(scaleMatrix)
        stage.layers.forEach(layer => {
          layer.opPoints = []
          delete layer.opLine
          layer.shadowControls = []
          layer.midList.forEach(mid => {
            let model = layer.models.get(mid);
            model.transVectors(scaleMatrix)
            //更新线段
            DDeiBusCommandChangeStageRatio.calLineCross(layer)
          })
        });


        let oldWidth = stage.width
        let oldHeight = stage.height
        stage.width = stage.width * scaleSize
        stage.height = stage.height * scaleSize
        let dw = stage.width - oldWidth
        let dh = stage.height - oldHeight

        let wpvX = -stage.wpv.x
        let wpvY = -stage.wpv.y


        let ex = null, ey = null
        if (window.event?.type == 'wheel') {
          let evt = window.event
          ex = evt.offsetX;
          ey = evt.offsetY;
        }
        //没鼠标，默认选择中心
        let ox = dw / 2
        let oy = dh / 2

        //有鼠标，则以鼠标位置
        if (ex && ey) {
          let ddRender = bus.ddInstance.render
          let rat1 = ddRender.ratio;
          //视窗的大小
          let canvasHeight = ddRender.realCanvas.height / rat1;
          let canvasWidth = ddRender.realCanvas.width / rat1;

          ox = dw * ex / canvasWidth
          oy = dh * ey / canvasHeight
        }


        stage.wpv.x = -wpvX - ox
        stage.wpv.y = -wpvY - oy








        return true;
      }
    }
    return false

  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    bus.insert(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt)
    bus.push(DDeiEnumBusCommandType.RefreshShape);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeStageRatio({ code: DDeiEnumBusCommandType.ChangeStageRatio, name: "", desc: "" })
  }

}


export default DDeiBusCommandChangeStageRatio
