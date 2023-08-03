import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiUtil from '../../util.js'

/**
 * DDei图形框架的事件监听器
 * 本监听器需要在画布被初始化后才能够被初始化
 * 本监听器将画布的事件进行监听并下发到stage的监听器上
 */
class DDeiCanvasEventListener {
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

    //绑定鼠标按下事件
    this.model.render.canvas.addEventListener('mousedown', (evt: Event) => {
      this.mouseDown(evt)
    });

    //绑定鼠标弹起事件
    this.model.render.canvas.addEventListener('mouseup', (evt: Event) => {
      this.mouseUp(evt)
    });

    //绑定鼠标移动事件
    this.model.render.canvas.addEventListener('mousemove', (evt: Event) => {
      this.mouseMove(evt)
    });
  }

  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    debugger
    console.log("鼠标按下")
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    console.log("鼠标弹起")
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    console.log("鼠标移动")
  }

}

export default DDeiCanvasEventListener