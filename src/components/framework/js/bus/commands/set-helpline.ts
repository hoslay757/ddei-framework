import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 设置辅助线的总线Command
 */
class DDeiBusCommandSetHelpLine extends DDeiBusCommand {
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
    let stage = bus.ddInstance.stage;
    if (stage) {
      let layer = data.layer;
      if (!layer) {
        layer = stage.layers[stage.layerIndex];
      }
      if (data?.models?.length > 0 || data?.models?.size > 0 || data?.container) {
        let models = data?.models;
        if (!models && data?.container) {
          models = data?.container.getSelectedModels();
        }
        if (models.set) {
          models = Array.from(models.values());
        }
        if (models?.length > 0) {
          let outRect = null;
          let rotate = null;
          let apvs = []
          models.forEach(model => {
            let modelAPVS = model.getAPVS()
            if (modelAPVS?.length > 0) {
              apvs = apvs.concat(modelAPVS)
            }
          });
          if (models.length == 1) {
            rotate = models[0].rotate
          } else {
            rotate = stage.render.selector.rotate
          }
          outRect = DDeiAbstractShape.getOutRectByPV(models)

          // 获取计算并获取对齐的点，只获取一屏内的数据做对比
          let { hpoint, vpoint, hAds, vAds } = stage.getAlignData({ pvs: apvs, rotate: rotate }, data?.models)
          stage.render.helpLines = {
            hpoint: hpoint,
            vpoint: vpoint,
            rect: outRect,
            hAds: hAds,
            vAds: vAds
          };
          return true;
        } else {
          //隐藏辅助对齐线、坐标文本等图形
          stage.render.helpLines = null;
          return true;
        }
      } else {
        //隐藏辅助对齐线、坐标文本等图形
        stage.render.helpLines = null;
        return true;
      }
    }

    return false;

  }

  /**
   * 后置行为，分发
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
    return new DDeiBusCommandSetHelpLine({ code: DDeiEnumBusCommandType.SetHelpLine, name: "", desc: "" })
  }

}


export default DDeiBusCommandSetHelpLine
