import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiAbstractShapeRender from './shape-render-base.js';
import DDeiStageCanvasRender from './stage-render.js';
import { cloneDeep } from 'lodash'
import DDeiRectangleCanvasRender from './rectangle-render.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiTable from '../../models/table.js';
import DDeiTableCell from '../../models/table-cell.js';

/**
 * 表格单元格的渲染器
 */
class DDeiTableCellCanvasRender extends DDeiRectangleCanvasRender {
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