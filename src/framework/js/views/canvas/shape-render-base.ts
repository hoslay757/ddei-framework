import { cloneDeep } from 'lodash';
import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiStageCanvasRender from './stage-render.js';
import { Vector3 } from 'three';
import DDeiEnumOperateState from '../../enums/operate-state.js';
/**
 * 缺省的图形渲染器，默认实现的了监听等方法
 */
class DDeiAbstractShapeRender {
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

  /**
   * 用于绘图时缓存属性等信息
   */
  renderCacheData: Map<string, object> = new Map();

  /**
   * 刷新当前图形，只有当为true时才刷新，刷新后会变为false，重新采样后会为true
   */
  refreshShape: boolean = true;


  enableRefreshShape() {
    this.refreshShape = true
    this.model.composes?.forEach(comp => {
      comp.render?.enableRefreshShape()
    })
  }


  /**
   * 获取html
   */
  getHTML(): string {
    return null;
  }


  /**
   * 获取缓存的渲染数据
   */
  getCachedValue(attrPath: string): object | null {
    let returnValue: object | null = null;

    if (!this.renderCacheData.has(attrPath)) {
      returnValue = DDeiModelArrtibuteValue.getAttrValueByState(this.model, attrPath, true);
      this.setCachedValue(attrPath, returnValue)
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
          this.changeComposesCacheValue(item, value);
        })
      } else {
        this.renderCacheData.set(attrPath, value);
        this.changeComposesCacheValue(attrPath, value)
      }

    }
  }

  clearCachedValue():void{
    this.renderCacheData.clear();
    this.enableRefreshShape();
    this.clearComposesCacheValue();
  }

  clearComposesCacheValue() {
    //通知composes的值改变
    let define = DDeiUtil.getControlDefine(this.model)?.define;
    if (define?.composes?.length > 0) {
      for (let i = 0; i < define.composes.length; i++) {
        let comDef = define.composes[i]
        let comModel = this.model.composes[i]
        if (comDef.attrLinks?.length > 0) {
          comDef.attrLinks.forEach(attrLink => {
            attrLink.mapping.forEach(mp => {
              if (mp == "*") {
                comModel.render?.clearCachedValue()
              } else {
                comModel.render?.clearCachedValue()
              }
            });
          });
        }
      }
    }
  }

  changeComposesCacheValue(attrPath, value) {
    //通知composes的值改变
    let define = DDeiUtil.getControlDefine(this.model)?.define;
    if (define?.composes?.length > 0) {
      for (let i = 0; i < define.composes.length; i++) {
        let comDef = define.composes[i]
        let comModel = this.model.composes[i]
        if (comDef.attrLinks?.length > 0) {
          comDef.attrLinks.forEach(attrLink => {
            if (attrPath.startsWith(attrLink.code) && attrLink.mapping?.length > 0) {
              attrLink.mapping.forEach(mp => {
                if (mp == "*") {
                  comModel.render.setCachedValue(attrPath, value)
                } else {
                  comModel.render.setCachedValue(mp, value)
                }
              });
            }
          });
        }
      }
    }
  }

  // ============================== 事件 ===============================

  /**
   * 拖拽本控件结束
   * @param evt 
   */
  controlDragEnd(evt: Event): void {

  }

  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {

  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    this.controlSelect()
  }




  /**
   * 选中
   */
  controlSelect(evt: Event): boolean {
    //按下ctrl增加选中，或取消当前选中
    let pContainerModel = this.model.pModel;
    //当前操作组合
    let pushMulits = [];
    //当前操作层级容器
    this.stageRender.currentOperateContainer = pContainerModel;
    let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_SELECT_BEFORE", DDeiEnumOperateType.SELECT, { models: [this.model] }, this.stage?.ddInstance, evt)
    if (rsState == 0 || rsState == 1) {
      let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
      if (isCtrl) {
        //判断当前操作控件是否选中
        if (this.stageRender.currentOperateShape?.state == DDeiEnumControlState.SELECTED) {
          pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.DEFAULT }] });
        } else {
          //选中当前操作控件
          pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.SELECTED }] });
        }
      }
      //没有按下ctrl键，取消选中非当前控件
      else {
        pushMulits.push({ actionType: DDeiEnumBusCommandType.CancelCurLevelSelectedModels, data: { ignoreModels: [this.model] } });
        pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.SELECTED }] });
      }
      this.model.layer.render.enableRefreshShape();
      pushMulits.push({ actionType: DDeiEnumBusCommandType.StageChangeSelectModels });
    
      this.stage?.ddInstance?.bus?.pushMulit(pushMulits, evt);
      this.stage?.ddInstance?.bus?.executeAll()
      DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_SELECT_AFTER", DDeiEnumOperateType.SELECT, { models: [this.model] }, this.stage?.ddInstance, evt)
    }
    return true;
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
        let stageRatio = this.stage?.getStageRatio()
        let ex = evt.offsetX;
        let ey = evt.offsetY;
        ex /= window.remRatio
        ey /= window.remRatio
        ex -= this.stage.wpv.x;
        ey -= this.stage.wpv.y
        ex /= stageRatio
        ey /= stageRatio
        this.changeOpPoints(ex, ey);
      }
      
    }

  }

  changeOpPoints(ex: number, ey: number, pointMode: number | null = null) {
    //获取直线连接操作点
    let appendPoints = []
    let hasPoint = false;
    let projPoint;
    if (this.stageRender?.operateState == DDeiEnumOperateState.LINE_POINT_CHANGING) {
      projPoint = this.model.getProjPoint({ x: ex, y: ey }, { in: -8, out: 15 });
    } else {
      let modelWeight = Math.min(this.model.width, this.model.height)
      let inWeight = -8
      if (modelWeight <= 24) {
        inWeight = 0
      }
      projPoint = this.model.getProjPoint({ x: ex, y: ey }, { in: inWeight, out: 15 });
    }
    let pots = []
    if (projPoint) {
      projPoint.model = this.model
      projPoint.mode = pointMode
      hasPoint = true;

      pots.push(projPoint);
    }
    let centerOpPoints = this.model.getCenterOpPoints()
    centerOpPoints.forEach(op => {
      op.model = this.model
      op.mode = 3
      //只响应点的操作点，如果距离小于10，则变大
      if (op.oppoint == 1 || op.oppoint == 3) {
        let dist = DDeiUtil.getPointDistance(op.x, op.y, ex, ey);
        if (Math.abs(dist) <= 5) {
          op.isMiddle = true
          this.stage.tempCursorOPpoint = op
          delete op.mode
          hasPoint = true;
        }
      }
      //判定是否圆心，判定点到圆心的距离
      if (op.oppoint == 3) {
        let rotate = this.model.rotate;
        if (!rotate) {
          rotate = 0
        }

        let bpv = DDeiUtil.pointsToZero([this.model.bpv], this.model.cpv, rotate)[0]
        let scaleX = Math.abs(bpv.x / 100)
        let scaleY = Math.abs(bpv.y / 100)
        let dist1 = DDeiUtil.getPointDistance(0, 0, (ex - op.x) / scaleX, (ey - op.y) / scaleY);
        if (Math.abs(op.r - dist1) <= 5) {
          let dr = op.r - dist1
          let rotate = DDeiUtil.getLineAngle(op.x, op.y, ex, ey)
          let dx = dr * Math.cos(rotate * DDeiConfig.ROTATE_UNIT)
          let dy = dr * Math.sin(rotate * DDeiConfig.ROTATE_UNIT)
          let op1 = new Vector3(ex + dx, ey + dy, 1)
          op1.model = this.model
          op1.oppoint = op.oppoint
          pots.push(op1)
          hasPoint = true;
        }
      } else {
        let angle = DDeiUtil.getLineAngle(this.model.cpv.x, this.model.cpv.y, op.x, op.y)
        angle -= (this.model.rotate ? this.model.rotate : 0)
        op.sita = angle
        appendPoints.push(op)
      }
    })

    //过滤靠近centerOppoints的点
    pots.forEach(po => {
      let insert = true;
      for (let i = 0; i < centerOpPoints.length; i++) {
        let co = centerOpPoints[i]

        if (co.isMiddle) {
          let dist = DDeiUtil.getPointDistance(po.x, po.y, co.x, co.y);
          if (Math.abs(dist) <= 5) {
            insert = false
          }
        }

      }
      if (insert) {
        let angle = DDeiUtil.getLineAngle(this.model.cpv.x, this.model.cpv.y, po.x, po.y)
        angle -= (this.model.rotate ? this.model.rotate : 0)
        po.sita = angle
        this.stage.tempCursorOPpoint = po
        appendPoints.push(po)
      }
    })
    if (appendPoints.length > 0) {
      appendPoints.forEach(po => {
        this.layer.opPoints.push(po);
      })
      this.layer.opPoints.push({ isSplit: 1 })
    }
    if (hasPoint) {
      this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'pointer' });
    }
  }

  //数据
  refreshView(editor,vNode, tempShape, composeRender) {
    let shapeElement = vNode.el
    let model = this.model
    let stage = model.stage
    let ddInstance = stage.ddInstance

    let render = model.render
    let ruleWeight = 0
    if (stage.render.tempRuleDisplay == 1 || stage.render.tempRuleDisplay == '1') {
      ruleWeight = 15
    }
    //位置
    let canvasEle = document.getElementById(editor.id + "_canvas");
    let canvasDomPos = DDeiUtil.getDomAbsPosition(canvasEle);

    let stageRatio = model.getStageRatio()
    //创建图形，修改图形大小、旋转、边框等属性，以及移动图形位置

    //获取model的绝对位置
    let modelPos = DDeiUtil.getModelsDomAbsPosition([model])

    let rat1 = window.remRatio
    if (DDeiUtil.isModelHidden(model)) {
      shapeElement.style.display = "none"
    } else {
      //大小
      shapeElement.style.width = (model.width * rat1) + "px"
      shapeElement.style.height = (model.height * rat1) + "px"

      //旋转,缩放
      let transform = ""
      if (stageRatio > 0 && stageRatio != 1) {
        transform += " scale(" + stageRatio + ")"
      }

      if (model.rotate) {
        transform += " rotate(" + model.rotate + "deg)"
      }
      if (transform) {
        shapeElement.style.transform = transform
      }

      //边框
      let type = tempShape?.border?.type || tempShape?.border?.type == 0 ? tempShape?.border?.type : render.getCachedValue("border.type")
      let opacity = tempShape?.border?.opacity || tempShape?.border?.opacity == 0 ? tempShape?.border?.opacity : render.getCachedValue("border.opacity");
      let width = tempShape?.border?.width || tempShape?.border?.width == 0 ? tempShape?.border?.width : render.getCachedValue("border.width");
      let dash = tempShape?.border?.dash || tempShape?.border?.dash == 0 ? tempShape?.border?.dash : render.getCachedValue("border.dash");
      let color = tempShape?.border?.color || tempShape?.border?.color == 0 ? tempShape?.border?.color : render.getCachedValue("border.color");
      let drawLine = ((type == 1 || type == '1') && width > 0)
      if (drawLine) {
        let type = !dash || dash.length == 0 ? "solid" : "dashed"
        if (!color) {
          color = "var(--border)"
        }
        if (opacity >= 0 && opacity < 1) {
          let value16 = parseInt(opacity * 255)
          color += value16.toString(16);
        }
        shapeElement.style.setProperty("--borderColor", color)
        shapeElement.style.setProperty("--borderType", type)
        shapeElement.style.setProperty("--borderWidth", width + "px")
      }
      
      shapeElement.style.left = (model.cpv.x * stageRatio + stage.wpv.x) - (shapeElement.offsetWidth ? shapeElement.offsetWidth : model.width * rat1) / 2 - ruleWeight + "px"
      shapeElement.style.top = (model.cpv.y * stageRatio + stage.wpv.y) - (shapeElement.offsetHeight ? shapeElement.offsetHeight : model.height * rat1) / 2 - ruleWeight + "px"

      //背景
      //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
      let fillColor = tempShape?.fill?.color ? tempShape.fill.color : render.getCachedValue("fill.color");
      if (!fillColor) {
        fillColor = DDeiUtil.getStyleValue("canvas-control-background", ddInstance);
      }
      let fillOpacity = tempShape?.fill?.opacity ? tempShape.fill.opacity : render.getCachedValue("fill.opacity");

      let fillType = tempShape?.fill?.type ? tempShape.fill.type : render.getCachedValue("fill.type");
      if (fillType == 1) {

        if (fillOpacity >= 0 && fillOpacity < 1) {
          let value16 = parseInt(fillOpacity * 255)
          fillColor += value16.toString(16);
        }
        shapeElement.style.setProperty("--fillColor", fillColor)
      }
      //圆角
      let round = tempShape?.border?.round ? tempShape?.border?.round : render.getCachedValue("border.round");
      if (round) {
        shapeElement.style.setProperty("--borderRound", round + "px")
      }

      //字体
      let fiFamily = tempShape?.font?.family ? tempShape?.font?.family : render.getCachedValue("font.family");
      let fiSize = tempShape?.font?.size ? tempShape?.font?.size : render.getCachedValue("font.size");
      let fiColor = tempShape?.font?.color ? tempShape?.font?.color : render.getCachedValue("font.color");
      if (!fiColor) {
        fiColor = DDeiUtil.getStyleValue("canvas-control-title", ddInstance);
      }
      if (fiFamily) {
        shapeElement.style.setProperty("--fontFamily", fiFamily)
      }
      if (fiSize) {
        shapeElement.style.setProperty("--fontSize", fiSize + "px")
      }
      if (fiColor) {
        shapeElement.style.setProperty("--fontColor", fiColor)
      }
      //粗体
      let bold = tempShape?.textStyle?.bold ? tempShape?.textStyle?.bold : render.getCachedValue("textStyle.bold");
      if (bold == 1 || bold == '1') {
        shapeElement.style.setProperty("--fontWeight", "bold")
      }
      //斜体
      let italic = tempShape?.textStyle?.italic ? tempShape?.textStyle?.italic : render.getCachedValue("textStyle.italic");
      if (italic == 1 || italic == '1') {
        shapeElement.style.setProperty("--fontStyle", "italic")
      }
      //下划线
      let underline = tempShape?.textStyle?.underline ? tempShape?.textStyle?.underline : render.getCachedValue("textStyle.underline");
      if (underline == '1' || underline == 1) {
        shapeElement.style.setProperty("--textDecoration", "underline")
      } else {
        //删除线
        let deleteline = tempShape?.textStyle?.deleteline ? tempShape?.textStyle?.deleteline : render.getCachedValue("textStyle.deleteline");
        if (deleteline == '1' || deleteline == 1) {
          shapeElement.style.setProperty("--textDecoration", "line-through")
        } else {
          //上画线
          let overline = tempShape?.textStyle?.topline ? tempShape?.textStyle?.topline : render.getCachedValue("textStyle.topline");
          if (overline == '1' || overline == 1) {
            shapeElement.style.setProperty("--textDecoration", "overline")
          }
        }
      }

      //文本背景色
      let textBgColor = tempShape?.textStyle?.bgcolor ? tempShape?.textStyle?.bgcolor : render.getCachedValue("textStyle.bgcolor");
      if (textBgColor) {
        shapeElement.style.setProperty("--textBgColor", textBgColor)
      }
      //zIndex
      shapeElement.style.zIndex = model.render.tempZIndex


      shapeElement.style.display = "block"


      if (model.baseModelType == 'DDeiContainer') {
        for (let m = 0; m < model.midList?.length; m++) {
          let key = model.midList[m];
          let item = model.models.get(key);
          if (item?.render) {
            item.render.tempZIndex = model.render.tempZIndex + (m + 1)
            item.render.drawShape(tempShape, composeRender)
          }
        }
      }

      if (vNode.component.ctx.refreshView) {
        vNode.component.ctx.refreshView(model, vNode, tempShape, composeRender)
      }
    }
  }

  removeViewerCanvas(){
    if (!this.viewer) {
      this.tempCanvas?.remove()
      this.model.composes?.forEach(comp => {
        comp.render.removeViewerCanvas()
      })
    } else {
      DDeiUtil.createRenderViewer(this.model, "VIEW-HIDDEN")
    }
  }
}
export { DDeiAbstractShapeRender}
export default DDeiAbstractShapeRender