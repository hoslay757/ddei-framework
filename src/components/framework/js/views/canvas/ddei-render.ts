import DDeiConfig from '../../config.js';
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
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
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiCanvasRender {
    return new DDeiCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiCanvasRender";
  /**
   * 当前对应模型
   */
  model: DDei;
  /**
   * 当前画布
   */
  canvas: object | null = null;
  /**
   * 当前临时画布
   */
  tempCanvas: object | null = null;

  //屏幕缩放比例
  ratio: number = 1.0;

  //屏幕DPI
  dpi: object | null = null;

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
        this.realCanvas = document.createElement("canvas");
        this.realCanvas.setAttribute("id", this.model.id + "_canvas");
        //获得 2d 上下文对象
        let ctx = this.realCanvas.getContext('2d');
        //获取缩放比例
        let ratio = DDeiUtil.getPixelRatio(ctx);
        this.container.appendChild(this.realCanvas);
        //检测是否支持离屏渲染特性
        try {
          if (OffscreenCanvas) {
            this.isSupportOffScreen = false;
          }
        } catch (e) { }
        if (this.isSupportOffScreen) {
          this.canvas = new OffscreenCanvas(this.container.clientWidth * ratio, this.container.clientHeight * ratio);
        } else {
          this.canvas = this.realCanvas
        }
        this.realCanvas.setAttribute("style", "-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
        this.realCanvas.setAttribute("width", this.container.clientWidth * ratio);
        this.realCanvas.setAttribute("height", this.container.clientHeight * ratio);

        this.ratio = ratio;

        //获取dpi
        this.dpi = DDeiUtil.getDPI();

        //向canvas绑定事件
        this.bindEvent();
      }
    } else {
      throw new Error("容器" + this.model.containerid + "不存在");
    }
  }

  /**
   * 获取当前画布
   */
  getCanvas(): object {
    if (this.tempCanvas) {
      return this.tempCanvas;
    }
    return this.canvas;
  }
  /**
   * 显示
   */
  show(): void {
    document.getElementById(this.model.containerid).style.display = "block";
  }

  /**
   * 隐藏
   */
  hidden(): void {
    document.getElementById(this.model.containerid).style.display = "none";
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
    this.realCanvas.setAttribute("width", width * this.ratio);
    this.realCanvas.setAttribute("height", height * this.ratio);
    this.canvas.width = width * this.ratio;
    this.canvas.height = height * this.ratio;
  }

  /**
   * 绘制图形
   */
  drawShape(): void {
    if (this.model.stage) {

      if (this.model.stage.render?.refresh) {
        this.model.stage.render.drawShape();
        if (this.isSupportOffScreen) {
          const imageBitmap = this.canvas.transferToImageBitmap();
          let ctx = this.realCanvas.getContext('2d');
          ctx.drawImage(imageBitmap, 0, 0);
        }
        this.model.stage.drawing = false;
        this.model.stage.render.refresh = false;
      }
    } else {
      throw new Error("当前实例未加载舞台模型，无法渲染图形");
    }
  }
  // ============================== 事件 ===============================
  /**
   * 绑定事件
   */
  bindEvent(): void {
    setInterval(() => {
      this.model.stage.drawing = true;
      this.drawShape();
    }, 20)
  }

  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    this.model.eventCancel = false;
    //下发事件到stage
    this.model.stage.render.mouseDown(evt);
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    this.model.eventCancel = false;
    this.model.stage.render.mouseUp(evt);
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    let ex = evt.offsetX;
    let ey = evt.offsetY;
    let sx = evt.screenX;
    let sy = evt.screenY;
    let stage = this.model.stage
    let stageRatio = stage.getStageRatio()
    ex -= stage.wpv.x;
    ey -= stage.wpv.y;
    sx -= stage.wpv.x;
    sy -= stage.wpv.y;
    DDeiUtil.setMousePosition(ex, ey, sx, sy);
    this.model.eventCancel = false;
    this.model.stage.render.mouseMove(evt);
  }


  /**
   * 鼠标滚轮或滑动事件
   */
  mouseWheel(evt: Event) {
    //放大缩小
    if (evt.wheelDeltaY == 240 || evt.wheelDeltaY == -240) {
      this.mouseScale(evt.wheelDeltaY, evt)
    }
    //滚动平移
    else if (evt.wheelDeltaX || evt.wheelDeltaY) {
      let dx = 0
      let dy = 0
      if (Math.abs(evt.wheelDeltaX) > Math.abs(evt.wheelDeltaY)) {
        dx = evt.wheelDeltaX
      } else {
        dy = evt.wheelDeltaY
      }
      this.mouseWPV(dx, dy, evt)
    }

  }



  /**
   * 通过鼠标放大或缩小
   */
  mouseScale(delta: number, evt: Event) {
    let stage = this.model.stage;
    if (stage) {
      let ratio = stage.getStageRatio()
      let newValue = ratio
      if (delta > 0) {
        newValue = ratio + 0.02
      } else {
        newValue = ratio - 0.02
      }
      if (newValue < 0.1) {
        newValue = 0.1
      } else if (newValue > 10) {
        newValue = 10
      }
      if (newValue != ratio) {
        stage.setStageRatio(newValue);
      }


    }
  }

  /**
   * 通过鼠标平移窗体
   */
  mouseWPV(dx: number, dy: number, evt: Event) {
    let stage = this.model.stage;
    let stageRatio = stage.getStageRatio();
    if (stage) {
      let maxMove = 50 * stageRatio
      if (dx > maxMove) {
        dx = maxMove
      } else if (dx < -maxMove) {
        dx = -maxMove
      }
      if (dy > maxMove) {
        dy = maxMove
      } else if (dy < -maxMove) {
        dy = -maxMove
      }

      this.model.bus.push(DDeiEnumBusCommandType.ChangeStageWPV, {
        dragObj: { dx: 0, dy: 0 }, x: dx, y: dy
      })
      this.model.bus.executeAll();
    }
  }
}

export default DDeiCanvasRender