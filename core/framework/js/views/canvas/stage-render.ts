import DDeiConfig from '../../config.js'
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLine from '../../models/line.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js';
import DDeiCanvasRender from './ddei-render.js';
import { Vector3 } from 'three';

/**
 * DDeiStage的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiStageCanvasRender {

  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
    this.ddRender = null;
  }

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiStageCanvasRender {
    return new DDeiStageCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiStageCanvasRender";
  /**
   * 当前对应模型
   */
  model: DDeiStage;
  /**
   * 当前的ddei实例
   */
  ddRender: DDeiCanvasRender | null;

  /**
   * 当前操作图形
   */
  currentOperateShape: DDeiAbstractShape | null = null;

  /**
   * 当前操作状态
   */
  operateState: DDeiEnumOperateState = DDeiEnumOperateState.NONE;


  /**
   * 选择框控件模型
   */
  selector: DDeiSelector;

  //编辑时的影子控件，编辑完成后删除
  editorShadowControl: DDeiAbstractShape | null = null;

  /**
   * 刷新，如果为true则会绘制图形
   */
  refresh: boolean = true;


  //横向滚动条和纵向滚动条，当需要显示时不为空
  hScroll: object | null = null;
  vScroll: object | null = null;


  /**
   * 用于绘图时缓存属性等信息
   */
  renderCacheData: Map<string, object> = new Map();
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.ddInstance.render
    this.initSelector();
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


      //清空画布，绘制场景大背景
      this.clearStage();
      //绘制纸张，以及图层背景
      this.drawPaper();

      //计算滚动条
      this.calScroll();

      //绘制网格
      this.drawGrid()
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;

      //绘制图形
      ctx.save();

      ctx.translate((this.model.wpv.x) * rat1, (this.model.wpv.y) * rat1)

      // this.drawTest();

      let topDisplayIndex = -1;
      for (let i = this.model.layers.length - 1; i >= 0; i--) {
        if (this.model.layers[i].tempDisplay) {
          topDisplayIndex = i
        }
        else if (this.model.layers[i].display == 1) {
          this.model.layers[i].render.drawShape();
        }
      }

      if (topDisplayIndex != -1) {
        this.model.layers[topDisplayIndex].render.drawShape();
      }

      //绘制编辑时的影子控件
      this.drawEditorShadowControl();
      if (this.selector) {
        this.selector.render.drawShape();
      }



      ctx.restore();



      //绘制标尺
      this.drawRuler()
      //绘制辅助线
      this.drawHelpLines()


      //绘制水印
      this.drawMark();


      //绘制滚动条
      this.drawScroll();


      this.helpLines = null;


      DDeiLine.calLineCrossSync(this.model.layers[this.model.layerIndex])


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
  * 显示辅助对齐线以及文本
  */
  drawHelpLines(): void {
    // 未开启主线提示，则不再计算辅助线提示定位
    if (this.helpLines) {
      let hpoint = this.helpLines.hpoint;
      let vpoint = this.helpLines.vpoint;
      let rect = this.helpLines.rect;

      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio;
      //保存状态
      ctx.save();

      ctx.translate((this.model.wpv.x) * rat1, (this.model.wpv.y) * rat1)
      //绘制提示文本
      if (rect) {
        ctx.save()
        //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        let fontSize = 12
        let font = "bold " + (fontSize * rat1) + "px Microsoft YaHei"
        //设置字体
        ctx.font = font
        let ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.display", true);
        let xText = 0;
        let yText = 0;
        if (this.operateState == DDeiEnumOperateState.CONTROL_DRAGING || this.operateState == DDeiEnumOperateState.CONTROL_CREATING) {
          xText = rect.x.toFixed(0);
          yText = rect.y.toFixed(0);
        } else if (this.operateState == DDeiEnumOperateState.CONTROL_CHANGING_BOUND) {
          xText = rect.width.toFixed(0);
          yText = rect.height.toFixed(0);
        } else if (this.operateState == DDeiEnumOperateState.CONTROL_ROTATE) {
          xText = rect.rotate.toFixed(0);
        }
        if ((ruleDisplay == 1 || ruleDisplay == "1") && this.operateState != DDeiEnumOperateState.CONTROL_ROTATE) {
          let startBaseX = this.model.spv.x * rat1 + 1
          let startBaseY = this.model.spv.y * rat1 + 1
          //生成文本并计算文本大小
          let stageRatio = this.model.getStageRatio()
          let xDPI = this.ddRender.dpi.x;
          //标尺单位
          let unit = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.unit", true);
          let rulerConfig = DDeiConfig.RULER[unit]
          //尺子间隔单位
          let unitWeight = DDeiUtil.unitToPix(rulerConfig.size, unit, xDPI) * rat1;
          //根据缩放比率，对尺子间隔单位进行拆分
          //基准每个部分的大小
          let marginWeight = unitWeight * stageRatio

          if (this.operateState == DDeiEnumOperateState.CONTROL_DRAGING || this.operateState == DDeiEnumOperateState.CONTROL_CREATING) {
            xText = (rect.x * rat1 - startBaseX) / marginWeight * rulerConfig.size
            yText = (rect.y * rat1 - startBaseY) / marginWeight * rulerConfig.size
          } else if (this.operateState == DDeiEnumOperateState.CONTROL_CHANGING_BOUND) {
            xText = rect.width * rat1 / marginWeight * rulerConfig.size
            yText = rect.height * rat1 / marginWeight * rulerConfig.size
          }
          if (xText) {
            if (("" + xText).indexOf('.') != -1) {
              xText = xText.toFixed(1)
            }

            xText += rulerConfig.title
          }
          if (yText) {
            if (("" + yText).indexOf('.') != -1) {
              yText = yText.toFixed(1)
            }

            yText += rulerConfig.title
          }
        }
        let text = "";
        if (xText || yText) {
          if (this.operateState == DDeiEnumOperateState.CONTROL_DRAGING || this.operateState == DDeiEnumOperateState.CONTROL_CREATING) {
            text = xText + " , " + yText
          } else if (this.operateState == DDeiEnumOperateState.CONTROL_CHANGING_BOUND) {
            text = xText + " x " + yText
          } else if (this.operateState == DDeiEnumOperateState.CONTROL_ROTATE) {
            text = xText + "°"
          }
        }
        let textRect = DDeiUtil.measureText(text, font, ctx, fontSize * rat1)
        let width = textRect.width / rat1 + 10
        let height = fontSize + 4
        let x, y
        if (this.operateState == DDeiEnumOperateState.CONTROL_DRAGING || this.operateState == DDeiEnumOperateState.CONTROL_CREATING) {
          x = (rect.x - width / 2) * rat1
          y = (rect.y - height - 5) * rat1
        } else if (this.operateState == DDeiEnumOperateState.CONTROL_CHANGING_BOUND) {
          x = (rect.x + (rect.width - width) / 2) * rat1
          y = (rect.y + rect.height + height / 2) * rat1
        } else if (this.operateState == DDeiEnumOperateState.CONTROL_ROTATE) {
          x = (rect.x) * rat1
          y = (rect.y) * rat1
        }
        width *= rat1
        height *= rat1
        DDeiUtil.drawRectRound(ctx, x, y, width, height, 5, false, "", true, "#1F72FF")
        ctx.fillStyle = "white"
        ctx.fillText(text, x + (width - textRect.width) / 2, y + (height - fontSize * rat1) / 2);

        //如果正在移动，则在标尺上绘制标注区域
        if (ruleDisplay == 1 || ruleDisplay == "1") {
          //横向
          ctx.strokeStyle = "red";
          let weight = 16 * rat1;
          ctx.lineWidth = 1.5 * rat1
          ctx.globalAlpha = 0.5
          let x1 = (rect.x + this.model.wpv.x) * rat1
          let y1 = (rect.y + this.model.wpv.y) * rat1
          ctx.translate(-(this.model.wpv.x) * rat1, -(this.model.wpv.y) * rat1)
          ctx.beginPath()
          ctx.moveTo(x1, 0)
          ctx.lineTo(x1, weight);
          ctx.closePath();
          ctx.stroke()
          //纵向
          ctx.beginPath()
          ctx.moveTo(0, y1)
          ctx.lineTo(weight, y1);
          ctx.closePath();
          ctx.stroke()

        }
        ctx.restore()
      }
      // 计算对齐辅助线
      if (DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {

        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = 0//1 * ratio / 2;
        ctx.lineWidth = 1 * ratio;
        //线段、虚线样式
        ctx.setLineDash([0, 1 * ratio, 1 * ratio]);
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(DDeiConfig.GLOBAL_HELP_LINE_ALIGN_COLOR);

        if (hpoint) {
          for (let y in hpoint) {

            //画横线
            ctx.beginPath();
            ctx.moveTo(hpoint[y].sx * rat1 - 100, y * rat1 + lineOffset);
            ctx.lineTo(hpoint[y].ex * rat1 + 100, y * rat1 + lineOffset);
            ctx.stroke();
          };
        }
        if (vpoint) {
          for (let x in vpoint) {
            //画竖线
            ctx.beginPath();
            ctx.moveTo(x * rat1 + lineOffset, vpoint[x].sy * rat1 - 100);
            ctx.lineTo(x * rat1 + lineOffset, vpoint[x].ey * rat1 + 100);
            ctx.stroke();
          };
        }

      }

      ctx.beginPath();
      //恢复状态
      ctx.restore();
    }
  }

  /**
   * 绘制编辑时的影子元素
   */
  drawEditorShadowControl(): void {
    if (this.editorShadowControl) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;
      //保存状态
      ctx.save();
      let item = this.editorShadowControl;
      item.render.drawShape();
      ctx.restore();
    }
  }
  /**
   * 清空画布
   */
  clearStage(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    ctx.save();
    //清空画布
    ctx.fillStyle = DDeiUtil.getColor(DDeiConfig.STAGE.NONE_BG_COLOR)
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.restore();
  }

  /**
   * 绘制纸张
   */
  drawPaper() {
    let paperType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.type", true);
    //获取纸张大小的定义
    let paperConfig = DDeiConfig.PAPER[paperType];
    if (paperConfig) {
      //纸张从原点开始，根据配置输出和自动扩展
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio;

      //当前的窗口位置（乘以了窗口缩放比例）
      let wpv = this.model.wpv
      let wpvX = -wpv.x * rat1
      let wpvY = -wpv.y * rat1
      let offsetWidth = 1 * ratio / 2;

      //纸张的像素大小
      let paperSize = DDeiUtil.getPaperSize(this.model)

      let paperWidth = paperSize.width;
      let paperHeight = paperSize.height;

      //第一张纸开始位置
      if (!this.model.spv) {
        let sx = this.model.width / 2 - paperWidth / 2 / rat1
        let sy = this.model.height / 2 - paperHeight / 2 / rat1
        this.model.spv = new Vector3(sx, sy, 1)
      }
      let startPaperX = this.model.spv.x * rat1 + 1
      let startPaperY = this.model.spv.y * rat1 + 1

      let posX = startPaperX - wpvX + offsetWidth;
      let posY = startPaperY - wpvY + offsetWidth;
      this.paperStartX = posX
      this.paperStartY = posY

      //获取最大的有效范围，自动扩展纸张
      let maxOutRect = DDeiAbstractShape.getOutRectByPV(this.model.getLayerModels())
      maxOutRect.x = maxOutRect.x * rat1;
      maxOutRect.x1 = maxOutRect.x1 * rat1;
      maxOutRect.y = maxOutRect.y * rat1;
      maxOutRect.y1 = maxOutRect.y1 * rat1;

      //计算各个方向扩展的数量
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
      let paperOutRect = {
        x: posX + (-leftExtNum * paperWidth), y: posY + (-topExtNum * paperHeight), w: (rightExtNum + leftExtNum + 1) * paperWidth, h: (bottomExtNum + topExtNum + 1) * paperHeight
      }
      this.paperOutRect = paperOutRect;
      //绘制矩形纸张
      ctx.save();
      ctx.lineWidth = 1
      ctx.fillStyle = "white"
      ctx.strokeStyle = "grey"
      ctx.setLineDash([5, 5]);
      ctx.fillRect(paperOutRect.x, paperOutRect.y, paperOutRect.w, paperOutRect.h)
      //绘制当前纸张的每个图层背景
      let topDisplayIndex = -1;
      for (let l = this.model.layers.length - 1; l >= 0; l--) {
        if (this.model.layers[l].tempDisplay) {
          topDisplayIndex = l;
        } else if (this.model.layers[l].display == 1) {
          this.model.layers[l].render.drawBackground(paperOutRect.x, paperOutRect.y, paperOutRect.w, paperOutRect.h);
        }
      }
      if (topDisplayIndex != -1) {
        this.model.layers[topDisplayIndex].render.drawBackground(paperOutRect.x, paperOutRect.y, paperOutRect.w, paperOutRect.h);
      }
      //绘制分割虚线

      for (let i = -leftExtNum + 1; i <= rightExtNum; i++) {
        ctx.beginPath()
        ctx.moveTo(posX + (i * paperWidth), paperOutRect.y)
        ctx.lineTo(posX + (i * paperWidth), paperOutRect.y + paperOutRect.h)
        ctx.stroke()
      }
      for (let i = -topExtNum + 1; i <= bottomExtNum; i++) {
        ctx.beginPath()
        ctx.moveTo(paperOutRect.x, posY + (i * paperHeight))
        ctx.lineTo(paperOutRect.x + paperOutRect.w, posY + (i * paperHeight))
        ctx.stroke()
      }

      ctx.setLineDash([]);
      let lineWidth = 1;
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = "black"
      ctx.strokeRect(posX + (-leftExtNum * paperWidth) - lineWidth, posY + (-topExtNum * paperHeight) - lineWidth, (rightExtNum + leftExtNum + 1) * paperWidth + 2 * lineWidth, (bottomExtNum + topExtNum + 1) * paperHeight + 2 * lineWidth)

      ctx.restore();

    }

  }

  drawTest() {
    let linePathData = this.linePathData
    if (linePathData) {
      let corssPoints = linePathData.corssPoints
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio
      ctx.save()
      ctx.font = "bold " + (12 * ratio) + "px Microsoft YaHei"
      corssPoints.forEach(point => {
        let weight = 3;

        ctx.fillStyle = "grey"
        ctx.strokeStyle = "green"


        ctx.beginPath();

        ctx.ellipse(point.x * rat1, point.y * rat1, weight * ratio, weight * ratio, 0, 0, Math.PI * 2)
        ctx.fill();
        ctx.stroke();
        // if (point.prio) {
        //   ctx.fillStyle = "black"
        //   ctx.fillText(point.prio, point.x * rat1 - 8, point.y * rat1 + 8)
        // }

        ctx.closePath();
      });

      let extLines = linePathData.extLines
      ctx.lineWidth = 1

      extLines.forEach(extLine => {
        ctx.strokeStyle = "red"
        ctx.globalAlpha = 0.1
        ctx.beginPath();
        ctx.moveTo(extLine[0].x * rat1, extLine[0].y * rat1)
        if (extLine[0].color) {
          ctx.strokeStyle = extLine[0].color
          ctx.globalAlpha = 0.3
        }
        if (extLine[0].x == extLine[1].x) {
          if (extLine[0].y >= extLine[1].y) {
            ctx.lineTo(extLine[1].x * rat1, (extLine[1].y - 1000) * rat1)
          } else {
            ctx.lineTo(extLine[1].x * rat1, (extLine[1].y + 1000) * rat1)
          }

        } else if (extLine[0].y == extLine[1].y) {
          if (extLine[0].x >= extLine[1].x) {
            ctx.lineTo((extLine[1].x - 1000) * rat1, extLine[1].y * rat1)
          } else {
            ctx.lineTo((extLine[1].x + 1000) * rat1, extLine[1].y * rat1)
          }
        }


        ctx.stroke();
        ctx.closePath();
      });


      ctx.restore()

    }


  }

  /**
   * 标尺
   */
  drawRuler() {
    let ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.display", true);

    if (ruleDisplay == 1 || ruleDisplay == "1") {
      //绘制横向点
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let xDPI = this.ddRender.dpi.x;
      //标尺单位
      let unit = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.unit", true);
      let rulerConfig = DDeiConfig.RULER[unit]
      //尺子间隔单位
      let unitWeight = DDeiUtil.unitToPix(rulerConfig.size, unit, xDPI) * rat1;
      //根据缩放比率，对尺子间隔单位进行拆分
      //基准每个部分的大小
      let marginWeight = unitWeight * stageRatio
      //找到最接近的区间
      let timesNums = [0.25, 0.5, 1, 2, 4, 8]
      //当前的衡量量级
      let curTimes = 0.25;
      for (let i = 1; i < timesNums.length; i++) {
        if (stageRatio >= timesNums[i]) {
          curTimes = timesNums[i]
        }
      }
      let standWeight = curTimes * unitWeight;
      //计算量级偏差与实际大小的百分比
      let passPercent = Math.round((marginWeight - standWeight) / standWeight * 100)
      let splitNumber = rulerConfig.parts[0];
      if (passPercent > 0) {
        let p = Math.round(1 / rulerConfig.parts.length * 100)
        for (let i = 1; i < rulerConfig.parts.length; i++) {
          if (passPercent >= i * p) {
            splitNumber = rulerConfig.parts[i];
          }
        }
      }

      //切分后单个part大小
      let splitedWeight = marginWeight / splitNumber;


      //标尺的固定显示大小
      let weight = 16 * rat1;
      ctx.save();
      let fontSize = 9.5
      if (stageRatio <= 0.5) {
        fontSize -= 1
      } else if (stageRatio <= 0.25) {
        fontSize -= 3
      }
      fontSize *= rat1
      ctx.font = fontSize + "px Microsoft YaHei"
      ctx.lineWidth = 1
      ctx.strokeStyle = "#E0E3E9"
      ctx.fillStyle = "white"
      let cwidth = canvas.width;
      let cheight = canvas.height;

      //纸张的像素大小
      let paperSize = DDeiUtil.getPaperSize(this.model)
      let paperWidth = paperSize.width;
      let paperHeight = paperSize.height;

      //基准位置0刻度，初始以这个刻度为准，后续跟着变化


      if (!this.model.spv) {
        let sx = this.model.width / 2 - paperWidth / 2 / rat1
        let sy = this.model.height / 2 - paperHeight / 2 / rat1
        this.model.spv = new Vector3(sx, sy, 1)
      }
      let startBaseX = this.model.spv.x * rat1 + 1
      let startBaseY = this.model.spv.y * rat1 + 1
      if (ruleDisplay == 1 || ruleDisplay == "1") {
        ctx.beginPath()
        //横向尺子背景
        ctx.fillRect(0, 0, cwidth, weight)
        ctx.moveTo(cwidth, 0)
        ctx.lineTo(cwidth, weight)
        ctx.lineTo(0, weight)
        ctx.stroke()
        //纵向尺子背景
        ctx.beginPath()
        ctx.fillRect(0, 0, weight, cheight)
        ctx.moveTo(0, cheight)
        ctx.lineTo(weight, cheight)
        ctx.lineTo(weight, 0)
        ctx.stroke()
      }


      //绘制竖线
      let textOffset = 1 * rat1
      ctx.fillStyle = "rgb(200,200,200)"
      //当前的窗口位置（乘以了窗口缩放比例）
      let wpvX = -this.model.wpv.x * rat1
      let wpvY = -this.model.wpv.y * rat1
      let x = 0;
      let curX = startBaseX - wpvX
      while (curX <= cwidth) {
        if (curX > weight) {
          ctx.beginPath();
          ctx.moveTo(curX, 0);
          let nMod = x % splitNumber
          if (nMod != 0) {
            ctx.moveTo(curX, 15);
          }
          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(curX, weight);
          ctx.stroke()
        }
        curX += splitedWeight;
        x++
      }
      x = 0;
      curX = startBaseX - wpvX
      while (curX >= 0) {
        if (curX > weight) {
          ctx.beginPath();
          ctx.moveTo(curX, 0);
          let nMod = x % splitNumber
          if (nMod != 0) {
            ctx.moveTo(curX, 15);
          }
          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(curX, weight);
          ctx.stroke()
        }
        curX -= splitedWeight;
        x--
      }

      let curY = startBaseY - wpvY
      let y = 0;
      while (curY <= cheight) {
        if (curY > weight) {
          ctx.beginPath();
          ctx.moveTo(0, curY);
          let lineToNumber = 0;
          let nMod = y % splitNumber
          if (nMod != 0) {
            ctx.moveTo(15, curY);
          }
          lineToNumber = weight


          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(lineToNumber, curY);
          ctx.stroke();
        }
        curY += splitedWeight;
        y++
      }
      curY = startBaseY - wpvY
      y = 0
      while (curY >= 0) {
        if (curY > weight) {
          ctx.beginPath();
          ctx.moveTo(0, curY);
          let lineToNumber = 0;
          let nMod = y % splitNumber
          if (nMod != 0) {
            ctx.moveTo(15, curY);
          }
          lineToNumber = weight


          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(lineToNumber, curY);
          ctx.stroke();
        }
        curY -= splitedWeight;
        y--
      }


      ctx.fillStyle = "grey"
      //绘制文本与左上角空白
      curX = startBaseX - wpvX
      x = 0;
      let textTime = 1;
      if (stageRatio > 0.25 && stageRatio <= 0.5) {
        textTime = 2;
      } else if (stageRatio > 0 && stageRatio <= 0.25) {
        textTime = 4;
      }
      while (curX <= cwidth) {
        //绘制文本
        if (x % textTime == 0) {
          let posText = (x * rulerConfig.size) + ""

          if (posText.indexOf('.') != -1) {
            posText = parseFloat(posText).toFixed(2)
          }

          ctx.fillText(posText, curX + textOffset, fontSize)
        }
        x++
        curX += marginWeight;
      }
      curX = startBaseX - wpvX
      x = 0
      while (curX >= 0) {
        if (x % textTime == 0) {
          //绘制文本
          let posText = (x * rulerConfig.size) + ""
          if (posText.indexOf('.') != -1) {
            posText = parseFloat(posText).toFixed(2)
          }
          ctx.fillText(posText, curX + textOffset, fontSize)
        }
        x--
        curX -= marginWeight;
      }

      ctx.save()
      ctx.scale(-1, 1);
      ctx.rotate(90 * DDeiConfig.ROTATE_UNIT);
      ctx.scale(-1, 1);
      curY = startBaseY - wpvY
      y = 0;
      let oneSize = DDeiUtil.measureTextSize(this.ddRender?.model, "0", 'Microsoft YaHei', fontSize).width
      while (curY <= cheight) {
        if (y % textTime == 0) {
          //绘制文本
          let posText = (y * rulerConfig.size) + ""
          if (posText.indexOf('.') != -1) {
            posText = parseFloat(posText).toFixed(2)
          }
          ctx.fillText(posText, -curY - textOffset - oneSize * posText.length, fontSize)
        }
        y++
        curY += marginWeight;

      }
      curY = startBaseY - wpvY
      y = 0
      while (curY >= 0) {
        if (y % textTime == 0) {
          //绘制文本
          let posText = (y * rulerConfig.size) + ""
          if (posText.indexOf('.') != -1) {
            posText = parseFloat(posText).toFixed(2)
          }
          ctx.fillText(posText, -curY - textOffset - oneSize * posText.length, fontSize)
        }
        y--
        curY -= marginWeight;
      }
      ctx.restore()



      //左上角空白
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, weight, weight)
      ctx.moveTo(0, weight)
      ctx.lineTo(weight, weight)
      ctx.stroke()
      ctx.moveTo(weight, 0)
      ctx.lineTo(weight, weight)
      ctx.stroke()


      //绘制当前选中的图形标尺
      let selectedModels = this.model.selectedModels;
      if (selectedModels?.size > 0) {
        let rect = DDeiAbstractShape.getOutRectByPV(Array.from(selectedModels?.values()));
        //横向
        ctx.strokeStyle = "#1F72FF";
        let weight = 16 * rat1;
        ctx.lineWidth = 1.5 * rat1
        ctx.globalAlpha = 0.7
        let x1 = (rect.x + this.model.wpv.x) * rat1
        let y1 = (rect.y + this.model.wpv.y) * rat1
        ctx.beginPath()
        ctx.moveTo(x1, 0)
        ctx.lineTo(x1, weight);
        ctx.closePath();
        ctx.stroke()
        //纵向
        ctx.beginPath()
        ctx.moveTo(0, y1)
        ctx.lineTo(weight, y1);
        ctx.closePath();
        ctx.stroke()
      }

      ctx.restore();
    }
  }

  /**
  * 绘制网格
  */
  drawGrid() {
    let paperType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.type", true);
    //获取纸张大小的定义
    let paperConfig = DDeiConfig.PAPER[paperType];
    if (paperConfig) {
      let gridDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "grid.display", true);
      if (gridDisplay == 1 || gridDisplay == '1' || gridDisplay == 2 || gridDisplay == '2') {
        //绘制横向点
        //获得 2d 上下文对象
        let canvas = this.ddRender.getCanvas();
        let ctx = canvas.getContext('2d');
        let rat1 = this.ddRender.ratio;
        let stageRatio = this.model.getStageRatio()
        let xDPI = this.ddRender.dpi.x;
        //标尺单位
        let unit = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.unit", true);
        let rulerConfig = DDeiConfig.RULER[unit]
        //尺子间隔单位
        let unitWeight = DDeiUtil.unitToPix(rulerConfig.size, unit, xDPI) * rat1;
        //根据缩放比率，对尺子间隔单位进行拆分
        //基准每个部分的大小
        let marginWeight = unitWeight * stageRatio
        //找到最接近的区间
        let timesNums = [0.25, 0.5, 1, 2, 4, 8]
        //当前的衡量量级
        let curTimes = 0.25;
        for (let i = 1; i < timesNums.length; i++) {
          if (stageRatio >= timesNums[i]) {
            curTimes = timesNums[i]
          }
        }
        let standWeight = curTimes * unitWeight;
        //计算量级偏差与实际大小的百分比
        let passPercent = Math.round((marginWeight - standWeight) / standWeight * 100)
        let splitNumber = rulerConfig.parts[0];
        if (passPercent > 0) {
          let p = Math.round(1 / rulerConfig.parts.length * 100)
          for (let i = 1; i < rulerConfig.parts.length; i++) {
            if (passPercent >= i * p) {
              splitNumber = rulerConfig.parts[i];
            }
          }
        }
        let paperOutRect = this.paperOutRect
        //切分后单个part大小
        let splitedWeight = marginWeight / splitNumber;
        //标尺的固定显示大小
        ctx.save();
        //创建剪切区，只有在纸张范围内才显示网格线
        ctx.beginPath();
        ctx.moveTo(paperOutRect.x, paperOutRect.y);
        ctx.lineTo(paperOutRect.x + paperOutRect.w, paperOutRect.y);
        ctx.lineTo(paperOutRect.x + paperOutRect.w, paperOutRect.y + paperOutRect.h);
        ctx.lineTo(paperOutRect.x, paperOutRect.y + paperOutRect.h);
        ctx.stroke()

        ctx.clip()
        let fontSize = 11 * rat1
        ctx.font = fontSize + "px Microsoft YaHei"
        ctx.lineWidth = 1
        ctx.strokeStyle = "rgb(190,190,190)"
        ctx.fillStyle = "white"

        let ex = paperOutRect.x + paperOutRect.w
        let ey = paperOutRect.y + paperOutRect.h
        if (gridDisplay == 2 || gridDisplay == '2') {
          //纸张开始的位置
          ctx.strokeStyle = "rgb(121,121,121)"
          ctx.lineWidth = 2 * stageRatio
          ctx.setLineDash([2 * stageRatio, splitedWeight - stageRatio])
          for (let sx = this.paperStartX; sx <= ex; sx = sx + splitedWeight) {
            ctx.beginPath()
            ctx.moveTo(sx, paperOutRect.y);
            ctx.lineTo(sx, ey);
            ctx.stroke();
          }
          for (let sx = this.paperStartX; sx >= paperOutRect.x; sx = sx - splitedWeight) {
            ctx.beginPath()
            ctx.moveTo(sx, paperOutRect.y);
            ctx.lineTo(sx, ey);
            ctx.stroke();
          }
        } else if (gridDisplay == 1 || gridDisplay == '1') {
          for (let sx = this.paperStartX, n = 0; sx <= ex; sx = sx + splitedWeight, n++) {
            let nMod = n % splitNumber
            if (nMod != 0) {
              ctx.strokeStyle = "rgb(230,230,230)"
            } else {
              ctx.strokeStyle = "rgb(220,220,220)"
            }
            ctx.beginPath()
            ctx.moveTo(sx, paperOutRect.y);
            ctx.lineTo(sx, ey);
            ctx.stroke();
          }
          for (let sx = this.paperStartX, n = 0; sx >= paperOutRect.x; sx = sx - splitedWeight, n++) {
            let nMod = n % splitNumber
            if (nMod != 0) {
              ctx.strokeStyle = "rgb(230,230,230)"
            } else {
              ctx.strokeStyle = "rgb(220,220,220)"
            }
            ctx.beginPath()
            ctx.moveTo(sx, paperOutRect.y);
            ctx.lineTo(sx, ey);
            ctx.stroke();
          }
          for (let sy = this.paperStartY, n = 0; sy <= ey; sy = sy + splitedWeight, n++) {
            let nMod = n % splitNumber
            if (nMod != 0) {
              ctx.strokeStyle = "rgb(230,230,230)"
            } else {
              ctx.strokeStyle = "rgb(220,220,220)"
            }
            ctx.beginPath()
            ctx.moveTo(paperOutRect.x, sy);
            ctx.lineTo(ex, sy);
            ctx.stroke();

          }
          for (let sy = this.paperStartY, n = 0; sy >= paperOutRect.y; sy = sy - splitedWeight, n++) {
            let nMod = n % splitNumber
            if (nMod != 0) {
              ctx.strokeStyle = "rgb(230,230,230)"
            } else {
              ctx.strokeStyle = "rgb(220,220,220)"
            }
            ctx.beginPath()
            ctx.moveTo(paperOutRect.x, sy);
            ctx.lineTo(ex, sy);
            ctx.stroke();

          }
        }


        ctx.restore();
      }
    }
  }


  /**
   * 绘制水印
   */
  drawMark() {
    //水印的参考位置为0,0原点，按照配置进行输出
    let markType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.type", true);
    //文本水印
    if (markType == 1 || markType == '1') {
      //内容
      let text = DDeiUtil.getReplacibleValue(this.model, "mark.data");
      if (text) {
        if (!this.markCanvas) {
          this.markCanvas = document.createElement("canvas");
        }
        let markCanvas = this.markCanvas;

        //获得 2d 上下文对象
        let canvas = this.ddRender.getCanvas();
        let ctx = canvas.getContext('2d');
        let rat1 = this.ddRender.ratio;
        let stageRatio = this.model.getStageRatio()
        let ratio = rat1 * stageRatio;
        ctx.save();
        //获取并应用设置信息
        //获取字体信息
        let fiFamily = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.font.family", true);
        let fiSize = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.font.size", true);
        let fiColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.font.color", true);
        //字体缩放后的大小，用于计算
        let fontSize = fiSize * ratio;
        //计算文本大小
        let textSize = DDeiUtil.measureTextSize(this.model.ddInstance, text, fiFamily, fontSize)
        let weight = Math.max(textSize.width, textSize.height);
        markCanvas.setAttribute("width", weight);
        markCanvas.setAttribute("height", weight);
        let markCtx = markCanvas.getContext("2d");
        markCtx.save();
        //设置字体
        markCtx.font = fontSize + "px " + fiFamily
        //设置字体颜色
        markCtx.fillStyle = fiColor
        //透明度
        let opac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.opacity", true);
        if (opac) {
          markCtx.globalAlpha = opac
        }
        //方向
        let direct = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.direct", true);
        if (direct == 1) {
          markCtx.translate(markCanvas.width * 0.5, markCanvas.height * 0.5)
          markCtx.rotate(45 * DDeiConfig.ROTATE_UNIT);
          markCtx.translate(-markCanvas.width * 0.5, -markCanvas.height * 0.5)
        } else if (direct == 2) {
          markCtx.translate(markCanvas.width * 0.5, markCanvas.height * 0.5)
          markCtx.rotate(-45 * DDeiConfig.ROTATE_UNIT);
          markCtx.translate(-markCanvas.width * 0.5, -markCanvas.height * 0.5)
        }
        markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height)
        markCtx?.fillText(text, 0, (markCanvas.height - textSize.height) / 2)
        let marginWidth = textSize.width + 50 * ratio
        let marginHeight = textSize.height + 100 * ratio
        let cwidth = canvas.width + marginWidth;
        let cheight = canvas.height + marginHeight;
        let x = -marginWidth
        let xdr = this.model.wpv.x * rat1 % marginWidth
        let ydr = this.model.wpv.y * rat1 % marginHeight
        for (; x <= cwidth; x += marginWidth) {
          let y = -marginHeight
          for (; y <= cheight; y += marginHeight) {
            ctx.drawImage(markCanvas, x + xdr, y + ydr)
          }
        }
        ctx.restore();
        markCtx.restore();
      }
    }
    //图片水印
    else if (this.model.mark?.type == 2) {
      //没有图片，加载图片，有图片绘制图片
      let imgData = DDeiUtil.getReplacibleValue(this.model, "mark.data");
      if (!this.mark?.imgObj || this.mark.upMarkImg != imgData) {
        this.initMarkImage();
      } else {
        if (!this.markCanvas) {
          this.markCanvas = document.createElement("canvas");
        }
        let markCanvas = this.markCanvas;
        //获得 2d 上下文对象
        let canvas = this.ddRender.getCanvas();
        let ctx = canvas.getContext('2d');
        let rat1 = this.ddRender.ratio;
        let stageRatio = this.model.getStageRatio()
        let ratio = rat1 * stageRatio;
        ctx.save();
        //获取并应用设置信息
        let weight = Math.max(this.mark.imgObj.width, this.mark.imgObj.height);
        markCanvas.setAttribute("width", weight);
        markCanvas.setAttribute("height", weight);
        let markCtx = markCanvas.getContext("2d");
        markCtx.save();
        //透明度
        let opac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.opacity", true);
        if (opac) {
          markCtx.globalAlpha = opac
        }
        //方向
        let direct = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "mark.direct", true);
        if (direct == 1) {
          markCtx.translate(markCanvas.width * 0.5, markCanvas.height * 0.5)
          markCtx.rotate(45 * DDeiConfig.ROTATE_UNIT);
          markCtx.translate(-markCanvas.width * 0.5, -markCanvas.height * 0.5)
        } else if (direct == 2) {
          markCtx.translate(markCanvas.width * 0.5, markCanvas.height * 0.5)
          markCtx.rotate(-45 * DDeiConfig.ROTATE_UNIT);
          markCtx.translate(-markCanvas.width * 0.5, -markCanvas.height * 0.5)
        }
        markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height)
        markCtx.drawImage(this.mark.imgObj, weight - this.mark.imgObj.width, (weight - this.mark.imgObj.height) / 2)
        let marginWidth = markCanvas.width + 50 * ratio
        let marginHeight = markCanvas.height + 50 * ratio
        let cwidth = canvas.width + marginWidth;
        let cheight = canvas.height + marginHeight;
        let x = -marginWidth
        let xdr = this.model.wpv.x * rat1 % marginWidth
        let ydr = this.model.wpv.y * rat1 % marginHeight
        for (; x <= cwidth; x += marginWidth) {
          let y = -marginHeight
          for (; y <= cheight; y += marginHeight) {
            ctx.drawImage(markCanvas, x + xdr, y + ydr)
          }
        }
        ctx.restore();
        markCtx.restore();
      }
    }


  }



  /**
   * 绘制滚动条
   */
  drawScroll() {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    let rat1 = this.ddRender.ratio;
    ctx.save();

    let scrollWeight = rat1 * 15;


    //获取全局缩放比例


    let cwidth = canvas.width - scrollWeight;
    let cheight = canvas.height - scrollWeight;
    //绘制画布滚动条
    if (this.hScroll) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "rgb(220,220,220)"
      ctx.fillRect(0, cheight, this.hScroll.width * rat1, scrollWeight)
      ctx.strokeRect(0, cheight, this.hScroll.width * rat1, scrollWeight)
      //绘制当前位置区域
      ctx.fillStyle = "rgb(210,210,210)"
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING && this.dragObj?.scroll == 1) {
        ctx.fillStyle = "rgb(200,200,200)"
      }
      ctx.fillRect(this.hScroll.x * rat1, cheight, this.hScroll.contentWidth * rat1, scrollWeight)
    }
    if (this.vScroll) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "rgb(220,220,220)"
      ctx.fillRect(cwidth, 0, scrollWeight, this.vScroll.height * rat1)
      ctx.strokeRect(cwidth, 0, scrollWeight, this.vScroll.height * rat1)
      ctx.fillStyle = "rgb(210,210,210)"
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING && this.dragObj?.scroll == 2) {
        ctx.fillStyle = "rgb(200,200,200)"
      }
      ctx.fillRect(cwidth, this.vScroll.y * rat1, scrollWeight, this.vScroll.contentHeight * rat1)
      //绘制当前位置区域
    }
    if (this.vScroll || this.hScroll) {
      ctx.strokeStyle = "rgb(220,220,220)"
      ctx.fillStyle = "white"
      ctx.fillRect(cwidth, cheight, scrollWeight, scrollWeight)
      ctx.strokeRect(cwidth, cheight, scrollWeight, scrollWeight)
    }



    //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
    // ctx.textAlign = "left";
    // ctx.textBaseline = "top";
    // //设置字体
    // ctx.font = "bold 24px 宋体"
    // //设置字体颜色
    // ctx.fillStyle = "red"
    // ctx.fillText(this.model.wpv.x + "," + this.model.wpv.y, 0, 0)
    // ctx.fillText(this.model.width + "," + this.model.height, 0, 20)
    // ctx.fillText(this.ddRender.container.clientWidth + "," + this.ddRender.container.clientHeight, 0, 40)
    // ctx.fillText(this.vScroll?.y + "", 0, 60)
    // ctx.restore();
  }

  /**
   * 计算滚动条信息
   */
  calScroll() {

    let canvas = this.ddRender.getCanvas();
    let rat1 = this.ddRender.ratio;
    //视窗的大小
    let canvasHeight = canvas.height / rat1;
    let canvasWidth = canvas.width / rat1;
    //当前位置
    let curX = -this.model.wpv.x;
    let curY = -this.model.wpv.y;

    //滚动条大小
    let scrollWeight = 15;

    //画布总大小
    let maxWidth = this.model.width
    let maxHeight = this.model.height;
    //计算纵向滚动条信息
    if (maxHeight > canvasHeight) {
      let height = canvasHeight - scrollWeight;
      this.vScroll = { height: height, contentHeight: height * height / maxHeight, y: height * curY / maxHeight, bn: curY / maxHeight };
    } else {
      this.vScroll = null;
      this.model.wpv.y = 0
    }
    //计算横向滚动条信息
    if (maxWidth > canvasWidth) {
      let width = canvasWidth - scrollWeight;
      this.hScroll = { width: width, contentWidth: width * width / maxWidth, x: width * curX / maxWidth, bn: curX / maxWidth };
    } else {
      this.hScroll = null;
      this.model.wpv.x = 0
    }
  }
  /**
   * 获取缓存的渲染数据
   */
  getCachedValue(attrPath: string): object | null {
    let returnValue: object | null = null;

    if (!this.renderCacheData.has(attrPath)) {
      returnValue = DDeiModelArrtibuteValue.getAttrValueByState(this.model, attrPath, true);
      this.renderCacheData.set(attrPath, returnValue)
    } else {
      returnValue = this.renderCacheData.get(attrPath)
    }
    return returnValue;
  }

  /**
  * 设置渲染缓存数据
  */
  setCachedValue(attrPath: string | string[], value: any): void {
    if (attrPath) {
      if (Array.isArray(attrPath)) {
        attrPath.forEach(item => {
          this.renderCacheData.set(item, value);
        })
      } else {
        this.renderCacheData.set(attrPath, value);
      }
    }
  }

  /**
   * 初始化选择器
   */
  initSelector(): void {
    if (!this.selector) {

      //创建选择框控件
      this.selector = DDeiSelector.initByJSON({
        id: this.model.id + "_inner_selector",
        border: DDeiConfig.SELECTOR.BORDER,
        fill: { default: {}, selected: {} }
      });
      this.selector.stage = this.model
      DDeiConfig.bindRender(this.selector);
      this.selector.initRender();
    }
    this.selector.resetState();
  }

  /**
   * 初始化水印图片
   */
  initMarkImage(): void {
    //加载图片
    let that = this;
    //加载base64图片
    let imgData = DDeiUtil.getReplacibleValue(this.model, "mark.data");
    if ((this.model.mark?.imgBase64 || imgData)) {
      let img = new Image();   // 创建一个<img>元素
      img.onload = function () {
        if (!that.mark) {
          that.mark = {}
        }
        let imgData = DDeiUtil.getReplacibleValue(that.model, "mark.data");
        that.mark.upMarkImg = that.model.mark.imgBase64 ? that.model.mark?.imgBase64 : imgData;
        that.mark.imgObj = img;
        that.model.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        that.model.ddInstance.bus.executeAll()
      }
      img.src = this.model.mark.imgBase64 ? this.model.mark?.imgBase64 : imgData;
    }

  }

  /**
   * 重置选择器状态
   * @param evt 事件
   */
  resetSelectorState(evt: Event): void {
    this.selector.resetState(evt.offsetX - this.model.wpv.x, evt.offsetY - this.model.wpv.y);
  }



  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    //分发到当前图层的mouseDown
    if (!this.model.ddInstance.eventCancel) {
      let canvas = this.ddRender.getCanvas();
      let rat1 = this.ddRender.ratio;
      let ex = evt.offsetX;
      let ey = evt.offsetY;
      ex /= window.remRatio
      ey /= window.remRatio
      //判断是否在滚动条区间
      let scrollWeight = 15;
      let cwidth = canvas.width / rat1 - scrollWeight;
      let cheight = canvas.height / rat1 - scrollWeight;
      if (this.vScroll && ex > cwidth && ey >= this.vScroll.y && (ey) <= (this.vScroll.y + this.vScroll.contentHeight)) {
        this.dragObj = {
          dy: ey - this.vScroll.y,
          scroll: 2
        }
        this.operateState = DDeiEnumOperateState.STAGE_SCROLL_WORKING;
      } else if (this.hScroll && ey > cheight && ex >= this.hScroll.x && (ex) <= (this.hScroll.x + this.hScroll.contentWidth)) {
        this.dragObj = {
          dx: ex - this.hScroll.x,
          scroll: 1
        }
        this.operateState = DDeiEnumOperateState.STAGE_SCROLL_WORKING;
      }
      else {
        this.model.layers[this.model.layerIndex].render.mouseDown(evt);
      }
    }
  }




  mouseUp(evt: Event): void {
    //分发到当前图层的mouseUp
    if (!this.model.ddInstance.eventCancel) {
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING) {
        this.dragObj = null;
        this.operateState = DDeiEnumOperateState.NONE;
      } else {
        this.model.layers[this.model.layerIndex].render.mouseUp(evt);
      }
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //分发到当前图层的mouseUp
    if (!this.model.ddInstance.eventCancel) {
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING) {
        let canvasPos = DDeiUtil.getDomAbsPosition(this.ddRender?.canvas?.parentElement)
        let ex = evt.clientX - canvasPos.left;
        let ey = evt.clientY - canvasPos.top;

        if (this.dragObj?.scroll == 1) {
          let width = this.hScroll.width;
          //原始鼠标位置在操作区域的位置
          //当前鼠标位置在滚动条的比例位置
          let posRat = (ex / window.remRatio - this.dragObj.dx) / width;
          this.model.wpv.x = -this.model.width * posRat;
          let hScrollWidth = this.hScroll?.width ? this.hScroll?.width : 0
          if (this.model.wpv.x > 0) {
            this.model.wpv.x = 0
          } else if (this.model.wpv.x < -this.model.width + hScrollWidth) {
            this.model.wpv.x = -this.model.width + hScrollWidth
          }
        } else if (this.dragObj?.scroll == 2) {
          let height = this.vScroll.height;
          //原始鼠标位置在操作区域的位置
          //当前鼠标位置在滚动条的比例位置
          let posRat = (ey / window.remRatio - this.dragObj.dy) / height;
          this.model.wpv.y = -this.model.height * posRat;
          let vScrollHeight = this.vScroll?.height ? this.vScroll?.height : 0
          if (this.model.wpv.y > 0) {
            this.model.wpv.y = 0
          } else if (this.model.wpv.y < -this.model.height + vScrollHeight) {
            this.model.wpv.y = -this.model.height + vScrollHeight
          }
        }
        this.model.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        this.model.ddInstance?.bus?.executeAll()
      } else {
        this.model.layers[this.model.layerIndex].render.mouseMove(evt);
      }
    }
  }

  /**
   * 鼠标悬停
   * @param inEdge 悬停方位
   * @param inEdgeTime 悬停时间
   */
  mouseInEdge(inEdge: number, inEdgeTime: number) {
    switch (this.operateState) {
      case DDeiEnumOperateState.CONTROL_CREATING:
      case DDeiEnumOperateState.CONTROL_DRAGING: {
        //鼠标悬停于边缘时的拖拽
        if (inEdge && inEdgeTime > 400) {
          let pContainerModel = null;
          //当前控件的上层控件
          if (this.currentOperateShape.id.indexOf("_shadow") != -1) {
            let id = this.currentOperateShape.id.substring(this.currentOperateShape.id, this.currentOperateShape.id.lastIndexOf("_shadow"))
            let model = this.model.getModelById(id)
            pContainerModel = model.pModel;
          } else {
            pContainerModel = this.currentOperateShape.pModel;
          }
          if (pContainerModel) {
            let dx = 0, dy = 0;
            let deltaSize = 10 * this.model.getStageRatio();
            switch (inEdge) {
              case 1: dy = -deltaSize; break;
              case 2: dx = deltaSize; break;
              case 3: dy = deltaSize; break;
              case 4: dx = -deltaSize; break;
            }
            if (dx || dy) {
              let shadowControls = this.model.layers[this.model.layerIndex].shadowControls
              if (!(shadowControls?.length > 0)) {
                shadowControls = [this.currentOperateShape]
              }
              let pushData = { dx: dx, dy: dy, dragObj: this.dragObj, models: shadowControls };
              //修改所有选中控件坐标
              this.model?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelEdgePosition, pushData);
              //渲染图形
              this.model?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
              this.model?.ddInstance?.bus?.executeAll();
            }
          }
        }
      } break;
    };
  }
}

export default DDeiStageCanvasRender