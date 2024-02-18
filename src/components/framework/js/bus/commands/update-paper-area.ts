import DDeiEditorEnumBusCommandType from '@/components/editor/js/enums/editor-command-type';
import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Vector3 } from 'three';
import DDeiAbstractShape from '../../models/shape';
/**
 * 更新纸张区域信息
 */
class DDeiBusCommandUpdatePaperArea extends DDeiBusCommand {
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
   * 更新纸张，确保有效纸张位置在整个画布的正中央
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    let paperType = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.type", true);
    //获取纸张大小的定义
    let paperConfig = DDeiConfig.PAPER[paperType];
    if (paperConfig) {

      //当前的窗口位置（乘以了窗口缩放比例）
      let wpv = stage.wpv
      let wpvX = -wpv.x
      let wpvY = -wpv.y

      //纸张的像素大小
      let paperSize = DDeiUtil.getPaperSize(stage)

      let paperWidth = paperSize.width;
      let paperHeight = paperSize.height;

      //第一张纸开始位置
      if (!stage.spv) {
        let sx = stage.width / 2 - paperWidth / 2
        let sy = stage.height / 2 - paperHeight / 2
        stage.spv = new Vector3(sx, sy, 1)
      }
      let startPaperX = stage.spv.x
      let startPaperY = stage.spv.y


      //获取最大的有效范围，自动扩展纸张
      let maxOutRect = DDeiAbstractShape.getOutRectByPV(stage.getLayerModels())

      //计算各个方向扩展的数量j
      let leftExtNum = 0, rightExtNum = 0, topExtNum = 0, bottomExtNum = 0
      if (maxOutRect.width > 0 && maxOutRect.height > 0) {
        if (maxOutRect.x < startPaperX) {
          //计算要扩展的数量
          leftExtNum = parseInt((startPaperX - maxOutRect.x) / paperWidth)
          if (Math.abs((startPaperX - maxOutRect.x) % paperWidth) > 1) {
            leftExtNum++
          }
        }
        if (maxOutRect.x1 > startPaperX + paperWidth) {
          //计算要扩展的数量
          rightExtNum = parseInt((maxOutRect.x1 - startPaperX - paperWidth) / paperWidth)
          if (Math.abs((maxOutRect.x1 - startPaperX - paperWidth) % paperWidth) > 1) {
            rightExtNum++
          }
        }
        if (maxOutRect.y < startPaperY) {
          //计算要扩展的数量
          topExtNum = parseInt((startPaperY - maxOutRect.y) / paperHeight)
          if (Math.abs((startPaperY - maxOutRect.y) % paperHeight) > 1) {
            topExtNum++
          }
        }
        if (maxOutRect.y1 > startPaperY + paperHeight) {
          //计算要扩展的数量
          bottomExtNum = parseInt((maxOutRect.y1 - startPaperY - paperHeight) / paperHeight)
          if (Math.abs((maxOutRect.y1 - startPaperY - paperHeight) % paperHeight) > 1) {
            bottomExtNum++
          }
        }
      }
      //从spv.x 开始，左边和右边的宽度
      let leftPaperWidth = (leftExtNum + 0.5) * paperWidth
      let rightPaperWidth = (rightExtNum + 1.5) * paperWidth
      let leftSpace = stage.spv.x
      let rightSpace = stage.width - stage.spv.x

      if (rightPaperWidth > rightSpace) {
        console.log("右扩展")
      } else if ((rightSpace - rightPaperWidth) > paperWidth) {
        console.log("右收缩")
      } else if (leftPaperWidth > leftSpace) {
        console.log("左扩展")
      } else if ((leftSpace - leftPaperWidth) > paperWidth) {
        console.log("左收缩")
      }



      //画布宽度=半张纸宽度+纸张总宽度+半张纸宽度
      //画布高度=半张纸宽度+纸张总宽度+半张纸宽度
      // stage.width = (fullPaperWidth + paperWidth) / rat1
      // stage.height = (fullPaperHeight + paperHeight) / rat1



      // let hScrollWidth = stage.render.hScroll?.width ? stage.render.hScroll.width : 0
      // let hScrollHeight = stage.render.vScroll?.height ? stage.render.vScroll.height : 0
      // if (wpv.x > 0) {
      //   wpv.x = 0
      // } else if (wpv.x < -stage.width + hScrollWidth) {
      //   wpv.x = -stage.width + hScrollWidth
      // }
      // if (wpv.y > 0) {
      //   wpv.y = 0
      // } else if (wpv.y < -stage.height + hScrollHeight) {
      //   wpv.y = -stage.height + hScrollHeight
      // }


      // //画布宽度=半张纸宽度+纸张总宽度+半张纸宽度
      // //画布高度=半张纸宽度+纸张总宽度+半张纸宽度
      // let extW = (fullPaperWidth + paperWidth) / rat1 - stage?.width
      // let extH = (fullPaperHeight + paperHeight) / rat1 - stage?.height

      // if (extW || extH) {
      //   stage.width += extW
      //   stage.height += extH
      //   let moveMatrix = new Matrix3(
      //     1, 0, extW,
      //     0, 1, extH,
      //     0, 0, 1,
      //   );
      //   stage?.spv.applyMatrix3(moveMatrix)
      //   let mds = stage.getLayerModels([]);
      //   mds.forEach(item => {
      //     item.transVectors(moveMatrix)
      //   });

      //   stage.render.selector?.transVectors(moveMatrix)

      // }
    }
    return true
  }

  /**
   * 后置行为，分发，修改当前editor的状态
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
    return new DDeiBusCommandUpdatePaperArea({ code: DDeiEnumBusCommandType.UpdatePaperArea, name: "", desc: "" })
  }

}


export default DDeiBusCommandUpdatePaperArea
