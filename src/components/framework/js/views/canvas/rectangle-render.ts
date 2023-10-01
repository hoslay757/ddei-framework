import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiAbstractShapeRender from './shape-render-base.js';
import DDeiStageCanvasRender from './stage-render.js';
import { cloneDeep } from 'lodash'

/**
 * DDeiRectangle的渲染器类，用于渲染矩形
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiRectangleCanvasRender extends DDeiAbstractShapeRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiRectangleCanvasRender {
    return new DDeiRectangleCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiRectangleCanvasRender";
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
    //加载图片
    if (this.model.img && !this.imgObj) {
      let img = new Image();   // 创建一个<img>元素
      let that = this;
      img.onload = function () {
        that.imgObj = img;
        that.ddInstance.render.drawShape()//绘制图片
      }
      img.src = this.model.img;
    }
  }

  /**
   * 创建图形
   */
  drawShape(): void {

    this.model.calRotatePointVectors();

    //绘制边框
    this.drawBorder();

    //绘制填充
    this.drawFill();

    //绘制图片
    this.drawImage();

    //绘制文本
    this.drawText();


    //清空旋转矩阵
    this.model.currentPointVectors = this.model.pointVectors;
    this.model.pointVectors = null;

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
  getBorderInfo(tempBorder, direct, path): object {
    let borderInfo = null;
    if (tempBorder) {
      try {
        let returnJSON = DDeiUtil.getDataByPath(tempBorder, path.split('.'));
        borderInfo = returnJSON.data
      } catch (e) {

      }
    } else if (direct == 1) {
      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.top" + "." + path, true);
    } else if (direct == 2) {

      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.right" + "." + path, true);
    } else if (direct == 3) {

      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.bottom" + "." + path, true);
    } else if (direct == 4) {
      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.left" + "." + path, true);
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
      let disabled = this.getBorderInfo(tempBorder, i, "disabled");
      let color = this.getBorderInfo(tempBorder, i, "color");
      let opacity = this.getBorderInfo(tempBorder, i, "opacity");
      let width = this.getBorderInfo(tempBorder, i, "width");
      let dash = this.getBorderInfo(tempBorder, i, "dash");

      //绘制四个方向的边框
      //如果边框未被disabled，则绘制边框
      if (!disabled && color && (!opacity || opacity > 0) && width > 0) {
        //保存状态
        ctx.save();
        //设置旋转
        this.doRotate(ctx, ratPos);


        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = width * ratio / 2;
        ctx.lineWidth = width * ratio;
        ctx.beginPath();
        //线段、虚线样式
        if (dash) {
          ctx.setLineDash(dash);
        }
        //透明度
        if (opacity != null && opacity != undefined) {
          ctx.globalAlpha = opacity
        }
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(color);
        if (this.stage?.selectedModels?.size > 0 && this.model.baseModelType == "DDeiSelector") {
          let pvs = this.model.currentPointVectors;
          if (pvs?.length > 0) {
            if (i == 4) {
              ctx.moveTo(pvs[i - 1].x * ratio + lineOffset, pvs[i - 1].y * ratio + lineOffset);
              ctx.lineTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
            } else {
              ctx.moveTo(pvs[i - 1].x * ratio + lineOffset, pvs[i - 1].y * ratio + lineOffset);
              ctx.lineTo(pvs[i].x * ratio + lineOffset, pvs[i].y * ratio + lineOffset);
            }
          }
        } else {
          if (i == 1) {
            ctx.moveTo(ratPos.x + lineOffset, ratPos.y + lineOffset);
            ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + lineOffset);
          } else if (i == 2) {
            ctx.moveTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + lineOffset);
            ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + ratPos.height + lineOffset);
          } else if (i == 3) {
            ctx.moveTo(ratPos.x + lineOffset, ratPos.y + ratPos.height + lineOffset);
            ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + ratPos.height + lineOffset);
          } else if (i == 4) {
            ctx.moveTo(ratPos.x + lineOffset, ratPos.y + lineOffset);
            ctx.lineTo(ratPos.x + lineOffset, ratPos.y + ratPos.height + lineOffset);
          }
        }
        ctx.stroke();
        //恢复状态
        ctx.restore();
      }

    }
  }



  /**
   * 填充图片
   */
  drawImage(): void {
    //如果有图片，则绘制
    if (this.model.img && this.imgObj) {
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
      let imgFillInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "image.opacity", true);
      //透明度
      if (imgFillInfo) {
        ctx.globalAlpha = imgFillInfo
      }
      ctx.drawImage(this.imgObj, ratPos.x, ratPos.y, ratPos.width, ratPos.height);

      //恢复状态
      ctx.restore();
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
    let fillColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.color", true);
    let fillOpacity = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.opacity", true);
    let fillDisabled = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.disabled", true);
    //如果拥有填充色，则使用填充色

    if (!fillDisabled && fillColor && (!fillOpacity || fillOpacity > 0)) {
      ctx.fillStyle = DDeiUtil.getColor(fillColor);
      //透明度
      if (fillOpacity != null && !fillOpacity != undefined) {
        ctx.globalAlpha = fillOpacity
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
    let fiFamily = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.family", true);
    let fiSize = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.size", true);
    let fiColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "font.color", true);
    //字体对齐信息
    let align = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.align", true);
    let valign = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.valign", true);
    //缩小字体填充
    let autoScaleFill = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.autoScaleFill", true);
    //镂空
    let hollow = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.hollow", true);

    //粗体
    let bold = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.bold", true);

    //斜体
    let italic = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.italic", true);

    //下划线
    let underline = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.underline", true);

    //删除线
    let deleteline = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.deleteline", true);

    //删除线
    let topline = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "textStyle.topline", true);


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
    let fontSize = fiSize * ratio;

    // TODO 如果有金额大小写转换选项，则执行大小写转换
    let cText = this.model.text;
    // if (this.convertToRMBY == 2 || this.convertToRMBY == '2') {
    //   cText = PDSetting.dealBigMoney(this.text);
    // }
    if (cText) {
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
          if (autoScaleFill == 1) {
            textContainer = [];
            fontSize = fontSize - 0.5;
            continue;
          }
        }
        //设置字体
        let font = fontSize + "px " + fiFamily;
        if (bold == '1') {
          font = "bold " + font;
        }
        if (italic == '1') {
          font = "italic " + font;
        }
        ctx.font = font;
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
          let x1, y1, x2;
          //绘制文字
          if (align == 1) {
            x1 = x;
            y1 = y + rRect.height * tci;
            x2 = x1 + rRect.width;
          } else if (align == 2) {
            x1 = ratPos.x + (ratPos.width - rRect.width) * 0.5;
            y1 = y + rRect.height * tci
            x2 = x1 + rRect.width;
          } else if (align == 3) {
            x1 = ratPos.x + (ratPos.width - rRect.width);
            y1 = y + rRect.height * tci
            x2 = x1 + rRect.width;
          }
          if (hollow == '1') {
            ctx.strokeStyle = fiColor;
            ctx.strokeText(rRect.text, x1, y1)
          } else {
            ctx.fillText(rRect.text, x1, y1)
          }
          if (underline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = fiColor;
            ctx.moveTo(x1, y1 + rRect.height);
            ctx.lineTo(x2, y1 + rRect.height);
            ctx.closePath();
            ctx.stroke();
          }
          if (deleteline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = fiColor;
            ctx.moveTo(x1, y1 + rRect.height * 0.5);
            ctx.lineTo(x2, y1 + rRect.height * 0.5);
            ctx.closePath();
            ctx.stroke();
          }
          if (topline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = fiColor;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
      //如果不换行，则输出第一行内容,直接对整理进行坐标对齐
      else {
        //处理镂空样式
        if (hollow == 1) {
          ctx.strokeStyle = fiColor;
          ctx.strokeText(textContainer[0].text, x, y)
        } else {
          ctx.fillText(textContainer[0].text, x, y)
        }
        if (underline == '1') {
          ctx.beginPath();
          ctx.strokeStyle = fiColor;
          ctx.moveTo(x, y + textContainer[0].height);
          ctx.lineTo(x + textContainer[0].width, y + textContainer[0].height);
          ctx.closePath();
          ctx.stroke();
        }
        if (deleteline == '1') {
          ctx.beginPath();
          ctx.strokeStyle = fiColor;
          ctx.moveTo(x, y + textContainer[0].height / 2);
          ctx.lineTo(x + textContainer[0].width, y + textContainer[0].height / 2);
          ctx.closePath();
          ctx.stroke();
        }
        if (topline == '1') {
          ctx.beginPath();
          ctx.strokeStyle = fiColor;
          ctx.moveTo(x, y);
          ctx.lineTo(x + textContainer[0].width, y);
          ctx.closePath();
          ctx.stroke();
        }

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
   * 计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let topDisabled = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.top.disabled", true);
    let topColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.top.color", true);
    let topOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.top.opacity", true);
    let topWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.top.width", true);
    let rightDisabled = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.right.disabled", true);
    let rightColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.right.color", true);
    let rightOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.right.opacity", true);
    let rightWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.right.width", true);
    let bottomDisabled = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.bottom.disabled", true);
    let bottomColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.bottom.color", true);
    let bottomOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.bottom.opacity", true);
    let bottomWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.bottom.width", true);
    let leftDisabled = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.left.disabled", true);
    let leftColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.left.color", true);
    let leftOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.left.opacity", true);
    let leftWidth = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border.left.width", true);

    //计算填充的原始区域
    if (!(!leftDisabled && leftColor && (!leftOpac || leftOpac > 0) && leftWidth > 0)) {
      leftWidth = 0
    }
    if (!(!rightDisabled && rightColor && (!rightOpac || rightOpac > 0) && rightWidth > 0)) {
      rightWidth = 0
    }
    if (!(!topDisabled && topColor && (!topOpac || topOpac > 0) && topWidth > 0)) {
      bottomWidth = 0
    }
    if (!(!bottomDisabled && bottomColor && (!bottomOpac || bottomOpac > 0) && bottomWidth > 0)) {
      bottomWidth = 0
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
    super.mouseDown(evt);
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    super.mouseUp(evt);
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    super.mouseMove(evt);
  }
}

export default DDeiRectangleCanvasRender