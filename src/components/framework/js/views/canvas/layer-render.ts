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
import { Vector3 } from 'three';
import { xor } from 'lodash';
import DDeiLink from '../../models/link.js';
import line from '@/components/editor/configs/controls/line.js';
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
   * 辅助线对象
   */
  helpLines: object = {};

  /**
   * 用于绘图时缓存属性等信息
   */
  renderCacheData: Map<string, object> = new Map();

  // ============================ 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.stage.ddInstance.render
    this.stage = this.model.stage
    this.stageRender = this.model.stage.render
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
   * 绘制图形
   */
  drawShape(): void {
    //只有当显示时才绘制图层
    if (this.model.display || this.model.tempDisplay) {
      if (!this.viewBefore || this.viewBefore(
        DDeiEnumOperateType.VIEW,
        [this.model],
        null,
        this.ddRender.model,
        null
      )) {
        //绘制子元素
        this.drawChildrenShapes();
        //绘制操作点
        this.drawOpPoints();

        //绘制移入移出效果图形
        this.drawDragInOutPoints();

        //绘制拖拽影子控件
        this.drawShadowControls();

        //绘制辅助线
        this.drawHelpLines()

        this.modelChanged = false;
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
  }




  /**
   * 绘制背景
   */
  drawBackground(px, py, pw, ph): void {
    if (this.model.display || this.model.tempDisplay) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      //保存状态
      ctx.save();


      //根据背景的设置绘制图层
      //获取属性配置
      let bgInfoType = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.type", true);
      // 绘制纯色背景
      if (bgInfoType == 1) {
        let bgInfoColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.color", true);
        let bgInfoOpacity = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.opacity", true);
        //填充色
        ctx.fillStyle = DDeiUtil.getColor(bgInfoColor)
        //透明度
        if (bgInfoOpacity || bgInfoOpacity == 0) {
          ctx.globalAlpha = bgInfoOpacity
        }
        ctx.fillRect(px, py, pw, ph)
      }
      //绘制图片背景类型
      else if (bgInfoType == 2) {
        let bgImage = DDeiUtil.getReplacibleValue(this.model, "bg.image");
        //没有图片，加载图片，有图片绘制图片
        if (!this.bgImgObj || bgImage != this.upBgImage) {
          this.initBgImage();
        } else {
          let bgImgMode = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageMode", true);
          let bgInfoOpacity = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.opacity", true);
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
          let ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "ruler.display", true);
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
            let bgImageScale = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageScale", true);
            w = w * bgImageScale;
            h = h * bgImageScale;
          }
          //对齐
          if (bgImgMode != 2) {
            let bgImageAlign = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "bg.imageAlign", true);
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
   * 绘制子元素
   */
  drawShadowControls(): void {
    if (this.model.shadowControls?.length > 0) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;

      this.model.shadowControls.forEach(item => {
        //保存状态
        ctx.save();
        item.render.drawShape();
        let pvs = item.pvs;
        ctx.globalAlpha = 0.7
        //设置字体颜色
        ctx.fillStyle = DDeiUtil.getColor("#017fff");
        //开始绘制  
        let lineOffset = 1 * ratio / 2;
        ctx.beginPath();
        if (item.baseModelType == 'DDeiLine') {

        } else {
          ctx.moveTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
          ctx.lineTo(pvs[1].x * ratio + lineOffset, pvs[1].y * ratio + lineOffset);
          ctx.lineTo(pvs[2].x * ratio + lineOffset, pvs[2].y * ratio + lineOffset);
          ctx.lineTo(pvs[3].x * ratio + lineOffset, pvs[3].y * ratio + lineOffset);
          ctx.lineTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
        }
        ctx.fill();
        ctx.restore();
      });

    }
  }



  /**
   * 绘制子元素
   */
  drawChildrenShapes(): void {
    if (this.model.models) {
      let canvas = this.ddRender.getCanvas();
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      let stageRatio = this.stage.getStageRatio()
      let ratio = rat1 * stageRatio;
      let x = -this.stage.wpv.x * ratio / rat1;
      let y = -this.stage.wpv.y * ratio / rat1;
      let x1 = x + canvas.width / rat1;
      let y1 = y + canvas.height / rat1;
      //遍历子元素，绘制子元素
      this.model.midList.forEach(key => {
        let item = this.model.models.get(key);
        //判定控件是否在绘制区间，如果在则绘制
        if (item?.isInRect(x, y, x1, y1)) {
          item.render.drawShape();
        }
      });
    }
  }

  /**
   * 绘制操作点
   */
  drawOpPoints(): void {
    if (this.model?.opPoints?.length > 0) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let ratio = this.ddRender.ratio;
      //保存状态
      ctx.save();
      let lineOffset = 1 * ratio / 2;
      this.model?.opPoints.forEach(point => {
        if (point.mode == 3) {
          let weight = 8;
          ctx.fillStyle = "white"
          ctx.strokeStyle = "#017fff"
          ctx.beginPath();
          ctx.ellipse(point.x * ratio + lineOffset, point.y * ratio + lineOffset, weight, weight, 0, 0, Math.PI * 2)
          ctx.fill();
          ctx.stroke();
          ctx.closePath();
        }
      });
      this.model?.opPoints.forEach(point => {
        if (point.mode != 3) {
          let weight = 8;
          if (point.isMiddle) {
            weight = 10;
          }
          ctx.fillStyle = "white"
          ctx.beginPath();
          ctx.ellipse(point.x * ratio + lineOffset, point.y * ratio + lineOffset, weight + 2, weight + 2, 0, 0, Math.PI * 2)
          ctx.fill();
          ctx.closePath();
          if (point.mode == 1) {
            ctx.fillStyle = "red"
          } else {
            ctx.fillStyle = "#017fff"
          }
          ctx.beginPath();
          ctx.ellipse(point.x * ratio + lineOffset, point.y * ratio + lineOffset, weight, weight, 0, 0, Math.PI * 2)
          ctx.fill();
          ctx.closePath();
        }
      });


      //恢复状态
      ctx.restore();
    }
  }

  /**
  * 绘制移入移出效果图形
  */
  drawDragInOutPoints(): void {

    if (this.model?.dragInPoints?.length > 0 || this.model?.dragOutPoints?.length > 0) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      let ratio = this.ddRender.ratio;
      //保存状态
      ctx.save();
      ctx.lineWidth = 2.5 * ratio;
      ctx.setLineDash([0, 1 * ratio, 1 * ratio]);
      //设置颜色
      ctx.strokeStyle = DDeiUtil.getColor("green");
      //开始绘制  
      let lineOffset = 1 * ratio / 2;
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

  /**
   * 获取单个点移动后的坐标增量
   * 考虑最小移动像素
   * @param evt 事件
   * @returns 计算的坐标增量
   */
  getMovedPositionDelta(evt): object {
    let ex = evt.offsetX;
    let ey = evt.offsetY;
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

  /**
  * 显示辅助对齐线以及文本
  * @param bounds 当前碰撞边框
  */
  drawHelpLines(): void {
    // 未开启主线提示，则不再计算辅助线提示定位
    if (DDeiConfig.GLOBAL_HELP_LINE_ENABLE && this.helpLines) {
      let hpoint = this.helpLines.hpoint;
      let vpoint = this.helpLines.vpoint;
      let pvs = this.helpLines.pvs;
      let cpv = this.helpLines.cpv;
      let textPV = cpv;
      if (pvs?.length > 0) {
        textPV = pvs[0];
      }

      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio
      let stageRatio = this.stage.getStageRatio()
      let ratio = rat1 * stageRatio;
      //保存状态
      ctx.save();
      //绘制提示文本
      //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      //设置字体
      ctx.font = "bold 24px 宋体"
      //设置字体颜色
      ctx.fillStyle = "red"
      //执行绘制
      if (textPV) {
        ctx.fillText(textPV.x.toFixed(0) + "," + textPV.y.toFixed(0), textPV.x * rat1 - 30, textPV.y * rat1 - 30);
      }
      // 计算对齐辅助线
      if (DDeiConfig.GLOBAL_HELP_LINE_ALIGN_ENABLE) {

        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = 1 * ratio / 2;
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


      //恢复状态
      ctx.restore();
      this.helpLines = null;
    }
  }



  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
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
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y;
    //判定是否在操作点上，如果在则快捷创建线段
    if (this.stageRender.selector && this.stageRender.selector.isInAreaLoose(ex, ey, true) &&
      ((this.stageRender.selector.passIndex >= 1 && this.stageRender.selector.passIndex <= 9) || this.stageRender.selector.passIndex == 13)) {
      //派发给selector的mousedown事件，在事件中对具体坐标进行判断
      this.stageRender.selector.render.mouseDown(evt);
    } else {
      let opPoint = this.model.getOpPointByPos(ex, ey);
      if (opPoint) {
        //当前操作状态：线改变点中
        //记录当前的拖拽的x,y,写入dragObj作为临时变量
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { opPoint: opPoint } }, evt);
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
        this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING_CONFIRM
      } else {
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);
        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          //全局变量：当前操作控件=当前控件
          let operateControl = operateControls[0];
          this.stageRender.currentOperateShape = operateControl;
          this.stageRender.tempSX = ex
          this.stageRender.tempSY = ey
          //当前操作状态:控件状态确认中
          this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CONFIRMING
          //分发事件到当前控件 TODO 事件分发逻辑设计
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
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ResetSelectorState, { x: ex, y: ey }, evt);
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
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { dx: ex, dy: ey } }, evt);
              this.stageRender.operateState = DDeiEnumOperateState.TEXT_CREATING
              clearSelect = true;
            }
            case 4: {
              //当前操作状态：线改变点中
              //记录当前的拖拽的x,y,写入dragObj作为临时变量
              this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: { dx: ex, dy: ey } }, evt);
              this.stageRender.operateState = DDeiEnumOperateState.LINE_POINT_CHANGING

              clearSelect = true
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
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y
    //鼠标右键，显示菜单
    if (evt.button == 2) {
      //在鼠标位置显示菜单
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey);
      //显示当前控件的
      if (operateControls != null && operateControls.length > 0) {
        //全局变量：当前操作控件=当前控件
        DDeiUtil.showContextMenu(operateControls[0], evt)
      }
      //清除临时操作点
      this.model.opPoints = [];
      this.model.shadowControls = [];
    } else {
      //判断当前操作状态
      switch (this.stageRender.operateState) {
        //控件状态确认中
        case DDeiEnumOperateState.LINE_POINT_CHANGING_CONFIRM: {
          // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
          let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);
          //光标所属位置是否有控件
          //有控件：分发事件到当前控件
          if (operateControls != null && operateControls.length > 0) {
            //全局变量：当前操作控件=当前控件
            let operateControl = operateControls[0];
            this.stageRender.currentOperateShape = operateControl;
          }
        }
        case DDeiEnumOperateState.CONTROL_CONFIRMING: {
          this.model.shadowControls = [];
          this.stageRender.currentOperateShape.render.mouseUp(evt);
          //如果有格式刷
          if (this.stage?.brushData) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CopyStyle, { models: [this.stageRender.currentOperateShape], brushData: this.stage.brushData }, evt)
          }
          break;
        }
        //选择器工作中
        case DDeiEnumOperateState.SELECT_WORKING:
          //选中被选择器包含的控件
          //当前操作数据
          let pushDatas = [];
          let includedModels: Map<string, DDeiAbstractShape> = this.stageRender.selector.getIncludedModels();

          //加载事件的配置
          let selectBefore = DDeiUtil.getConfigValue(
            "EVENT_CONTROL_SELECT_BEFORE",
            this.stage?.ddInstance
          );

          if (!selectBefore || selectBefore(DDeiEnumOperateType.SELECT, Array.from(includedModels.values()), null, this.stage?.ddInstance, evt)) {
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
              if (model) {
                model.syncVectors(item)
              } else {
                let opPoint = this.model.getOpPointByPos(ex, ey);
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
                  this.model.addModel(item)
                  item.initRender();
                  model = item;
                } else {
                  isStop = true;
                }
              }
              if (!isStop) {
                let passIndex = this.stageRender.dragObj.passIndex;

                //如果是开始或结束节点的拖拽，判断落点是否在操作点上，如果在，则关联
                if (passIndex == 1) {
                  //如果原有的关联存在，取消原有的关联
                  let opvsIndex = this.stageRender.dragObj.opvsIndex;
                  let dmpath = ""
                  //判断开始点还是结束点
                  if (opvsIndex == 0) {
                    dmpath = "startPoint"
                  } else {
                    dmpath = "endPoint"
                  }
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

                  let opPoint = this.model.getOpPointByPos(ex, ey);
                  if (opPoint) {

                    //建立关联
                    let smodel = opPoint.model;
                    //创建连接点
                    let id = "_" + DDeiUtil.getUniqueCode()
                    smodel.exPvs[id] = new Vector3(opPoint.x, opPoint.y, opPoint.z)
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
                model?.initPVS()
                hasChange = true;
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
            this.model.shadowControls = [];
            break;
          }
        //控件拖拽中
        case DDeiEnumOperateState.CONTROL_DRAGING:

          let isStop = false;
          let hasChange = false;
          //如果按下了ctrl键，则需要修改容器的关系并更新样式
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] = DDeiAbstractShape.findBottomContainersByArea(this.model, ex, ey);
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
              if (!lastOnContainer.layoutManager || lastOnContainer.layoutManager.canAppend(ex, ey, this.model.shadowControls)) {
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

                //加载事件的配置
                let dragAfter = DDeiUtil.getConfigValue(
                  "EVENT_CONTROL_DRAG_AFTER",
                  this.stage?.ddInstance
                );
                if (dragAfter) {
                  dragAfter(DDeiEnumOperateType.DRAG, operateModels, null, this.stage?.ddInstance, evt)
                }
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
            if (!pContainerModel.layoutManager || pContainerModel.layoutManager.canChangePosition(ex, ey, this.model.shadowControls)) {
              let operateModels = []
              let lines = this.stage?.getModelsByBaseType("DDeiLine");
              //同步影子元素的坐标大小等状态到当前模型
              this.model.shadowControls.forEach(item => {
                let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                let model = this.stage?.getModelById(id)
                model.syncVectors(item)
                hasChange = true;
                operateModels.push(model)
                model.updateLinkModels();
                //判定当前控件是否为某个线段的关联控件，如果是，更改关联点的dx和dy关系
                lines?.forEach(line => {
                  if (line.linkModels?.has(model.id)) {
                    let lm = line.linkModels?.get(model.id);
                    let point = null;
                    if (lm.type == 1) {
                      point = line.startPoint;
                    } else if (lm.type == 2) {
                      point = line.endPoint;
                    } else if (lm.type == 3) {
                      point = line.pvs[Math.floor(line.pvs.length / 2)];
                    }
                    lm.dx = model.cpv.x - point.x
                    lm.dy = model.cpv.y - point.y
                  }
                })
              })
              pContainerModel?.layoutManager?.updateLayout(ex, ey, operateModels);
              operateModels?.forEach(item => {
                item.render?.controlDragEnd(evt)
              })
              //加载事件的配置
              let dragAfter = DDeiUtil.getConfigValue(
                "EVENT_CONTROL_DRAG_AFTER",
                this.stage?.ddInstance
              );
              if (dragAfter) {
                dragAfter(DDeiEnumOperateType.DRAG, operateModels, null, this.stage?.ddInstance, evt)
              }
            }
          }
          if (hasChange) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.NodifyChange);
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.AddHistroy);
          }

          this.model.shadowControls = [];
          break;
        //表格内部拖拽中
        case DDeiEnumOperateState.TABLE_INNER_DRAG:
          let table = this.stageRender.currentOperateShape
          table?.render?.mouseUp(evt)
          this.stage?.ddInstance?.bus.push(DDeiEnumBusCommandType.CopyStyle, { models: [table], brushData: this.stage.brushData });
          break;
        case DDeiEnumOperateState.CONTROL_ROTATE:
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
          this.model.shadowControls = [];

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
    // let rat1 = this.ddRender?.ratio;
    // let canvasWidth = this.ddRender.canvas.width / rat1
    // let canvasHeight = this.ddRender.canvas.height / rat1
    // //判断是否在边缘
    // if (ex < 100) {
    //   this.ddRender.inEdge = 4;
    // } else if (ex > canvasWidth - 100) {
    //   this.ddRender.inEdge = 2;
    // } else if (ey < 100) {
    //   this.ddRender.inEdge = 1;
    // } else if (ey > canvasHeight - 100) {
    //   this.ddRender.inEdge = 3;
    // } else {
    //   this.ddRender.inEdge = 0;
    // }
    ex -= this.stage.wpv.x;
    ey -= this.stage.wpv.y;
    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING: {
        //如果移动的距离比较小，则忽略
        if (Math.abs(ex - this.stageRender.tempSX) <= 2 && Math.abs(ey - this.stageRender.tempSY) <= 2) {
          return;
        }
        //清除临时操作点
        this.model.opPoints = [];
        //中心点坐标
        //当前控件的上层控件，可能是一个layer也可能是容器
        let pContainerModel = this.stageRender.currentOperateShape.pModel;
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
          let dragBefore = DDeiUtil.getConfigValue(
            "EVENT_CONTROL_DRAG_BEFORE",
            this.stage?.ddInstance
          );

          let selectedModels = pContainerModel.getSelectedModels();
          let sms = Array.from(selectedModels.values())
          if (sms.indexOf(this.stageRender.currentOperateShape) == -1) {
            sms.push(this.stageRender.currentOperateShape)
          }
          if (!dragBefore || dragBefore(DDeiEnumOperateType.DRAG, sms, null, this.stage?.ddInstance, evt)) {
            //当前操作状态：控件拖拽中
            this.stageRender.operateState = DDeiEnumOperateState.CONTROL_DRAGING
            //产生影子控件
            sms.forEach(m => {
              let md = DDeiUtil.getShadowControl(m);
              dragObj[md.id] = { dx: md.cpv.x - ex, dy: md.cpv.y - ey }
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
            lineJson.pvs = [lineJson.cpv, new Vector3(ex, ey, 1)]
          } else {
            lineJson.pvs = [lineJson.cpv, new Vector3((lineJson.cpv.x + ex) / 2, lineJson.cpv.y, 1), new Vector3((lineJson.cpv.x + ex) / 2, ey, 1), new Vector3(ex, ey, 1)]
          }
          //初始化开始点和结束点
          let ddeiLine = DDeiLine.initByJSON(lineJson, { currentStage: this.stage, currentLayer: this.model, currentContainer: this.model });
          let lineShadow = DDeiUtil.getShadowControl(ddeiLine);
          this.model.shadowControls.push(lineShadow);
          //将当前被拖动的控件转变为影子控件
          this.stageRender.currentOperateShape = lineShadow
          //建立连接关系
          if (opPoint) {
            let smodel = opPoint.model;
            //创建连接点
            let id = "_" + DDeiUtil.getUniqueCode()
            smodel.exPvs[id] = new Vector3(opPoint.x, opPoint.y, opPoint.z)
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
            x: ex,
            y: ey,
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
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeLinePoint, { ex: ex, ey: ey });
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }
        //判定是否到达了另一个控件的操作点
        this.model.opPoints = [];
        //判断当前鼠标坐标是否落在选择器控件的区域内
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);
        if (operateControls != null && operateControls.length > 0) {
          let projPoint = operateControls[0].getProjPoint({ x: ex, y: ey });
          let centerOpPoints = operateControls[0].getCenterOpPoints()
          centerOpPoints.forEach(op => {
            op.model = operateControls[0]
            op.mode = 3
            this.model.opPoints.push(op)
          })
          if (projPoint) {
            projPoint.model = operateControls[0]
            projPoint.mode = 1
            this.model.opPoints.push(projPoint)
          }
        }
        break;
      }
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING: {
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
          }

          //设置辅助线
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls }, evt);
          //修改所有选中控件坐标
          this.stageRender.tempPushData = pushData;
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangePosition, pushData, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }

        break;
      }
      //表格内部拖拽中
      case DDeiEnumOperateState.TABLE_INNER_DRAG: {
        this.model.opPoints = []
        let table = this.stageRender.currentOperateShape;
        table.render.mouseMove(evt);
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        break;
      }
      //控件改变大小中
      case DDeiEnumOperateState.CONTROL_CHANGING_BOUND: {

        //得到改变后的新坐标以及大小，按下ctrl则等比放大缩小
        let movedBounds = this.stageRender.selector.render.getMovedBounds(ex, ey, isCtrl);
        if (movedBounds) {
          let selector = this.stageRender.selector;
          let stageRatio = this.model.getStageRatio()
          let pushData = { x: ex, y: ey, deltaX: movedBounds.x - selector.x * stageRatio, deltaY: movedBounds.y - selector.y * stageRatio, deltaWidth: movedBounds.width - selector.width * stageRatio, deltaHeight: movedBounds.height - selector.height * stageRatio, selector: selector, models: this.model.shadowControls };
          this.model.opPoints = [];
          //更新dragObj临时变量中的数值,确保坐标对应关系一致
          //修改辅助线
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls }, evt);
          //修改所有选中控件坐标
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeBounds, pushData, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        }
        break;
      }
      //控件旋转
      case DDeiEnumOperateState.CONTROL_ROTATE: {
        //获取当前移动的坐标量
        let movedPos = this.getMovedPositionDelta(evt);
        if (movedPos.x != 0) {
          //计算上级控件的大小
          let pContainerModel = this.stageRender?.currentOperateContainer;
          if (!pContainerModel) {
            pContainerModel = this.model;
          }

          //更新旋转
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeRotate, { deltaX: movedPos.x, container: pContainerModel }, evt);
          //更新dragObj临时变量中的数值,确保坐标对应关系一致
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { deltaX: movedPos.x, deltaY: 0 }, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

        }
        break;
      }
      //默认缺省状态
      default: {
        //清空当前opPoints
        this.model.opPoints = [];
        //判断当前鼠标坐标是否落在选择器控件的区域内
        let inSelector = false
        if (this.stageRender.selector &&
          this.stageRender.selector.isInAreaLoose(ex, ey, true)) {
          //派发给selector的mousemove事件，在事件中对具体坐标进行判断
          this.stageRender.selector.render.mouseMove(evt);
          inSelector = true;
        }
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);
        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          operateControls[0].render.mouseMove(evt);
          let centerOpPoints = operateControls[0].getCenterOpPoints()
          centerOpPoints.forEach(op => {
            op.model = operateControls[0]
            op.mode = 3
            this.model.opPoints.push(op)
          })
          this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'all-scroll' }, evt);
        } else if (!inSelector || this.stageRender.selector.passIndex == -1) {
          if (this.stage.ddInstance?.editMode == 1) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
          } else if (this.stage.ddInstance?.editMode == 2) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'grab' }, evt);
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

export default DDeiLayerCanvasRender