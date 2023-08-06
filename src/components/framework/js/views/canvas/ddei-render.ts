import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiKeyAction from '../../hotkeys/key-action.js';
import DDeiUtil from '../../util.js'

/**
 * DDei图形框架的渲染器类，用于渲染图形框架
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
  }

  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDei;

  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    //在容器上创建画布，画布用来渲染图形
    this.container = document.getElementById(this.model.containerid);
    if (this.container) {
      if (this.container.children.length > 0) {
        throw new Error("容器" + this.containerid + "已拥有元素，不能创建画布");
      } else {
        //创建容器
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", this.model.id + "_canvas");
        //获得 2d 上下文对象
        var ctx = this.canvas.getContext('2d');
        //获取缩放比例
        let ratio = DDeiUtil.getPixelRatio(ctx);
        this.canvas.setAttribute("style", "zoom:" + (1 / ratio));
        this.canvas.setAttribute("width", this.container.clientWidth * ratio);
        this.canvas.setAttribute("height", this.container.clientHeight * ratio);
        this.ratio = ratio;
        this.container.appendChild(this.canvas);
        //向canvas绑定事件
        this.bindEvent();
      }
    } else {
      throw new Error("容器" + this.model.containerid + "不存在");
    }
  }


  /**
   * 绘制图形
   */
  drawShape(): void {
    if (this.model.stage) {
      this.model.stage.render.drawShape();
    } else {
      throw new Error("当前实例未加载舞台模型，无法渲染图形");
    }
  }
  // ============================== 事件 ===============================
  /**
   * 绑定事件
   */
  bindEvent(): void {

    //绑定鼠标按下事件
    this.canvas.addEventListener('mousedown', (evt: Event) => {
      this.mouseDown(evt)
    });

    //绑定鼠标弹起事件
    this.canvas.addEventListener('mouseup', (evt: Event) => {
      this.mouseUp(evt)
    });

    //绑定鼠标移动事件
    this.canvas.addEventListener('mousemove', (evt: Event) => {
      this.mouseMove(evt)
    });

    //绑定键盘事件
    document.addEventListener('keydown', (evt: Event) => {
      this.keyDown(evt)
    });
    document.addEventListener('keyup', (evt: Event) => {
      this.keyUp(evt)
    });
  }

  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    //下发事件到stage
    this.model.stage.render.mouseDown(evt);
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    this.model.stage.render.mouseUp(evt);
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    this.model.stage.render.mouseMove(evt);
  }

  /**
   * 键盘按下
   */
  keyDown(evt: Event): void {
    DDeiKeyAction.route(evt, this.model)
  }

  /**
   * 键盘弹起
   */
  keyUp(evt: Event): void {
    let ctrl = evt.ctrlKey || evt.metaKey;
    let shift = evt.shiftKey;
    let alt = evt.altKey
    let m1Str = "_"
    if (ctrl != true) {
      DDei.KEY_DOWN_STATE.set("ctrl", false);
    }
    if (shift != true) {
      m1Str += "shift_"
      DDei.KEY_DOWN_STATE.set("shift", false);
    }
    if (alt != true) {
      m1Str += "alt_"
      DDei.KEY_DOWN_STATE.set("alt", false);
    }
    DDei.KEY_DOWN_STATE.set("" + evt.keyCode, false);
  }
}

export default DDeiCanvasRender