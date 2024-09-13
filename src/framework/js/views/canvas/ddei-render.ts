import DDeiConfig from '../../config.js';
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiUtil from '../../util.js'
import { throttle } from "lodash";

/**
 * DDei图形框架的渲染器类，用于渲染图形框架
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
    // this.mouseScale = throttle(this.mouseScale, 60)
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

  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    //在容器上创建画布，画布用来渲染图形
    this.container = document.getElementById(this.model.containerid);
    if (this.container) {
      if (this.container.children.length > 0) {
        let cvs = this.container.getElementsByTagName("canvas")
        
        while (cvs?.length > 0){
          cvs[0].remove()
        }
      }
      if (this.model.width){
        this.container.style.width = this.model.width+"px"
      }
      if (this.model.height) {
        this.container.style.height = this.model.height + "px"
      }
      //创建容器
      this.realCanvas = document.createElement("canvas");
      this.realCanvas.setAttribute("id", this.model.id + "_canvas");
      //获得 2d 上下文对象
      let ctx = this.realCanvas.getContext('2d');
      //获取缩放比例
      let ratio = DDeiUtil.getPixelRatio(ctx);
      this.container.appendChild(this.realCanvas);
      let w = this.model.width ? this.model.width: this.container.clientWidth
      let h = this.model.height ? this.model.height: this.container.clientHeight
      this.canvas = this.realCanvas
      this.realCanvas.setAttribute("style", "pointer-events:none;z-index:100;position:absolute;-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
      this.realCanvas.setAttribute("width", w * ratio);
      this.realCanvas.setAttribute("height", h * ratio);

      //创建操作图层，用于检测图形事件
      // this.operateCanvas = document.createElement("canvas");
      // this.operateCanvas.setAttribute("id", this.model.id + "_operate_canvas");
      // this.operateCanvas.setAttribute("style", "background:red;z-index:99999;opacity:0.1;pointer-events:none;position:absolute;-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
      // this.operateCanvas.setAttribute("width", w * ratio);
      // this.operateCanvas.setAttribute("height", h * ratio);
      // this.container.appendChild(this.operateCanvas);

      this.ratio = ratio * window.remRatio;

      

      //向canvas绑定事件
      this.bindEvent();
      
    } else {
      throw new Error("容器" + this.model.containerid + "不存在");
    }

    // this.webglTest()

  }

  // webglTest() {

  //   let canvas = document.createElement('canvas');
  //   canvas.setAttribute("width", 480)
  //   canvas.setAttribute("height", 240)
  //   canvas.setAttribute("style", "border:1px solid red;position:absolute;left:0;top:400px;")
  //   document.body.appendChild(canvas)
  //   let gl = canvas.getContext('webgl')
  //   gl.viewport(0, 0, 480, 240)

  //   //创建顶点着色器
  //   const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  //   //创建片元着色器
  //   const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  //   //顶点着色器代码
  //   const vertexShaderSource = `
  //         attribute vec4 a_pos;
  //         void main() {
  //             gl_Position = a_pos;
  //         }
  //     `
  //   //片元着色器代码
  //   const fragmentShaderSource = `
  //         void main() {
  //             gl_FragColor = vec4(0.0,0.0,0.0,1.0);
  //         }
  //     `

  //   //绑定数据源
  //   gl.shaderSource(vertexShader, vertexShaderSource)
  //   gl.shaderSource(fragmentShader, fragmentShaderSource)


  //   // 编译着色器
  //   gl.compileShader(vertexShader)
  //   gl.compileShader(fragmentShader)
  //   // 创建着色器程序
  //   const program = gl.createProgram()
  //   gl.attachShader(program, vertexShader)
  //   gl.attachShader(program, fragmentShader)
  //   // 链接 并使用着色器
  //   gl.linkProgram(program)
  //   gl.useProgram(program)
  //   gl.program = program

  //   // //错误输出日志
  //   // const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  //   // if (success) {
  //   //   gl.useProgram(program)
  //   //   return program
  //   // }
  //   // console.error(gl.getProgramInfoLog(program), 'test---')
  //   // gl.deleteProgram(program)

  //   //抗锯齿
  //   // gl.enable(gl.MULTISAMPLE)

  //   //创建顶点缓冲对象
  //   const buffer = gl.createBuffer()

  //   //把标识符buffer设置为当前缓冲区，后面的所有的数据都会都会被放入当前缓冲区，直到bindBuffer绑定另一个当前缓冲区
  //   gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  //   //构造三角形的点
  //   let data = new Float32Array([-0.2, 0.5,
  //   -0.5, -0.3,
  //     0, -0.3,
  //     0.29, 0.5])
  //   gl.bufferData(gl.ARRAY_BUFFER, data, gl?.DYNAMIC_DRAW)


  //   //从刚才创建的GLSL着色程序中找到这个属性值所在的位置。
  //   const aposlocation = gl.getAttribLocation(program, 'a_pos')

  //   gl.enableVertexAttribArray(aposlocation)
  //   //从缓冲中读取数据绑定给被激活的aposlocation的位置
  //   gl.vertexAttribPointer(aposlocation, 2, gl.FLOAT, false, 2 * 4, 0 * 4)

  //   //渲染
  //   //清空颜色
  //   gl.clearColor(1, 1, 1, 1)
  //   gl.clear(gl.COLOR_BUFFER_BIT)
  //   // gl.drawArrays(gl?.LINE_LOOP, 0, 4) 

  //   //索引缓冲区,可以控制绘制的顺序
  //   let indexArr = new Uint16Array([
  //     0, 1, 2,
  //     0, 3, 1,
  //   ]);
  //   let indexBuffer = gl?.createBuffer()
  //   gl?.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  //   gl?.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW)
  //   gl?.drawElements(gl.TRIANGLES, indexArr.length, gl.UNSIGNED_SHORT, 0)
  //   let indexArr1 = new Uint16Array([
  //     1, 2, 3
  //   ]);
  //   gl?.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
  //   gl?.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr1, gl.STATIC_DRAW)
  //   gl?.drawElements(gl.LINE_LOOP, indexArr1.length, gl.UNSIGNED_SHORT, 0)

  //   // data = new Float32Array([0.3, 0.5, 0.1, -0.3, 0.5, -0.3])
  //   // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
  //   // gl.drawArrays(gl?.LINE_LOOP, 0, 3)
  //   // gl.drawArrays(gl?.TRIANGLES, 0, 3)
  // }

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
    this.realCanvas.setAttribute("width", width * this.ratio / window.remRatio);
    this.realCanvas.setAttribute("height", height * this.ratio / window.remRatio);
    // this.operateCanvas.setAttribute("width", width * this.ratio / window.remRatio);
    // this.operateCanvas.setAttribute("height", height * this.ratio / window.remRatio);
  }

  /**
   * 绘制图形
   */
  drawShape(): void {
    if (this.model.stage) {
      if (this.model.stage.render?.refresh || this.model.stage.render?.editorShadowControl) {
        this.model.stage.render.drawShape();
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
    this.interval = setInterval(() => {
      if(this.model.render != this){
        this.destroyed();
      }else if(!this.model.disabled){
        let allowBackActive = DDeiUtil.isBackActive(this.model)
        if (allowBackActive){
          //边缘扫描
          this.mouseInEdge();
        }
        this.model.stage.drawing = true;
        this.drawShape();
      }
    }, 20)
  }

  destroyed() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  /**
   * 鼠标在画布边缘
   */
  mouseInEdge(): void {
    //在边缘，计数
    if (this.upInEdge != this.inEdge) {
      this.inEdgeTime = 0
      this.upInEdge = this.inEdge
    }
    if (this.inEdge) {
      this.inEdgeTime += 20;
      this.model.stage?.render?.mouseInEdge(this.inEdge, this.inEdgeTime)
    }
    DDeiUtil.invokeCallbackFunc("EVENT_MOUSE_IN_AREA", "MOUSE_IN_AREA", { x: this.inAreaX, y: this.inAreaY, models: this.inAreaControls }, this.model, null)
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
    ex /= window.remRatio
    ey /= window.remRatio
    let sx = evt.screenX;
    let sy = evt.screenY;
    sx /= window.remRatio
    sy /= window.remRatio
    let stage = this.model.stage
    ex -= stage.wpv.x;
    ey -= stage.wpv.y;
    sx -= stage.wpv.x;
    sy -= stage.wpv.y;
    this.model.eventCancel = false;
    this.model.stage.render.mouseMove(evt);
  }


  /**
   * 鼠标滚轮或滑动事件
   */
  mouseWheel(evt: Event) {
    //放大缩小
    let wheelDeltaY = evt.wheelDeltaY
    let wheelDeltaYAbs = Math.abs(wheelDeltaY)
    if (wheelDeltaYAbs > 0 && wheelDeltaYAbs % 120 == 0) {
      if (DDeiUtil.getConfigValue("GLOBAL_ALLOW_STAGE_RATIO", this.model)) {
        this.mouseScale(evt.wheelDeltaY, evt)
      }
    }

    else if (evt.wheelDeltaX || evt.wheelDeltaY) {
      //放大缩小
      let ctrl = DDei.KEY_DOWN_STATE.get("ctrl");
      if (DDeiUtil.getConfigValue("GLOBAL_ALLOW_STAGE_RATIO", this.model) && ctrl && evt.wheelDeltaY) {
        // if (DDeiUtil.USER_OS == 'MAC') {
        //   this.mouseScale(-evt.wheelDeltaY, evt)
        // } else {
        this.mouseScale(evt.wheelDeltaY, evt)
        // }
      }
      //滚动平移
      else {
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

  }



  /**
   * 通过鼠标放大或缩小
   */
  mouseScale(delta: number, evt: Event) {
    let stage = this.model.stage;
    if (stage) {
      let ratio = stage.getStageRatio()
      let newValue = ratio
      let dn = 0.02 * ratio;
      if (delta > 0) {

        newValue = ratio + dn
      } else {
        newValue = ratio - dn
      }
      if (newValue < 0.1) {
        newValue = 0.1
      } else if (newValue > 10) {
        newValue = 10
      }
      if (newValue != ratio) {
        stage.setStageRatio(newValue);
        if (!this.model.ratioWatch){
          this.model.bus.push(
            DDeiEnumBusCommandType.ChangeStageRatio,
            {
              oldValue: ratio,
              newValue: newValue,
            },
            null
          );
          this.model.bus.executeAll();
        }
      }
    }
  }

  /**
   * 通过鼠标平移窗体
   */
  mouseWPV(dx: number, dy: number, evt: Event) {
    let stage = this.model.stage;
    let rat1 = this.ratio;
    let stageRatio = stage.getStageRatio();
    if (stage) {
      let maxMove = 75 * stageRatio * rat1
      dx *= stageRatio * rat1
      dy *= stageRatio * rat1
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