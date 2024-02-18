import DDeiEditorEnumBusCommandType from '@/components/editor/js/enums/editor-command-type';
import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Vector3, Matrix3 } from 'three';
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
      let rat1 = bus.ddInstance.render.ratio
      //当前的窗口位置（乘以了窗口缩放比例）
      let wpv = stage.wpv

      //纸张的像素大小
      let paperSize = DDeiUtil.getPaperSize(stage)

      let paperWidth = paperSize.width / rat1;
      let paperHeight = paperSize.height / rat1;

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

      let topPaperWidth = (topExtNum + 0.5) * paperHeight
      let bottomPaperWidth = (bottomExtNum + 1.5) * paperHeight
      let topSpace = stage.spv.y
      let bottomSpace = stage.height - stage.spv.y
      let extW = 0, extH = 0
      let needMoveX = false, needMoveY = false
      if (rightPaperWidth > rightSpace) {
        extW = rightPaperWidth - rightSpace

      } else if ((rightSpace - rightPaperWidth) >= paperWidth) {
        extW = -parseInt((rightSpace - rightPaperWidth) / paperWidth) * paperWidth

      }
      if (leftPaperWidth > leftSpace) {
        extW = leftPaperWidth - leftSpace
        needMoveX = true
      } else if (parseFloat((leftSpace - leftPaperWidth).toFixed(2)) >= parseFloat(paperWidth.toFixed(2))) {
        extW = - parseInt((leftSpace - leftPaperWidth) / paperWidth) * paperWidth
        needMoveX = true
      }


      if (bottomPaperWidth > bottomSpace) {
        extH = bottomPaperWidth - bottomSpace
      } else if ((bottomSpace - bottomPaperWidth) >= paperHeight) {
        extH = -parseInt((bottomSpace - bottomPaperWidth) / paperHeight) * paperHeight
      }
      if (topPaperWidth > topSpace) {
        extH = topPaperWidth - topSpace
        needMoveY = true
      } else if (parseFloat((topSpace - topPaperWidth).toFixed(2)) >= parseFloat(paperHeight.toFixed(2))) {
        extH = - parseInt((topSpace - topPaperWidth) / paperHeight) * paperHeight
        needMoveY = true
      }




      if (extW || extH) {
        stage.width += extW
        stage.height += extH
        let mx = 0, my = 0
        if (needMoveX) {
          mx = extW
        }
        if (needMoveY) {
          my = extH
        }
        if (mx || my) {
          let moveMatrix = new Matrix3(
            1, 0, mx,
            0, 1, my,
            0, 0, 1,
          );
          stage?.spv.applyMatrix3(moveMatrix)
          let mds = stage.getLayerModels([]);
          mds.forEach(item => {
            item.transVectors(moveMatrix)
          });

          stage.render.selector?.transVectors(moveMatrix)

          wpv.x -= mx
          wpv.y -= my
        }

      }
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
