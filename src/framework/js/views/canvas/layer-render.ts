import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumState from '../../enums/ddei-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiLine from '../../models/line.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiStageCanvasRender from './stage-render.js';
import { Vector3, Matrix3 } from 'three';
import DDeiLink from '../../models/link.js';
import { cloneDeep } from 'lodash'
/**
 * DDeiLayer的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiLayerCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
    this.ddRender = null;
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiLayerCanvasRender {
    return new DDeiLayerCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLayerCanvasRender";
  /**
   * 当前对应模型
   */
  model: DDeiLayer;

  /**
   * 当前的stage实例
   */
  stage: DDeiStage | null;

  /**
   * 当前的ddei实例
   */
  ddRender: DDeiCanvasRender | null;

  /**
    * 当前的stage渲染器
    */
  stageRender: DDeiStageCanvasRender | null;

  /**
   * 用于绘图时缓存属性等信息
   */
  renderCacheData: Map<string, object> = new Map();

  /**
   * 用于显示自身的容器
   */
  containerViewer:HTMLElement|null = null;

  // ============================ 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.stage.ddInstance.render
    this.stage = this.model.stage
    this.stageRender = this.model.stage.render
    this.initContainerViewer();
  }

  initContainerViewer() {
    if (!this.containerViewer) {
      let editorId = DDeiUtil.getEditorId(this.ddRender?.model);
      this.containerViewer = document.getElementById(editorId + "_layer_" + this.model.id)
      if (!this.containerViewer) {
        //在容器上创建画布，画布用来渲染图形
        let canvasViewerElement = this.ddRender.getCanvas().parentElement
        if (canvasViewerElement) {
          let containerElement = document.createElement("div")

          containerElement.setAttribute("class", "ddei-editor-canvasview-contentlayer")
          containerElement.setAttribute("id", editorId + "_layer_" + this.model.id)
          canvasViewerElement.insertBefore(containerElement, this.ddRender.realCanvas)
          this.containerViewer = containerElement


        }
      }
    }
  }

  /**
   * 清空shadowControl
   */
  clearShadowControls(): void {
    //清空shadows
    this.model.shadowControls?.forEach(c => {
      if (c.isShadowControl) {
        c.destroyed()
      }
    })
    this.model.shadowControls = [];
  }

  

  /**
   * 绘制图形
   */
  drawShape(inRect: boolean = true): void {
    this.initContainerViewer();
    //只有当显示时才绘制图层
    if (this.model.display || this.model.tempDisplay) {
      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_BEFORE", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.stage?.ddInstance, null)
      if (rsState == 0 || rsState == 1) {
        let rsState1 = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.stage?.ddInstance, null)
        if (rsState1 == 0 || rsState1 == 1) {
          this.containerViewer.style.display = "block"
          this.containerViewer.style.zIndex = this.tempZIndex
          //绘制子元素
          this.drawChildrenShapes(inRect);
          //绘制操作点
          this.drawOpPoints();
          //绘制操作线
          this.drawOpLine();

          //绘制移入移出效果图形
          this.drawDragInOutPoints();

          //绘制拖拽影子控件
          this.drawShadowControls();

          this.modelChanged = false;
        }
        DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_AFTER", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.stage?.ddInstance, null)
      }
    }else{
      this.containerViewer.style.display = "none"
      //隐藏子元素
      this.drawChildrenShapes(inRect,true);
    }
  }



  /**
   * 绘制背景
   */
  drawBackground(px, py, pw, ph,isBottom): void {
    this.initContainerViewer()
    if (this.containerViewer && (this.model.display || this.model.tempDisplay)) {
      let ratio = this.ddRender.ratio
      if(!this.bgCanvas){
        let editorId = DDeiUtil.getEditorId(this.ddRender?.model);
        this.bgCanvas = document.getElementById(editorId + "_layerbg_" + this.model.id)
        if (!this.bgCanvas){
          let bgCanvas = document.createElement("canvas")
          
          bgCanvas.setAttribute("style", "z-index:0;position:absolute;-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
          bgCanvas.setAttribute("id",editorId + "_layerbg_" + this.model.id)
          this.containerViewer.appendChild(bgCanvas)
          this.bgCanvas = bgCanvas
        }
      }
      this.bgCanvas.setAttribute("width", this.containerViewer.clientWidth * ratio);
      this.bgCanvas.setAttribute("height", this.containerViewer.clientHeight * ratio);
      //获得 2d 上下文对象
      // let canvas = this.ddRender.getCanvas();
      let canvas = this.bgCanvas;
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      //保存状态
      ctx.save();

      let ruleWeight = 0
      if (this.stageRender.tempRuleDisplay == 1 || this.stageRender.tempRuleDisplay == '1') {
        ruleWeight = 15
      }
      ctx.translate(-ruleWeight*rat1,-ruleWeight*rat1)



      //根据背景的设置绘制图层
      //获取属性配置
      let bgInit
      if (this.ddRender?.model.background && typeof (this.ddRender?.model.background) == 'object') {
        bgInit = this.ddRender?.model.background;
      }
      let bgInfoType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.type", true, bgInit);
      let bgInfoColor
      if (this.model.bg?.color) {
        bgInfoColor = this.model.bg.color
      } else if (this.ddRender?.model.background) {
        if (typeof (this.ddRender?.model.background) == 'string' || typeof (this.ddRender?.model.background) == 'number') {
          if (this.ddRender?.model.background == "-1" || this.ddRender?.model.background == -1){
            bgInfoType = -1;
          }else{
            bgInfoColor = this.ddRender?.model.background;
            if (!bgInfoType){
              bgInfoType = 1;
            }
          }
        } else {
          bgInfoColor = this.ddRender?.model.background.color
        }
      } else {
        bgInfoColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.color", true);
      }
      if (!bgInfoColor && isBottom) {
        bgInfoColor = DDeiUtil.getStyleValue("panel-background", this.ddRender.model);
      }
      // 绘制纯色背景
      if (bgInfoType == 1) {
        if (bgInfoColor){
          let bgInfoOpacity = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.opacity", true, bgInit);
          //填充色
          ctx.fillStyle = DDeiUtil.getColor(bgInfoColor)
          //透明度
          if (bgInfoOpacity || bgInfoOpacity == 0) {
            ctx.globalAlpha = bgInfoOpacity
          }
          ctx.fillRect(px, py, pw, ph)
        }
      }
      //绘制图片背景类型
      else if (bgInfoType == 2) {
        let bgImage = DDeiUtil.getReplacibleValue(this.model, "bg.image");
        if (!bgImage) {
          bgImage = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.image", true, bgInit);
        }
        //没有图片，加载图片，有图片绘制图片
        if (!this.bgImgObj || bgImage != this.upBgImage) {
          this.initBgImage();
        } else {
          let bgImgMode = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageMode", true, bgInit);
          let bgInfoOpacity = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.opacity", true, bgInit);
          //透明度
          if (bgInfoOpacity || bgInfoOpacity == 0) {
            ctx.globalAlpha = bgInfoOpacity
          }
          let x = px;
          let y = py;
          let w = this.bgImgObj.width;
          let h = this.bgImgObj.height;
          let cwidth = pw
          let cheight = ph
          let ruleDisplay
          if (this.stage.ruler?.display) {
            ruleDisplay = this.stage.ruler.display;
          } else if (this.stage.ddInstance.ruler != null && this.stage.ddInstance.ruler != undefined) {
            if (typeof (this.model.ddInstance.ruler) == 'boolean') {
              ruleDisplay = this.stage.ddInstance.ruler ? 1 : 0;
            } else {
              ruleDisplay = this.stage.ddInstance.ruler.display;
            }
          } else {
            ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "ruler.display", true);
          }
          if (ruleDisplay == 1) {
            cwidth -= 16 * rat1;
            cheight -= 16 * rat1;
          }
          let scrollWeight = rat1 * 15;

          if (this.stageRender.hScroll == 1) {
            cheight -= scrollWeight;
          }
          if (this.stageRender.vScroll == 1) {
            cwidth -= scrollWeight;
          }
          //填充
          if (bgImgMode == 2) {
            //绘制图片
            w = cwidth;
            h = cheight;
          }
          //缩放
          else if (bgImgMode == 1) {
            let bgImageScale = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageScale", true, bgInit);
            w = w * bgImageScale;
            h = h * bgImageScale;
          }
          //对齐
          if (bgImgMode != 2) {
            let bgImageAlign = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageAlign", true,bgInit);
            let align = 2;
            let valign = 2;
            switch (bgImageAlign) {
              case 1: align = 1; valign = 1; break;
              case 2: align = 2; valign = 1; break;
              case 3: align = 3; valign = 1; break;
              case 4: align = 1; valign = 2; break;
              case 5: align = 2; valign = 2; break;
              case 6: align = 3; valign = 2; break;
              case 7: align = 1; valign = 3; break;
              case 8: align = 2; valign = 3; break;
              case 9: align = 3; valign = 3; break;
              default: break;
            }
            switch (align) {
              case 1: x = px; break;
              case 2: x = px + (cwidth - w) / 2; break;
              case 3: x = px + cwidth - w; break;
            }
            switch (valign) {
              case 1: y = py; break;
              case 2: y = py + (cheight - h) / 2; break;
              case 3: y = py + cheight - h; break;
            }
          }
          ctx.drawImage(this.bgImgObj, x, y, w, h);
        }

      }

      //恢复状态
      ctx.restore();
    }
  }

  /**
   * 初始化背景图片
   */
  initBgImage(): void {
    //加载图片
    let that = this;
    let bgImage = DDeiUtil.getReplacibleValue(this.model, "bg.image");
    if (!bgImage) {
      let bgInit
      if (this.ddRender?.model.background && typeof (this.ddRender?.model.background) == 'object') {
        bgInit = this.ddRender?.model.background;
      }
      bgImage = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.image", true, bgInit);
    }
    //加载base64图片
    if ((this.model.bgImageBase64 || bgImage)) {
      let img = new Image();   // 创建一个<img>元素
      img.onload = function () {
        if (!that.mark) {
          that.mark = {}
        }
        that.upBgImage = bgImage
        that.bgImgObj = img;
        that.ddRender.model.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        that.ddRender.model.bus.executeAll()
      }
      img.src = this.model.bgImageBase64 ? this.model.bgImageBase64 : bgImage;
    }
  }
  /**
   * 绘制影子元素
   */
  drawShadowControls(): void {
    if (this.model.shadowControls?.length > 0) {
      //获得 2d 上下文对象
      // let canvas = this.ddRender.operateCanvas
      
      this.model.shadowControls.forEach(item => {
        //保存状态
        // item.render.drawShape();
        item.render.enableRefreshShape()
        if (item.modelType == 'DDeiLine') {
          item.render.drawShape({ color: "#017fff", dash: [], opacity: 0.7, fill: { color: '#017fff', opacity: 0.7 } }, 0, null, 99999);
        } else {
          item.render.drawShape({ fill: { color: '#017fff', opacity: 0.7 } }, 0, null, 99999);
        }
      });

    }
  }






  /**
   * 绘制子元素
   */
  drawChildrenShapes(inRect: boolean = true,hidden:boolean = false): void {
    
    if (this.model.models) {
      let canvas = this.ddRender.getCanvas();
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      let stageRatio = this.model.getStageRatio()
      let x = -this.stage.wpv.x / stageRatio;
      let y = -this.stage.wpv.y / stageRatio;
      let x1 = x + canvas.width / rat1 / stageRatio;
      let y1 = y + canvas.height / rat1 / stageRatio;
      //遍历子元素，绘制子元素
      // let time1 = new Date().getTime()
      if(!hidden){
        let rect = inRect ? { x: x, y: y, x1: x1, y1: y1 } : null
        for (let li = 0; li < this.model.midList.length; li++) {
          let key = this.model.midList[li]
          let item = this.model.models.get(key);
          item?.render?.drawShape(null, 0, rect, this.tempZIndex + (li + 1));
        }
      }else{
        DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", "VIEW-HIDDEN", { models: Array.from(this.model.models.values()) }, this.ddRender.model, null)
      }
      
      
    }
  }

  /**
   * 绘制操作点
   */
  drawOpPoints(): void {
    if (this.model?.opPoints?.length > 0) {
      
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas()
      let ctx = canvas.getContext('2d');
      let stageRatio = this.stage?.getStageRatio()
      let rat1 = this.ddRender.ratio;
      let ratio = rat1 * stageRatio;
      //保存状态
      ctx.save();
      // ctx.translate(rat1,rat1)
      let firstOp2Point, beforeOp2Point
      this.model?.opPoints.forEach(point => {
        if (!point || point.isSplit) {
          beforeOp2Point = null
          firstOp2Point = null

        } else if (point.mode == 3) {
  
          if (point.oppoint == 2 || point.oppoint == 4) {
            if (!beforeOp2Point) {
              beforeOp2Point = point
              firstOp2Point = point
            } else {
              let weight = 4;
              ctx.fillStyle = "white"
              ctx.strokeStyle = "#017fff"
              ctx.beginPath();
              ctx.ellipse((point.x + beforeOp2Point.x) / 2 * ratio, (point.y + beforeOp2Point.y) / 2 * ratio, weight * ratio, weight * ratio, 0, 0, Math.PI * 2)
              ctx.fill();
              ctx.stroke();
              ctx.closePath();
              beforeOp2Point = point;
              if (point.op2close == 1) {
                ctx.beginPath();
                ctx.ellipse((point.x + firstOp2Point.x) / 2 * ratio, (point.y + firstOp2Point.y) / 2 * ratio, weight * ratio, weight * ratio, 0, 0, Math.PI * 2)
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
              }
            }
          } else {
            let weight = 4;
            ctx.fillStyle = "white"
            ctx.strokeStyle = "#017fff"
            ctx.beginPath();
            ctx.ellipse(point.x * ratio, point.y * ratio, weight * ratio, weight * ratio, 0, 0, Math.PI * 2)
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
          }
        } else {
          let weight = 4;
          if (point.isMiddle) {
            weight = 5;
          }
          ctx.fillStyle = "white"
          ctx.beginPath();
          ctx.ellipse(point.x * ratio, point.y * ratio, (weight + 1) * ratio, (weight + 1) * ratio, 0, 0, Math.PI * 2)
          ctx.fill();
          ctx.closePath();
          if (point.mode == 1) {
            ctx.fillStyle = "red"
          } else {
            ctx.fillStyle = "#017fff"
          }
          ctx.beginPath();
          ctx.ellipse(point.x * ratio, point.y * ratio, weight * ratio, weight * ratio, 0, 0, Math.PI * 2)
          ctx.fill();
          ctx.closePath();

        }
      });


      //恢复状态
      ctx.restore();
    }
  }

  enableRefreshShape() {
    // this.model.models.forEach(shape=>{
    //   shape?.render?.enableRefreshShape();
    // })
  }

  /**
   * 绘制操作线
   */
  drawOpLine(): void {
    if (this.model.opLine) {
      //获得 2d 上下文对象
      // let canvas = this.ddRender.operateCanvas
      // let ctx = canvas.getContext('2d');
      // let ratio = this.ddRender?.ratio;
      // //保存状态
      // ctx.save();
      let lineRender = this.model.opLine.render
      let color = lineRender.getCachedValue("color");
      let weight = lineRender.getCachedValue("weight");
      lineRender.enableRefreshShape();
      this.model.opLine.render.drawShape({ color: "red", opacity: 0.5, weight: weight * 1.5 })


      // //恢复状态
      // ctx.restore();
    }
  }

  /**
  * 绘制移入移出效果图形
  */
  drawDragInOutPoints(): void {

    if (this.model?.dragInPoints?.length > 0 || this.model?.dragOutPoints?.length > 0) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas()
      let ctx = canvas.getContext('2d');
      let stageRatio = this.stage?.getStageRatio()
      let ratio = this.ddRender.ratio * stageRatio;
      //保存状态
      ctx.save();
      ctx.lineWidth = 2.5 * ratio;
      ctx.setLineDash([0, 1 * ratio, 1 * ratio]);
      //设置颜色
      ctx.strokeStyle = DDeiUtil.getColor("green");
      //开始绘制  
      let lineOffset = 0//1 * ratio / 2;
      let pvs = this.model.dragInPoints;
      for (let i = 0; i < pvs?.length; i++) {
        let s = i;
        let e = i + 1;
        if (i == pvs.length - 1) {
          e = 0
        }
        ctx.beginPath();
        ctx.moveTo(pvs[s].x * ratio + lineOffset, pvs[s].y * ratio + lineOffset);
        ctx.lineTo(pvs[e].x * ratio + lineOffset, pvs[e].y * ratio + lineOffset);
        ctx.stroke();
        ctx.closePath();
      }
      //设置颜色
      ctx.strokeStyle = DDeiUtil.getColor("red");
      pvs = this.model.dragOutPoints;
      for (let i = 0; i < pvs?.length; i++) {
        let s = i;
        let e = i + 1;
        if (i == pvs.length - 1) {
          e = 0
        }
        ctx.beginPath();
        ctx.moveTo(pvs[s].x * ratio + lineOffset, pvs[s].y * ratio + lineOffset);
        ctx.lineTo(pvs[e].x * ratio + lineOffset, pvs[e].y * ratio + lineOffset);
        ctx.stroke();
        ctx.closePath();
      }


      //恢复状态
      ctx.restore();
    }
    this.model.dragInPoints = []
    this.model.dragOutPoints = []
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

  clearCachedValue(): void {
    this.renderCacheData.clear();
    this.model.models.forEach(item=>{
      item?.render?.clearCachedValue()
    });
  }

  /**
   * 获取单个点移动后的坐标增量
   * 考虑最小移动像素
   * @param evt 事件
   * @returns 计算的坐标增量
   */
  getMovedPositionDelta(evt): object {
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    ex /= window.remRatio
    ey /= window.remRatio
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y
    //获取移动后的坐标
    let movedBounds = {
      x: ex - this.stageRender.dragObj.x,
      y: ey - this.stageRender.dragObj.y
    }
    return movedBounds
  }





  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    if (this.stage.ddInstance.disabled) {
      return;
    }
    if (this.stage.ddInstance.state == DDeiEnumState.IN_ACTIVITY) {
      return;
    }
    if (this.stage.ddInstance.eventCancel) {
      return;
    }
    //只有当显示时才绘制图层
    if (!this.model.display && !this.model.tempDisplay || this.model.lock) {
      return
    }
    //ctrl键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    //判断当前鼠标坐标是否落在选择器控件的区域内
    let stageRatio = this.model.getStageRatio()
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    ex /= window.remRatio
    ey /= window.remRatio
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y;
    let ex2 = ex / stageRatio
    let ey2 = ey / stageRatio
    

    if (this.stageRender?.operateState == DDeiEnumOperateState.QUICK_EDITING) {
      //如果在画布范围内，但不在编辑的控件上，则确认解除快捷编辑状态
      if (evt.target == this.ddRender.getCanvas() && (!this.stageRender.editorShadowControl || !this.stageRender.editorShadowControl?.isInAreaLoose(ex, ey))) {
        DDeiUtil.getEditorText()?.enterValue()
      }
    }

    //判定是否在快捷操作点上
    //判定是否在特殊操作点上，特殊操作点的优先级最大
    let isOvPoint = false;
    if (this.stage?.selectedModels?.size == 1) {
      let model = Array.from(this.stage?.selectedModels.values())[0]
      let ovPoint = model.getOvPointByPos(ex2, ey2)
      if (ovPoint) {
        let ovsDefine = DDeiUtil.getControlDefine(model)?.define?.ovs;
        let ovd = ovsDefine[model.ovs.indexOf(ovPoint)];
        if (ovd?.constraint?.type) {
          isOvPoint = true;
          this.stageRender.operateState = DDeiEnumOperateState.OV_POINT_CHANGING
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { x: ex2, y: ey2, opPoint: ovPoint, model: model } }, evt);
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: "pointer" }, evt);
        }
      }
    }
    if (isOvPoint) {
    }
    //判定是否在操作点上，如果在则快捷创建线段
    else if (this.stageRender.selector && this.stageRender.selector.isInAreaLoose(ex2, ey2, true) &&
      ((this.stageRender.selector.passIndex >= 1 && this.stageRender.selector.passIndex <= 9) || this.stageRender.selector.passIndex == 13)) {
      //派发给selector的mousedown事件，在事件中对具体坐标进行判断
      this.stageRender.selector.render.mouseDown(evt);
    }
    else {
      let opPoint = this.model.getOpPointByPos(ex2, ey2);
      let isStop = false;
      if (opPoint) {
        //只有在控件内部才触发
        let projPoint = null
        let innerSize = 0
        let outRect = DDeiAbstractShape.getOutRectByPV([opPoint.model])
        if (outRect.height > 20 && outRect.width > 20) {
          innerSize = -5;
        }
        if (opPoint.oppoint == 3 || (projPoint = opPoint.model.getProjPoint({ x: ex2, y: ey2 }, { in: innerSize, out: 15 }, 1, 2))) {
          let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.stage.ddInstance);
          let accessLink = DDeiUtil.isAccess(
            DDeiEnumOperateType.LINK, null, null, modeName,
            this.stage.ddInstance
          );
          if (accessLink) {
            isStop = true;
            //当前操作状态：线改变点中
            //记录当前的拖拽的x,y,写入dragObj作为临时变量
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { opPoint: opPoint } }, evt);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
            this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING_CONFIRM
          }
        }
      }

      if (!isStop) {
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex2, ey2, true);
        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          //全局变量：当前操作控件=当前控件
          let operateControl = operateControls[0];

          this.stageRender.currentOperateShape = operateControl;
          this.stageRender.tempSX = ex2
          this.stageRender.tempSY = ey2
          //当前操作状态:控件状态确认中
          this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CONFIRMING
          //分发事件到当前控件
          operateControl.render.mouseDown(evt);

          //当前控件的上层控件，可能是一个layer也可能是容器
          let pContainerModel = operateControl.pModel;
          if (pContainerModel) {
            //没有按下ctrl键
            if (!isCtrl) {
              let selectedModels = pContainerModel.getSelectedModels();
              // 当前操作控件不在选中控件中，则清空所有当前选中控件
              if (!selectedModels.has(operateControl.id)) {
                //清空除了当前操作控件外所有选中状态控件
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, { container: pContainerModel, curLevel: true }, evt);
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ResetSelectorState, {}, evt);
              }
            }
          }
        }
        //无控件
        else {
          if (this.stage?.brushData) {
            this.stage.brushData = null;
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
          }
          //重置选择器位置
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ResetSelectorState, { x: ex2, y: ey2 }, evt);
          let clearSelect = false;
          switch (this.stage.ddInstance?.editMode) {
            case 1: {
              //当前操作状态：选择器工作中
              this.stageRender.operateState = DDeiEnumOperateState.SELECT_WORKING

              //当没有按下ctrl键时，清空除了当前操作控件外所有选中状态控件
              clearSelect = !isCtrl;
              break;
            }
            case 2: {
              //当前操作状态：抓手工作中
              //记录当前的拖拽的x,y,写入dragObj作为临时变量
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { dx: ex, dy: ey } }, evt);
              this.stageRender.operateState = DDeiEnumOperateState.GRAB_WORKING
              //当没有按下ctrl键时，清空除了当前操作控件外所有选中状态控件
              clearSelect = !isCtrl;
              break;
            }
            case 3: {
              //当前操作状态：文本创建中
              //记录当前的拖拽的x,y,写入dragObj作为临时变量
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { dx: ex2, dy: ey2 } }, evt);
              this.stageRender.operateState = DDeiEnumOperateState.TEXT_CREATING
              clearSelect = true;
            }
            case 4: {
              let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.stage?.ddInstance);
              let accessLink = DDeiUtil.isAccess(
                DDeiEnumOperateType.LINK, null, null, modeName,
                this.stage?.ddInstance
              );
              if (accessLink) {
                //当前操作状态：线改变点中
                //记录当前的拖拽的x,y,写入dragObj作为临时变量
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { dx: ex2, dy: ey2 } }, evt);
                this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING

                clearSelect = true
              }
            }
          }
          if (clearSelect) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
          }
        }
      }
    }

    //渲染图形
    this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

    //排序并执行所有action
    this.stage?.ddInstance?.bus?.executeAll();

  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    if (this.stage.ddInstance.disabled) {
      return;
    }
    if (this.stage.ddInstance.state == DDeiEnumState.IN_ACTIVITY) {
      return;
    }
    if (this.stage.ddInstance.eventCancel) {
      return;
    }
    //只有当显示时才绘制图层
    if (!this.model.display && !this.model.tempDisplay || this.model.lock) {
      return;
    }
    //ctrl、alt键的按下状态
    let isAlt = DDei.KEY_DOWN_STATE.get("alt");
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    ex /= window.remRatio
    ey /= window.remRatio
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y

    let ex2 = ex / stageRatio
    let ey2 = ey / stageRatio
    //鼠标右键，显示菜单
    if (evt.button == 2) {
      //在鼠标位置显示菜单
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex2, ey2);
      //显示当前控件的
      if (operateControls != null && operateControls.length > 0) {
        //全局变量：当前操作控件=当前控件
        DDeiUtil.showContextMenu(operateControls[0],this.ddRender?.model, evt)
      }
      //清除临时操作点
      this.model.opPoints = [];

      if (this.model.opLine?.render) {
        this.model.opLine.render.enableRefreshShape()
      }
      delete this.model.opLine;
      //清空shadows
      this.clearShadowControls()
    } else {
      //判断当前操作状态
      switch (this.stageRender.operateState) {
        //控件状态确认中
        case DDeiEnumOperateState.LINE_POINT_CHANGING_CONFIRM: {
          // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
          let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex2, ey2, true);
          //光标所属位置是否有控件
          //有控件：分发事件到当前控件
          if (operateControls != null && operateControls.length > 0) {
            //全局变量：当前操作控件=当前控件
            let operateControl = operateControls[0];
            this.stageRender.currentOperateShape = operateControl;
          }
        }
        case DDeiEnumOperateState.CONTROL_CONFIRMING: {

          
          this.stageRender.currentOperateShape.render.mouseUp(evt);
          //如果有格式刷
          if (this.stage?.brushData) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CopyStyle, { models: [this.stageRender.currentOperateShape], brushData: this.stage.brushData }, evt)
          }
          //清空shadows
          this.clearShadowControls()
          break;
        }
        //选择器工作中
        case DDeiEnumOperateState.SELECT_WORKING:
          //选中被选择器包含的控件
          //当前操作数据
          let pushDatas = [];
          let includedModels: Map<string, DDeiAbstractShape> = this.stageRender.selector.getIncludedModels();

          //加载事件的配置
          let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_SELECT_BEFORE", DDeiEnumOperateType.SELECT, { models: Array.from(includedModels.values()) }, this.stage?.ddInstance, evt)
          let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
          if (!isCtrl) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
          }
          if (rsState == 0 || rsState == 1) {
            this.stageRender.currentOperateContainer = this.model;
            includedModels.forEach((model, key) => {
              pushDatas.push({ id: model.id, value: DDeiEnumControlState.SELECTED });
            });

            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, pushDatas, evt);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.StageChangeSelectModels);
          } else {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
            this.stageRender.operateState = DDeiEnumOperateState.NONE
          }
          break;
        //抓手工作中
        case DDeiEnumOperateState.GRAB_WORKING:

          break;
        //文本创建中
        case DDeiEnumOperateState.TEXT_CREATING:

          break;
        //线段修改点中
        case DDeiEnumOperateState.LINE_POINT_CHANGING:
          {
            let hasChange = false
            //同步影子元素的坐标大小等状态到当前模型
            if (this.model.shadowControls.length > 0) {
              let item = this.model.shadowControls[0];
              let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
              let model = this.stage?.getModelById(id)
              let isStop = false;
              //加载事件的配置
              let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_DRAG_AFTER", DDeiEnumOperateType.DRAG, this.stageRender.dragObj, this.stage?.ddInstance, null)

              
              if (rsState == 0 || rsState == 1) {
                if (model) {
                  model.syncVectors(item)
                } else {
                  let opPoint = this.model.getOpPointByPos(ex2, ey2);
                  //如果长度小于15，终止创建
                  let maxLength = 0
                  if (!opPoint?.model) {
                    for (let i = 0; i < item.pvs.length - 1; i++) {
                      maxLength += DDeiUtil.getPointDistance(item.pvs[i].x, item.pvs[i].y, item.pvs[i + 1].x, item.pvs[i + 1].y)
                    }
                  }
                  if ((opPoint?.model && (Math.abs(opPoint.x - item.startPoint.x) >= 1 || Math.abs(opPoint.y - item.startPoint.y) >= 1)) || maxLength >= 15) {
                    //影子控件转变为真实控件并创建
                    item.id = id
                    item.destroyed()
                    this.model.addModel(item,false)
                    item.initRender();
                    model = item;
                    delete model.isShadowControl
                  } else {
                    isStop = true;
                  }
                }
                if (!isStop) {

                  let passIndex = this.stageRender.dragObj.passIndex;
                  //如果是开始或结束节点的拖拽，判断落点是否在操作点上，如果在且满足关联条件，则关联
                  if (passIndex == 1) {
                    //如果原有的关联存在，取消原有的关联
                    //取得线段定义中的约束
                    let skip = false
                    let constraint = DDeiUtil.getControlDefine(model)?.define?.constraint;
                    let opvsIndex = this.stageRender.dragObj.opvsIndex;
                    let dmpath = ""
                    //判断开始点还是结束点
                    if (opvsIndex == 0) {
                      if (constraint?.sp && constraint.sp.link == false) {
                        skip = true;
                      } else {
                        dmpath = "startPoint"
                      }
                    } else {
                      if (constraint?.ep && constraint.ep.link == false) {
                        skip = true;
                      } else {
                        dmpath = "endPoint"
                      }
                    }

                    if (!skip) {

                      let distLinks = this.stage?.getDistModelLinks(model.id);
                      distLinks?.forEach(dl => {
                        if (dl.dmpath == dmpath) {
                          this.stage?.removeLink(dl);
                          //删除源点
                          if (dl?.sm && dl?.smpath) {
                            eval("delete dl.sm." + dl.smpath)
                          }
                        }
                      })

                      let opPoint = this.model.getOpPointByPos(ex2, ey2);
                      if (opPoint) {

                        //建立关联
                        let smodel = opPoint.model;
                        //创建连接点
                        let id = "_" + DDeiUtil.getUniqueCode()

                        smodel.exPvs[id] = new Vector3(opPoint.x, opPoint.y, opPoint.z)
                        smodel.exPvs[id].rate = opPoint.rate
                        smodel.exPvs[id].sita = opPoint.sita
                        smodel.exPvs[id].index = opPoint.index
                        smodel.exPvs[id].id = id
                        let link = new DDeiLink({
                          sm: smodel,
                          dm: model,
                          smpath: "exPvs." + id,
                          dmpath: dmpath,
                          stage: this.stage
                        });

                        this.stage?.addLink(link)
                        model?.initPVS()
                        smodel.updateLinkModels();
                      }
                    }
                  }
                  model.initPVS()
                  model.updateOVS()
                  //重新计算错线
                  model.clps = []

                  this.stageRender.refreshJumpLine = false
                  if (model.pModel != this.model) {
                    model.pModel?.changeParentsBounds()
                  }
                  hasChange = true;
                  this.stage.refreshLinkCache()
                }
              }
            }

            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ClearTemplateVars);
            if (hasChange) {

              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.NodifyChange);
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.AddHistroy);
            }
            //改变光标
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: "grab" }, evt);
            //清空shadows
            this.clearShadowControls()
            break;
          }
        //控件拖拽中
        case DDeiEnumOperateState.CONTROL_DRAGING:

          let isStop = false;
          let hasChange = false;
          //如果按下了ctrl键，则需要修改容器的关系并更新样式
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] = DDeiAbstractShape.findBottomContainersByArea(this.model, ex2, ey2);
            let lastOnContainer = this.model;
            let pContainerModel = this.stageRender.currentOperateShape.pModel;
            if (mouseOnContainers && mouseOnContainers.length > 0) {
              //获取最下层容器
              for (let k = mouseOnContainers.length - 1; k >= 0; k--) {
                if (mouseOnContainers[k].id != this.stageRender.currentOperateShape.id) {
                  lastOnContainer = mouseOnContainers[k]
                  break;
                }
              }
            }

            //如果最小层容器不是当前容器，执行的移动容器操作
            if (lastOnContainer.id != pContainerModel.id || lastOnContainer.unicode != pContainerModel.unicode) {
              if (!lastOnContainer.layoutManager || lastOnContainer.layoutManager.canAppend(ex2, ey2, this.model.shadowControls)) {
                let operateModels = []
                let selMods = []
                //同步影子元素的坐标大小等状态到当前模型
                this.model.shadowControls.forEach(item => {
                  let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                  let model = this.stage?.getModelById(id)
                  model.originCPV = model.cpv
                  model.originPVS = model.pvs
                  model.syncVectors(item, true)
                  operateModels.push(model)

                  selMods.push({ id: model?.id, value: DDeiEnumControlState.SELECTED })
                })
                //判断是否需要取消选中表格
                if (pContainerModel.baseModelType == 'DDeiTableCell') {
                  selMods.push({ id: pContainerModel.pModel?.id, value: DDeiEnumControlState.DEFAULT })
                } else {
                  selMods.push({ id: pContainerModel.id, value: DDeiEnumControlState.DEFAULT })
                }
                if (lastOnContainer?.baseModelType == 'DDeiTableCell') {
                  selMods.push({ id: lastOnContainer.pModel?.id, value: DDeiEnumControlState.SELECTED })
                } else {
                  selMods.push({ id: lastOnContainer?.id, value: DDeiEnumControlState.SELECTED })
                }
                DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_DRAG_AFTER", DDeiEnumOperateType.DRAG, { models: operateModels }, this.stage?.ddInstance, null)

                //构造移动容器action数据
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: pContainerModel, newContainer: lastOnContainer, models: operateModels }, evt);
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, selMods, evt);
                hasChange = true;
              }
              isStop = true;
            }
          }
          if (!isStop) {
            let pContainerModel = this.stageRender.currentOperateShape.pModel;
            if (!pContainerModel.layoutManager || pContainerModel.layoutManager.canChangePosition(ex2, ey2, this.model.shadowControls)) {
              let operateModels = []
              let lines = this.stage?.getModelsByBaseType("DDeiLine");
              let moveOriginModels = []
              let moveOriginModelIds = []
              let moveOriginLines = []
              // if (this.model.shadowControls[0].baseModelType == 'DDeiContainer') {
              //   this.clearShadowControls()
              //   //清空临时变量
              //   this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ClearTemplateVars, null, evt);
              //   //渲染图形
              //   this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
              //   //排序并执行所有action
              //   this.stage?.ddInstance?.bus?.executeAll();
              //   return;
              // }
              this.model.shadowControls.forEach(item => {
                
                let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                let momodel = this.stage?.getModelById(id)
                if (momodel){
                  if (momodel?.baseModelType == 'DDeiLine') {
                    moveOriginLines.push(momodel.id)
                  }
                  moveOriginModels.push(momodel)
                  moveOriginModelIds.push(momodel.id)
                }
              });
              //同步影子元素的坐标大小等状态到当前模
              for (let i = 0; i < this.model.shadowControls.length; i++) {
                let item = this.model.shadowControls[i];
                let model = moveOriginModels[i]
                model.syncVectors(item)
                hasChange = true;
                operateModels.push(model)
                //有两种情况，第一种：直接移动了线，此时断开被移动控件之外的已有连接,并根据开始点或结束点的位置建立新链接
                if (model.modelType == 'DDeiLine') {
                  //如果原有的关联存在，取消原有的关联
                  let distLinks = this.stage?.getDistModelLinks(model.id);
                  distLinks?.forEach(dl => {
                    if (!dl.sm || moveOriginModels.indexOf(dl.sm) == -1) {
                      this.stage?.removeLink(dl);
                      //删除源点
                      if (dl?.sm && dl?.smpath) {
                        eval("delete dl.sm." + dl.smpath)
                      }
                    }
                  })
                  //根据开始点或结束点的位置建立新链接
                  let lineInModelsStart = DDeiAbstractShape.findBottomModelsByArea(this.model, model.startPoint.x, model.startPoint.y, true, true);
                  if (lineInModelsStart.length > 0) {
                    for (let li = 0; li < lineInModelsStart.length; li++) {
                      if (!model.linkModels?.has(lineInModelsStart[li].id) && moveOriginModelIds.indexOf(lineInModelsStart[li].id) == -1) {
                        addLineLink(model, lineInModelsStart[li], model.startPoint, 1)
                      }
                      break
                    }
                  }
                  let lineInModelsEnd = DDeiAbstractShape.findBottomModelsByArea(this.model, model.endPoint.x, model.endPoint.y, true, true);
                  if (lineInModelsEnd.length > 0) {

                    for (let li = 0; li < lineInModelsEnd.length; li++) {
                      if (!model.linkModels?.has(lineInModelsEnd[li].id) && moveOriginModelIds.indexOf(lineInModelsEnd[li].id) == -1) {
                        addLineLink(model, lineInModelsEnd[li], model.endPoint, 2)
                      }
                      break
                    }
                  }
                  function addLineLink(model, smodel, point, type) {
                    let pathPvs = smodel.pvs;
                    let proPoints = DDeiAbstractShape.getProjPointDists(pathPvs, point.x, point.y, false, 1);
                    let index = proPoints[0].index
                    //计算当前path的角度（方向）angle和投射后点的比例rate
                    let distance = DDeiUtil.getPointDistance(pathPvs[index].x, pathPvs[index].y, pathPvs[index + 1].x, pathPvs[index + 1].y)
                    let sita = DDeiUtil.getLineAngle(pathPvs[index].x, pathPvs[index].y, pathPvs[index + 1].x, pathPvs[index + 1].y)
                    let pointDistance = DDeiUtil.getPointDistance(pathPvs[index].x, pathPvs[index].y, proPoints[0].x, proPoints[0].y)
                    let rate = pointDistance / distance
                    rate = rate > 1 ? rate : rate
                    //创建连接点
                    let id = "_" + DDeiUtil.getUniqueCode()
                    let dmpath
                    if (type == 1) {
                      dmpath = "startPoint"
                      smodel.exPvs[id] = new Vector3(model.startPoint.x, model.startPoint.y, model.startPoint.z)
                    } else if (type == 2) {
                      dmpath = "endPoint"
                      smodel.exPvs[id] = new Vector3(model.endPoint.x, model.endPoint.y, model.endPoint.z)
                    }
                    smodel.exPvs[id].rate = rate
                    smodel.exPvs[id].sita = sita
                    smodel.exPvs[id].index = index
                    smodel.exPvs[id].id = id
                    let link = new DDeiLink({
                      sm: smodel,
                      dm: model,
                      smpath: "exPvs." + id,
                      dmpath: dmpath,
                      stage: model.stage
                    });
                    model.stage?.addLink(link)
                  }
                  //依附于线段存在的子控件，跟着线段移动
                  model.refreshLinkModels()
                }
                //第二种情况，移动了非线控件，此时要判断两种情况
                else {
                  //情况A移动的是独立的控件，则更新其已连接线段的点，以确保线段始终连接当前图形
                  model.updateLinkModels(moveOriginLines);
                  //情况B移动的是依附于线段存在的子控件，更新和线段的关系
                  lines?.forEach(line => {
                    if (line.linkModels?.has(model.id)) {
                      let lm = line.linkModels?.get(model.id);
                      let point = null;
                      if (lm.type == 1) {
                        point = line.startPoint;
                      } else if (lm.type == 2) {
                        point = line.endPoint;
                      } else if (lm.type == 3) {
                        //奇数，取正中间
                        let pi = Math.floor(line.pvs.length / 2)
                        if (line.pvs.length % 3 == 0) {
                          point = line.pvs[pi];
                        }
                        //偶数，取两边的中间点
                        else {
                          point = {
                            x: (line.pvs[pi - 1].x + line.pvs[pi].x) / 2,
                            y: (line.pvs[pi - 1].y + line.pvs[pi].y) / 2
                          }
                        }
                      }
                      lm.dx = model.cpv.x - point.x
                      lm.dy = model.cpv.y - point.y
                    }
                  })
                }

              }
              //重新计算错线
              lines?.forEach(line => {
                line.clps = []
              })
              this.stageRender.refreshJumpLine = false
              //更新新容器大小
              pContainerModel?.changeParentsBounds()
              pContainerModel?.layoutManager?.updateLayout(ex2, ey2, operateModels);
              operateModels?.forEach(item => {
                item.render?.controlDragEnd(evt)
              })
              //加载事件的配置
              DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_DRAG_AFTER", DDeiEnumOperateType.DRAG, { models: operateModels }, this.stage?.ddInstance, null)

            }
          }
          if (hasChange) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdatePaperArea);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.StageChangeSelectModels);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.NodifyChange);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.AddHistroy);
          }
          //清空shadows
          this.clearShadowControls()
          
          break;
        //表格内部拖拽中
        case DDeiEnumOperateState.TABLE_INNER_DRAG:
          let table = this.stageRender.currentOperateShape
          table?.render?.mouseUp(evt)
          this.stage?.ddInstance?.bus.push(DDeiEnumBusCommandType.CopyStyle, { models: [table], brushData: this.stage.brushData });
          break;
        case DDeiEnumOperateState.CONTROL_ROTATE:
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ClearTemplateVars);
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.NodifyChange);
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.AddHistroy);
          break;
        case DDeiEnumOperateState.CONTROL_CHANGING_BOUND:
          let operateModels = []
          //同步影子元素的坐标大小等状态到当前模型
          this.model.shadowControls.forEach(item => {
            let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
            let model = this.stage?.getModelById(id)
            if (model) {
              model.syncVectors(item)
              if (model.changeChildrenBounds) {
                model.changeChildrenBounds();
              }
              model.updateLinkModels()
              operateModels.push(model)
            }
          })
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.NodifyChange);
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
          this.stageRender.selector.updatePVSByModels(operateModels)
          //清空shadows
          this.clearShadowControls()
          break;
        case DDeiEnumOperateState.QUICK_EDITING_TEXT_SELECTING:
          delete this.stage.brushData
          //执行粘贴样式动作
          if (this.stage.brushDataText?.length > 0) {
            let shadowControl = this.stage.render.editorShadowControl
            if (shadowControl) {
              let editorText = DDeiUtil.getEditorText();
              //开始光标与结束光标
              let curSIdx = -1
              let curEIdx = -1
              if (editorText) {

                curSIdx = editorText.selectionStart
                curEIdx = editorText.selectionEnd
                let tempI = 0;
                if (curSIdx > -1 && curEIdx > -1 && curSIdx <= curEIdx) {
                  for (; curSIdx < curEIdx; curSIdx++) {
                    shadowControl.sptStyle[curSIdx] = cloneDeep(this.stage.brushDataText[tempI])
                    tempI++
                    if (tempI >= this.stage.brushDataText.length) {
                      tempI = 0
                    }
                  }

                }
              }
            }
            delete this.stage.brushDataText
          }
          this.stageRender.operateState = DDeiEnumOperateState.QUICK_EDITING;
          //发出通知，选中的焦点发生变化
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.TextEditorChangeSelectPos);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
          //排序并执行所有action
          this.stage?.ddInstance?.bus?.executeAll();
          return;
        case DDeiEnumOperateState.QUICK_EDITING:
          //如果不在编辑的控件上，则确认解除快捷编辑状态
          if (evt.target == this.ddRender.canvas && (!this.stageRender.editorShadowControl || !this.stageRender.editorShadowControl?.isInAreaLoose(ex, ey))) {
            DDeiUtil.getEditorText()?.enterValue()
          } else if (evt.target != this.ddRender.canvas) {
            return;
          }
          break;
        //默认缺省状态
        default:
          break;
      }

    }
    //清空临时变量
    this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ClearTemplateVars, null, evt);
    //渲染图形
    this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
    //排序并执行所有action
    this.stage?.ddInstance?.bus?.executeAll();
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    if (this.stage.ddInstance.disabled) {
      return;
    }
    if (this.stage.ddInstance.state == DDeiEnumState.IN_ACTIVITY) {
      return;
    }
    if (this.stage.ddInstance.eventCancel) {
      return;
    }
    //只有当显示时才绘制图层
    if (!this.model.display && !this.model.tempDisplay || this.model.lock) {
      return;
    }
    //ctrl、alt键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    let isAlt = DDei.KEY_DOWN_STATE.get("alt");

    let ex = evt.offsetX;
    let ey = evt.offsetY;
    ex /= window.remRatio
    ey /= window.remRatio
    let rat1 = this.ddRender?.ratio;
    let canvasWidth = this.ddRender.canvas.width / rat1
    let canvasHeight = this.ddRender.canvas.height / rat1
    let edgeWeight = 25;
    //判断是否在边缘
    if (ex < edgeWeight) {
      this.ddRender.inEdge = 4;
    } else if (ex > canvasWidth - edgeWeight) {
      this.ddRender.inEdge = 2;
    } else if (ey < edgeWeight) {
      this.ddRender.inEdge = 1;
    } else if (ey > canvasHeight - edgeWeight) {
      this.ddRender.inEdge = 3;
    } else {
      this.ddRender.inEdge = 0;
    }
 
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y;

    let stageRatio = this.model.getStageRatio()
    let ex2 = ex / stageRatio
    let ey2 = ey / stageRatio

       //记录ex和ey
    this.ddRender.inAreaX = ex2;
    this.ddRender.inAreaY = ey2;

    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING: {
        //如果移动的距离比较小，则忽略
        if (Math.abs(ex2 - this.stageRender.tempSX) <= 2 && Math.abs(ey2 - this.stageRender.tempSY) <= 2) {
          return;
        }
        //清除临时操作点
        this.model.opPoints = [];
        if (this.model.opLine?.render) {
          this.model.opLine.render.enableRefreshShape()
        }
        delete this.model.opLine;
        //中心点坐标
        let operateControl = this.stageRender.currentOperateShape
        //当前控件的上层控件，可能是一个layer也可能是容器
        if (operateControl.pModel != this.model && operateControl.state != DDeiEnumControlState.SELECTED) {
          operateControl = operateControl.pModel
        }
        let pContainerModel = operateControl.pModel;
        //记录当前的拖拽的x,y,写入dragObj作为临时变量
        let dragObj = {
          x: ex,
          y: ey,
          model: this.stageRender.currentOperateShape
        }
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
        if (this.stageRender.currentOperateShape?.baseModelType == 'DDeiTable' && !isCtrl) {
          this.stageRender.operateState = DDeiEnumOperateState.TABLE_INNER_DRAG
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, { ignoreModels: [this.stageRender.currentOperateShape] }, evt);
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, [{ id: this.stageRender.currentOperateShape.id, value: DDeiEnumControlState.SELECTED }], evt);
        } else {

          //加载事件的配置
          
          
          let selectedModels = pContainerModel.getSelectedModels();
          let sms = Array.from(selectedModels.values())
          if (sms.indexOf(this.stageRender.currentOperateShape) == -1) {
            sms.push(this.stageRender.currentOperateShape)
          }
          
          let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_DRAG_BEFORE", DDeiEnumOperateType.DRAG, { models: sms }, this.ddRender.model, evt)

          if (rsState == 0 || rsState == 1) {
            DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", DDeiEnumOperateType.DRAG, { models: sms }, this.ddRender.model, evt)
            //当前操作状态：控件拖拽中
            
            this.stageRender.operateState = DDeiEnumOperateState.CONTROL_DRAGING
            //产生影子控件
            sms.forEach(m => {
              let md = DDeiUtil.getShadowControl(m);
              dragObj[md.id] = { dx: md.cpv.x - ex2, dy: md.cpv.y - ey2 }
              this.model.shadowControls.push(md);
            });
            
            //将当前被拖动的控件转变为影子控件
            this.stageRender.currentOperateShape = this.model.shadowControls[this.model.shadowControls.length - 1]
          } else {
            this.stageRender.operateState = DDeiEnumOperateState.NONE
          }
        }
        break;
      }
      //选择器工作中
      case DDeiEnumOperateState.SELECT_WORKING: {
        DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", "SELECT_WORKING", null, this.stage?.ddInstance, evt)
        //根据事件更新选择器位置
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds, { operateState: this.stageRender.operateState }, evt);
        //渲染图形
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        break;
      }
      //抓手工作中
      case DDeiEnumOperateState.GRAB_WORKING: {
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeStageWPV, { x: ex, y: ey, dragObj: this.stageRender.dragObj }, evt);
        break;
      }
      //线段修改点中-待确认
      case DDeiEnumOperateState.LINE_POINT_CHANGING_CONFIRM: {
        let dx, dy, opPoint
        if (this.stageRender.dragObj.opPoint) {
          opPoint = this.stageRender.dragObj.opPoint
          dx = opPoint.x
          dy = opPoint.y
        } else {
          dx = this.stageRender.dragObj.dx
          dy = this.stageRender.dragObj.dy
        }
        DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", "CHANGE_WPV", null, this.stage?.ddInstance, evt)
        
        if (Math.abs(ex - dx) >= 10 || Math.abs(ey - dy) >= 10) {
          this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING
        }

        break;
      }
      //线段修改点中
      case DDeiEnumOperateState.LINE_POINT_CHANGING: {
        //如果当前操作控件不存在，创建线段,生成影子控件，并把影子线段作为当前操作控件
        if (!this.stageRender.currentOperateShape) {
          let lineJson = DDeiUtil.getLineInitJSON();
          lineJson.id = "line_" + (++this.stage.idIdx)
          let dx, dy, opPoint
          
          if (this.stageRender.dragObj.opPoint) {
            opPoint = this.stageRender.dragObj.opPoint
            dx = opPoint.x
            dy = opPoint.y
          } else {
            dx = this.stageRender.dragObj.dx
            dy = this.stageRender.dragObj.dy
          }
          lineJson.cpv = new Vector3(dx, dy, 1);

          //根据线的类型生成不同的初始化点
          lineJson.type = 2
          //直线两个点
          if (lineJson.type == 1) {
            lineJson.pvs = [lineJson.cpv, new Vector3(ex2, ey2, 1)]
          } else {
            lineJson.pvs = [lineJson.cpv, new Vector3((lineJson.cpv.x + ex2) / 2, lineJson.cpv.y, 1), new Vector3((lineJson.cpv.x + ex2) / 2, ey2, 1), new Vector3(ex2, ey2, 1)]
          }
          
          //初始化开始点和结束点

          let ddeiLine = DDeiLine.initByJSON(lineJson, { currentStage: this.stage, currentLayer: this.model, currentContainer: this.model });
          let lineShadow = DDeiUtil.getShadowControl(ddeiLine);
          this.model.shadowControls.push(lineShadow);
          //将当前被拖动的控件转变为影子控件
          this.stageRender.currentOperateShape = lineShadow
          //建立连接关系
          if (opPoint) {
            this.stage.tempStartOPpoint = opPoint
            let smodel = opPoint.model;
            //创建连接点
            let id = "_" + DDeiUtil.getUniqueCode()
            smodel.exPvs[id] = new Vector3(opPoint.x, opPoint.y, opPoint.z)
            smodel.exPvs[id].rate = opPoint.rate
            smodel.exPvs[id].sita = opPoint.sita
            smodel.exPvs[id].index = opPoint.index
            smodel.exPvs[id].id = id
            let link = new DDeiLink({
              sm: smodel,
              dm: lineShadow,
              smpath: "exPvs." + id,
              dmpath: "startPoint",
              stage: this.stage
            });
            this.stage?.addLink(link)
            smodel.updateLinkModels();
          }
          //默认拖动结束线
          let dragObj = {
            x: ex2,
            y: ey2,
            dragPoint: lineShadow.pvs[lineShadow.pvs.length - 1],
            model: lineShadow,
            passIndex: 1,
            opvsIndex: lineJson.pvs.length - 1,
            opvs: lineJson.pvs,
            create: true
          }
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }
        //如果操作控件存在，修改线段的点
        else {
          let lineModel = this.stageRender.dragObj.model
          let passIndex = this.stageRender.dragObj.passIndex
          let opvsIndex = this.stageRender.dragObj.opvsIndex
          let opvs = this.stageRender.dragObj.opvs
          
          if (passIndex == 1 && opvsIndex == 0) {
            let endPoint = lineModel.endPoint;
            if (Math.abs(endPoint.x - ex2) <= this.stage?.ddInstance.GLOBAL_ADV_WEIGHT) {
              ex2 = endPoint.x
            } else if (Math.abs(endPoint.y - ey2) <= this.stage?.ddInstance.GLOBAL_ADV_WEIGHT) {
              ey2 = endPoint.y
            }
          } else if (passIndex == 1 && opvsIndex == opvs.length - 1) {
            let startPoint = lineModel.startPoint;
            if (Math.abs(startPoint.x - ex2) <= this.stage?.ddInstance.GLOBAL_ADV_WEIGHT) {
              ex2 = startPoint.x
            } else if (Math.abs(startPoint.y - ey2) <= this.stage?.ddInstance.GLOBAL_ADV_WEIGHT) {
              ey2 = startPoint.y
            }
          }
          

          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeLinePoint, { ex: ex2, ey: ey2 });
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }
       
        //判定是否到达了另一个控件的操作点
        this.model.opPoints = [];
        DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_OPERATING", "CHANGE_WPV", null, this.stage?.ddInstance, evt)
        if (this.model.opLine?.render) {
          this.model.opLine.render.enableRefreshShape()
        }
        delete this.model.opLine;
        delete this.stage.tempCursorOPpoint
        //判断当前鼠标坐标是否落在选择器控件的区域内
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex2, ey2, true, true);
        if (operateControls != null && operateControls.length > 0) {

          operateControls[0].render.changeOpPoints(ex2, ey2, 1);

        }
        break;
      }
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING: {
        if (!this.ddRender.inEdge) {
          let pContainerModel = null;
          //当前控件的上层控件
          if (this.stageRender.currentOperateShape.id.indexOf("_shadow") != -1) {
            let id = this.stageRender.currentOperateShape.id.substring(this.stageRender.currentOperateShape.id, this.stageRender.currentOperateShape.id.lastIndexOf("_shadow"))
            let model = this.stage?.getModelById(id)
            pContainerModel = model.pModel;
          } else {
            pContainerModel = this.stageRender.currentOperateShape.pModel;
          }
          if (pContainerModel) {
            let pushData = { x: ex, y: ey, dragObj: this.stageRender.dragObj, models: this.model.shadowControls, changeContainer: isAlt };
            pushData.oldContainer = pContainerModel
            if (isAlt) {
              //寻找鼠标落点当前所在的容器
              let mouseOnContainers = DDeiAbstractShape.findBottomContainersByArea(this.model, ex, ey);
              let lastOnContainer = this.model;
              if (mouseOnContainers && mouseOnContainers.length > 0) {
                //获取最下层容器
                for (let k = mouseOnContainers.length - 1; k >= 0; k--) {
                  if (mouseOnContainers[k].id != this.stageRender.currentOperateShape.id) {
                    lastOnContainer = mouseOnContainers[k]
                    break;
                  }
                }
              }
              pushData.isAlt = true;
              pushData.newContainer = lastOnContainer
            }else{
              if (!this.ddRender?.model.EXT_STAGE_WIDTH || !this.ddRender?.model.EXT_STAGE_HEIGHT){
                let dragObj = pushData.dragObj;
                let outRect = DDeiAbstractShape.getOutRectByPV(this.model.shadowControls)
                let nmodel = this.stageRender.currentOperateShape;
                let dx = 0
                let dy = 0
                if (dragObj && dragObj[nmodel.id]) {
                  dx = dragObj[nmodel.id]?.dx ? dragObj[nmodel.id]?.dx : 0;
                  dy = dragObj[nmodel.id]?.dy ? dragObj[nmodel.id]?.dy : 0
                }
                if (!this.ddRender?.model.EXT_STAGE_WIDTH){
                  let xm = ex - nmodel.cpv.x + dx;
                  if(outRect.x + xm < 0){
                    pushData.x -= (outRect.x + xm)
                  }else if(outRect.x1 +xm > this.stage.width){
                    pushData.x -= (outRect.x1 + xm - this.stage.width)
                  }
                }
                if (!this.ddRender?.model.EXT_STAGE_HEIGHT){
                  let ym = ey - nmodel.cpv.y + dy;
                  if (outRect.y + ym < 0) {
                    pushData.y -= (outRect.y + ym)
                  } else if (outRect.y1 + ym > this.stage.height) {
                    pushData.y -= (outRect.y1 + ym - this.stage.height)
                  }
                }
              }
            }

            //设置辅助线
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls }, evt);
            //修改所有选中控件坐标
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangePosition, pushData, evt);
            //渲染图形
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
          }
        }
        break;
      }
      //表格内部拖拽中
      case DDeiEnumOperateState.TABLE_INNER_DRAG: {
        this.model.opPoints = []
        if (this.model.opLine?.render) {
          this.model.opLine.render.enableRefreshShape()
        }
        delete this.model.opLine;
        let table = this.stageRender.currentOperateShape;
        table.render.mouseMove(evt);
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        break;
      }
      //控件改变大小中
      case DDeiEnumOperateState.CONTROL_CHANGING_BOUND: {
        //得到改变后的新坐标以及大小，按下ctrl则等比放大缩小
        let points = []

        switch (this.stageRender.selector.passIndex) {
          case 1: {
            points.push({ x: this.stageRender.selector.x + this.stageRender.selector.width / 2, y: this.stageRender.selector.y })
          } break;
          case 2: {
            points.push({ x: this.stageRender.selector.x + this.stageRender.selector.width, y: this.stageRender.selector.y })
          } break;
          case 3: {
            points.push({ x: this.stageRender.selector.x + this.stageRender.selector.width, y: this.stageRender.selector.y + this.stageRender.selector.height / 2 })
          } break;
          case 4: {
            points.push({ x: this.stageRender.selector.x + this.stageRender.selector.width, y: this.stageRender.selector.y + this.stageRender.selector.height })
          } break;
          case 5: {
            points.push({ x: this.stageRender.selector.x + this.stageRender.selector.width / 2, y: this.stageRender.selector.y + this.stageRender.selector.height })
          } break;
          case 6: {
            points.push({ x: this.stageRender.selector.x, y: this.stageRender.selector.y + this.stageRender.selector.height })
          } break;
          case 7: {
            points.push({ x: this.stageRender.selector.x, y: this.stageRender.selector.y + this.stageRender.selector.height / 2 })
          } break;
          case 8: {
            points.push({ x: this.stageRender.selector.x, y: this.stageRender.selector.y })
          } break;
        }
       
        points.forEach(point => {
          point.x = point.x * stageRatio
          point.y = point.y * stageRatio
        })
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls, points: points }, evt);
        this.stage?.ddInstance?.bus?.executeAll()
        let movedBounds = this.stageRender.selector.render.getMovedBounds(ex2, ey2, isCtrl || this.stageRender.selector.eqrat);
        if (movedBounds) {
          let selector = this.stageRender.selector;

          let pushData = { x: ex, y: ey, deltaX: movedBounds.x - selector.x * stageRatio, deltaY: movedBounds.y - selector.y * stageRatio, deltaWidth: movedBounds.width - selector.width * stageRatio, deltaHeight: movedBounds.height - selector.height * stageRatio, selector: selector, models: this.model.shadowControls };
          this.model.opPoints = [];
          if (this.model.opLine?.render) {
            this.model.opLine.render.enableRefreshShape()
          }
          delete this.model.opLine;
          //更新dragObj临时变量中的数值,确保坐标对应关系一致
          //修改所有选中控件坐标
          let tempMd = Array.from(this.stage.selectedModels.values())[0]
          
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeBounds, pushData, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }
        break;
      }
      //控件旋转
      case DDeiEnumOperateState.CONTROL_ROTATE: {
        //获取当前移动的坐标量
        // let movedPos = this.getMovedPositionDelta(evt);
        // if (movedPos.x != 0) {
        //计算上级控件的大小
        let pContainerModel = this.stageRender?.currentOperateContainer;
        if (!pContainerModel) {
          pContainerModel = this.model;
        }

        //更新旋转
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeRotate, { ex: ex2, ey: ey2, container: pContainerModel }, evt);
        // //更新dragObj临时变量中的数值,确保坐标对应关系一致
        // this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { deltaX: movedPos.x, deltaY: 0 }, evt);
        //渲染图形
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

        // }
        break;
      }
      //快捷编辑中
      case DDeiEnumOperateState.QUICK_EDITING: {
        if (this.stageRender.editorShadowControl) {
          //清空当前opPoints
          this.model.opPoints = [];
          if (this.model.opLine?.render) {
            this.model.opLine.render.enableRefreshShape()
          }
          delete this.model.opLine;
          let shadowControl = this.stageRender.editorShadowControl;
          if (shadowControl?.isInTextArea(ex, ey)) {

            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'text' }, evt);


          } else {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
          }
        }
        break;
      }
      //快捷编辑选择文本中
      case DDeiEnumOperateState.QUICK_EDITING_TEXT_SELECTING: {

        let shadowControl = this.stageRender.editorShadowControl;
        if (shadowControl?.isInTextArea(ex2, ey2)) {
          let cx = (ex2 - shadowControl.cpv.x) * rat1 * stageRatio;
          let cy = (ey2 - shadowControl.cpv.y) * rat1 * stageRatio;
          //先判断行，再判断具体位置
          //textUsedArea记录的是基于中心点的偏移量
          let startIndex = 0;
          let sx = 0;
          let i = 0;
          //由于绘制缓存中的文本位置乘以了调整系数，因此这里判断时，需要利用这个系数反向判断
          let scaleSize = rat1 < 2 ? 2 / rat1 : 1
          for (; i < shadowControl.render.textUsedArea.length; i++) {
            let rowData = shadowControl.render.textUsedArea[i];
            let ry = rowData.y / scaleSize
            let rh = rowData.height / scaleSize
            let rx = rowData.x / scaleSize
            let rw = rowData.width / scaleSize
            if (cy >= ry && cy <= ry + rh) {
              if (cx >= rx && cx <= rx + rw) {
                //判断位于第几个字符，求出光标的开始位置
                let endI = startIndex + rowData.text.length;
                for (let x = startIndex; x < endI; x++) {
                  let fx = shadowControl.render.textUsedArea[0].textPosCache[x].x / scaleSize;
                  let lx = x < endI - 1 ? shadowControl.render.textUsedArea[0].textPosCache[x + 1].x / scaleSize : rx + rw
                  let halfW = (lx - fx) / 2
                  if (cx >= fx && cx < lx) {
                    if (cx > fx + halfW) {
                      sx = x + 1
                    } else {
                      sx = x
                    }
                    break;
                  }
                }
              }
              if (!sx) {
                if (ex < shadowControl.cpv.x) {
                  sx = startIndex
                } else {
                  sx = startIndex + rowData.text.length;
                }
              }
              break;
            }
            startIndex += rowData.text.length
          }
          if (!sx) {
            if (ex < shadowControl.cpv.x) {
              sx = 0
            } else {
              sx = startIndex + shadowControl.render.textUsedArea[i - 1].text.length;
            }
          }
          let editorText = DDeiUtil.getEditorText();
          if (this.stageRender.tempTextStart > sx) {
            editorText.selectionStart = sx
            editorText.selectionEnd = this.stageRender.tempTextStart
          } else {
            editorText.selectionEnd = sx
          }

          setTimeout(() => {
            editorText.focus()
          }, 10);
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'text' }, evt);
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
          this.stage.ddInstance.bus.executeAll();
          break;
        }
        break;
      }
      case DDeiEnumOperateState.OV_POINT_CHANGING: {
        //修改所有选中控件坐标
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.OVSChangePosition, { x: ex2, y: ey2 }, evt);
        //渲染图形
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        break;
      }
      //默认缺省状态
      default: {
        //清空当前opPoints
        this.model.opPoints = [];
        if (this.model.opLine?.render) {
          this.model.opLine.render.enableRefreshShape()
        }
        delete this.model.opLine;
        //判断当前鼠标坐标是否落在选择器控件的区域内
        let inSelector = false
        if (this.stageRender.selector &&
          this.stageRender.selector.isInAreaLoose(ex2, ey2, true)) {
          //派发给selector的mousemove事件，在事件中对具体坐标进行判断
          this.stageRender.selector.render.mouseMove(evt);
          inSelector = true;
        }
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex2, ey2, true);
        this.ddRender.inAreaControls = operateControls;
        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          //执行回调函数
          let allowBackActive = DDeiUtil.isBackActive(this.stage?.ddInstance)
          if (allowBackActive) {
            DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_MOVE_IN_CONTROL", "MOVE_IN_CONTROL", { models: operateControls }, this.ddRender.model, evt)
          }
          operateControls.forEach(control => {
            control.render.mouseMove(evt)
          })
          
          // operateControls[0].render.mouseMove(evt);
          this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'all-scroll' }, evt);
        } else if (!inSelector || this.stageRender.selector.passIndex == -1) {
         if (this.stage.ddInstance?.editMode == 1) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
          } else if (this.stage.ddInstance?.editMode == 2) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'grab' }, evt);
          }
          let allowBackActive = DDeiUtil.isBackActive(this.stage?.ddInstance)
          if (allowBackActive) {
            DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_MOVE_IN_LAYER", "MOVE_IN_LAYER", { layer: this.model,ex:ex,ey:ey }, this.ddRender.model, evt)
          }
        }
        if (this.stage?.brushData) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { image: 'cursor-brush' }, evt);
        }
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        break;
      }
    }
    this.stage?.ddInstance?.bus?.executeAll();

  }


}
export {DDeiLayerCanvasRender}
export default DDeiLayerCanvasRender