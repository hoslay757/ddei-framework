import DDeiConfig from '../../config.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiUtil from '../../util.js';
import DDeiRectangleCanvasRender from './rectangle-render.js';

/**
 * DDeiSelector的渲染器类，用于渲染选择器
 */
class DDeiSelectorCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 方法 ===============================


  /**
   * 创建图形
   */
  drawShape(): void {

    //绘制边框
    this.drawBorder();


    //绘制边框上的操作图形
    this.drawOperatorShape();

    //绘制填充
    this.drawFill();

    //绘制选中控件特效
    this.drawIncludedStyle();

    //修改鼠标样式
    this.changeCursorStyle();
  }

  // //设置旋转,覆写
  // doRotate(ctx, ratPos): void {
  //   //设置旋转角度
  //   if (this.model.rotate) {
  //     let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
  //     let paddingWeight = 0;
  //     let selectedModels = this.stage?.layers[this.stage.layerIndex].getSelectedModels();
  //     if (selectedModels.size > 1) {
  //       paddingWeight = paddingWeightInfo.multiple;
  //     } else {
  //       paddingWeight = paddingWeightInfo.single;
  //     }
  //     ctx.translate(ratPos.x + ratPos.width * 0.5 + paddingWeight, ratPos.y + ratPos.height * 0.5 + paddingWeight)
  //     ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);
  //     ctx.translate(-ratPos.x - ratPos.width * 0.5 - paddingWeight, -ratPos.y - ratPos.height * 0.5 - paddingWeight)
  //   }
  // }

  /**
   * 获取边框上的操作图形
   * @param tempBorder 
   */
  drawOperatorShape(tempBorder: object | null): void {
    if (this.model.state != DDeiEnumControlState.SELECTED) {
      return;
    }
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();
    //保存状态
    ctx.save();
    //设置旋转
    this.doRotate(ctx, ratPos);
    for (let i = 1; i <= 9; i++) {
      //如果被选中，使用选中的边框，否则使用缺省边框
      let borderInfo = null;
      if (i <= 2) {
        borderInfo = this.getBorderInfo(tempBorder, 1);
      } else if (i <= 4) {
        borderInfo = this.getBorderInfo(tempBorder, 2);
      } else if (i <= 6) {
        borderInfo = this.getBorderInfo(tempBorder, 3);
      } else if (i <= 8) {
        borderInfo = this.getBorderInfo(tempBorder, 4);
      } else if (i == 9) {
        borderInfo = this.getBorderInfo(tempBorder, 1);
      }

      //如果边框未被disabled，则绘制边框
      if (!borderInfo.disabled && borderInfo.color && (!borderInfo.opacity || borderInfo.opacity > 0) && borderInfo.width > 0) {

        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = borderInfo.width * ratio / 2;
        ctx.lineWidth = borderInfo.width * ratio;
        ctx.beginPath();

        //透明度
        if (borderInfo.opacity) {
          ctx.globalAlpha = borderInfo.opacity
        }
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(borderInfo.color);
        //填充操作图标的颜色
        let defaultFillColor = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.default);
        ctx.fillStyle = defaultFillColor;

        //操作图标的宽度
        let width = DDeiConfig.SELECTOR.OPERATE_ICON.weight * ratio;
        //设置填充样式
        if (this.model.passIndex == i) {
          ctx.fillStyle = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.pass);
        }
        if (i == 1) {
          ctx.strokeRect(ratPos.x + ratPos.width * 0.5 - width * 0.5 + lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
          ctx.fillRect(ratPos.x + ratPos.width * 0.5 - width * 0.5 + lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
        } else if (i == 2) {
          ctx.strokeRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
          ctx.fillRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
        } else if (i == 3) {
          ctx.strokeRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y + ratPos.height * 0.5 - width * 0.5 + lineOffset, width, width);
          ctx.fillRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y + ratPos.height * 0.5 - width * 0.5 + lineOffset, width, width);
        } else if (i == 4) {
          ctx.strokeRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
          ctx.fillRect(ratPos.x + ratPos.width - width * 0.5 - lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
        } else if (i == 5) {
          ctx.strokeRect(ratPos.x + ratPos.width * 0.5 - width * 0.5 + lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
          ctx.fillRect(ratPos.x + ratPos.width * 0.5 - width * 0.5 + lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
        } else if (i == 6) {
          ctx.strokeRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
          ctx.fillRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y + ratPos.height - width * 0.5 - lineOffset, width, width);
        } else if (i == 7) {
          ctx.strokeRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y + ratPos.height * 0.5 - width * 0.5 + lineOffset, width, width);
          ctx.fillRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y + ratPos.height * 0.5 - width * 0.5 + lineOffset, width, width);
        } else if (i == 8) {
          ctx.strokeRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
          ctx.fillRect(ratPos.x - width * 0.5 + lineOffset, ratPos.y - width * 0.5 + lineOffset, width, width);
        } else if (i == 9) {
          if (this.model.passIndex == i) {
            //填充一个圆形
            ctx.ellipse(ratPos.x + ratPos.width * 0.5 + lineOffset, ratPos.y - width * 2 + lineOffset, width * 0.5, width * 0.5, 0, 0, Math.PI * 2)
            ctx.fill();
          } else {
            //绘制旋转按钮
            ctx.arc(ratPos.x + ratPos.width * 0.5 + lineOffset, ratPos.y - width * 2 + lineOffset, width * 0.4, 50, Math.PI * 1.6)
            ctx.stroke()
          }
        }

      }

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
    } else {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border && this.model.border.selected ? this.model.border.selected : DDeiConfig.SELECTOR.BORDER.selected;
      } else {
        borderInfo = this.model.border && this.model.border && this.model.border.default ? this.model.border.default : DDeiConfig.SELECTOR.BORDER.default;
      }
    }
    return borderInfo;
  }

  /**
   * 绘制选中图形特效
   */
  drawIncludedStyle(): void {
    //选中被选择器包含的控件
    let includedModels: Map<string, DDeiAbstractShape> | null = null;
    let selectNumber = 0
    if (this.model.state == DDeiEnumControlState.DEFAULT) {
      includedModels = this.model.getIncludedModels();
    } else if (this.model.state == DDeiEnumControlState.SELECTED) {
      includedModels = this.stage.layers[this.stage.layerIndex].getSelectedModels();
      selectNumber = 1
    }
    if (includedModels && includedModels.size > selectNumber) {
      includedModels.forEach((model, key) => {
        //绘制临时Border
        //TODO 样式的配置
        model.render.drawBorder({ width: 1, color: "red" });
      });
    }

  }

  /**
   * 修改鼠标样式
   */
  changeCursorStyle(): void {
    switch (this.model.passIndex) {
      case 1:
        document.body.style.cursor = 'ns-resize';
        break;
      case 2:
        document.body.style.cursor = 'nesw-resize';
        break;
      case 3:
        document.body.style.cursor = 'ew-resize';
        break;
      case 4:
        document.body.style.cursor = 'nwse-resize';
        break;
      case 5:
        document.body.style.cursor = 'ns-resize';
        break;
      case 6:
        document.body.style.cursor = 'nesw-resize';
        break;
      case 7:
        document.body.style.cursor = 'ew-resize';
        break;
      case 8:
        document.body.style.cursor = 'nwse-resize';
        break;
      case 9:
        document.body.style.cursor = 'alias';
        break;
      case 10:
        document.body.style.cursor = 'all-scroll';
        break;
      default:
        document.body.style.cursor = 'default';
        break;
    }
  }

  /**
   * 鼠标移动事件，经由上层容器分发
   */
  mouseMove(evt: Event): void {
    let offsetX = evt.offsetX;
    let offsetY = evt.offsetY;
    //判断当前坐标是否位于操作按钮上
    //中上
    if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width * 0.5 - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(1);
    }
    //右上
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(2);
    }
    //右中
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y + this.model.height * 0.5 - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(3);
    }
    //右下
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y + this.model.height - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(4);
    }
    //中下
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width * 0.5 - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y + this.model.height - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(5);
    }
    //左下
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y + this.model.height - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(6);
    }
    //左中
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y + this.model.height * 0.5 - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(7);
    }
    //左上
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(8);
    }
    //旋转
    else if (DDeiAbstractShape.isInArea(offsetX, offsetY,
      {
        x: this.model.x + this.model.width * 0.5 - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 0.5,
        y: this.model.y - DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2.5,
        width: DDeiConfig.SELECTOR.OPERATE_ICON.weight, height: DDeiConfig.SELECTOR.OPERATE_ICON.weight
      })) {
      this.model.setPassIndex(9);
    } else {
      //判断是否在某个具体选中的控件上，如果是则分发事件
      let models = this.stage?.layers[this.stage?.layerIndex].findModelsByArea(offsetX, offsetY);
      //TODO 事件如何分发，分发一个还是多个？
      //TODO 不同的逻辑应该放在哪个层的事件去处理？例如控件的移动，变光标等等
      if (models && models.length > 0) {
        this.model.setPassIndex(10);
      } else {
        this.model.setPassIndex(-1);
      }
    }
    if (this.model.passChange) {
      this.drawShape();
    }
  }

  /**
  * 鼠标按下事件，经由上层容器分发
  */
  mouseDown(evt: Event): void {
    //判断当前坐标是否位于操作按钮上,如果是则改变状态为响应状态
    if (this.model.passIndex >= 1 && this.model.passIndex <= 8) {
      this.stageRender.dragObj = {
        x: evt.offsetX,
        y: evt.offsetY
      }
      //当前操作状态：改变控件大小中
      this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CHANGING_BOUND
    }
    //旋转
    else if (this.model.passIndex == 9) {
      this.stageRender.dragObj = {
        x: evt.offsetX,
        y: evt.offsetY
      }
      //当前操作状态：改变控件大小中
      this.stageRender.operateState = DDeiEnumOperateState.CONTROL_ROTATE
    }
    //记录当前拖拽状态
    if (this.model.passIndex != -1) {

    }
  }
}

export default DDeiSelectorCanvasRender