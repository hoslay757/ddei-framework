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
import { cloneDeep } from 'lodash-es'
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';


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

  createTempShape() {
    let rat1 = this.ddRender.ratio;
    //测试剪切图形
    //转换为图片
    if (!this.tempCanvas) {
      this.tempCanvas = document.createElement('canvas');
      this.tempCanvas.setAttribute("style", "pointer-events:none;position:absolute;-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / rat1) + ");-webkit-transform:scale(" + (1 / rat1) + ");display:block;");
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
          if (!this.viewer) {
            let print = false
            if (!DDeiUtil.isModelHidden(this.model) && this.refreshShape) {
              print = true
              //创建准备图形
              this.createTempShape();
              //将当前控件以及composes按照zindex顺序排列并输出
              let rendList = DDeiUtil.sortRendList(this.model)
              for(let ri = 0;ri < rendList.length;ri++){
                let c = rendList[ri];
                if (c == this.model) {
                  this.tempZIndex = this.tempZIndex+ri
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
                  c.render.drawShape(tempShape, 1,null,this.tempZIndex+ri)
                }
              }
              this.refreshShape = false
            }

            //外部canvas
            this.drawSelfToCanvas(composeRender, print)
          } else {
            if (!DDeiUtil.isModelHidden(this.model) && this.refreshShape) {
              DDeiUtil.createRenderViewer(this.model, "VIEW", tempShape, composeRender)
            } else {
              DDeiUtil.createRenderViewer(this.model, "VIEW-HIDDEN")
            }
          }
        }
        DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_AFTER", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.ddRender.model, null)
      }
    } else {

      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", "VIEW-HIDDEN", { models: [this.model] }, this.ddRender.model, null)
      if (rsState == 0 || rsState == 1) {
        if (!this.viewer) {
          this.removeViewerCanvas()
        } else {
          DDeiUtil.createRenderViewer(this.model, "VIEW-HIDDEN")
        }
      }

    }
  }

  drawSelfToCanvas(composeRender, print) {
    if(this.viewer){
      if (!DDeiUtil.isModelHidden(this.model) && this.refreshShape) {
        DDeiUtil.createRenderViewer(this.model, "VIEW", null, composeRender)
      } else {
        DDeiUtil.createRenderViewer(this.model, "VIEW-HIDDEN")
      }
    }
    //外部canvas
    else if (this.tempCanvas) {
      if (!DDeiUtil.isModelHidden(this.model)) {
        let outRect = this.tempCanvas.outRect
        //获取model的绝对位置
        let model = this.model
        let stage = model.stage
        let ruleWeight = 0
        if (stage.render.tempRuleDisplay == 1 || stage.render.tempRuleDisplay == '1') {
          ruleWeight = 15
        }
        if (!this.tempCanvas.parentElement) {
          //将canvas移动至画布位置
          let viewerEle = this.model.layer.render.containerViewer
          viewerEle.appendChild(this.tempCanvas)
        }
        this.tempCanvas.style.zIndex = this.tempZIndex

        this.tempCanvas.style.left = (outRect.x + outRect.x1) / 2 + this.model.stage.wpv.x - this.tempCanvas.offsetWidth / 2 - ruleWeight + "px"

        this.tempCanvas.style.top = (outRect.y + outRect.y1) / 2 + this.model.stage.wpv.y - this.tempCanvas.offsetHeight / 2 - ruleWeight + "px"
        if (!print) {
          this.model.composes?.forEach(comp => {
            comp.render.drawSelfToCanvas(composeRender + 1)
          })
        }
      } else {
        this.removeViewerCanvas()
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


    if (this.layer) {
      let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender?.model);
      let accessLink = DDeiUtil.isAccess(
        DDeiEnumOperateType.LINK, [this.model], null, modeName,
        this.ddRender?.model
      );
      if (accessLink) {
        let ex = evt.offsetX || evt.offsetX == 0 ? evt.offsetX : evt.touches[0].pageX;
        let ey = evt.offsetY || evt.offsetY == 0 ? evt.offsetY : evt.touches[0].pageY;
        ex /= window.remRatio
        ey /= window.remRatio
        ex -= this.stage.wpv.x;
        ey -= this.stage.wpv.y
        let stageRatio = this.stage.getStageRatio();
        ex = ex / stageRatio
        ey = ey / stageRatio
        let tpdata
        //操作图标的宽度
        let weight = DDeiConfig.SELECTOR.OPERATE_ICON.weight;
        let halfWeigth = weight * 0.5;
        if (this.opvs){
          for (let i = 0; i < this.opvs.length; i++) {
            let pv = this.opvs[i];
            if (DDeiAbstractShape.isInsidePolygon(
              [
                { x: pv.x - halfWeigth, y: pv.y - halfWeigth },
                { x: pv.x + halfWeigth, y: pv.y - halfWeigth },
                { x: pv.x + halfWeigth, y: pv.y + halfWeigth },
                { x: pv.x - halfWeigth, y: pv.y + halfWeigth }
              ]
              , { x: ex, y: ey })) {
              tpdata = { type: this.opvsType[i], index: i }
            }
          }
        }
        if (tpdata){
          let dragPoint = this.opvs[tpdata.index]
          //创建影子控件
          let lineShadow = DDeiUtil.getShadowControl(this.model);
          this.layer.shadowControls.push(lineShadow);
          this.stageRender.currentOperateShape = lineShadow
          this.stageRender.currentOperateShape.dragPoint = dragPoint
          let dragObj = {
            x: ex,
            y: ey,
            dragPoint: dragPoint,
            model: lineShadow,
            opvsIndex: tpdata.index,
            passIndex: tpdata.type,
            opvs: this.opvs
          }
          let rsState = DDeiUtil.invokeCallbackFunc("EVENT_LINE_DRAG_BEFORE", DDeiEnumOperateType.DRAG, dragObj, this.stage?.ddInstance, evt)
          if (rsState == 0 || rsState == 1) {
            DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", DDeiEnumOperateType.LINK, null, this.stage?.ddInstance, evt)
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
            //改变光标
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: "grabbing" }, evt);

            this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING
          }
        }
      }
    }
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

        //计算线的操作点

        let type = this.getCachedValue("type");
        let pvs = this.model.pvs
        let { startDX, startDY, endDX, endDY } = this.getPointShapeSize();
        let opvs = [];
        let opvsType = [];
        opvs.push(pvs[0])
        opvsType.push(1);

        switch (type) {
          case 2: {
            for (let i = 1; i < pvs.length; i++) {
              let x = (pvs[i].x + pvs[i - 1].x) / 2
              let y = (pvs[i].y + pvs[i - 1].y) / 2

              opvs.push(new Vector3(x, y, 1))
              opvsType.push(3);

              if (i != pvs.length - 1) {
                opvs.push(pvs[i])
                opvsType.push(2);
              }
            }
            break;
          }
          case 3: {
            if (pvs.length >= 4) {
              //曲线
              for (let i = 4; i <= pvs.length; i += 3) {
                let i0 = i - 4;
                let i1 = i - 3;
                let i2 = i - 2;
                let i3 = i - 1;
                //输出中间控制点
                if (i0 != 0) {
                  opvs.push(new Vector3(pvs[i0].x, pvs[i0].y, 1))
                  opvsType.push(4);
                }
                let stratX = pvs[i0].x
                let stratY = pvs[i0].y
                let endX = pvs[i3].x
                let endY = pvs[i3].y
                if (i0 == 0) {
                  stratX = pvs[i0].x + startDX
                  stratY = pvs[i0].y + startDY
                }
                if (i == pvs.length) {
                  endX = pvs[i3].x + endDX
                  endY = pvs[i3].y + endDY
                }
                //计算三次贝赛尔曲线的落点，通过落点来操作图形
                let btx = stratX * DDeiUtil.p331t3 + DDeiUtil.p331t2t3 * pvs[i1].x + DDeiUtil.p33t21t3 * pvs[i2].x + DDeiUtil.p33t3 * endX
                let bty = stratY * DDeiUtil.p331t3 + DDeiUtil.p331t2t3 * pvs[i1].y + DDeiUtil.p33t21t3 * pvs[i2].y + DDeiUtil.p33t3 * endY
                opvs.push(new Vector3(btx, bty, 1))
                opvsType.push(4);
                btx = stratX * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].x + DDeiUtil.p66t21t3 * pvs[i2].x + DDeiUtil.p66t3 * endX
                bty = stratY * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].y + DDeiUtil.p66t21t3 * pvs[i2].y + DDeiUtil.p66t3 * endY
                opvs.push(new Vector3(btx, bty, 1))
                opvsType.push(4);

              }
            }
            break;
          }
        }
        //结束点
        opvs.push(pvs[pvs.length - 1])
        opvsType.push(1);
        this.opvs = opvs;
        this.opvsType = opvsType;

        let ex = evt.offsetX || evt.offsetX == 0 ? evt.offsetX : evt.touches[0].pageX;
        let ey = evt.offsetY || evt.offsetY == 0 ? evt.offsetY : evt.touches[0].pageY;
        ex /= window.remRatio
        ey /= window.remRatio
        ex -= this.stage.wpv.x;
        ey -= this.stage.wpv.y
        let stageRatio = this.stage?.getStageRatio();
        ex = ex / stageRatio
        ey = ey / stageRatio
        
        let tpdata
        //操作图标的宽度
        let weight = DDeiConfig.SELECTOR.OPERATE_ICON.weight;
        let halfWeigth = weight * 0.5;
        if (this.opvs){
          for (let i = 0; i < this.opvs.length; i++) {
            let pv = this.opvs[i];
            if (DDeiAbstractShape.isInsidePolygon(
              [
                { x: pv.x - halfWeigth, y: pv.y - halfWeigth },
                { x: pv.x + halfWeigth, y: pv.y - halfWeigth },
                { x: pv.x + halfWeigth, y: pv.y + halfWeigth },
                { x: pv.x - halfWeigth, y: pv.y + halfWeigth }
              ]
              , { x: ex, y: ey })) {
              tpdata = { type: this.opvsType[i], index: i }
            }
          }
        }

        if (tpdata) {
          //如果类型为3，需要计算方向
          let direct = null;
          if (tpdata.type == 3) {
            let beforeP = this.opvs[tpdata.index - 1]
            let afterP = this.opvs[tpdata.index + 1]
            //TODO 旋转的情况下，需要把旋转归0判断，x相等
            if (Math.abs(beforeP.x - afterP.x) <= 1) {
              direct = 2
            } else {
              direct = 1
            }
          }
          this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { type: 'line', passIndex: tpdata.type, direct: direct, opvsIndex: tpdata.index }, evt,1);
        } else {
          this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { type: 'line', passIndex: -1, opvsIndex: -1 }, evt,1);
        }
      }
    }
  }

  /**
   * 绘制操作图形
   */
  drawOpShape(){
   
    //获得 2d 上下文对象
    let canvas = this.tempCanvas
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.stage.getStageRatio()
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;
    rat1 = ratio
    let pvs = this.model.pvs
    let type = this.getCachedValue("type");
    let weight = this.getCachedValue("weight");
    let w10 = 1.3 * weight * ratio
    if (w10 > 5 * rat1) {
      w10 = 5 * rat1
    } else if (w10 < 2 * rat1) {
      w10 = 2 * rat1
    }

    let w15 = 1.5 * w10
    let w20 = 2 * w10
    let w30 = 2 * w15
    let lineModel = this.model
    //保存状态
    ctx.save();

    

    switch (type) {
      case 1: {
        this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
        break;
      }
      case 2: {
        this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
        //根据中间节点绘制操作点
        ctx.strokeStyle = "#017fff";
        ctx.fillStyle = "white";
        for (let i = 1; i < pvs.length; i++) {
          if (i != pvs.length - 1) {
            ctx.save()
            let x1 = pvs[i].x * rat1;
            let y1 = pvs[i].y * rat1;
            if (lineModel.rotate) {
              ctx.translate(x1, y1)
              ctx.rotate(lineModel.rotate * DDeiConfig.ROTATE_UNIT);
              ctx.translate(-x1, -y1)
            }
            ctx.fillRect(x1 - w15, y1 - w15, w30, w30)
            ctx.strokeRect(x1 - w15, y1 - w15, w30, w30)
            ctx.restore()
          }
          ctx.save()
          let x = (pvs[i].x + pvs[i - 1].x) / 2 * rat1
          let y = (pvs[i].y + pvs[i - 1].y) / 2 * rat1
          ctx.translate(x, y)
          ctx.rotate(((lineModel.rotate ? lineModel.rotate : 0) + 45) * DDeiConfig.ROTATE_UNIT);
          ctx.translate(-x, -y)
          //菱形
          ctx.fillRect(x - w10, y - w10, w20, w20)
          ctx.strokeRect(x - w10, y - w10, w20, w20)
          ctx.restore()
        }
        break;
      }
      case 3: {
        this.drawSEPoint(pvs, w10, w20, ctx, rat1, ratio)
        if (pvs.length >= 4) {
          ctx.strokeStyle = "#017fff";
          ctx.fillStyle = "white";
          for (let i = 1; i < this.opvs.length - 1; i++) {
            let pv = this.opvs[i];
            ctx.beginPath()
            ctx.ellipse(pv.x * rat1, pv.y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
            ctx.closePath()
            ctx.fill();
            ctx.stroke();
          }

        }
        break;
      }
    }

    //恢复状态
    ctx.restore();
  }

  getOvPointByPos(x: number = 0, y: number = 0): object {
    if (x && y && this.ovs?.length > 0) {
      for (let i = 0; i < this.ovs?.length; i++) {
        let point = this.ovs[i]
        if (Math.abs(x - point.x) <= 8 && Math.abs(y - point.y) <= 8) {
          return point;
        }
      }
    }
    return null;
  }

  /**
   * 绘制开始和结束操作点
   */
  private drawSEPoint(pvs: object[], w10: number, w20: number, ctx: object, rat1: number, ratio: number): void {
    ctx.strokeStyle = "red";
    ctx.lineWidth = ratio
    ctx.fillStyle = "white";
    //白色打底
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    //最里面红点
    ctx.fillStyle = "red";
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w10, w10, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w10, w10, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.fill();
    //最外层红线
    ctx.beginPath()
    ctx.ellipse(pvs[0].x * rat1, pvs[0].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.stroke();
    ctx.beginPath()
    ctx.ellipse(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1, w20, w20, 0, 0, DDeiUtil.PI2);
    ctx.closePath()
    ctx.stroke();
  }
}

export {DDeiLineCanvasRender}
export default DDeiLineCanvasRender