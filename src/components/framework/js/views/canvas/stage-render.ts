import DDeiConfig from '../../config.js'
import DDeiEnumOperateState from '../../enums/operate-state.js';
import AbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';

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

  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDeiStage;
  /**
   * 当前的ddei实例
   */
  ddRender: object | null;

  /**
   * 当前操作图形
   */
  currentOperateShape: AbstractShape | null = null;

  /**
   * 当前操作状态
   */
  operateState: DDeiEnumOperateState = DDeiEnumOperateState.NONE;
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.ddInstance.render
  }

  /**
   * 创建图形
   */
  drawShape(): void {
    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      this.model.layers[i].render.drawShape();
    }
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    //分发到当前图层的mouseDown
    this.model.layers[this.model.layerIndex].render.mouseDown(evt);
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    //分发到当前图层的mouseUp
    this.model.layers[this.model.layerIndex].render.mouseUp(evt);
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //分发到当前图层的mouseUp
    this.model.layers[this.model.layerIndex].render.mouseMove(evt);
  }
}

export default DDeiStageCanvasRender