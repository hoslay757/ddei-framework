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
import DDeiStageCanvasRender from './stage-render.js';
import { cloneDeep } from 'lodash'

/**
 * 缺省的图形渲染器，默认实现的了监听等方法
 */
class DDeiAbstractShapeRender {
  constructor(props: object) {
    this.model = props.model;
    this.ddRender = null;
  }
  // ============================== 属性 ===============================
  /**
   * 当前对应模型
   */
  model: DDeiRectangle;

  /**
   * 当前的stage实例
   */
  stage: DDeiStage | null;

  /**
  * 当前的layer实例
  */
  layer: DDeiLayer | null;

  /**
   * 当前的ddei实例
   */
  ddRender: DDeiCanvasRender | null;

  /**
    * 当前的stage渲染器
    */
  stageRender: DDeiStageCanvasRender | null;

  /**
  * 当前的layer渲染器
  */
  layerRender: DDeiLayerCanvasRender | null;

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {

  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {

  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //获取操作点，如果有则添加到其Layer
    if (this.layer) {
      let projPoint = this.model.getProjPoint({ x: evt.offsetX, y: evt.offsetY });
      if (projPoint) {
        this.layer.opPoints.push(projPoint);
      }
    }
  }
}

export default DDeiAbstractShapeRender