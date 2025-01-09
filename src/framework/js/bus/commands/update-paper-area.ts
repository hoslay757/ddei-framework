import DDeiEditorEnumBusCommandType from '@ddei-core/editor/js/enums/editor-command-type';
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
    let paperType
    if (stage.paper?.type) {
      paperType = stage.paper.type;
    } else if (stage.ddInstance.paper) {
      if (typeof (stage.ddInstance.paper) == 'string') {
        paperType = stage.ddInstance.paper;
      } else {
        paperType = stage.ddInstance.paper.type;
      }
    } else {
      paperType = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.type", true);
    }
    //获取纸张大小的定义
    let paperConfig = DDeiConfig.PAPER[paperType];
    let stageRatio = stage?.getStageRatio()
    let paperWidth, paperHeight
    let mds
    if (paperConfig) {
      //纸张的像素大小
      let paperSize = DDeiUtil.getPaperSize(stage,paperType,false)
      paperWidth = paperSize.width;
      paperHeight = paperSize.height;
    }else{
      mds = stage?.getLayerModels(null,100)
      let outRect = DDeiAbstractShape.getOutRectByPV(mds)
      paperWidth = outRect.width * stageRatio
      paperHeight = outRect.height * stageRatio
    }
    //当前的窗口位置（乘以了窗口缩放比例）
    let wpv = stage.wpv
    //第一张纸开始位置
    if (!stage.spv) {
      let sx = stage.width / 2 - paperWidth/stageRatio / 2
      let sy = stage.height / 2 - paperHeight/stageRatio / 2
      stage.spv = new Vector3(sx, sy, 1)
    }
    let startPaperX = stage.spv.x * stageRatio
    let startPaperY = stage.spv.y * stageRatio


    //获取最大的有效范围，自动扩展纸张
    let maxOutRect = DDeiAbstractShape.getOutRectByPV(stage.getLayerModels())
    maxOutRect.x = maxOutRect.x * stageRatio;
    maxOutRect.x1 = maxOutRect.x1 * stageRatio;
    maxOutRect.y = maxOutRect.y * stageRatio;
    maxOutRect.y1 = maxOutRect.y1 * stageRatio;
    maxOutRect.width = maxOutRect.width * stageRatio;
    maxOutRect.height = maxOutRect.height * stageRatio;
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
    let leftSpace = stage.spv.x * stageRatio
    let rightSpace = stage.width - stage.spv.x * stageRatio

    let topPaperWidth = (topExtNum + 0.5) * paperHeight
    let bottomPaperWidth = (bottomExtNum + 1.5) * paperHeight
    let topSpace = stage.spv.y * stageRatio
    let bottomSpace = stage.height - stage.spv.y * stageRatio
    let extW = 0, extH = 0
    let needMoveX = false, needMoveY = false
    if (rightPaperWidth > rightSpace) {
      extW = rightPaperWidth - rightSpace

    } else if (rightSpace > rightPaperWidth) {
      extW = -(rightSpace - rightPaperWidth)
    }
    if (leftPaperWidth > leftSpace) {
      extW = leftPaperWidth - leftSpace
      needMoveX = true
    } else if (leftSpace > leftPaperWidth) {
      extW = -(leftSpace - leftPaperWidth)
      needMoveX = true
    }


    if (bottomPaperWidth > bottomSpace) {
      extH = bottomPaperWidth - bottomSpace
    } else if (bottomSpace > bottomPaperWidth) {
      extH = -(bottomSpace - bottomPaperWidth)
    }
    if (topPaperWidth > topSpace) {
      extH = topPaperWidth - topSpace
      needMoveY = true
    } else if (topSpace > topPaperWidth ) {
      extH = - (topSpace - topPaperWidth)
      needMoveY = true
    }


    if(!bus.ddInstance.EXT_STAGE_WIDTH){
      extW = 0;
    }
    if (!bus.ddInstance.EXT_STAGE_HEIGHT) {
      extH = 0;
    }
    if (extW || extH) {
      stage.width = leftPaperWidth + rightPaperWidth
      stage.height = bottomPaperWidth + topPaperWidth
      let mx = 0, my = 0
      if (needMoveX) {
        mx = extW
      }
      if (needMoveY) {
        my = extH
      }
      if (mx || my) {
        let moveMatrix = new Matrix3(
          1, 0, mx/stageRatio,
          0, 1, my/stageRatio,
          0, 0, 1,
        );
        stage.spv.x += (mx/stageRatio)
        stage.spv.y += (my/stageRatio)
        if (!mds){
          mds = stage.getLayerModels();
        }
        mds.forEach(item => {
          item.transVectors(moveMatrix)
        });

        stage.render.selector?.transVectors(moveMatrix)

        wpv.x -= mx 
        wpv.y -= my 
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

export { DDeiBusCommandUpdatePaperArea }
export default DDeiBusCommandUpdatePaperArea
