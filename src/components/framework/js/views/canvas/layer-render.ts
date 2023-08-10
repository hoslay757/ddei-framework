import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiLayer from '../../models/layer.js';
import DDeiSelector from '../../models/selector.js';
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
  // ============================== 属性 ===============================
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
      bgInfo = this.model.background ? this.model.background : DDeiConfig.LAYER.BACKGROUND;
    } else {
      bgInfo = this.model.background ? this.model.background : DDeiConfig.LAYER.NORMAL;
    }
    //绘制无背景
    if (!bgInfo || !bgInfo.type || bgInfo.type == 0) {
    }
    // 绘制纯色背景
    else if (bgInfo.type == 1) {
      ctx.fillStyle = bgInfo.bgcolor
      //透明度
      if (bgInfo.opacity) {
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
      if (bgInfo.opacity) {
        ctx.globalAlpha = bgInfo.opacity
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 1 * ratio;
      let r20 = ratio * 20;
      let r40 = ratio * 40;
      for (let x = 0; x <= canvas.width; x = x + r20) {
        ctx.beginPath();
        if (x % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(220,220,220)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(240,240,240)";
        }
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y = y + r20) {
        ctx.beginPath();
        if (y % r40 == 0) {
          ctx.setLineDash([]);
          ctx.strokeStyle = "rgb(220,220,220)";
        } else {
          ctx.setLineDash([3, 1]);
          ctx.strokeStyle = "rgb(240,240,240)";
        }
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    //恢复状态
    ctx.restore();
  }


  /**
   * 绘制子元素
   */
  drawChildrenShapes(): void {
    if (this.model.models) {
      //遍历子元素，绘制子元素
      this.model.models.forEach((item, key) => {
        item.render.drawShape();
      });
    }
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
    if (movedBounds.x < 0) {
      movedBounds.x = 0
    }
    if (movedBounds.y < 0) {
      movedBounds.y = 0
    }
    return movedBounds
  }

  /**
   * 获取单个点移动后的坐标
   * 考虑最小移动像素
   * @param evt 事件
   * @returns 计算的坐标
   */
  getMovedPosition(evt): object {
    //获取移动后的坐标
    let movedBounds = {
      x: evt.offsetX - this.stageRender.dragObj.x,
      y: evt.offsetY - this.stageRender.dragObj.y
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
      ctx.fillText(bounds.x + "," + bounds.y, bounds.x * ratio - 30, bounds.y * ratio - 30);
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
    //只有当显示时才绘制图层
    if (!this.model.display) {
      return
    }
    //ctrl键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    //判断当前鼠标坐标是否落在选择器控件的区域内
    if (this.stageRender.selector &&
      this.stageRender.selector.passIndex >= 1 && this.stageRender.selector.passIndex <= 9) {
      //派发给selector的mousemove事件，在事件中对具体坐标进行判断
      this.stageRender.selector.render.mouseDown(evt);
    } else {
      // 获取当前光标所属位置是否有控件
      let operateControls = this.model.findModelsByArea(evt.offsetX, evt.offsetY);
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

        //没有按下ctrl键，并且当前操作控件不在选中控件中，则清空所有当前选中控件
        if (!isCtrl) {
          let selectedModels = this.model.getSelectedModels();
          if (!selectedModels.has(operateControl.id)) {
            //清空除了当前操作控件外所有选中状态控件
            this.model.cancelSelectModels();
            if (this.stageRender.selector) {
              this.stageRender.selector.resetState();
            }
          }
        }
      }
      //无控件
      else {
        //重置选择器位置
        this.stageRender.selector.resetState(evt.offsetX, evt.offsetY);
        //当前操作状态：选择器工作中
        this.stageRender.operateState = DDeiEnumOperateState.SELECT_WORKING
        //当没有按下ctrl键时，清空除了当前操作控件外所有选中状态控件
        if (!isCtrl) {
          this.model.cancelSelectModels();
        }
      }
    }


    //重新渲染
    this.ddRender.drawShape();
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    //只有当显示时才绘制图层
    if (!this.model.display) {
      return;
    }
    //ctrl键的按下状态
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING:
        //按下ctrl增加选中，或取消当前选中
        if (isCtrl) {
          //判断当前操作控件是否选中
          if (this.stageRender.currentOperateShape.state == DDeiEnumControlState.SELECTED) {
            //取消选中当前操作控件
            this.stageRender.currentOperateShape.state = DDeiEnumControlState.DEFAULT;
            //全局变量：当前操作控件=空
            this.stageRender.currentOperateShape = null;
          } else {
            //选中当前操作控件
            this.stageRender.currentOperateShape.state = DDeiEnumControlState.SELECTED;
          }
        }
        //没有按下ctrl键，取消选中非当前控件
        else {
          //清空除了当前操作控件外所有选中状态控件
          this.model.cancelSelectModels();
          this.stageRender.currentOperateShape.state = DDeiEnumControlState.SELECTED;
        }
        //当前操作控件：无
        this.stageRender.currentOperateShape = null;
        //根据选中图形的状态更新选择器
        if (this.stageRender.selector) {
          this.stageRender.selector.updatedBoundsBySelectedModels();
        }
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        break;
      //选择器工作中
      case DDeiEnumOperateState.SELECT_WORKING:
        if (this.stageRender.selector) {
          //选中被选择器包含的控件
          let includedModels: Map<string, DDeiAbstractShape> = this.stageRender.selector.getIncludedModels();
          includedModels.forEach((model, key) => {
            model.state = DDeiEnumControlState.SELECTED;
          });
          //根据选中图形的状态更新选择器
          this.stageRender.selector.updatedBoundsBySelectedModels();
          //重新渲染
          this.ddRender.drawShape();
        }
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        break;
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING:
        //清除作为临时变量dragX、dargY、dragObj
        this.stageRender.dragObj = null
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        //当前操作控件：无
        this.stageRender.currentOperateShape = null;
        //重新渲染
        this.ddRender.drawShape();
        break;
      case DDeiEnumOperateState.CONTROL_CHANGING_BOUND:
        //清除作为临时变量dragX、dargY、dragObj
        this.stageRender.dragObj = null
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        //当前操作控件：无
        this.stageRender.currentOperateShape = null;
        //重新渲染
        this.ddRender.drawShape();
        break;
      case DDeiEnumOperateState.CONTROL_ROTATE:
        //清除作为临时变量dragX、dargY、dragObj
        this.stageRender.dragObj = null
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        //当前操作控件：无
        this.stageRender.currentOperateShape = null;
        //重新渲染
        this.ddRender.drawShape();
        break;
      //默认缺省状态
      default:
        break;
    }
    //重新渲染
    this.ddRender.drawShape();
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //只有当显示时才绘制图层
    if (!this.model.display) {
      return;
    }
    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING: {
        //当前操作状态：控件拖拽中
        this.stageRender.operateState = DDeiEnumOperateState.CONTROL_DRAGING
        //记录当前的拖拽的x,y,写入dragObj作为临时变量
        this.stageRender.dragObj = {
          x: this.stageRender.currentOperateShape.x - evt.offsetX,
          y: this.stageRender.currentOperateShape.y - evt.offsetY,
          model: this.stageRender.currentOperateShape
        }
        break;
      }
      //选择器工作中
      case DDeiEnumOperateState.SELECT_WORKING: {
        //根据事件更新选择器位置
        this.stageRender.updateSelectorBounds(evt);
        //重新渲染
        this.ddRender.drawShape();
        break;
      }
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING: {
        //修改当前操作控件坐标
        let movedBounds = this.getMovedBounds(evt, this.stageRender.currentOperateShape);
        //获取当前选择的控件
        let selectedModels = this.model.getSelectedModels();
        //修改所有当前选中控件的坐标
        let deltaX = movedBounds.x - this.stageRender.currentOperateShape.x
        let deltaY = movedBounds.y - this.stageRender.currentOperateShape.y
        selectedModels.forEach((item, key) => {
          item.setPosition(item.x + deltaX, item.y + deltaY)
        });
        this.stageRender.currentOperateShape.setPosition(movedBounds.x, movedBounds.y)
        //根据选中图形的状态更新选择器
        if (this.stageRender.selector) {
          this.stageRender.selector.updatedBoundsBySelectedModels();
        }
        //重新渲染
        this.ddRender.drawShape();
        //显示辅助对齐线、坐标文本等图形
        selectedModels.set(this.stageRender.currentOperateShape?.id, this.stageRender.currentOperateShape)
        this.drawHelpLines(movedBounds, selectedModels);
        break;
      }
      //控件改变大小中
      case DDeiEnumOperateState.CONTROL_CHANGING_BOUND: {
        //获取当前移动的坐标量
        let movedPos = this.getMovedPosition(evt);
        //计算移动后的坐标以及大小
        let movedBounds = this.stageRender.selector.getMovedBounds(movedPos.x, movedPos.y);
        if (movedBounds) {
          let successChange = this.stageRender.selector.changeSelectedModelBounds(movedBounds);
          if (successChange) {
            this.stageRender.dragObj.x = this.stageRender.dragObj.x + movedPos.x
            this.stageRender.dragObj.y = this.stageRender.dragObj.y + movedPos.y
            //更新选择器状态
            this.stageRender.selector.updatedBoundsBySelectedModels();
            //重新渲染
            this.ddRender.drawShape();
          }
        }

        break;
      }
      //控件旋转
      case DDeiEnumOperateState.CONTROL_ROTATE: {
        //获取当前移动的坐标量
        let movedPos = this.getMovedPosition(evt);
        if (movedPos.x != 0) {
          //更改已选择控件的旋转
          this.stageRender.selector.changeSelectedModelRotate(movedPos.x);
          this.stageRender.dragObj.x = this.stageRender.dragObj.x + movedPos.x
          //重新渲染
          this.ddRender.drawShape();
        }
        break;
      }
      //默认缺省状态
      default: {
        //判断当前鼠标坐标是否落在选择器控件的区域内
        if (this.stageRender.selector &&
          this.stageRender.selector.isInAreaLoose(evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2)) {
          //派发给selector的mousemove事件，在事件中对具体坐标进行判断
          this.stageRender.selector.render.mouseMove(evt);
        }
        else {
          //恢复鼠标等状态
          document.body.style.cursor = 'default';
        }
        break;
      }
    }
  }
}

export default DDeiLayerCanvasRender