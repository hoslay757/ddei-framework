import DDeiConfig from '../../config.js'
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiLayer from '../../models/layer.js';
import AbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
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
  ddRender: object | null;

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
    //绘制背景
    this.drawBackground();

    //绘制子元素
    this.drawChildrenShapes();
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
      for (let i in this.model.models) {
        this.model.models[i].render.drawShape();
      }
    }
  }
  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {

    // 获取当前光标所属位置是否有控件
    let operateControls = this.model.findControlsByArea(evt.offsetX, evt.offsetY);
    //光标所属位置是否有控件
    //有控件：分发事件到当前控件
    if (operateControls != null && operateControls.length > 0) {
      //全局变量：当前操作控件=当前控件
      this.stageRender.currentOperateShape = operateControls[0];
      //当前操作状态:控件状态确认中
      this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CONFIRMING
      //分发事件到当前控件
      this.stageRender.currentOperateShape.render.mouseDown(evt);
    }
    //无控件，显示选择框
    else {
      //TODO 显示控件选择框
      //TODO 全局变量：当前操作控件=选择器控件
      //当前操作状态：选择器工作中
      this.stageRender.operateState = DDeiEnumOperateState.SELECT_WORKING
    }
    //清空除了当前操作控件外所有选中状态控件
    let selectedControls = this.model.getSelectedControls();
    if (selectedControls) {
      for (let i = 0; i < selectedControls.length; i++) {
        if (this.stageRender.currentOperateShape != selectedControls[i]) {
          selectedControls[i].state = DDeiEnumControlState.DEFAULT;
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
    //判断当前操作状态
    switch (this.stageRender.operateState) {
      //控件状态确认中
      case DDeiEnumOperateState.CONTROL_CONFIRMING:
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
        //当前操作控件：无
        this.stageRender.currentOperateShape = null;
        //当前操作状态:无
        this.stageRender.operateState = DDeiEnumOperateState.NONE;
        //重新渲染
        this.ddRender.drawShape();
        break;
      //选择器工作中
      case DDeiEnumOperateState.SELECT_WORKING:

        break;
      //控件拖拽中
      case DDeiEnumOperateState.CONTROL_DRAGING:

        break;
      //默认缺省状态
      default:
        break;
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
  }
}

export default DDeiLayerCanvasRender