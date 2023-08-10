import DDeiConfig from '../../config'
import DDeiRectangle from '../../models/rectangle';
import DDeiCircle from '../../models/circle';
import DDeiUtil from '../../util'
import DDeiRectangleCanvasRender from './rectangle-render';
import DDeiEnumControlState from '../../enums/control-state';

/**
 * DDeiDiamond的渲染器类，用于渲染菱形,继承自矩形渲染器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiDiamondCanvasRender extends DDeiRectangleCanvasRender {

  // ============================== 方法 ===============================


  /**
  * 创建图形
  */
  drawShape(): void {
    //绘制边框
    this.drawBorderAndFill();

    //绘制文本
    this.drawText();

  }
  /**
   * 绘制边框
   * @param tempBorder 临时边框，优先级最高
   */
  drawBorderAndFill(tempBorder: object | null): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    //1,2,3,4 上，右，下，左
    //保存状态
    ctx.save();
    //设置旋转角度
    if (this.model.rotate) {
      ctx.translate(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height * 0.5)
      ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-ratPos.x - ratPos.width * 0.5, -ratPos.y - ratPos.height * 0.5)
    }
    for (let i = 1; i <= 4; i++) {
      //如果被选中，使用选中的边框，否则使用缺省边框
      //TODO 样式最小替换颗粒度，需要前后保持一致
      let borderInfo = this.getBorderInfo(tempBorder, i);

      //绘制四个方向的边框
      //如果边框未被disabled，则绘制边框
      if (!borderInfo.disabled && borderInfo.color && (!borderInfo.opacity || borderInfo.opacity > 0) && borderInfo.width > 0) {


        ctx.beginPath();
        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = borderInfo.width * ratio / 2;
        ctx.lineWidth = borderInfo.width * ratio;

        //线段、虚线样式
        if (borderInfo.dash) {
          ctx.setLineDash(borderInfo.dash);
        }
        //透明度
        if (borderInfo.opacity) {
          ctx.globalAlpha = borderInfo.opacity
        }
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(borderInfo.color);
        if (i == 1) {
          ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
          ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
        } else if (i == 2) {
          ctx.moveTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
          ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
        } else if (i == 3) {
          ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
          ctx.lineTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
        } else if (i == 4) {
          ctx.moveTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
          ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
        }
        ctx.stroke();
        ctx.closePath();
      }
    }
    //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
    let fillInfo = null;
    if (this.model.state == DDeiEnumControlState.SELECTED) {
      fillInfo = this.model.fill && this.model.fill.selected ? this.model.fill.selected : DDeiConfig.DIAMOND.FILL.selected
    } else {
      fillInfo = this.model.fill && this.model.fill.default ? this.model.fill.default : DDeiConfig.DIAMOND.FILL.default
    }
    //如果拥有填充色，则使用填充色
    if (fillInfo && fillInfo.color) {

      ctx.fillStyle = DDeiUtil.getColor(fillInfo.color);
      //透明度
      if (fillInfo.opacity) {
        ctx.globalAlpha = fillInfo.opacity
      }
      ctx.beginPath();
      ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
      ctx.lineTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.closePath()
      //填充矩形
      ctx.fill();
    }
    //恢复状态
    ctx.restore();
  }

  /**
     * 获取边框信息
     * @param tempBorder 
     */
  getBorderInfo(tempBorder, direct): object {
    let borderInfo = null;
    if (tempBorder) {
      borderInfo = tempBorder;
    } else if (direct == 1) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.selected ? this.model.border.top.selected : DDeiConfig.DIAMOND.BORDER.top.selected;
      } else {
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.default ? this.model.border.top.default : DDeiConfig.DIAMOND.BORDER.top.default;
      }
    } else if (direct == 2) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.selected ? this.model.border.right.selected : DDeiConfig.DIAMOND.BORDER.right.selected;
      } else {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.default ? this.model.border.right.default : DDeiConfig.DIAMOND.BORDER.right.default;
      }
    } else if (direct == 3) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.selected ? this.model.border.bottom.selected : DDeiConfig.DIAMOND.BORDER.bottom.selected;
      } else {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.default ? this.model.border.bottom.default : DDeiConfig.DIAMOND.BORDER.bottom.default;
      }
    } else if (direct == 4) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.selected ? this.model.border.left.selected : DDeiConfig.DIAMOND.BORDER.left.selected;
      } else {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.default ? this.model.border.left.default : DDeiConfig.DIAMOND.BORDER.left.default;
      }
    }
    return borderInfo;
  }
}

export default DDeiDiamondCanvasRender