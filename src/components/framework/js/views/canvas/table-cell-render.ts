import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiRectContainerCanvasRender from './rect-container-render.js';

/**
 * 表格单元格的渲染器
 */
class DDeiTableCellCanvasRender extends DDeiRectContainerCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }


  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableCellCanvasRender {
    return new DDeiTableCellCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCellCanvasRender";
  // ============================== 方法 ===============================


  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }

  mouseUp(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }
}

export default DDeiTableCellCanvasRender