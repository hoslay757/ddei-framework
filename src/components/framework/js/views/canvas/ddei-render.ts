import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
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
   * 鼠标移动
   */
  keyDown(evt: Event): void {
    //获取是否按下ctrl、command、alt、shift等键
    let ctrl = evt.ctrlKey || evt.metaKey;
    let shift = evt.shiftKey;
    let alt = evt.altKey
    let m1Str = "_"
    if (ctrl == true) {
      m1Str += "ctrl_"
    }
    if (shift == true) {
      m1Str += "shift_"
    }
    if (alt == true) {
      m1Str += "alt_"
    }
    if (evt.keyCode != 93 && evt.keyCode != 18 && evt.keyCode != 16 && evt.keyCode != 17) {
      m1Str += evt.keyCode
    }
    console.log(m1Str)
    //执行下发逻
    for (let it = 0; it < DDeiConfig.HOT_KEY_MAPPING.length; it++) {
      let item = DDeiConfig.HOT_KEY_MAPPING[it];
      let matchStr = "_"
      if (item.ctrl == true) {
        matchStr += "ctrl_"
      }
      if (item.shift == true) {
        matchStr += "shift_"
      }
      if (item.alt == true) {
        matchStr += "alt_"
      }
      if (item.keys) {
        matchStr += item.keys
      }
      //如果匹配则下发
      if (m1Str == matchStr) {
        item.action.action(evt);
        break;
      }
    };

  }
}

export default DDeiCanvasRender