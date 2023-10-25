import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumState from '../../enums/ddei-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiLayer from '../../models/layer.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiStageCanvasRender from './stage-render.js';

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



  // ============================ 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.stage.ddInstance.render
    this.stage = this.model.stage
    this.stageRender = this.model.stage.render
  }

  /**
   * 绘制图形
   */
  drawShape(): void {
    //只有当显示时才绘制图层
    if (this.model.display) {

      //绘制背景
      this.drawBackground();
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
    }
  }




  /**
   * 绘制背景
   */
  drawBackground(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    let r20 = ratio * 20;
    let r40 = ratio * 40;
    //保存状态
    ctx.save();

    ctx.translate(-this.stage.wpv.x * ratio, -this.stage.wpv.y * ratio)
    //根据背景的设置绘制图层
    //绘制背景图层
    let bgInfo = null;
    if (this.model.type == 99) {
      bgInfo = this.model.background ? this.model.background : DDeiConfig.BACKGROUND_LAYER;
    } else {
      bgInfo = this.model.background ? this.model.background : DDeiConfig.LAYER;
    }
    //绘制无背景
    if (!bgInfo || !bgInfo.type || bgInfo.type == 0) {
    }
    // 绘制纯色背景
    else if (bgInfo.type == 1) {
      ctx.fillStyle = bgInfo.bgcolor
      //透明度
      if (bgInfo.opacity != null && bgInfo.opacity != undefined) {
        ctx.globalAlpha = bgInfo.opacity
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    //TODO 绘制图片背景类型
    else if (bgInfo.type == 2) {

    }
    //绘制田字背景
    else if (bgInfo.type == 3) {
      ctx.fillStyle = bgInfo.bgcolor
      //透明度
      if (bgInfo.opacity != null && bgInfo.opacity != undefined) {
        ctx.globalAlpha = bgInfo.opacity
      }
      let cwidth = canvas.width + r20;
      let cheight = canvas.height + r20;
      let x = -r20
      let y = -r20
      ctx.fillRect(x, y, cwidth, cheight)

      ctx.lineWidth = 1;

      let offsetWidth = 0.5;
      let xdr = this.stage.wpv.x * ratio % r20
      let ydr = this.stage.wpv.y * ratio % r20
      for (; x <= cwidth; x += r20) {

        ctx.beginPath();
        if (x % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(210,210,210)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(220,220,220)";
        }
        ctx.moveTo(x + offsetWidth + xdr, offsetWidth - ydr);
        ctx.lineTo(x + offsetWidth + xdr, canvas.height + offsetWidth + ydr);
        ctx.stroke();
      }

      for (; y <= cheight; y += r20) {
        ctx.beginPath();
        if (y % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(210,210,210)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(220,220,220)";
        }
        ctx.moveTo(offsetWidth - xdr, y + offsetWidth + ydr);
        ctx.lineTo(canvas.width + offsetWidth + xdr, y + offsetWidth + ydr);
        ctx.stroke();
      }
    }

    //恢复状态
    ctx.restore();
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
        ctx.moveTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
        ctx.lineTo(pvs[1].x * ratio + lineOffset, pvs[1].y * ratio + lineOffset);
        ctx.lineTo(pvs[2].x * ratio + lineOffset, pvs[2].y * ratio + lineOffset);
        ctx.lineTo(pvs[3].x * ratio + lineOffset, pvs[3].y * ratio + lineOffset);
        ctx.lineTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
        ctx.closePath();
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
      this.model?.opPoints.forEach(point => {
        //设置字体颜色
        ctx.fillStyle = "red"
        //开始绘制  
        let lineOffset = 1 * ratio / 2;
        ctx.beginPath();
        ctx.ellipse(point.x * ratio + lineOffset, point.y * ratio + lineOffset, 10, 10, 0, 0, Math.PI * 2)
        ctx.fill();
        ctx.closePath();
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
   * 获取单个点移动后的坐标增量
   * 考虑最小移动像素
   * @param evt 事件
   * @returns 计算的坐标增量
   */
  getMovedPositionDelta(evt): object {
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x * stageRatio;
    ey -= this.stage.wpv.y * stageRatio;
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
    if (!this.model.display) {
      return
    }
    //ctrl键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    //判断当前鼠标坐标是否落在选择器控件的区域内
    //关闭菜单
    let menuDialogId = DDeiUtil.getMenuControlId();
    let menuEle = document.getElementById(menuDialogId);
    if (menuEle) {
      menuEle.style.display = "none";
    }

    let ex = evt.offsetX;
    let ey = evt.offsetY;
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x * stageRatio;
    ey -= this.stage.wpv.y * stageRatio;
    if (this.stageRender.selector && this.stageRender.selector.isInAreaLoose(ex, ey, true) &&
      ((this.stageRender.selector.passIndex >= 1 && this.stageRender.selector.passIndex <= 9) || this.stageRender.selector.passIndex == 13)) {
      //派发给selector的mousedown事件，在事件中对具体坐标进行判断
      this.stageRender.selector.render.mouseDown(evt);
    } else {
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);
      //光标所属位置是否有控件
      //有控件：分发事件到当前控件
      if (operateControls != null && operateControls.length > 0) {
        //全局变量：当前操作控件=当前控件
        let operateControl = operateControls[0];
        this.stageRender.currentOperateShape = operateControl;

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
        if (this.stage.ddInstance?.editMode == 1) {
          //当前操作状态：选择器工作中
          this.stageRender.operateState = DDeiEnumOperateState.SELECT_WORKING
        } else if (this.stage.ddInstance?.editMode == 2) {
          //当前操作状态：抓手工作中
          //记录当前的拖拽的x,y,写入dragObj作为临时变量
          let dragObj = {
            dx: ex,
            dy: ey,
          }
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
          this.stageRender.operateState = DDeiEnumOperateState.GRAB_WORKING
        }

        //当没有按下ctrl键时，清空除了当前操作控件外所有选中状态控件
        if (!isCtrl) {
          //清空所有层级的已选状态
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
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
    if (!this.model.display) {
      return;
    }
    //ctrl、alt键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    let isAlt = DDei.KEY_DOWN_STATE.get("alt");
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x * stageRatio;
    ey -= this.stage.wpv.y * stageRatio;
    //鼠标右键，显示菜单
    if (evt.button == 2) {
      //在鼠标位置显示菜单
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey);
      //显示当前控件的
      if (operateControls != null && operateControls.length > 0) {
        //全局变量：当前操作控件=当前控件
        let operateControl = operateControls[0];
        let menuJSON = DDeiUtil.getMenuConfig(operateControl);
        if (menuJSON) {
          //记录当前控件
          this.stageRender.currentMenuShape = operateControl;
          //显示菜单
          DDeiUtil.setCurrentMenu(menuJSON);
          let menuDialogId = DDeiUtil.getMenuControlId();
          let menuEle = document.getElementById(menuDialogId);
          if (menuEle) {
            menuEle.style.display = "block";
            menuEle.style.left = evt.layerX + "px";
            menuEle.style.top = evt.layerY + "px";
          }
        }
      }
      //清除临时操作点
      this.model.opPoints = [];
      this.model.shadowControls = [];
    } else {
      //判断当前操作状态
      switch (this.stageRender.operateState) {
        //控件状态确认中
        case DDeiEnumOperateState.CONTROL_CONFIRMING:
          this.model.shadowControls = [];
          this.stageRender.currentOperateShape.render.mouseUp(evt);
          //按下ctrl增加选中，或取消当前选中
          let pContainerModel = this.stageRender.currentOperateShape.pModel;
          //当前操作组合
          let pushMulits = [];
          //当前操作层级容器
          this.stageRender.currentOperateContainer = pContainerModel;
          if (isCtrl) {
            //判断当前操作控件是否选中
            if (this.stageRender.currentOperateShape.state == DDeiEnumControlState.SELECTED) {
              pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.stageRender.currentOperateShape.id, value: DDeiEnumControlState.DEFAULT }] });
            } else {
              //选中当前操作控件
              pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.stageRender.currentOperateShape.id, value: DDeiEnumControlState.SELECTED }] });
            }
          }
          //没有按下ctrl键，取消选中非当前控件
          else {
            pushMulits.push({ actionType: DDeiEnumBusCommandType.CancelCurLevelSelectedModels, data: { ignoreModels: [this.stageRender.currentOperateShape] } });
            pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.stageRender.currentOperateShape.id, value: DDeiEnumControlState.SELECTED }] });
          }
          //如果有格式刷
          if (this.stage?.brushData) {
            pushMulits.push({ actionType: DDeiEnumBusCommandType.CopyStyle, data: { models: [this.stageRender.currentOperateShape], brushData: this.stage.brushData } });
          }
          this.stage?.ddInstance?.bus?.pushMulit(pushMulits, evt);
          break;
        //选择器工作中
        case DDeiEnumOperateState.SELECT_WORKING:
          //选中被选择器包含的控件
          //当前操作数据
          let pushDatas = [];
          let includedModels: Map<string, DDeiAbstractShape> = this.stageRender.selector.getIncludedModels();
          this.stageRender.currentOperateContainer = this.model;
          includedModels.forEach((model, key) => {
            pushDatas.push({ id: model.id, value: DDeiEnumControlState.SELECTED });
          });
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, pushDatas, evt);
          break;
        //抓手工作中
        case DDeiEnumOperateState.GRAB_WORKING:

          break;
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
              //同步影子元素的坐标大小等状态到当前模型
              this.model.shadowControls.forEach(item => {
                let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                let model = this.stage?.getModelById(id)
                model.syncVectors(item)
                hasChange = true;
                operateModels.push(model)
              })
              pContainerModel?.layoutManager?.updateLayout(ex, ey, operateModels);
              operateModels?.forEach(item => {
                item.render?.controlDragEnd(evt)
              })
            }
          }
          if (hasChange) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateSelectorBounds, null, evt);
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
    if (!this.model.display) {
      return;
    }

    //ctrl、alt键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    let isAlt = DDei.KEY_DOWN_STATE.get("alt");
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    let stageRatio = this.stage.getStageRatio()
    ex -= this.stage.wpv.x * stageRatio;
    ey -= this.stage.wpv.y * stageRatio;
    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING: {
        //如果当前未按下ctrl键，并且在表格上，则认为是表格内部的拖拽

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
          //当前操作状态：控件拖拽中
          this.stageRender.operateState = DDeiEnumOperateState.CONTROL_DRAGING
          //产生影子控件
          let selectedModels = pContainerModel.getSelectedModels();
          selectedModels.forEach(m => {
            let md = DDeiUtil.getShadowControl(m);
            dragObj[md.id] = { dx: md.cpv.x - ex, dy: md.cpv.y - ey }
            this.model.shadowControls.push(md);
          });
          if (!selectedModels.has(this.stageRender.currentOperateShape?.id)) {
            let md = DDeiUtil.getShadowControl(this.stageRender.currentOperateShape)
            dragObj[md.id] = { dx: md.cpv.x - ex, dy: md.cpv.y - ey }
            this.model.shadowControls.push(md);
          }
          //将当前被拖动的控件转变为影子控件
          this.stageRender.currentOperateShape = this.model.shadowControls[this.model.shadowControls.length - 1]
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
        // //清空当前opPoints
        this.model.opPoints = [];
        //判断当前鼠标坐标是否落在选择器控件的区域内
        if (this.stageRender.selector &&
          this.stageRender.selector.isInAreaLoose(ex, ey, true)) {
          //派发给selector的mousemove事件，在事件中对具体坐标进行判断
          this.stageRender.selector.render.mouseMove(evt);
        }
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, ex, ey, true);

        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          operateControls[0].render.mouseMove(evt);
        } else if (this.stageRender.selector.passIndex == -1) {
          if (this.stage.ddInstance?.editMode == 1) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
          } else if (this.stage.ddInstance?.editMode == 2) {
            this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'grab' }, evt);
          }
        }
        if (this.stage?.brushData) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { image: 'cursor-brush' }, evt);
        }
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        break;
      }
    }
    this.stage?.ddInstance?.bus?.executeAll();
  }
}

export default DDeiLayerCanvasRender