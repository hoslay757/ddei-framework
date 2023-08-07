import DDeiConfig from '../../config.js'
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiCanvasRender from './ddei-render.js';

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
  ddRender: DDeiCanvasRender | null;

  /**
   * 当前操作图形
   */
  currentOperateShape: DDeiAbstractShape | null = null;

  /**
   * 当前操作状态
   */
  operateState: DDeiEnumOperateState = DDeiEnumOperateState.NONE;


  /**
   * 选择框控件模型
   */
  selector: DDeiSelector;
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.ddInstance.render
    this.initSelector();
  }

  /**
   * 创建图形
   */
  drawShape(): void {
    //display=2的节点，最后渲染
    let topDisplayIndex = -1;
    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      if (this.model.layers[i].display == 1) {
        this.model.layers[i].render.drawShape();
      } else if (this.model.layers[i].display == 2) {
        topDisplayIndex = i;
      }
    }
    if (topDisplayIndex != -1) {
      this.model.layers[topDisplayIndex].render.drawShape();
    }
    if (this.selector) {
      this.selector.render.drawShape();
    }
  }

  /**
   * 初始化选择器
   */
  initSelector(): void {
    if (!this.selector) {
      //创建选择框控件
      this.selector = DDeiSelector.initByJSON({
        id: this.model.id + "_inner_selector",
        border: DDeiConfig.SELECTOR.BORDER,
        fill: { default: {}, selected: {} }
      });
      this.selector.stage = this.model
      DDeiConfig.bindRender(this.selector);
      this.selector.initRender();
    }
    this.selector.resetState();
  }

  /**
   * 根据事件更新选择器位置
   * @param evt 事件
   */
  updateSelectorBounds(evt: Event): void {
    let x = this.selector.startX;
    let y = this.selector.startY;
    let width, height
    if (evt.offsetX < x) {
      width = x - evt.offsetX
      x = evt.offsetX
    } else {
      width = evt.offsetX - x
    }
    if (evt.offsetY < y) {
      height = y - evt.offsetY
      y = evt.offsetY
    } else {
      height = evt.offsetY - y
    }
    this.selector.setBounds(x, y, width, height);
  }

  /**
   * 重置选择器状态
   * @param evt 事件
   */
  resetSelectorState(evt: Event): void {
    this.selector.resetState(evt.offsetX, evt.offsetY);
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