import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'

/**
 * Stage(舞台）事件监听器
 */
class DDeiStageCanvasEventListener {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
  }


  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDeiStage;

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

export default DDeiStageCanvasEventListener