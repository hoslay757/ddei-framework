import DDeiConfig from '../../config.js'
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiUtil from '../../util.js'
import DDeiAbstractShapeRender from './shape-render-base.js';
import { cloneDeep, trim } from 'lodash'
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiAbstractShape from '../../models/shape.js';


/**
 * DDeiPolygon的渲染器类，用于渲染多边形
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiPolygonCanvasRender extends DDeiAbstractShapeRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiPolygonCanvasRender {
    return new DDeiPolygonCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiPolygonCanvasRender";

  /**
   * 用于绘图时缓存属性等信息
   */
  textUsedArea: object[] = [];

  //是否生成剪切区域
  clip: boolean = true;
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
    //展示前逻辑
    this.viewBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_VIEW_BEFORE",
      this.ddRender.model
    );
    //展示后逻辑
    this.viewAfter = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_VIEW_AFTER",
      this.ddRender.model
    );
  }


  initImage(): void {
    //加载图片
    let that = this;
    let bgImage = DDeiUtil.getReplacibleValue(this.model, "fill.image");
    //加载base64图片
    if ((this.model.bgImageBase64 || bgImage) && !this.imgObj) {
      let img = new Image();   // 创建一个<img>元素
      img.onload = function () {
        that.imgObj = img;
        that.upFillImage = bgImage
        that.ddRender.model.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        that.ddRender.model.bus.executeAll()
      }
      img.src = this.model.bgImageBase64 ? this.model.bgImageBase64 : bgImage;
    }
  }
  /**
   * 创建图形
   */
  drawShape(): void {
    if (!this.viewBefore || this.viewBefore(
      DDeiEnumOperateType.VIEW,
      [this.model],
      null,
      this.ddRender.model,
      null
    )) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      ctx.save();
      //绘制边框
      this.drawBorder();

      //绘制填充
      this.drawFill();

      //绘制文本
      // this.drawText();

      //清空绘图时计算的临时变量
      this.tempFillAreaRect = null

      ctx.restore();

      if (this.viewAfter) {
        this.viewAfter(
          DDeiEnumOperateType.VIEW,
          [this.model],
          null,
          this.ddRender.model,
          null
        )
      }
    }
  }


  /**
   * 生成边框的区域向量
   */
  getBorderPVS(tempBorder) {
    let stageRatio = this.model.getStageRatio()
    let round = this.getCachedValue("border.round");
    let disabled = this.getCachedValue("border.disabled");
    let width = this.getCachedValue("border.width");

    if (disabled) {
      width = 0
    }
    if (!round) {
      round = 0
    }
    round = round * stageRatio
    width = width / 2

    let borderPVS = []
    let pvs = this.model.pvs;
    let toZeroMatrix = new Matrix3(
      1, 0, -pvs[0].x,
      0, 1, -pvs[0].y,
      0, 0, 1);
    //归到原点，求夹角
    let p1 = new Vector3(pvs[1].x, pvs[1].y, 1)
    p1.applyMatrix3(toZeroMatrix)
    let lineAngle = -(new Vector3(1, 0, 0).angleTo(p1) * 180 / Math.PI).toFixed(4);
    let angle = 0;
    if (p1.x >= 0 && p1.y >= 0) {
      angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
    } else if (p1.x <= 0 && p1.y >= 0) {
      angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
    } else if (p1.x <= 0 && p1.y <= 0) {
      angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
    } else if (p1.x >= 0 && p1.y <= 0) {
      angle = ((- lineAngle) * DDeiConfig.ROTATE_UNIT).toFixed(4);
    }
    let rotateMatrix = new Matrix3(
      Math.cos(angle), Math.sin(angle), 0,
      -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 1);
    let roundPVS = new Vector3(round, 0, 1)
    roundPVS.applyMatrix3(rotateMatrix)
    //测试
    {
      let t1pvs = new Vector3(100, 0, 1)
      let tag = (108 * DDeiConfig.ROTATE_UNIT).toFixed(4);
      let trm = new Matrix3(
        Math.cos(tag), Math.sin(tag), 0,
        -Math.sin(tag), Math.cos(tag), 0,
        0, 0, 1);
      t1pvs.applyMatrix3(trm)
      console.log(t1pvs)
    }
    borderPVS[0] = new Vector3(pvs[0].x + Math.floor(roundPVS.x), pvs[0].y + Math.floor(roundPVS.y), 1);
    //四个角的点，考虑边框的位置也要响应变小
    for (let i = 1; i < pvs.length; i++) {
      borderPVS[i] = new Vector3(pvs[i].x, pvs[i].y, 1);
    }
    borderPVS[pvs.length] = new Vector3(pvs[0].x, pvs[0].y, 1);
    this.borderPVS = borderPVS
  }
  /**
   * 取得边框的绘制区域
   */
  getBorderRatPos() {
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    let absBounds = this.model.getAbsBounds();
    return DDeiUtil.getRatioPosition(absBounds, ratio);
  }


  /**
   * 绘制边框
   * @param tempBorder 临时边框，优先级最高
   * @param usePV 是否采用向量输出
   */
  drawBorder(tempBorder: object | null): void {

    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');

    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    //如果被选中，使用选中的边框，否则使用缺省边框

    let disabled = this.getCachedValue("border.disabled")
    let color = this.getCachedValue("border.color")
    let opacity = this.getCachedValue("border.opacity");
    let width = this.getCachedValue("border.width");
    let dash = this.getCachedValue("border.dash");
    let round = this.getCachedValue("border.round");

    //绘制四个方向的边框
    //如果边框未被disabled，则绘制边框
    if (!disabled && color && (!opacity || opacity > 0) && width > 0) {

      //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
      let lineOffset = 1 * ratio / 2;
      let lineWidth = width * ratio;

      ctx.lineWidth = lineWidth;
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
      //加载边框的矩阵
      this.getBorderPVS(tempBorder);
      let pvs = this.borderPVS;
      if (pvs?.length > 2) {
        let len = pvs.length;
        ctx.moveTo(pvs[0].x * rat1 + lineOffset, pvs[0].y * rat1 + lineOffset)
        for (let i = 1; i < len - 1; i++) {
          ctx.arcTo(pvs[i].x * rat1 + lineOffset, pvs[i].y * rat1 + lineOffset, pvs[i + 1].x * rat1 + lineOffset, pvs[i + 1].y * rat1 + lineOffset, round * rat1);
        }
        ctx.arcTo(pvs[len - 1].x * rat1 + lineOffset, pvs[len - 1].y * rat1 + lineOffset, pvs[1].x * rat1 + lineOffset, pvs[1].y * rat1 + lineOffset, round * rat1);
      }
      ctx.closePath()
      ctx.stroke();
      if (this.clip) {
        ctx.clip();
      }
      ctx.globalAlpha = 1
      ctx.lineWidth = 1
      ctx.lineColor = "black"
      ctx.setLineDash([])
    }
  }



  /**
   * 填充图片
   */
  drawImage(): void {
    //如果有图片，则绘制
    let bgImage = DDeiUtil.getReplacibleValue(this.model, "fill.image");
    if (!this.imgObj || bgImage != this.upFillImage) {
      this.initImage();
    } else {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let stageRatio = this.model.getStageRatio()
      let rat1 = this.ddRender.ratio;
      let ratio = rat1 * stageRatio;
      let fillRect = this.tempFillAreaRect;
      //缩放填充区域
      //保存状态
      ctx.save();
      //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
      let imgFillInfo = this.getCachedValue("fill.opacity");
      //透明度
      if (imgFillInfo) {
        ctx.globalAlpha = imgFillInfo
      }

      let lineOffset = 1 * ratio / 2;
      ctx.translate(this.model.cpv.x * rat1, this.model.cpv.y * rat1)
      ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-this.model.cpv.x * rat1, -this.model.cpv.y * rat1)
      //绘制图片
      ctx.drawImage(this.imgObj, (this.model.cpv.x - fillRect.width / 2) * rat1 + lineOffset, (this.model.cpv.y - fillRect.height / 2) * rat1 + lineOffset, fillRect.width * rat1, fillRect.height * rat1);

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
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    let round = this.getCachedValue("border.round");
    //保存状态
    ctx.save();
    let fillType = this.getCachedValue("fill.type");
    //纯色填充
    if (this.isEditoring) {
      if (!fillType || fillType == '0') {
        fillType = 1
      }
    }
    let lineOffset = 1 * ratio / 2;
    if (fillType == 1) {
      //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
      let fillColor = this.getCachedValue("fill.color");
      let fillOpacity = this.getCachedValue("fill.opacity");
      let fillDisabled = this.getCachedValue("fill.disabled");
      if (this.isEditoring) {
        fillDisabled = false
        fillOpacity = 1.0

      }
      //如果拥有填充色，则使用填充色
      if (!fillDisabled && fillColor && (!fillOpacity || fillOpacity > 0)) {
        ctx.fillStyle = DDeiUtil.getColor(fillColor);
        //透明度
        if (fillOpacity != null && !fillOpacity != undefined) {
          ctx.globalAlpha = fillOpacity
        }
        ctx.beginPath();
        let pvs = this.borderPVS;
        if (pvs?.length > 2) {
          let len = pvs.length;
          ctx.moveTo(pvs[0].x * rat1 + lineOffset, pvs[0].y * rat1 + lineOffset)
          for (let i = 1; i < len - 1; i++) {
            ctx.arcTo(pvs[i].x * rat1 + lineOffset, pvs[i].y * rat1 + lineOffset, pvs[i + 1].x * rat1 + lineOffset, pvs[i + 1].y * rat1 + lineOffset, round * rat1);
          }
          ctx.arcTo(pvs[len - 1].x * rat1 + lineOffset, pvs[len - 1].y * rat1 + lineOffset, pvs[1].x * rat1 + lineOffset, pvs[1].y * rat1 + lineOffset, round * rat1);
        }
        ctx.closePath();
        //填充矩形
        ctx.fill();
      }

    }
    //图片填充
    else if (fillType == 2) {
      this.drawImage()
    }

    //恢复状态
    ctx.restore();

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
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    //计算填充的原始区域
    let fillRect = this.tempFillAreaRect;
    let ratPos = DDeiUtil.getRatioPosition(fillRect, rat1)

    //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    //获取编辑文本框的实时状态
    let editorText = null;
    if (this.isEditoring) {
      editorText = DDeiUtil.getEditorText();
    }
    //开始光标与结束光标
    let curSIdx = -1
    let curEIdx = -1
    if (editorText) {
      curSIdx = editorText.selectionStart
      curEIdx = editorText.selectionEnd
      this.stageRender.editorShadowControl.tempCursorStart = curSIdx
      this.stageRender.editorShadowControl.tempCursorEnd = curEIdx
    }
    //以下样式为控件的整体样式，不能在文本中单独设置
    //字体对齐信息
    let align = this.getCachedValue("textStyle.align");
    let valign = this.getCachedValue("textStyle.valign");
    //缩小字体填充
    let autoScaleFill = this.getCachedValue("textStyle.autoScaleFill");
    //自动换行
    let feed = this.getCachedValue("textStyle.feed");

    //以上样式为控件的整体样式，不能在文本中单独设置

    //以下样式：字体、颜色、大小、镂空、粗体、斜体、下划线、删除线、上标、下标等
    //可以单独设置，未单独设置则使用整体样式
    //字体信息
    let fiFamily = this.getCachedValue("font.family");
    let fiSize = this.getCachedValue("font.size");
    let fiColor = this.getCachedValue("font.color");
    //镂空
    let hollow = this.getCachedValue("textStyle.hollow");
    //粗体
    let bold = this.getCachedValue("textStyle.bold");
    //斜体
    let italic = this.getCachedValue("textStyle.italic");
    //下划线
    let underline = this.getCachedValue("textStyle.underline");
    //删除线
    let deleteline = this.getCachedValue("textStyle.deleteline");
    //删除线
    let topline = this.getCachedValue("textStyle.topline");
    //文本背景色
    let textBgColor = this.getCachedValue("textStyle.bgcolor");

    //保存状态
    ctx.save();
    ctx.translate(this.model.cpv.x * rat1, this.model.cpv.y * rat1)
    ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);


    //循环进行分段输出,整体容器，代表了一个整体的文本大小区域
    let textContainer = []

    //是否全部输出完毕标志
    let loop = true;

    let fontSize = fiSize;

    //获取值替换后的文本信息
    let cText = null;
    let sptStyle = null;
    if (this.isEditoring) {
      sptStyle = this.model.sptStyle
      feed = "1"
      autoScaleFill = "1"
      cText = this.getCachedValue("text")
    } else {
      cText = DDeiUtil.getReplacibleValue(this.model, "text", true, true);

      sptStyle = this.tempSptStyle ? this.tempSptStyle : this.model.sptStyle;
    }

    if (cText && trim(cText) != '') {
      cText = "" + cText;
      let contentWidth = ratPos.width;
      //累计减去的字体大小
      let subtractionFontSize = 0;
      while (loop) {
        //记录使用过的宽度和高度
        let usedWidth = 0;
        let usedHeight = 0;
        //行容器
        let textRowContainer = { text: "", widths: [], heights: [] };
        textContainer.push(textRowContainer);
        //是否超出输出长度标志
        let isOutSize = false;
        let maxFontSize = 0;

        if (fontSize > ratPos.height) {
          if (autoScaleFill == 1) {
            textContainer = [];
            let ds = fontSize < 50 ? 0.5 : Math.floor(fontSize / 50)
            fontSize -= ds;
            continue;
          }
        }
        //设置字体
        let baseFont = fontSize + "px " + fiFamily;
        if (bold == '1') {
          baseFont = "bold " + baseFont;
        }
        if (italic == '1') {
          baseFont = "italic " + baseFont;
        }

        //循环每一个字符，计算和记录大小
        let rcIndex = 0;
        let lastUnSubTypeFontSize = 0;
        for (let ti = 0; ti < cText.length; ti++, rcIndex++) {
          let te = cText[ti];
          //回车换行

          //读取当前特殊样式，如果没有，则使用外部基本样式
          let font = null
          let fontHeight = null
          let isEnter = false;
          let fontShapeRect = null;
          if ((feed == 1 || feed == '1') && te == '\n') {
            isEnter = true;
            textRowContainer.text += te;
            textRowContainer.widths[rcIndex] = 0
            textRowContainer.heights[rcIndex] = 0
            textRowContainer.width = Math.max(0, usedWidth)
            textRowContainer.height = Math.max(0, textRowContainer.height ? textRowContainer.height : 0, lastUnSubTypeFontSize * ratio)
          } else {
            if (sptStyle[ti]) {
              let ftsize = sptStyle[ti]?.font?.size ? sptStyle[ti]?.font?.size - subtractionFontSize : fontSize;

              //如果显示的是标注，则当前字体的大小取决于前面最后一个未设置标注的字体大小（包括缺省大小）
              if (sptStyle[ti].textStyle?.subtype) {
                if (!lastUnSubTypeFontSize) {
                  lastUnSubTypeFontSize = ftsize
                }
                ftsize = lastUnSubTypeFontSize / 2
              } else if (ftsize < 1) {
                ftsize = 2
              }
              let ftfamily = sptStyle[ti]?.font?.family ? sptStyle[ti]?.font?.family : fiFamily;
              font = ftsize + "px " + ftfamily
              if (sptStyle[ti]?.textStyle?.bold == '1') {
                font = "bold " + font;
              }
              if (sptStyle[ti]?.textStyle?.italic == '1') {
                font = "italic " + font;
              }
              fontHeight = ftsize
            }
            if (!font) {
              font = baseFont;
              fontHeight = fontSize
            }
            if (!sptStyle[ti]?.textStyle?.subtype) {
              lastUnSubTypeFontSize = fontHeight
            }
            //记录最大字体大小
            maxFontSize = Math.max(maxFontSize, fontHeight)

            let rc1 = DDeiUtil.measureText(te, font, ctx);
            fontShapeRect = { width: rc1.width * ratio, height: rc1.height * ratio }
            usedWidth += fontShapeRect.width;

            textRowContainer.text += te;
            textRowContainer.widths[rcIndex] = fontShapeRect.width
            textRowContainer.heights[rcIndex] = fontHeight * ratio
            textRowContainer.width = usedWidth
            textRowContainer.height = Math.max(fontHeight * ratio, textRowContainer.height ? textRowContainer.height : 0, lastUnSubTypeFontSize * ratio)
          }

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
              usedWidth -= fontShapeRect.width;
              textRowContainer.width = usedWidth
              break;
            }
          }

          //处理换行
          else if (feed == 1 || feed == '1') {
            //如果回车
            if (isEnter) {
              //新开一行重新开始
              usedWidth = 0;
              usedHeight += textRowContainer.height;

              //换行的情况下，如果行高度超出，则不输出
              if (usedHeight + textRowContainer.height > ratPos.height) {
                //如果具备缩小字体填充，则重新生成
                if (autoScaleFill == 1) {
                  isOutSize = true;
                }
                break;
              }
              rcIndex = -1;
              textRowContainer = { text: '', widths: [], heights: [] };
              textRowContainer.width = usedWidth
              textRowContainer.height = 0
              textContainer.push(textRowContainer);
            }
            //如果插入本字符后的大小，大于了容器的大小，则需要换行
            else if (usedWidth > contentWidth) {

              //先使当前行字符-1
              textRowContainer.text = textRowContainer.text.substring(0, textRowContainer.text.length - 1)
              textRowContainer.width -= fontShapeRect.width;

              textRowContainer.widths.splice(rcIndex, 1)
              textRowContainer.heights.splice(rcIndex, 1)
              //新开一行重新开始
              usedWidth = fontShapeRect.width;
              usedHeight += textRowContainer.height;

              //换行的情况下，如果行高度超出，则不输出
              if (usedHeight + textRowContainer.height > ratPos.height) {
                //如果具备缩小字体填充，则重新生成
                if (autoScaleFill == 1) {
                  isOutSize = true;
                }
                break;
              }
              rcIndex = 0;
              textRowContainer = { text: te, widths: [], heights: [] };
              textRowContainer.widths[rcIndex] = fontShapeRect.width
              textRowContainer.heights[rcIndex] = fontHeight * ratio
              textRowContainer.width = usedWidth
              textRowContainer.height = Math.max(fontHeight * ratio, lastUnSubTypeFontSize * ratio)
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
          let ds = maxFontSize < 50 ? 0.5 : Math.floor(maxFontSize / 50)
          fontSize -= ds;
          subtractionFontSize += ds
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

      let cursorX = -Infinity;
      let cursorY = -Infinity;
      let cursorHeight = 0;


      //对内部容器进行排列对齐
      //记录当前行的开始坐标和结束坐标，用来计算光标选中或跨行效果
      let tempIdx = 0
      let usedY = 0, usedX = 0;
      let lastUsedX, lastUsedY, lastWidth, lastHeight;
      let lastUnSubTypeFontSize = 0
      if (textContainer.length > 0) {
        textContainer[0].textPosCache = []
      }
      for (let tci = 0; tci < textContainer.length; tci++) {

        let rRect = textContainer[tci];
        let x1, y1;
        //绘制文字
        if (align == 1) {
          x1 = x;
          y1 = y + usedY
        } else if (align == 2) {
          x1 = ratPos.x + (ratPos.width - rRect.width) * 0.5;
          y1 = y + usedY
        } else if (align == 3) {
          x1 = ratPos.x + (ratPos.width - rRect.width);
          y1 = y + usedY
        }


        //记录开始绘制的坐标
        textContainer[tci].x = x1;
        textContainer[tci].y = y1;
        //循环输出每一个字符
        usedX = x1;

        for (let tj = 0; tj < textContainer[tci].text.length; tj++, tempIdx++) {
          let width = textContainer[tci].widths[tj]
          let height = textContainer[tci].heights[tj]
          lastWidth = width
          lastHeight = height
          //获取样式
          ctx.save();
          //读取当前特殊样式，如果没有，则使用外部基本样式
          let font = (fontSize * ratio) + "px " + fiFamily;
          if (bold == '1') {
            font = "bold " + font;
          }
          if (italic == '1') {
            font = "italic " + font;
          }
          let tHollow = hollow;
          let tUnderline = underline;
          let tDeleteline = deleteline;
          let tTopline = topline;
          let tFontColor = fiColor
          let tBgColor = textBgColor;
          let ftsize = fontSize * ratio
          let subScriptOffY = 0;
          if (sptStyle[tempIdx]) {
            tBgColor = sptStyle[tempIdx].textStyle?.bgcolor ? sptStyle[tempIdx].textStyle.bgcolor : textBgColor;
            ftsize = sptStyle[tempIdx].font?.size ? sptStyle[tempIdx].font?.size - subtractionFontSize : fontSize;
            ftsize *= ratio
            //如果显示的是标注，则当前字体的大小取决于前面最后一个未设置标注的字体大小（包括缺省大小）
            if (sptStyle[tempIdx].textStyle?.subtype) {
              if (!lastUnSubTypeFontSize) {
                lastUnSubTypeFontSize = ftsize
              }
              ftsize = lastUnSubTypeFontSize / 2
              //上中下位置
              switch (sptStyle[tempIdx].textStyle?.subtype) {
                case 1:
                  subScriptOffY = -(lastUnSubTypeFontSize - ftsize)
                  break;
                case 2:
                  subScriptOffY = -(lastUnSubTypeFontSize - ftsize) / 2
                  break;
                case 3: break;
              }
            } else if (ftsize < 1) {
              ftsize = 2 * ratio
            }

            let ftfamily = sptStyle[tempIdx].font?.family ? sptStyle[tempIdx].font?.family : fiFamily;
            font = ftsize + "px " + ftfamily
            if (sptStyle[tempIdx]?.textStyle?.bold == '1') {
              font = "bold " + font;
            }
            if (sptStyle[tempIdx]?.textStyle?.italic == '1') {
              font = "italic " + font;
            }
            tHollow = sptStyle[tempIdx]?.textStyle?.hollow == '1' ? '1' : tHollow
            tUnderline = sptStyle[tempIdx]?.textStyle?.underline == '1' ? '1' : tUnderline
            tDeleteline = sptStyle[tempIdx]?.textStyle?.deleteline == '1' ? '1' : tDeleteline
            tTopline = sptStyle[tempIdx]?.textStyle?.topline == '1' ? '1' : tTopline
            tFontColor = sptStyle[tempIdx]?.font?.color ? sptStyle[tempIdx].font.color : tFontColor
          }
          if (!sptStyle[tempIdx]?.textStyle?.subtype) {
            lastUnSubTypeFontSize = ftsize
          }
          //记录计算值
          if (!textContainer[tci].tHollow) {
            textContainer[tci].tHollow = []
            textContainer[tci].tUnderline = []
            textContainer[tci].tDeleteline = []
            textContainer[tci].tTopline = []
            textContainer[tci].tFontColor = []
            textContainer[tci].font = []
            textContainer[tci].subScriptOffY = []
          }
          textContainer[tci].tHollow[tj] = tHollow
          textContainer[tci].tUnderline[tj] = tUnderline
          textContainer[tci].tDeleteline[tj] = tDeleteline
          textContainer[tci].tTopline[tj] = tTopline
          textContainer[tci].tFontColor[tj] = tFontColor
          textContainer[tci].font[tj] = font
          textContainer[tci].subScriptOffY[tj] = subScriptOffY

          let ofY = rRect.height - height + subScriptOffY
          //绘制光标和选中效果
          if (tempIdx >= curSIdx && tempIdx < curEIdx) {
            ctx.save();
            ctx.fillStyle = "#017fff";
            ctx.globalAlpha = 0.4
            ctx.fillRect(usedX - 0.5, y1 + ofY, width + 1, height)
            ctx.restore();
          }
          //绘制文字背景
          else if (tBgColor) {
            ctx.save();
            ctx.fillStyle = DDeiUtil.getColor(tBgColor);
            ctx.fillRect(usedX - 0.5, y1 + ofY, width + 1, height)
            ctx.restore();
          }
          if (curSIdx == curEIdx && tempIdx == curEIdx) {
            cursorX = usedX
            cursorHeight = tj > 1 ? textContainer[tci].heights[tj - 1] : height
            ofY = rRect.height - cursorHeight + (tj > 1 ? textContainer[tci].subScriptOffY[tj - 1] : subScriptOffY)
            cursorY = y1 + ofY

          }


          //设置字体颜色
          ctx.fillStyle = tFontColor
          //设置输出字体
          ctx.font = font;
          //处理镂空样式
          lastUsedY = y1 + ofY
          lastUsedX = usedX
          usedX += width

          ctx.restore();
        }


        //此轮循环输出每一个字符
        usedX = x1;
        for (let tj = 0; tj < textContainer[tci].text.length; tj++) {
          let outputText = textContainer[tci].text[tj]
          let width = textContainer[tci].widths[tj]
          let height = textContainer[tci].heights[tj]
          //获取样式
          ctx.save();

          let tHollow = textContainer[tci].tHollow[tj];
          let tUnderline = textContainer[tci].tUnderline[tj];;
          let tDeleteline = textContainer[tci].tDeleteline[tj];;
          let tTopline = textContainer[tci].tTopline[tj];;
          let tFontColor = textContainer[tci].tFontColor[tj];
          let font = textContainer[tci].font[tj];
          let subScriptOffY = textContainer[tci].subScriptOffY[tj];;
          let ofY = rRect.height - height + subScriptOffY

          //设置字体颜色
          ctx.fillStyle = tFontColor
          //设置输出字体
          ctx.font = font;
          //处理镂空样式
          if (tHollow == '1') {
            ctx.strokeStyle = tFontColor;
            ctx.strokeText(outputText, usedX, y1 + ofY)
          } else {
            ctx.fillText(outputText, usedX, y1 + ofY)
          }
          //记录缓存位置
          if (curSIdx != -1 && curEIdx != -1) {
            //记录每一个字的区域和位置，用于后续选择和计算

            textContainer[0].textPosCache.push({ x: usedX, y: y1 + ofY })
          }
          if (tUnderline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = tFontColor;
            ctx.moveTo(usedX, y1 + ofY + height);
            ctx.lineTo(usedX + width, y1 + ofY + height);
            ctx.closePath();
            ctx.stroke();
          }
          if (tDeleteline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = tFontColor;
            ctx.moveTo(usedX, y1 + ofY + height / 2);
            ctx.lineTo(usedX + width, y1 + ofY + height / 2);
            ctx.closePath();
            ctx.stroke();
          }
          if (tTopline == '1') {
            ctx.beginPath();
            ctx.strokeStyle = tFontColor;
            ctx.moveTo(usedX, y1 + ofY);
            ctx.lineTo(usedX + width, y1 + ofY);
            ctx.closePath();
            ctx.stroke();
          }
          usedX += width
          ctx.restore();
        }

        usedY += rRect.height
      }
      //绘制光标
      if (cursorX != -Infinity && cursorY != -Infinity && curSIdx == curEIdx) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cursorX, cursorY - 2);
        ctx.lineTo(cursorX, cursorY + cursorHeight + 2);
        ctx.closePath();
        ctx.stroke();
      } else if (editorText?.selectionEnd == cText.length) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lastUsedX + lastWidth, lastUsedY - 2);
        ctx.lineTo(lastUsedX + lastWidth, lastUsedY + lastHeight + 2);
        ctx.closePath();
        ctx.stroke();
      }
      this.textUsedArea = textContainer;
    }

    //恢复状态
    ctx.restore();

  }

  /**
   * 计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let disabled = this.getBorderInfo(null, 1, "disabled");
    let color = this.getBorderInfo(null, 1, "color");
    let opacity = this.getBorderInfo(null, 1, "opacity");
    let width = this.getBorderInfo(null, 1, "width");

    //计算填充的原始区域
    if (!(!disabled && color && (!opacity || opacity > 0) && width > 0)) {
      width = 0
    }
    return {
      x: this.model.x + width,
      y: this.model.y + width,
      width: this.model.width - 2 * width,
      height: this.model.height - 2 * width
    }
  }

  /**
   * 计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillAreaPVS(): object {
    return this.model.pvs;
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

  /**
   * 鼠标双击
   * @param evt 
   */
  dblClick(evt: Event): void {

  }
}

export default DDeiPolygonCanvasRender