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
      if (this.helpLines && this.helpLines.bounds && this.helpLines.models) {
        this.drawHelpLines(this.helpLines.bounds, this.helpLines.models)
        this.helpLines = null
      }

    }
  }




  /**
   * 绘制背景
   */
  drawBackground(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //保存状态
    ctx.save();

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
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 1;
      let r20 = ratio * 20;
      let r40 = ratio * 40;
      let offsetWidth = 0.5;
      for (let x = 0; x <= canvas.width; x = x + r20) {

        ctx.beginPath();
        if (x % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(210,210,210)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(220,220,220)";
        }
        ctx.moveTo(x + offsetWidth, offsetWidth);
        ctx.lineTo(x + offsetWidth, canvas.height + offsetWidth);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y = y + r20) {
        ctx.beginPath();
        if (y % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(210,210,210)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(220,220,220)";
        }
        ctx.moveTo(offsetWidth, y + offsetWidth);
        ctx.lineTo(canvas.width + offsetWidth, y + offsetWidth);
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
      let canvas = this.ddRender.canvas;
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;

      this.model.shadowControls.forEach(item => {
        //保存状态
        ctx.save();
        //找到实际图形的旋转关系，进行旋转变换，然后再进行绘制
        let pModelList = []
        //转换为缩放后的坐标
        let lm = item.pModel
        while (lm && lm.modelType != 'DDeiLayer') {
          pModelList.push(lm)
          lm = lm.pModel;
        }
        pModelList.forEach(pm => {
          let ratPos = pm.render.getBorderRatPos();
          pm.render.doRotate(ctx, ratPos)
        })

        item.render.drawShape();
        let pvs = item.currentPointVectors;
        item.pointVectors = null;
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
      //遍历子元素，绘制子元素
      this.model.midList.forEach(key => {
        let item = this.model.models.get(key);
        item.render.drawShape();
      });
    }
  }

  /**
   * 绘制操作点
   */
  drawOpPoints(): void {
    if (this.model?.opPoints?.length > 0) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.canvas;
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
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
      let canvas = this.ddRender.canvas;
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
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
   * 获取控件移动后的区域
   * 考虑最小移动像素
   * @param e 事件
   * @param control 当前控件模型
   * @returns 计算的坐标
   */
  getMovedBounds(evt, control: DDeiAbstractShape): object {
    //获取移动后的坐标
    let movedBounds = {
      x: evt.offsetX + this.stageRender.dragObj.x,
      y: evt.offsetY + this.stageRender.dragObj.y,
      width: control.width,
      height: control.height
    }


    // 计算图形拖拽后将要到达的坐标
    if (DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
      //辅助对齐线宽度
      let helpLineWeight = DDeiConfig.GLOBAL_HELP_LINE_WEIGHT;

      var mod = movedBounds.x % helpLineWeight
      if (mod > helpLineWeight * 0.5) {
        movedBounds.x = movedBounds.x + (helpLineWeight - mod)
      } else {
        movedBounds.x = movedBounds.x - mod
      }
      mod = movedBounds.y % helpLineWeight
      if (mod > helpLineWeight * 0.5) {
        movedBounds.y = movedBounds.y + (helpLineWeight - mod)
      } else {
        movedBounds.y = movedBounds.y - mod
      }
    }
    return movedBounds
  }

  /**
   * 获取单个点移动后的坐标增量
   * 考虑最小移动像素
   * @param evt 事件
   * @returns 计算的坐标增量
   */
  getMovedPositionDelta(evt): object {

    //获取移动后的坐标
    let movedBounds = {
      x: evt.offsetX - this.stageRender.dragObj.x,
      y: evt.offsetY - this.stageRender.dragObj.y
    }
    return movedBounds
  }

  /**
  * 显示辅助对齐线以及文本
  * @param bounds 当前碰撞边框
  */
  drawHelpLines(bounds, models): void {
    // 未开启主线提示，则不再计算辅助线提示定位
    if (DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.canvas;
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;
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
      ctx.fillText(bounds.x.toFixed(0) + "," + bounds.y.toFixed(0), bounds.x.toFixed(0) * ratio - 30, bounds.y.toFixed(0) * ratio - 30);
      // 计算对齐辅助线
      if (DDeiConfig.GLOBAL_HELP_LINE_ALIGN_ENABLE) {
        // 获取对齐的模型
        const { leftAlignModels, rightAlignModels, topAlignModels,
          bottomAlignModels, horizontalCenterAlignModels,
          verticalCenterAlignModels } = this.stage.getAlignModels(bounds, models)
        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = 1 * ratio / 2;
        ctx.lineWidth = 1 * ratio;
        //线段、虚线样式
        ctx.setLineDash([0, 1 * ratio, 1 * ratio]);
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(DDeiConfig.GLOBAL_HELP_LINE_ALIGN_COLOR);
        if (leftAlignModels && leftAlignModels.length > 0) {
          // 显示左侧对齐线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...leftAlignModels);
          let startY, endY;
          if (mp.y < bounds.y) {
            startY = mp.y - 50
            endY = bounds.y + bounds.height + 50
          } else {
            startY = bounds.y - 50
            endY = mp.y + mp.height + 50
          }
          ctx.moveTo(bounds.x * ratio, startY * ratio + lineOffset);
          ctx.lineTo(bounds.x * ratio, endY * ratio + lineOffset);
          ctx.stroke();
        }
        if (rightAlignModels && rightAlignModels.length > 0) {
          // 显示右侧对齐线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...rightAlignModels);
          let startY, endY;
          if (mp.y < bounds.y) {
            startY = mp.y - 50
            endY = bounds.y + bounds.height + 50
          } else {
            startY = bounds.y - 50
            endY = mp.y + mp.height + 50
          }
          ctx.moveTo((bounds.x + bounds.width) * ratio, startY * ratio + lineOffset);
          ctx.lineTo((bounds.x + bounds.width) * ratio, endY * ratio + lineOffset);
          ctx.stroke();
        }
        if (topAlignModels && topAlignModels.length > 0) {
          // 显示上侧对齐线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...topAlignModels);
          let startX, endX;
          if (mp.x < bounds.x) {
            startX = mp.x - 50
            endX = bounds.x + bounds.width + 50
          } else {
            startX = bounds.x - 50
            endX = mp.x + mp.width + 50
          }
          ctx.moveTo(startX * ratio + lineOffset, bounds.y * ratio);
          ctx.lineTo(endX * ratio + lineOffset, bounds.y * ratio);
          ctx.stroke();
        }
        if (bottomAlignModels && bottomAlignModels.length > 0) {
          // 显示下侧对齐线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...bottomAlignModels);
          let startX, endX;
          if (mp.x < bounds.x) {
            startX = mp.x - 50
            endX = bounds.x + bounds.width + 50
          } else {
            startX = bounds.x - 50
            endX = mp.x + mp.width + 50
          }
          ctx.moveTo(startX * ratio + lineOffset, (bounds.y + bounds.height) * ratio);
          ctx.lineTo(endX * ratio + lineOffset, (bounds.y + bounds.height) * ratio);
          ctx.stroke();
        }
        if (horizontalCenterAlignModels && horizontalCenterAlignModels.length > 0) {
          // 显示水平居中对齐的线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...horizontalCenterAlignModels);
          let startX, endX;
          if (mp.x < bounds.x) {
            startX = mp.x - 50
            endX = bounds.x + bounds.width + 50
          } else {
            startX = bounds.x - 50
            endX = mp.x + mp.width + 50
          }
          ctx.moveTo(startX * ratio + lineOffset, (bounds.y + bounds.height / 2) * ratio);
          ctx.lineTo(endX * ratio + lineOffset, (bounds.y + bounds.height / 2) * ratio);
          ctx.stroke();
        }
        if (verticalCenterAlignModels && verticalCenterAlignModels.length > 0) {
          // 显示垂直居中对齐的线
          ctx.beginPath();
          let mp = DDeiAbstractShape.getModelsPosition(bounds, ...verticalCenterAlignModels);
          let startY, endY;
          if (mp.y < bounds.y) {
            startY = mp.y - 50
            endY = bounds.y + bounds.height + 50
          } else {
            startY = bounds.y - 50
            endY = mp.y + mp.height + 50
          }
          ctx.moveTo((bounds.x + bounds.width / 2) * ratio, startY * ratio + lineOffset);
          ctx.lineTo((bounds.x + bounds.width / 2) * ratio, endY * ratio + lineOffset);
          ctx.stroke();
        }
      }


      //恢复状态
      ctx.restore();
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
    if (this.stageRender.selector && this.stageRender.selector.isInAreaLoose(evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2) &&
      ((this.stageRender.selector.passIndex >= 1 && this.stageRender.selector.passIndex <= 9) || this.stageRender.selector.passIndex == 13)) {
      //派发给selector的mousedown事件，在事件中对具体坐标进行判断
      this.stageRender.selector.render.mouseDown(evt);
    } else {
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2);
      //光标所属位置是否有控件
      //有控件：分发事件到当前控件
      if (operateControls != null && operateControls.length > 0) {
        console.log(operateControls)
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
        //重置选择器位置
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ResetSelectorState, { x: evt.offsetX, y: evt.offsetY }, evt);
        //当前操作状态：选择器工作中
        this.stageRender.operateState = DDeiEnumOperateState.SELECT_WORKING
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
    //鼠标右键，显示菜单
    if (evt.button == 2) {
      //在鼠标位置显示菜单
      // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
      let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, evt.offsetX, evt.offsetY);
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
            pushDatas[pushDatas.length] = { id: model.id, value: DDeiEnumControlState.SELECTED };
          });
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, pushDatas, evt);
          break;
        //控件拖拽中
        case DDeiEnumOperateState.CONTROL_DRAGING:

          let isStop = false;
          //如果按下了ctrl键，则需要修改容器的关系并更新样式
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] = DDeiAbstractShape.findBottomContainersByArea(this.model, evt.offsetX, evt.offsetY);
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
              if (!lastOnContainer.layoutManager || lastOnContainer.layoutManager.canAppend(evt.offsetX, evt.offsetY, this.model.shadowControls)) {
                let operateModels = []
                //同步影子元素的坐标大小等状态到当前模型
                this.model.shadowControls.forEach(item => {
                  let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                  let model = this.stage?.getModelById(id)
                  model.rotate = item.rotate
                  model.dragOriginWidth = model.width;
                  model.dragOriginHeight = model.height;
                  model.dragOriginX = model.x;
                  model.dragOriginY = model.y;
                  model.setBounds(item.x, item.y, item.width, item.height)
                  model.currentPointVectors = item.currentPointVectors
                  model.centerPointVector = item.centerPointVector
                  operateModels.push(model)
                })
                //构造移动容器action数据
                this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: pContainerModel, newContainer: lastOnContainer, models: operateModels }, evt);
              }
              isStop = true;
            }
          }
          if (!isStop) {
            let pContainerModel = this.stageRender.currentOperateShape.pModel;
            if (!pContainerModel.layoutManager || pContainerModel.layoutManager.canChangePosition(evt.offsetX, evt.offsetY, this.model.shadowControls)) {
              let operateModels = []
              //同步影子元素的坐标大小等状态到当前模型
              this.model.shadowControls.forEach(item => {
                let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
                let model = this.stage?.getModelById(id)
                model.rotate = item.rotate
                model.dragOriginWidth = model.width;
                model.dragOriginHeight = model.height;
                model.dragOriginX = model.x;
                model.dragOriginY = model.y;
                model.setBounds(item.x, item.y, item.width, item.height)
                model.currentPointVectors = item.currentPointVectors
                model.centerPointVector = item.centerPointVector
                operateModels.push(model)
              })
              pContainerModel?.layoutManager?.updateLayout(evt.offsetX, evt.offsetY, operateModels);
            }
          }

          this.model.shadowControls = [];

          break;
        //表格内部拖拽中
        case DDeiEnumOperateState.TABLE_INNER_DRAG:
          let table = this.stageRender.currentOperateShape
          table?.render?.mouseUp(evt)

          break;
        case DDeiEnumOperateState.CONTROL_ROTATE:

          break;
        case DDeiEnumOperateState.CONTROL_CHANGING_BOUND:
          //同步影子元素的坐标大小等状态到当前模型
          this.model.shadowControls.forEach(item => {
            let id = item.id.substring(item.id, item.id.lastIndexOf("_shadow"))
            let model = this.stage?.getModelById(id)
            if (model) {
              model.setBounds(item.x, item.y, item.width, item.height)
              model.rotate = item.rotate
              model.currentPointVectors = item.currentPointVectors
              model.centerPointVector = item.centerPointVector
              if (model.changeChildrenBounds) {
                model.changeChildrenBounds();
              }
            }
          })
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
        let selectSize = pContainerModel.getSelectedModels().size;
        let centerPointVector = null;
        if (selectSize > 1) {
          centerPointVector = this.stageRender.selector.centerPointVector;
        } else {
          centerPointVector = this.stageRender.currentOperateShape?.centerPointVector;
        }

        //记录当前的拖拽的x,y,写入dragObj作为临时变量
        let dragObj = {
          x: evt.offsetX,
          y: evt.offsetY,
          dx: centerPointVector.x - evt.offsetX,//鼠标在控件中心坐标的增量位置
          dy: centerPointVector.y - evt.offsetY,
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
            this.model.shadowControls.push(md);
          });
          if (!selectedModels.has(this.stageRender.currentOperateShape?.id)) {
            let md = DDeiUtil.getShadowControl(this.stageRender.currentOperateShape)
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
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING: {

        //当前控件的上层控件
        let pContainerModel = this.stageRender.currentOperateShape.pModel;
        if (pContainerModel) {
          let pushData = { x: evt.offsetX, y: evt.offsetY, dx: this.stageRender.dragObj.dx, dy: this.stageRender.dragObj.dy, models: this.model.shadowControls, changeContainer: isAlt };
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers = DDeiAbstractShape.findBottomContainersByArea(this.model, evt.offsetX, evt.offsetY);
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
          //修改所有选中控件坐标
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangePosition, pushData, evt);
          //修改辅助线
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls }, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
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
        let movedBounds = this.stageRender.selector.render.getMovedBounds(evt.offsetX, evt.offsetY, isCtrl);
        if (movedBounds) {
          let selector = this.stageRender.selector;
          let pushData = { x: evt.offsetX, y: evt.offsetY, dx: this.stageRender.dragObj.dx, dy: this.stageRender.dragObj.dy, deltaX: movedBounds.x - selector.x, deltaY: movedBounds.y - selector.y, deltaWidth: movedBounds.width - selector.width, deltaHeight: movedBounds.height - selector.height, selector: selector, models: this.model.shadowControls };
          this.model.opPoints = [];
          //更新dragObj临时变量中的数值,确保坐标对应关系一致
          //修改所有选中控件坐标
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeBounds, pushData, evt);
          //修改辅助线
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.model.shadowControls }, evt);
          //渲染图形
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
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
          this.stageRender.selector.isInAreaLoose(evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2)) {
          //派发给selector的mousemove事件，在事件中对具体坐标进行判断
          this.stageRender.selector.render.mouseMove(evt);
        }
        // 获取光标，在当前操作层级的控件,后续所有的操作都围绕当前层级控件展开
        let operateControls = DDeiAbstractShape.findBottomModelsByArea(this.model, evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2);

        //光标所属位置是否有控件
        //有控件：分发事件到当前控件
        if (operateControls != null && operateControls.length > 0) {
          operateControls[0].render.mouseMove(evt);
        } else if (this.stageRender.selector.passIndex == -1) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' }, evt);
        }
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        break;
      }
    }
    this.stage?.ddInstance?.bus?.executeAll();
  }
}

export default DDeiLayerCanvasRender