import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiCircle from '../../models/circle.js';
import DDeiUtil from '../../util.js'

/**
 * Circle(圆型)事件监听器
 * 本监听器需要在画布被初始化后才能够被初始化
 * 本监听器将画布的事件进行监听并下发到stage的监听器上
 */
class DDeiCircleCanvasEventListener {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
  }


  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDeiCircle;

  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
  }
  /**
   * 鼠标按下事件
   */
  mouseDown(): void {
    console.log("鼠标按下")
  }
  /**
   * 绘制图形
   */
  mouseUp(): void {
    console.log("鼠标弹起")
  }

  /**
   * 鼠标移动
   */
  mouseMove(): void {
    console.log("鼠标移动")
  }

}

export default DDeiCircleCanvasEventListener