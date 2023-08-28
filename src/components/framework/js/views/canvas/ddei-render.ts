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
        let ctx = this.canvas.getContext('2d');
        //获取缩放比例
        let ratio = DDeiUtil.getPixelRatio(ctx);
        this.container.appendChild(this.canvas);
        this.canvas.setAttribute("style", "display:block;zoom:" + (1 / ratio));
        this.canvas.setAttribute("width", this.container.clientWidth * ratio);
        this.canvas.setAttribute("height", this.container.clientHeight * ratio);
        this.ratio = ratio;

        //向canvas绑定事件
        this.bindEvent();
        setTimeout(() => {
          this.setSize(0, 0, 1, 1);
          this.drawShape();
        }, 10);
      }
    } else {
      throw new Error("容器" + this.model.containerid + "不存在");
    }
  }

  /** 
   * 重新设置大小
  */
  setSize(width: number = 0, height: number = 0, deltaX: number = 0, deltaY: number = 0): void {
    if (!width || width == 0) {
      width = this.container.clientWidth;
    }
    width += deltaX;
    if (!height || height == 0) {
      height = this.container.clientHeight;
    }
    height += deltaY;
    this.canvas.setAttribute("width", width * this.ratio);
    this.canvas.setAttribute("height", height * this.ratio);
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

    // //绑定鼠标按下事件
    // this.canvas.addEventListener('mousedown', (evt: Event) => {
    //   this.mouseDown(evt)
    // });

    // //绑定鼠标弹起事件
    // this.canvas.addEventListener('mouseup', (evt: Event) => {
    //   this.mouseUp(evt)
    // });

    // //绑定鼠标移动事件
    // this.canvas.addEventListener('mousemove', (evt: Event) => {
    //   this.mouseMove(evt)
    // });


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
}

export default DDeiCanvasRender