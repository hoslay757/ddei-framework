import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
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
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from '../../enums/operate-type.js';


/**
 * DDeiLine的渲染器类，用于渲染连线
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiLineCanvasRender extends DDeiAbstractShapeRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiRectangleCanvasRender {
    return new DDeiLineCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLineCanvasRender";

  /**
   * 用于绘图时缓存属性等信息
   */
  textUsedArea: object[] = [];

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

  enableRefreshShape() {
    super.enableRefreshShape()
    this.model.linkModels?.forEach(lm => {
      if (lm.dm) {
        lm.dm.render?.enableRefreshShape()
      }
    })
  }

  createTempShape() {
    let rat1 = this.ddRender.ratio;
    //测试剪切图形
    //转换为图片
    if (!this.tempCanvas) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.setAttribute("style", "pointer-events:none;position:absolute;-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / rat1) + ");display:block;scale:" + (1 / rat1));
    }
    let stageRatio = this.stage?.getStageRatio()
    let tempCanvas = this.tempCanvas
    let pvs = this.model.getOperatePVS(true);
    
    let outRect = DDeiAbstractShape.pvsToOutRect(pvs, stageRatio)
    let weight = 5 * stageRatio * rat1
    outRect.x -= weight
    outRect.x1 += weight
    outRect.y -= weight
    outRect.y1 += weight
    outRect.width += 2 * weight
    outRect.height += 2 * weight
    tempCanvas.setAttribute("width", outRect.width * rat1)
    tempCanvas.setAttribute("height", outRect.height * rat1)
    
    //获得 2d 上下文对象
    let tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tempCanvas.tx = -outRect.x * rat1
    tempCanvas.ty = -outRect.y * rat1
    tempCanvas.outRect = outRect
    tempCtx.translate(tempCanvas.tx, tempCanvas.ty)

  }


  /**
   * 创建图形
   */
  drawShape(tempShape, composeRender: boolean = false, inRect: object | null = null, zIndex: number = 0): void {
    if (!inRect || this.model.isInRect(inRect.x, inRect.y, inRect.x1, inRect.y1)) {
      this.tempZIndex = zIndex
      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_BEFORE", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.ddRender.model, null)
      if (rsState == 0 || rsState == 1) {
        let rsState1 = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", DDeiEnumOperateType.VIEW, { models: [this.model], tempShape: tempShape, composeRender: composeRender }, this.ddRender.model, null)
        if (rsState1 == 0 || rsState1 == 1) {
          if (this.refreshShape) {
            
            //创建准备图形
            this.createTempShape();
            //将当前控件以及composes按照zindex顺序排列并输出
            let rendList = [];
            if (this.model.composes?.length > 0) {
              rendList = rendList.concat(this.model.composes);
            }
            rendList.push(this.model)
            rendList.sort((a, b) => {

              if ((a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
                return a.cIndex - b.cIndex
              } else if ((a.cIndex || a.cIndex == 0) && !(b.cIndex || b.cIndex == 0)) {
                return 1
              } else if (!(a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
                return -1
              } else {
                return 0
              }
            })
            rendList.forEach(c => {
              if (c == this.model) {
                //获得 2d 上下文对象
                let canvas = this.getCanvas();
                let ctx = canvas.getContext('2d');
                ctx.save();
                //如果线段类型发生了改变，则重新绘制线段，计算中间点坐标
                if (this.inited && this.model.id.indexOf("_shadow") == -1 && (!this.upLineType || this.upLineType != this.model.type)) {
                  this.upLineType = this.model.type
                  this.model.freeze = 0
                  this.model.spvs = []

                  this.model.refreshLinePoints()
                  this.model.updateOVS()
                  this.stageRender?.selector.updatePVSByModels();
                } else if (!this.inited) {
                  this.inited = true;
                  this.upLineType = this.model.type
                }

                //绘制线段
                this.drawLine(tempShape);


                ctx.restore();
              } else {
                //绘制组合控件的内容
                c.render.drawShape(tempShape, true)
              }
            })
            this.refreshShape = false
          }

          //外部canvas
          if (DDeiUtil.DRAW_TEMP_CANVAS && this.tempCanvas) {
            // let canvas = this.getRenderCanvas(composeRender)
            // let ctx = canvas.getContext('2d');
            // let rat1 = this.ddRender.ratio;
            let outRect = this.tempCanvas.outRect
            // ctx.drawImage(this.tempCanvas, 0, 0, outRect.width * rat1, outRect.height * rat1, outRect.x * rat1, outRect.y * rat1, outRect.width * rat1, outRect.height * rat1)
            //获取model的绝对位置
            let model = this.model
            let stage = model.stage
            let ruleWeight = 0
            if (stage.render.tempRuleDisplay == 1 || stage.render.tempRuleDisplay == '1') {
              ruleWeight = 15
            }
            if (!this.tempCanvas.parentElement) {
              //将canvas移动至画布位置
              let editorId = DDeiUtil.getEditorId(this.ddRender?.model);
              let canvasDivEle = document.getElementById(editorId + "_canvas");
              let viewerEle = canvasDivEle.getElementsByClassName("ddei-editor-canvasview-viewers")[0]
              viewerEle.appendChild(this.tempCanvas)
            }
            this.tempCanvas.style.zIndex = this.tempZIndex
            
            this.tempCanvas.style.left = (outRect.x + outRect.x1) / 2 + this.model.stage.wpv.x - this.tempCanvas.offsetWidth / 2 - ruleWeight + "px"

            this.tempCanvas.style.top = (outRect.y + outRect.y1) / 2 + this.model.stage.wpv.y - this.tempCanvas.offsetHeight / 2 - ruleWeight + "px"


          }
        }
        DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_AFTER", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.ddRender.model, null)
      }
    } else {

      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", "VIEW-HIDDEN", { models: [this.model] }, this.ddRender.model, null)
      if (rsState == 0 || rsState == 1) {
        //将canvas移动至画布位置
        this.tempCanvas.remove()
      }

    }
  }

  getRenderCanvas(composeRender) {
    if (composeRender) {
      return this.model.pModel.render.getCanvas()
    } else {
      return this.ddRender?.getCanvas();
    }
  }

  getCanvas() {
    return this.tempCanvas;
  }



  /**
  * 绘制线段
  */
  drawLine(tempLine, tempCtx): void {

    //获得 2d 上下文对象
    let canvas = this.getCanvas();
    if (!canvas) {
      return;
    }
    let ctx = tempCtx ? tempCtx : canvas.getContext('2d');

    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = tempLine?.rat1 ? tempLine.rat1 : this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    rat1 = ratio
    //获取绘图属性
    let color = tempLine?.color ? tempLine.color : this.getCachedValue("color");
    if(!color){
      color = DDeiUtil.getStyleValue("canvas-control-border", this.ddRender.model);
    }
    let weight = tempLine?.weight ? tempLine.weight : this.getCachedValue("weight");
    let fillWeight = tempLine?.fill?.weight ? tempLine?.fill?.weight : this.getCachedValue("fill.weight");
    weight = weight + fillWeight
    let fillColor = tempLine?.fill?.color ? tempLine?.fill?.color : this.getCachedValue("fill.color");
    let dash = tempLine?.dash ? tempLine.dash : this.getCachedValue("dash");
    let round = tempLine?.round ? tempLine.round : this.getCachedValue("round");
    let type = this.getCachedValue("type");
    let opacity = tempLine?.opacity ? tempLine.opacity : this.getCachedValue("opacity");

    let pvs = this.model.pvs;
    //条线
    let jumpLine = DDeiModelArrtibuteValue.getAttrValueByState(this, "jumpline", true);
    //采用全局跳线
    //采用全局跳线
    if (jumpLine == 0 || !jumpLine) {
      if (this.stage.global?.jumpline) {
        jumpLine = this.stage.global.jumpline;
      } else if (this.stage.ddInstance.jumpline) {
        jumpLine = this.stage.ddInstance.jumpline;
      } else {
        jumpLine = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "global.jumpline", true);
      }
    }
    

    //绘制线段
    if (pvs?.length >= 2 && color && (!opacity || opacity > 0) && weight > 0) {
      //获取图标图形
      let { startDX, startDY, endDX, endDY } = this.getPointShapeSize();
      ctx.save()
      let lineWidth = weight * ratio;
      let fillLineWidth = fillWeight * ratio;
      ctx.lineWidth = lineWidth;
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
      let crossWeight = 4;
      switch (type) {
        case 1: {
          //直线
          ctx.beginPath()
          ctx.moveTo((pvs[0].x + startDX) * rat1, (pvs[0].y + startDY) * rat1)
          if (this.model.clps[0] && jumpLine == 1) {
            let clps = this.model.clps[0];
            for (let c = 0; c < clps.length; c++) {
              let cpi = clps[c].cp;
              let r = clps[c].r
              ctx.arc(cpi.x * rat1, cpi.y * rat1, crossWeight * rat1, (Math.PI / 180) * (r + 180), (Math.PI / 180) * r, true);
            }
          }
          ctx.lineTo((pvs[pvs.length - 1].x + endDX) * rat1, (pvs[pvs.length - 1].y + endDY) * rat1)
          ctx.stroke();
          if (fillLineWidth > 0) {
            ctx.lineWidth = fillLineWidth;
            ctx.strokeStyle = DDeiUtil.getColor(fillColor);
            ctx.stroke();
          }
          ctx.closePath()
        } break;
        case 2: {
          //折线
          ctx.beginPath()
          ctx.moveTo((pvs[0].x + startDX) * rat1, (pvs[0].y + startDY) * rat1)
          for (let i = 1; i < pvs.length; i++) {
            //如果存在交错点，则截断线段生成
            if (this.model.clps[i - 1] && jumpLine == 1) {
              let clps = this.model.clps[i - 1];
              for (let c = 0; c < clps.length; c++) {
                let cpi = clps[c].cp;
                let r = clps[c].r
                ctx.arc(cpi.x * rat1, cpi.y * rat1, crossWeight * rat1, (Math.PI / 180) * (r + 180), (Math.PI / 180) * r, true);
              }
              //绘制剩下的线段
              if (i == pvs.length - 1) {
                ctx.lineTo((pvs[i].x + endDX) * rat1, (pvs[i].y + endDY) * rat1)
              } else {
                ctx.arcTo(pvs[i].x * rat1, pvs[i].y * rat1, pvs[i + 1].x * rat1, pvs[i + 1].y * rat1, round * rat1);
              }
            } else {
              if (i == pvs.length - 1) {
                ctx.lineTo((pvs[i].x + endDX) * rat1, (pvs[i].y + endDY) * rat1)
              } else {
                ctx.arcTo(pvs[i].x * rat1, pvs[i].y * rat1, pvs[i + 1].x * rat1, pvs[i + 1].y * rat1, round * rat1);
              }
            }
          }
          
          ctx.stroke();
          if (fillLineWidth > 0) {
            ctx.lineWidth = fillLineWidth;
            ctx.strokeStyle = DDeiUtil.getColor(fillColor);
            ctx.stroke();
          }
          ctx.closePath()
        } break;
        case 3: {
          if (pvs.length >= 4) {
            //曲线
            for (let i = 4; i <= pvs.length; i += 3) {
              ctx.beginPath()
              let i0 = i - 4;
              let i1 = i - 3;
              let i2 = i - 2;
              let i3 = i - 1;
              if (i == 4) {
                ctx.moveTo((pvs[i0].x + startDX) * rat1, (pvs[i0].y + startDY) * rat1)
              } else {
                ctx.moveTo(pvs[i0].x * rat1, pvs[i0].y * rat1)
              }
              if (i == pvs.length) {
                ctx.bezierCurveTo(pvs[i1].x * rat1, pvs[i1].y * rat1, pvs[i2].x * rat1, pvs[i2].y * rat1, (pvs[i3].x + endDX) * rat1, (pvs[i3].y + endDY) * rat1);
              } else {
                ctx.bezierCurveTo(pvs[i1].x * rat1, pvs[i1].y * rat1, pvs[i2].x * rat1, pvs[i2].y * rat1, pvs[i3].x * rat1, pvs[i3].y * rat1);

              }
              ctx.stroke();
              if (fillLineWidth > 0) {
                ctx.lineWidth = fillLineWidth;
                ctx.strokeStyle = DDeiUtil.getColor(fillColor);
                ctx.stroke();
              }
              ctx.closePath()
            }
          } else {
            ctx.beginPath()
            ctx.moveTo((pvs[0].x + startDX) * rat1, (pvs[0].y + startDY) * rat1)
            ctx.lineTo((pvs[0].x + endDX) * rat1, pvs[0].y * rat1, pvs[1].x * rat1, (pvs[1].y + endDY) * rat1);
            ctx.stroke();
            if (fillLineWidth > 0) {
              ctx.lineWidth = fillLineWidth;
              ctx.strokeStyle = DDeiUtil.getColor(fillColor);
              ctx.stroke();
            }
            ctx.closePath()
          }
        } break;
      }
      //绘制端点
      this.drawPoint(tempLine, tempCtx);
      ctx.restore();
    }
  }

  /**
   * 获取点图形所占用的空间
   * @returns
   */
  getPointShapeSize(): { startDX: number, startDY: number, endDX: number, endDY: number } {
    let stageRatio = this.model.getStageRatio()
    let pvs = this.model.pvs;
    let startDX = 0;
    let endDX = 0;
    let startDY = 0;
    let endDY = 0;
    //计算开始和结束点的单位增量
    //计算不同类型箭头下的增量与减量
    let stype = this.getCachedValue("sp.type");
    let etype = this.getCachedValue("ep.type");
    let sweight = this.getCachedValue("sp.weight");
    let eweight = this.getCachedValue("ep.weight");
    let fillWeight = this.getCachedValue("fill.weight");
    let lineWeight = this.getCachedValue("weight");
    lineWeight = lineWeight * stageRatio
    sweight += fillWeight
    eweight += fillWeight
    if (sweight <= 0) {
      sweight = 1
    }
    if (eweight <= 0) {
      eweight = 1
    }
    //旋转
    let startRotate = DDeiUtil.getLineAngle(pvs[1].x, pvs[1].y, pvs[0].x, pvs[0].y)
    let endRotate = DDeiUtil.getLineAngle(pvs[pvs.length - 2].x, pvs[pvs.length - 2].y, pvs[pvs.length - 1].x, pvs[pvs.length - 1].y)
    let startAngle = (startRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
    let endAngle = (endRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
    let startVectorUnit = new Vector3(1, 0, 1)
    let endVectorUnit = new Vector3(1, 0, 1)
    let startRotateMatrix = new Matrix3(
      Math.cos(startAngle), Math.sin(startAngle), 0,
      -Math.sin(startAngle), Math.cos(startAngle), 0,
      0, 0, 1);
    startVectorUnit.applyMatrix3(startRotateMatrix)
    let endRotateMatrix = new Matrix3(
      Math.cos(endAngle), Math.sin(endAngle), 0,
      -Math.sin(endAngle), Math.cos(endAngle), 0,
      0, 0, 1);
    endVectorUnit.applyMatrix3(endRotateMatrix)

    let wl = 0;
    switch (stype) {
      case 1:
        // wl = sweight * stageRatio;
        break;
      case 21:
      case 2:
        wl = sweight * stageRatio;
        break;
      case 31:
      case 3:
        wl = sweight * stageRatio;
        break;
      case 41:
      case 4:
        wl = 2 * sweight * stageRatio + lineWeight;
        break;
      case 51:
      case 5:
        wl = sweight * stageRatio + lineWeight;
        break;
      case 61:
      case 6:
        wl = sweight * stageRatio / 2
        break;
    }
    startDX = -startVectorUnit.x * wl
    startDY = startVectorUnit.y * wl
    wl = 0
    switch (etype) {
      case 1:
        // wl = eweight * stageRatio;
        break;
      case 21:
      case 2:
        wl = eweight * stageRatio;
        break;
      case 31:
      case 3:
        wl = eweight * stageRatio;
        break;
      case 41:
      case 4:
        wl = 2 * eweight * stageRatio + lineWeight;
        break;
      case 51:
      case 5:
        wl = eweight * stageRatio + lineWeight;
        break;
      case 61:
      case 6:
        wl = eweight * stageRatio / 2
        break;
    }
    endDX = -endVectorUnit.x * wl
    endDY = endVectorUnit.y * wl
    return { startDX: startDX, startDY: startDY, endDX: endDX, endDY: endDY }
  }
  /**
  * 绘制端点
  */
  drawPoint(tempLine, tempCtx): void {
    //获得 2d 上下文对象
    let canvas = this.getCanvas();
    if (!canvas) {
      return;
    }
    let ctx = tempCtx ? tempCtx : canvas.getContext('2d');

    //获取绘图属性
    let stype = this.getCachedValue("sp.type");
    let etype = this.getCachedValue("ep.type");
    let sweight = this.getCachedValue("sp.weight");
    let eweight = this.getCachedValue("ep.weight");

    //开始节点
    this.drawOnePoint(1, stype, sweight, ctx, tempLine)

    //结束节点
    this.drawOnePoint(2, etype, eweight, ctx, tempLine)
  }

  /**
   * 绘制单个端点
   * @param type 
   * @param direct 
   */
  private drawOnePoint(pointType: number, type: number, weight: number, ctx, tempLine): void {
    if (!type) {
      return;
    }
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = tempLine?.rat1 ? tempLine.rat1 : this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    rat1 = ratio
    //获取绘图属性
    let color = tempLine?.color ? tempLine.color : this.getCachedValue("color");
    let opacity = tempLine?.opacity ? tempLine.opacity : this.getCachedValue("opacity");

    ctx.save()
    ctx.setLineDash([])
    let pvs = this.model.pvs;
    let point = null;
    let upPoint = null;
    let lineWeight = tempLine?.weight ? tempLine.weight : this.getCachedValue("weight");
    let fillColor = tempLine?.fill?.color ? tempLine?.fill?.color : this.getCachedValue("fill.color");
    let fillWeight = tempLine?.fill?.weight ? tempLine?.fill?.weight : this.getCachedValue("fill.weight");
    weight += fillWeight
    if (weight <= 0) {
      weight = 1
    }
    let lineWidth = lineWeight * ratio
    ctx.lineWidth = lineWidth;
    //开始
    if (pointType == 1) {
      point = this.model.startPoint;
      upPoint = pvs[1];
    }
    //结束
    else if (pointType == 2) {
      point = this.model.endPoint;
      upPoint = pvs[pvs.length - 2];
    }
    point = new Vector3(point.x, point.y, 1)

    //透明度
    if (opacity != null && opacity != undefined) {
      ctx.globalAlpha = opacity
    }
    //颜色
    ctx.fillStyle = DDeiUtil.getColor(color);
    //颜色
    ctx.strokeStyle = DDeiUtil.getColor(color);

    //旋转
    let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)
    if (rotate != 0) {
      ctx.translate(point.x * rat1, point.y * rat1)
      ctx.rotate(rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-point.x * rat1, -point.y * rat1)
    }
    switch (type) {
      case 1: {
        let wl = weight * stageRatio;
        ctx.beginPath()
        ctx.moveTo((point.x - wl) * rat1, (point.y - 0.8 * wl) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1, (point.y + 0.8 * wl) * rat1)
        ctx.stroke()
        ctx.closePath()
        break;
      }
      case 21:
      case 2: {
        //圆形
        let wl = weight * stageRatio;
        ctx.beginPath()
        ctx.ellipse((point.x - wl / 2) * rat1 - lineWidth / 2, point.y * rat1, wl / 2 * rat1, wl / 2 * rat1, 0, 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke();
        if (fillWeight > 0 || type == 21 || tempLine) {
          if (fillWeight > 0) {
            ctx.fillStyle = DDeiUtil.getColor(fillColor)
          }
          ctx.fill()
        }
        break;
      }
      case 31:
      case 3: {
        let wl = weight * stageRatio;
        //方形
        ctx.beginPath()
        ctx.moveTo((point.x - wl) * rat1 - lineWidth / 2, (point.y - wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, (point.y - wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, (point.y + wl / 2) * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth / 2, (point.y + wl / 2) * rat1)
        ctx.closePath()
        ctx.stroke();
        if (fillWeight > 0 || type == 31 || tempLine) {
          if (fillWeight > 0) {
            ctx.fillStyle = DDeiUtil.getColor(fillColor)
          }

          ctx.fill();
        }
        break;
      }
      case 41:
      case 4: {
        let wl = weight * stageRatio;
        //菱形
        ctx.beginPath()
        ctx.moveTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth, (point.y - wl / 2) * rat1)
        ctx.lineTo((point.x - 2 * wl) * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth, (point.y + wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.closePath()
        ctx.stroke();
        if (fillWeight > 0 || type == 41 || tempLine) {
          if (fillWeight > 0) {
            ctx.fillStyle = DDeiUtil.getColor(fillColor)
          }
          ctx.fill()
        }
        break;
      }
      case 51:
      case 5: {
        let wl = weight * stageRatio;
        ctx.beginPath()
        ctx.moveTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth, (point.y - wl / 2) * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth, (point.y + wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.closePath()
        ctx.stroke()
        if (fillWeight > 0 || type == 51 || tempLine) {
          if (fillWeight > 0) {
            ctx.fillStyle = DDeiUtil.getColor(fillColor)
          }
          ctx.fill()
        }
        break;
      }
      case 61:
      case 6: {
        //半圆
        let wl = weight * stageRatio / 2;
        ctx.beginPath()
        ctx.ellipse((point.x - wl / 2) * rat1 - lineWidth / 2, point.y * rat1, wl * rat1, wl * rat1, 0, 0.4 * Math.PI, Math.PI * 1.6)

        ctx.stroke();
        if (fillWeight > 0 || type == 61 || tempLine) {
          if (fillWeight > 0) {
            ctx.fillStyle = DDeiUtil.getColor(fillColor)
          }
          ctx.fill()
        }
        break;
      }
    }
    ctx.restore();
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
    //获取操作点，如果有则添加到其Layer
    if (this.layer) {

      let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender?.model);
      let accessLink = DDeiUtil.isAccess(
        DDeiEnumOperateType.LINK, [this.model], null, modeName,
        this.ddRender?.model
      );
      if (accessLink) {
        this.layer.opLine = this.model
      }
    }
  }
}

export {DDeiLineCanvasRender}
export default DDeiLineCanvasRender