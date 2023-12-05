import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumOperateType from '../../enums/operate-type.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiStageCanvasRender from './stage-render.js';

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

  /**
   * 用于绘图时缓存属性等信息
   */
  renderCacheData: Map<string, object> = new Map();


  /**
   * 获取html
   */
  getHTML(): string {
    return null;
  }


  /**
   * 获取缓存的渲染数据
   */
  getCachedValue(attrPath: string): object | null {
    let returnValue: object | null = null;

    if (!this.renderCacheData.has(attrPath)) {
      returnValue = DDeiModelArrtibuteValue.getAttrValueByState(this.model, attrPath, true);
      this.renderCacheData.set(attrPath, returnValue)
    } else {
      returnValue = this.renderCacheData.get(attrPath)
    }
    return returnValue;
  }

  /**
  * 设置渲染缓存数据
  */
  setCachedValue(attrPath: string | string[], value: any): void {
    if (attrPath) {
      if (Array.isArray(attrPath)) {
        attrPath.forEach(item => {
          this.renderCacheData.set(item, value);
        })
      } else {
        this.renderCacheData.set(attrPath, value);
      }
    }
  }

  // ============================== 事件 ===============================

  /**
   * 拖拽本控件结束
   * @param evt 
   */
  controlDragEnd(evt: Event): void {

  }

  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {

  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    //加载事件的配置
    let selectBefore = DDeiUtil.getConfigValue("EVENT_CONTROL_SELECT_BEFORE", this.stage.ddInstance);
    //选中前
    if (!selectBefore || selectBefore(DDeiEnumOperateType.SELECT, [this.model], null, this.stage.ddInstance, evt)) {
      if (this.controlSelect()) {
        let selectAfter = DDeiUtil.getConfigValue("EVENT_CONTROL_SELECT_AFTER", this.stage.ddInstance);
        if (selectAfter) {
          selectAfter(DDeiEnumOperateType.SELECT, [this.model], null, this.stage.ddInstance, evt);
        }
      }
    }
  }




  /**
   * 选中
   */
  controlSelect(evt: Event): boolean {
    //按下ctrl增加选中，或取消当前选中
    let pContainerModel = this.model.pModel;
    //当前操作组合
    let pushMulits = [];
    //当前操作层级容器
    this.stageRender.currentOperateContainer = pContainerModel;
    let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
    if (isCtrl) {
      //判断当前操作控件是否选中
      if (this.stageRender.currentOperateShape.state == DDeiEnumControlState.SELECTED) {
        pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.DEFAULT }] });
      } else {
        //选中当前操作控件
        pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.SELECTED }] });
      }
    }
    //没有按下ctrl键，取消选中非当前控件
    else {
      pushMulits.push({ actionType: DDeiEnumBusCommandType.CancelCurLevelSelectedModels, data: { ignoreModels: [this.model] } });
      pushMulits.push({ actionType: DDeiEnumBusCommandType.ModelChangeSelect, data: [{ id: this.model.id, value: DDeiEnumControlState.SELECTED }] });

    }
    pushMulits.push({ actionType: DDeiEnumBusCommandType.StageChangeSelectModels });
    this.stage?.ddInstance?.bus?.pushMulit(pushMulits, evt);
    this.stage?.ddInstance?.bus?.executeAll()
    return true;
  }



  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //获取操作点，如果有则添加到其Layer
    if (this.layer) {
      let ex = evt.offsetX;
      let ey = evt.offsetY;
      ex -= this.stage.wpv.x;
      ey -= this.stage.wpv.y
      let projPoint = this.model.getProjPoint({ x: ex, y: ey });
      if (projPoint) {
        projPoint.model = this.model
        this.layer.opPoints.push(projPoint);
      }
    }
  }
}

export default DDeiAbstractShapeRender