import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiStageCanvasRender from './stage-render.js';

/**
 * DDeiRectangle的渲染器类，用于渲染矩形
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiRectangleCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
    this.ddRender = null;
  }
  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDeiRectangle;

  /**
   * 当前的stage实例
   */
  stage: DDeiStage | null;

  /**
  * 当前的layer实例
  */
  layer: DDeiLayer | null;

  /**
   * 当前的ddei实例
   */
  ddRender: DDeiCanvasRender | null;

  /**
    * 当前的stage渲染器
    */
  stageRender: DDeiStageCanvasRender | null;

  /**
  * 当前的layer渲染器
  */
  layerRender: DDeiLayerCanvasRender | null;
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.stage.ddInstance.render
    this.stage = this.model.stage
    this.stageRender = this.model.stage.render
    if (this.model.layer) {
      this.layer = this.model.layer
      this.layerRender = this.model.layer.render
    }
  }

  /**
   * 创建图形
   */
  drawShape(): void {
    //绘制边框
    this.drawBorder();

    //绘制填充
    this.drawFill();

    //绘制文本
    this.drawText();

  }

  /**
   * 取得边框的绘制区域
   */
  getBorderRatPos() {
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    let absBounds = this.model.getAbsBounds();
    return DDeiUtil.getRatioPosition(absBounds, ratio);
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
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.selected ? this.model.border.top.selected : DDeiConfig.RECTANGLE.BORDER.top.selected;
      } else {
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.default ? this.model.border.top.default : DDeiConfig.RECTANGLE.BORDER.top.default;
      }
    } else if (direct == 2) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.selected ? this.model.border.right.selected : DDeiConfig.RECTANGLE.BORDER.right.selected;
      } else {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.default ? this.model.border.right.default : DDeiConfig.RECTANGLE.BORDER.right.default;
      }
    } else if (direct == 3) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.selected ? this.model.border.bottom.selected : DDeiConfig.RECTANGLE.BORDER.bottom.selected;
      } else {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.default ? this.model.border.bottom.default : DDeiConfig.RECTANGLE.BORDER.bottom.default;
      }
    } else if (direct == 4) {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.selected ? this.model.border.left.selected : DDeiConfig.RECTANGLE.BORDER.left.selected;
      } else {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.default ? this.model.border.left.default : DDeiConfig.RECTANGLE.BORDER.left.default;
      }
    }
    return borderInfo;
  }

  /**
   * 绘制边框
   * @param tempBorder 临时边框，优先级最高
   */
  drawBorder(tempBorder: object | null): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    //1,2,3,4 上，右，下，左
    for (let i = 1; i <= 4; i++) {
      //如果被选中，使用选中的边框，否则使用缺省边框
      //TODO 样式最小替换颗粒度，需要前后保持一致
      let borderInfo = this.getBorderInfo(tempBorder, i);

      //绘制四个方向的边框
      //如果边框未被disabled，则绘制边框
      if (!borderInfo.disabled && borderInfo.color && (!borderInfo.opacity || borderInfo.opacity > 0) && borderInfo.width > 0) {
        //保存状态
        ctx.save();
        //设置旋转
        this.doRotate(ctx, ratPos);


        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = borderInfo.width * ratio / 2;
        ctx.lineWidth = borderInfo.width * ratio;
        ctx.beginPath();
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
          ctx.moveTo(ratPos.x, ratPos.y + lineOffset);
          ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + lineOffset);
        } else if (i == 2) {
          ctx.moveTo(ratPos.x + ratPos.width - lineOffset, ratPos.y);
          ctx.lineTo(ratPos.x + ratPos.width - lineOffset, ratPos.y + ratPos.height);
        } else if (i == 3) {
          ctx.moveTo(ratPos.x, ratPos.y + ratPos.height - lineOffset);
          ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height - lineOffset);
        } else if (i == 4) {
          ctx.moveTo(ratPos.x + lineOffset, ratPos.y);
          ctx.lineTo(ratPos.x + lineOffset, ratPos.y + ratPos.height);
        }
        ctx.stroke();
        //恢复状态
        ctx.restore();
      }

    }
  }





  /**
   * 绘制填充
   */
  drawFill(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
    //缩放填充区域
    //保存状态
    ctx.save();
    //设置旋转角度
    this.doRotate(ctx, ratPos);

    //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
    let fillInfo = null;
    if (this.model.state == DDeiEnumControlState.SELECTED) {
      fillInfo = this.model.fill && this.model.fill.selected ? this.model.fill.selected : DDeiConfig.RECTANGLE.FILL.selected
    } else {
      fillInfo = this.model.fill && this.model.fill.default ? this.model.fill.default : DDeiConfig.RECTANGLE.FILL.default
    }
    //如果拥有填充色，则使用填充色
    if (fillInfo && fillInfo.color) {
      ctx.fillStyle = DDeiUtil.getColor(fillInfo.color);
      //透明度
      if (fillInfo.opacity) {
        ctx.globalAlpha = fillInfo.opacity
      }
      //填充矩形
      ctx.fillRect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    }

    //恢复状态
    ctx.restore();

  }

  /**
   * 绘制文本
   */
  drawText(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);

    //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    //获取字体信息
    let fInfo = this.model.font && this.model.font.default ? this.model.font.default : DDeiConfig.RECTANGLE.FONT.default;
    //字体对齐信息
    let align = this.model.textStyle && this.model.textStyle.default && this.model.textStyle.default.align ? this.model.textStyle.default.align : DDeiConfig.RECTANGLE.TEXTSTYLE.default.align;
    let valign = this.model.textStyle && this.model.textStyle.default && this.model.textStyle.default.valign ? this.model.textStyle.default.valign : DDeiConfig.RECTANGLE.TEXTSTYLE.default.valign;
    //缩小字体填充
    let autoScaleFill = this.model.textStyle && this.model.textStyle.default && this.model.textStyle.default.autoScaleFill ? this.model.textStyle.default.autoScaleFill : DDeiConfig.RECTANGLE.TEXTSTYLE.default.autoScaleFill;
    //镂空
    let hollow = this.model.textStyle && this.model.textStyle.default && this.model.textStyle.default.hollow ? this.model.textStyle.default.hollow : DDeiConfig.RECTANGLE.TEXTSTYLE.default.hollow;
    //自动换行
    let feed = this.model.textStyle && this.model.textStyle.default && this.model.textStyle.default.feed ? this.model.textStyle.default.feed : DDeiConfig.RECTANGLE.TEXTSTYLE.default.feed;
    if (this.model.state == DDeiEnumControlState.SELECTED) {
      fInfo = this.model.font && this.model.font.selected ? this.model.font.selected : DDeiConfig.RECTANGLE.FONT.selected;
      align = this.model.textStyle && this.model.textStyle.selected && this.model.textStyle.selected.align ? this.model.textStyle.selected.align : DDeiConfig.RECTANGLE.TEXTSTYLE.selected.align;
      valign = this.model.textStyle && this.model.textStyle.selected && this.model.textStyle.selected.valign ? this.model.textStyle.selected.valign : DDeiConfig.RECTANGLE.TEXTSTYLE.selected.valign;
      autoScaleFill = this.model.textStyle && this.model.textStyle.selected && this.model.textStyle.selected.autoScaleFill ? this.model.textStyle.selected.autoScaleFill : DDeiConfig.RECTANGLE.TEXTSTYLE.selected.autoScaleFill;
      hollow = this.model.textStyle && this.model.textStyle.selected && this.model.textStyle.selected.hollow ? this.model.textStyle.selected.hollow : DDeiConfig.RECTANGLE.TEXTSTYLE.selected.hollow;
      feed = this.model.textStyle && this.model.textStyle.selected && this.model.textStyle.selected.feed ? this.model.textStyle.selected.feed : DDeiConfig.RECTANGLE.TEXTSTYLE.selected.feed;
    }
    //如果字体不存在则退出，不输出
    if (!fInfo) {
      return;
    }
    //TODO 校验属性，不满足则设置缺省值
    if (!align) {
      align = 1
    }
    if (!valign) {
      valign = 2
    }
    if (!autoScaleFill) {
      autoScaleFill = 0
    }
    if (!hollow) {
      hollow = 0
    }
    if (!feed) {
      feed = 0;
    }
    //保存状态
    ctx.save();
    //设置旋转
    this.doRotate(ctx, ratPos);

    //循环进行分段输出,整体容器，代表了一个整体的文本大小区域
    let textContainer = []

    //是否全部输出完毕标志
    let loop = true;
    let fontSize = fInfo.size * ratio;

    // TODO 如果有金额大小写转换选项，则执行大小写转换
    let cText = this.model.text;
    // if (this.convertToRMBY == 2 || this.convertToRMBY == '2') {
    //   cText = PDSetting.dealBigMoney(this.text);
    // }

    cText = "" + cText;
    let contentWidth = ratPos.width;
    while (loop) {

      //循环拆分结果，分别对空格，非空格按照是否换行，缩小等进行处理
      let spaceWidth = DDeiUtil.getSpaceWidth(fInfo.family, fontSize, "normal");
      //记录使用过的宽度和高度
      let usedWidth = 0;
      let usedHeight = 0;
      //行容器
      let textRowContainer = { text: "" };
      textContainer.push(textRowContainer);

      //是否超出输出长度标志
      let isOutSize = false;
      if (fontSize > ratPos.height) {
        if (autoScaleFill == 1) {
          textContainer = [];
          fontSize = fontSize - 0.5;
          continue;
        }
      }
      //设置字体
      ctx.font = fontSize + "px " + fInfo.family
      //设置字体颜色
      ctx.fillStyle = fInfo.color

      for (let ti = 0; ti < cText.length; ti++) {
        let te = cText[ti];
        textRowContainer.text += te;
        let fontShapeRect = ctx.measureText(textRowContainer.text);
        usedWidth = fontShapeRect.width;
        let fontHeight = parseFloat(fontSize);
        textRowContainer.width = usedWidth
        textRowContainer.height = fontHeight
        //如果不自动换行也不缩小字体，则超过的话，就省略显示
        if (feed == 0) {
          //如果具备缩小字体填充，并且usedWidth超出了单行大小,则跳出循环，重新生成
          if (autoScaleFill == 1 && usedWidth > contentWidth) {
            isOutSize = true;
            break;
          }
          //省略显示,除去一个字符，重新计算大小
          else if (usedWidth > contentWidth) {
            textRowContainer.text = textRowContainer.text.substring(0, textRowContainer.text.length - 1)
            let fontShapeRect = ctx.measureText(textRowContainer.text);
            usedWidth = fontShapeRect.width;
            textRowContainer.width = usedWidth
            break;
          }
        }
        //处理换行
        else if (feed == 1) {

          //如果插入本字符后的大小，大于了容器的大小，则需要换行
          if (usedWidth > contentWidth) {
            //先使当前行字符-1
            textRowContainer.text = textRowContainer.text.substring(0, textRowContainer.text.length - 1)
            let fontShapeRect = ctx.measureText(textRowContainer.text);
            textRowContainer.width = fontShapeRect.width
            //新开一行重新开始
            usedWidth = 0;
            usedHeight += fontHeight;
            //换行的情况下，如果行高度超出，则不输出
            if (usedHeight + fontHeight > ratPos.height) {
              //如果具备缩小字体填充，则重新生成
              if (autoScaleFill == 1) {
                isOutSize = true;
              }
              break;
            }
            textRowContainer = { text: te };
            fontShapeRect = ctx.measureText(textRowContainer.text);
            usedWidth = fontShapeRect.width;
            textRowContainer.width = usedWidth
            textRowContainer.height = fontHeight
            textContainer.push(textRowContainer);
          }
        }
      }
      //如果没有超出，则输出完毕
      if (!isOutSize) {
        loop = false;
      }
      //如果超出，清空生成的字段，缩小字体重新输出
      else {
        textContainer = [];
        fontSize = fontSize - 0.5;
      }
    }
    // 计算文字整体区域位置
    let containerRect = { width: 0, height: 0 };
    for (let i = 0; i < textContainer.length; i++) {
      if (i == 0) {
        containerRect.width += textContainer[i].width
      }
      containerRect.height += textContainer[i].height
    }
    let containerWidth = containerRect.width;
    let containerHeight = containerRect.height;
    let x, y;
    if (align == 1) {
      x = 0;
    } else if (align == 2) {
      x = (ratPos.width - containerWidth) * 0.5
    } else if (align == 3) {
      x = ratPos.width - containerWidth;
    }
    x = x + ratPos.x

    if (valign == 1) {
      y = 0;
    } else if (valign == 2) {
      y = (ratPos.height - containerHeight) * 0.5;
    } else if (valign == 3) {
      y = ratPos.height - containerHeight;
    }
    y = y + ratPos.y
    //如果换行，则对每一子行进行对齐
    if (feed == 1) {

      //对内部容器进行排列对齐
      for (let tci = 0; tci < textContainer.length; tci++) {

        let rRect = textContainer[tci];
        //绘制文字
        if (align == 1) {
          if (hollow == 1) {
            ctx.strokeText(rRect.text, x, y + rRect.height * tci)
          } else {
            ctx.fillText(rRect.text, x, y + rRect.height * tci)
          }
        } else if (align == 2) {
          if (hollow == 1) {
            ctx.strokeText(rRect.text, ratPos.x + (ratPos.width - rRect.width) * 0.5, y + rRect.height * tci)
          } else {
            ctx.fillText(rRect.text, ratPos.x + (ratPos.width - rRect.width) * 0.5, y + rRect.height * tci)
          }
        } else if (align == 3) {
          if (hollow == 1) {
            ctx.strokeText(rRect.text, ratPos.x + (ratPos.width - rRect.width), y + rRect.height * tci)
          } else {
            ctx.fillText(rRect.text, ratPos.x + (ratPos.width - rRect.width), y + rRect.height * tci)
          }

        }
      }
    }
    //如果不换行，则输出第一行内容,直接对整理进行坐标对齐
    else {
      //处理镂空样式
      if (hollow == 1) {
        ctx.strokeText(textContainer[0].text, x, y)
      } else {
        ctx.fillText(textContainer[0].text, x, y)
      }

    }

    //恢复状态
    ctx.restore();

  }

  /**
   * 根据模型的值，设置旋转
   */
  doRotate(ctx, ratPos): void {
    //设置旋转角度
    if (this.model.rotate) {
      ctx.translate(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height * 0.5)
      ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-ratPos.x - ratPos.width * 0.5, -ratPos.y - ratPos.height * 0.5)
    }
  }

  /**
   * 私有函数，计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let topBorder, bottomBorder, leftBorder, rightBorder;
    if (this.model.state == DDeiEnumControlState.SELECTED) {
      topBorder = this.model.border && this.model.border.top && this.model.border.top.selected ? this.model.border.top.selected : DDeiConfig.RECTANGLE.BORDER.top.selected;
      rightBorder = this.model.border && this.model.border.right && this.model.border.right.selected ? this.model.border.right.selected : DDeiConfig.RECTANGLE.BORDER.right.selected;
      bottomBorder = this.model.border && this.model.border.bottom && this.model.border.bottom.selected ? this.model.border.bottom.selected : DDeiConfig.RECTANGLE.BORDER.bottom.selected;
      leftBorder = this.model.border && this.model.border.left && this.model.border.left.selected ? this.model.border.left.selected : DDeiConfig.RECTANGLE.BORDER.left.selected;
    } else {
      topBorder = this.model.border && this.model.border.top && this.model.border.top.default ? this.model.border.top.default : DDeiConfig.RECTANGLE.BORDER.top.default;
      rightBorder = this.model.border && this.model.border.right && this.model.border.right.default ? this.model.border.right.default : DDeiConfig.RECTANGLE.BORDER.right.default;
      bottomBorder = this.model.border && this.model.border.bottom && this.model.border.bottom.default ? this.model.border.bottom.default : DDeiConfig.RECTANGLE.BORDER.bottom.default;
      leftBorder = this.model.border && this.model.border.left && this.model.border.left.default ? this.model.border.left.default : DDeiConfig.RECTANGLE.BORDER.left.default;
    }
    //计算填充的原始区域
    let leftWidth = 0;
    if (!leftBorder.disabled && leftBorder.color && (!leftBorder.opacity || leftBorder.opacity > 0) && leftBorder.width > 0) {
      leftWidth = leftBorder.width;
    }
    let rightWidth = 0;
    if (!rightBorder.disabled && rightBorder.color && (!rightBorder.opacity || rightBorder.opacity > 0) > 0 && rightBorder.width > 0) {
      rightWidth = rightBorder.width;
    }
    let topWidth = 0;
    if (!topBorder.disabled && topBorder.color && (!topBorder.opacity || topBorder.opacity > 0) > 0 && topBorder.width > 0) {
      topWidth = topBorder.width;
    }
    let bottomWidth = 0;
    if (!bottomBorder.disabled && bottomBorder.color && (!bottomBorder.opacity || bottomBorder.opacity > 0) > 0 && bottomBorder.width > 0) {
      bottomWidth = bottomBorder.width;
    }
    let absBounds = this.model.getAbsBounds();
    let fillAreaE = {
      x: absBounds.x + leftWidth,
      y: absBounds.y + topWidth,
      width: absBounds.width - leftWidth - rightWidth,
      height: absBounds.height - topWidth - bottomWidth
    }
    return fillAreaE;
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {

  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {

  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
  }
}

export default DDeiRectangleCanvasRender