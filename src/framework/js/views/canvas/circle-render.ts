import DDeiConfig from '../../config'
import DDeiRectangle from '../../models/rectangle';
import DDeiCircle from '../../models/circle';
import DDeiUtil from '../../util'
import DDeiRectangleCanvasRender from './rectangle-render';
import DDeiEnumControlState from '../../enums/control-state';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value';

/**
 * DDeiCircle的渲染器类，用于渲染圆型,继承自矩形渲染器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiCircleCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiCircleCanvasRender {
    return new DDeiCircleCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiCircleCanvasRender";
  // ============================== 方法 ===============================

  /**
   * 绘制边框
   * @param tempBorder 临时border信息
   */
  drawBorder(tempBorder: object | null): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    //如果被选中，使用选中的边框，否则使用缺省边框
    let borderType = null;
    let borderColor = null;
    let borderOpac = null;
    let borderWidth = null;
    let borderDash = null;
    if (tempBorder) {
      borderType = tempBorder?.type
      borderColor = tempBorder?.color
      borderOpac = tempBorder?.opacity
      borderWidth = tempBorder?.width
      borderDash = tempBorder?.dash
    } else {
      borderType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.type", true);
      borderColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.color", true);
      borderOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.opacity", true);
      borderWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.width", true);
      borderDash = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.dash", true);
    }



    //绘制四个方向的边框
    //如果边框未被disabled，则绘制边框
    if ((borderType == 1 || borderType == '1') && borderColor && (!borderOpac || borderOpac > 0) && borderWidth > 0) {
      //保存状态
      ctx.save();
      //设置旋转角度
      this.doRotate(ctx, ratPos);
      //开始绘制  
      ctx.beginPath();
      //线段的宽度
      ctx.lineWidth = borderWidth * ratio;
      //线段、虚线样式
      if (borderDash) {
        ctx.setLineDash(borderDash);
      }
      //透明度
      if (borderOpac) {
        ctx.globalAlpha = borderOpac
      }
      //颜色
      ctx.strokeStyle = DDeiUtil.getColor(border.color);
      //绘制一个椭圆
      ctx.ellipse(ratPos.x + ratPos.width * 0.5 + 0.5, ratPos.y + ratPos.height * 0.5 + 0.5, ratPos.width * 0.5, ratPos.height * 0.5, 0, 0, Math.PI * 2)
      ctx.stroke();
      //恢复状态
      ctx.restore();
    }

  }






  /**
   * 绘制填充
   */
  drawFill(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
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
    let fillColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.color", true);
    //如果拥有填充色，则使用填充色
    if (fillColor) {
      ctx.fillStyle = DDeiUtil.getColor(fillColor);
      let fillOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.opacity", true);
      //透明度
      if (fillOpac) {
        ctx.globalAlpha = fillOpac
      }
      //填充一个椭圆
      ctx.ellipse(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height * 0.5, ratPos.width * 0.5, ratPos.height * 0.5, 0, 0, Math.PI * 2)
      ctx.fill();
    }

    //恢复状态
    ctx.restore();

  }


  /**
   * 填充图片
   */
  drawImage(): void {
    //如果有图片，则绘制
    if (this.imgObj) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let stageRatio = this.model.getStageRatio()
      let ratio = this.ddRender.ratio * stageRatio;
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
      let imgFillInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "image.opacity", true);
      //透明度
      if (imgFillInfo) {
        ctx.globalAlpha = imgFillInfo
      }
      ctx.ellipse(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height * 0.5, ratPos.width * 0.5, ratPos.height * 0.5, 0, 0, Math.PI * 2)
      ctx.clip();
      ctx.drawImage(this.imgObj, ratPos.x, ratPos.y, ratPos.width, ratPos.height);

      //恢复状态
      ctx.restore();
    }
  }

  /**
   * 绘制文本
   */
  drawText(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);

    //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    //获取字体信息
    let fiFamily = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.family", true);
    let fiSize = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.size", true);
    let fiColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.color", true);
    //字体对齐信息
    let align = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.align", true);
    let valign = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.valign", true);
    //缩小字体填充
    let scale = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.scale", true);
    //镂空
    let hollow = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.hollow", true);
    //自动换行
    let feed = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.feed", true);

    //如果字体不存在则退出，不输出
    if (!fiFamily) {
      return;
    }
    //TODO 校验属性，不满足则设置缺省值
    if (!align) {
      align = 1
    }
    if (!valign) {
      valign = 2
    }
    if (!scale) {
      scale = 0
    }
    if (!hollow) {
      hollow = 0
    }
    if (!feed) {
      feed = 0;
    }
    //保存状态
    ctx.save();
    //设置旋转角度
    this.doRotate(ctx, ratPos);

    //循环进行分段输出,整体容器，代表了一个整体的文本大小区域
    let textContainer = []

    //是否全部输出完毕标志
    let loop = true;
    let fontSize = fiSize * ratio;

    // TODO 如果有金额大小写转换选项，则执行大小写转换
    let cText = this.model.text;
    // if (this.convertToRMBY == 2 || this.convertToRMBY == '2') {
    //   cText = PDSetting.dealBigMoney(this.text);
    // }

    cText = "" + cText;
    let contentWidth = ratPos.width;
    while (loop) {

      //记录使用过的宽度和高度
      let usedWidth = 0;
      let usedHeight = 0;
      //行容器
      let textRowContainer = { text: "" };
      textContainer.push(textRowContainer);

      //是否超出输出长度标志
      let isOutSize = false;
      if (fontSize > ratPos.height) {
        if (scale == 1) {
          textContainer = [];
          fontSize = fontSize - 0.5;
          continue;
        }
      }
      //设置字体
      ctx.font = fontSize + "px " + fiFamily
      //设置字体颜色
      ctx.fillStyle = fiColor

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
          if (scale == 1 && usedWidth > contentWidth) {
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
              if (scale == 1) {
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
   * 私有函数，计算除边框外的填充区域，用于填充颜色
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let borderType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.type", true);
    let borderColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.color", true);
    let borderOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.opacity", true);
    let borderWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.width", true);


    //计算填充的原始区域
    if (!((borderType == 1 || borderType == '1') && borderColor && (!borderOpac || borderOpac > 0) && borderWidth > 0)) {
      borderWidth = 0
    }
    let absBounds = this.model.getAbsBounds();
    let fillAreaE = {
      x: absBounds.x + borderWidth,
      y: absBounds.y + borderWidth,
      width: absBounds.width - borderWidth - borderWidth,
      height: absBounds.height - borderWidth - borderWidth
    }
    return fillAreaE;
  }

  /**
   * 私有函数，计算除边框外的填充区域字体
   */
  getTextArea(fillArea: object | null, fInfo: object | null): object {
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    if (!fillArea) {
      fillArea = this.getFillArea();
      fillArea = DDeiUtil.getRatioPosition(fillArea, ratio);
    }
    //获取字体信息
    if (!fInfo) {
      fInfo = this.model.font && this.model.font.default ? this.model.font.default : DDeiConfig.CIRCLE.FONT.default;
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        fInfo = this.model.font && this.model.font.selected ? this.model.font.selected : DDeiConfig.CIRCLE.FONT.selected;
      }
    }
    //字体缩放后的大小，用于计算
    let fontSize = fInfo.size * ratio;

    let startFindY = fontSize;
    let startFindX = fillArea.width * 0.5;

  }
}
export { DDeiCircleCanvasRender}
export default DDeiCircleCanvasRender