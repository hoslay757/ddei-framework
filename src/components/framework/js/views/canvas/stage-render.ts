import DDeiConfig from '../../config.js'
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js';
import DDeiCanvasRender from './ddei-render.js';
import DDeiAbstractShapeRender from './shape-render-base.js';

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

  /**
   * 刷新，如果为true则会绘制图形
   */
  refresh: boolean = true;


  //横向滚动条和纵向滚动条，当需要显示时不为空
  hScroll: object | null = null;
  vScroll: object | null = null;
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.ddInstance.render
    this.initSelector();
  }

  /**
   * 创建图形
   */
  drawShape(): void {

    //根据视窗平移
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    let rat1 = this.ddRender.ratio;
    ctx.save();
    ctx.translate(this.model.wpv.x * rat1, this.model.wpv.y * rat1)

    //计算滚动条
    this.calScroll();
    //绘制背景
    let topDisplayIndex = -1;
    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      if (this.model.layers[i].display == 1) {
        this.model.layers[i].render.drawBackground();
      } else if (this.model.layers[i].display == 2) {
        topDisplayIndex = i;
      }
    }
    if (topDisplayIndex != -1) {
      this.model.layers[topDisplayIndex].render.drawBackground();
    }
    ctx.restore();
    //绘制纸张
    this.drawPaper();
    //绘制网格
    this.drawGrid()
    //绘制图形
    ctx.save();
    ctx.translate(this.model.wpv.x * rat1, this.model.wpv.y * rat1)

    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      if (this.model.layers[i].display == 1) {
        this.model.layers[i].render.drawShape();
      }
    }
    if (topDisplayIndex != -1) {
      this.model.layers[topDisplayIndex].render.drawShape();
    }

    if (this.selector) {
      this.selector.render.drawShape();
    }
    ctx.restore();



    //绘制标尺
    this.drawRuler()

    //绘制水印
    this.drawMark();


    //绘制滚动条
    this.drawScroll();

  }

  /**
   * 绘制纸张
   */
  drawPaper() {
    let paperType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.type", true);
    let paperDirect = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.direct", true);
    //获取纸张大小的定义
    let paperConfig = DDeiConfig.PAPER[paperType];
    if (paperConfig) {
      //纸张从原点开始，根据配置输出和自动扩展
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio;
      let xDPI = this.ddRender.dpi.x;
      //当前的窗口位置（乘以了窗口缩放比例）
      let wpvX = -this.model.wpv.x * rat1
      let wpvY = -this.model.wpv.y * rat1
      let offsetWidth = 1 * ratio / 2;

      //纸张的像素大小
      let paperWidth = 0;
      let paperHeight = 0;
      if (paperDirect == 1 || paperDirect == '1') {
        paperWidth = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
        paperHeight = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
      } else {
        paperHeight = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
        paperWidth = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
      }

      //第一张纸开始位置
      let startPaperX = Math.floor(this.model.width / 2 * rat1 - paperWidth / 2)
      let startPaperY = Math.floor(this.model.height / 2 * rat1 - paperHeight / 2)
      let posX = startPaperX - wpvX + offsetWidth;
      let posY = startPaperY - wpvY + offsetWidth;

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
      //绘制矩形纸张
      ctx.save();
      ctx.lineWidth = 1
      ctx.fillStyle = "white"
      ctx.strokeStyle = "grey"
      ctx.setLineDash([5, 5]);

      for (let i = -leftExtNum; i <= rightExtNum; i++) {
        for (let j = -topExtNum; j <= bottomExtNum; j++) {
          ctx.fillRect(posX + (i * paperWidth), posY + (j * paperHeight), paperWidth, paperHeight)
          ctx.strokeRect(posX + (i * paperWidth), posY + (j * paperHeight), paperWidth, paperHeight)
        }
      }
      ctx.setLineDash([]);
      ctx.lineWidth = 1
      ctx.strokeStyle = "black"
      ctx.strokeRect(posX + (-leftExtNum * paperWidth), posY + (-topExtNum * paperHeight), (rightExtNum + leftExtNum + 1) * paperWidth, (bottomExtNum + topExtNum + 1) * paperHeight)
      ctx.restore();
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
      let ratio = rat1 * stageRatio;
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
      let fontSize = 11 * rat1
      ctx.font = fontSize + "px Microsoft YaHei"
      ctx.lineWidth = 1
      ctx.strokeStyle = "rgb(190,190,190)"
      ctx.fillStyle = "white"
      let cwidth = canvas.width;
      let cheight = canvas.height;

      //纸张的像素大小
      let paperWidth = 0;
      let paperHeight = 0;
      //获取纸张大小的定义
      let paperType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.type", true);
      let paperConfig = DDeiConfig.PAPER[paperType];

      if (paperConfig) {
        let paperDirect = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.direct", true);
        if (paperDirect == 1 || paperDirect == '1') {
          paperWidth = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
          paperHeight = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
        } else {
          paperHeight = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
          paperWidth = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
        }
      }

      //基准位置0刻度
      let startBaseX = this.model.width / 2 * rat1 - paperWidth / 2 + 0.5
      let startBaseY = this.model.height / 2 * rat1 - paperHeight / 2 + 0.5
      if (ruleDisplay == 1 || ruleDisplay == "1") {
        //横向尺子背景
        ctx.fillRect(0, 0, cwidth, weight)
        ctx.strokeRect(0, 0, cwidth, weight)
        //纵向尺子背景
        ctx.fillRect(0, 0, weight, cheight)
        ctx.strokeRect(0, 0, weight, cheight)
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
      ctx.strokeRect(0, 0, weight, weight)

      ctx.restore();
    }
  }

  /**
  * 绘制网格
  */
  drawGrid() {
    let gridDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "grid.display", true);
    if (gridDisplay == 1 || gridDisplay == '1') {
      //绘制横向点
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio;
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
      let fontSize = 11 * rat1
      ctx.font = fontSize + "px Microsoft YaHei"
      ctx.lineWidth = 1
      ctx.strokeStyle = "rgb(190,190,190)"
      ctx.fillStyle = "white"
      let cwidth = canvas.width;
      let cheight = canvas.height;

      //纸张的像素大小
      let paperWidth = 0;
      let paperHeight = 0;
      //获取纸张大小的定义
      let paperType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.type", true);
      let paperConfig = DDeiConfig.PAPER[paperType];

      if (paperConfig) {
        let paperDirect = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "paper.direct", true);
        if (paperDirect == 1 || paperDirect == '1') {
          paperWidth = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
          paperHeight = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
        } else {
          paperHeight = DDeiUtil.unitToPix(paperConfig.width, paperConfig.unit, xDPI) * ratio;
          paperWidth = DDeiUtil.unitToPix(paperConfig.height, paperConfig.unit, xDPI) * ratio;
        }
      }

      //基准位置0刻度
      let startBaseX = this.model.width / 2 * rat1 - paperWidth / 2 + 0.5
      let startBaseY = this.model.height / 2 * rat1 - paperHeight / 2 + 0.5


      //绘制竖线
      let textOffset = 1 * rat1
      ctx.fillStyle = "rgb(200,200,200)"
      //当前的窗口位置（乘以了窗口缩放比例）
      let wpvX = -this.model.wpv.x * rat1
      let wpvY = -this.model.wpv.y * rat1
      let x = 0;
      let k = 0;
      let curX = startBaseX - wpvX
      while (curX <= cwidth) {
        if (curX > weight) {
          ctx.beginPath();
          ctx.moveTo(curX, 0);
          let nMod = x % splitNumber
          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
            k++
          }
          ctx.lineTo(curX, cheight);
          ctx.stroke()
        }
        curX += splitedWeight;
        x++
      }
      x = 0;
      k = 0;
      curX = startBaseX - wpvX
      while (curX >= 0) {
        if (curX > weight) {
          ctx.beginPath();
          ctx.moveTo(curX, 0);
          let nMod = x % splitNumber

          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
            k--
          }
          ctx.lineTo(curX, cheight);
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
          let nMod = y % splitNumber
          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(cwidth, curY);
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

          let nMod = y % splitNumber

          if (nMod != 0) {
            ctx.strokeStyle = "rgb(230,230,230)"
          } else {
            ctx.strokeStyle = "rgb(220,220,220)"
          }
          ctx.lineTo(cwidth, curY);
          ctx.stroke();
        }
        curY -= splitedWeight;
        y--
      }
      ctx.restore();
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
      let text = this.model.mark.data
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
      if (!this.mark?.imgObj) {
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
    let ruleWeight = 0;
    let ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.display", true);
    if (ruleDisplay == 1 || ruleDisplay == '1') {
      ruleWeight = 16;
    }
    //滚动条大小
    let scrollWeight = 15;

    //画布总大小
    let maxWidth = this.model.width
    let maxHeight = this.model.height;
    //计算纵向滚动条信息
    if (maxHeight > canvasHeight) {
      let height = canvasHeight - scrollWeight - ruleWeight;
      this.vScroll = { height: height, contentHeight: height * height / maxHeight, y: height * curY / maxHeight, bn: curY / maxHeight };
    } else {
      this.vScroll = null;
    }
    //计算横向滚动条信息
    if (maxWidth > canvasWidth) {
      let width = canvasWidth - scrollWeight - ruleWeight;
      this.hScroll = { width: width, contentWidth: width * width / maxWidth, x: width * curX / maxWidth, bn: curX / maxWidth };
    } else {
      this.hScroll = null;
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
    if ((this.model.mark?.imgBase64 || this.model.mark?.data) && !this.mark?.imgObj) {
      let img = new Image();   // 创建一个<img>元素
      img.onload = function () {
        if (!that.mark) {
          that.mark = {}
        }
        that.mark.imgObj = img;
        that.model.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        that.model.ddInstance.bus.executeAll()
      }
      img.src = this.model.mark.imgBase64 ? this.model.mark?.imgBase64 : this.model.mark?.data;
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
        let canvasPos = DDeiUtil.getDomAbsPosition(this.ddRender?.canvas)
        let ex = evt.clientX - canvasPos.left;
        let ey = evt.clientY - canvasPos.top;
        if (this.dragObj?.scroll == 1) {
          let width = this.hScroll.width;
          //原始鼠标位置在操作区域的位置
          //当前鼠标位置在滚动条的比例位置
          let posRat = (ex - this.dragObj.dx) / width;
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
          let posRat = (ey - this.dragObj.dy) / height;
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
}

export default DDeiStageCanvasRender