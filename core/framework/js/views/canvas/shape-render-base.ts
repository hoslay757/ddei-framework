import { cloneDeep } from 'lodash';
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
import { Vector3 } from 'three';
import DDeiEnumOperateState from '../../enums/operate-state.js';
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
   * 刷新当前图形，只有当为true时才刷新，刷新后会变为false，重新采样后会为true
   */
  refreshShape: boolean = true;


  enableRefreshShape() {
    this.refreshShape = true
    this.model.composes?.forEach(comp => {
      comp.render?.enableRefreshShape()
    })
  }


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
      this.setCachedValue(attrPath, returnValue)
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
          this.changeComposesCacheValue(item, value);
        })
      } else {
        this.renderCacheData.set(attrPath, value);
        this.changeComposesCacheValue(attrPath, value)
      }

    }
  }

  changeComposesCacheValue(attrPath, value) {
    //通知composes的值改变
    let define = DDeiUtil.getControlDefine(this.model)?.define;
    if (define?.composes?.length > 0) {
      for (let i = 0; i < define.composes.length; i++) {
        let comDef = define.composes[i]
        let comModel = this.model.composes[i]
        if (comDef.attrLinks?.length > 0) {
          comDef.attrLinks.forEach(attrLink => {
            if (attrPath.startsWith(attrLink.code) && attrLink.mapping?.length > 0) {
              attrLink.mapping.forEach(mp => {
                if (mp == "*") {
                  comModel.render.setCachedValue(attrPath, value)
                } else {
                  comModel.render.setCachedValue(mp, value)
                }
              });
            }
          });
        }
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
    this.controlSelect()
    // //加载事件的配置
    // let selectBefore = DDeiUtil.getConfigValue("EVENT_CONTROL_SELECT_BEFORE", this.stage.ddInstance);
    // //选中前
    // if (!selectBefore || selectBefore(DDeiEnumOperateType.SELECT, [this.model], null, this.stage.ddInstance, evt)) {
    //   if (this.controlSelect()) {
    //     let selectAfter = DDeiUtil.getConfigValue("EVENT_CONTROL_SELECT_AFTER", this.stage.ddInstance);
    //     if (selectAfter) {
    //       selectAfter(DDeiEnumOperateType.SELECT, [this.model], null, this.stage.ddInstance, evt);
    //     }
    //   }
    // }
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

      let modeName = DDeiUtil.getConfigValue("MODE_NAME", this.ddRender?.model);
      let accessLink = DDeiUtil.isAccess(
        DDeiEnumOperateType.LINK, [this.model], null, modeName,
        this.ddRender?.model
      );
      if (accessLink) {
        let ex = evt.offsetX;
        let ey = evt.offsetY;
        ex /= window.remRatio
        ey /= window.remRatio
        ex -= this.stage.wpv.x;
        ey -= this.stage.wpv.y
        this.changeOpPoints(ex, ey);
      }
    }

  }

  changeOpPoints(ex: number, ey: number, pointMode: number | null = null) {
    //获取直线连接操作点
    let appendPoints = []
    let hasPoint = false;
    let projPoint;
    if (this.stageRender?.operateState == DDeiEnumOperateState.LINE_POINT_CHANGING) {
      projPoint = this.model.getProjPoint({ x: ex, y: ey }, { in: -8, out: 15 });
    } else {
      let modelWeight = Math.min(this.model.width, this.model.height)
      let inWeight = -8
      if (modelWeight <= 24) {
        inWeight = 0
      }
      projPoint = this.model.getProjPoint({ x: ex, y: ey }, { in: inWeight, out: 15 });
    }

    let pots = []
    if (projPoint) {
      projPoint.model = this.model
      projPoint.mode = pointMode
      hasPoint = true;

      pots.push(projPoint);
    }
    let centerOpPoints = this.model.getCenterOpPoints()
    centerOpPoints.forEach(op => {
      op.model = this.model
      op.mode = 3
      //只响应点的操作点，如果距离小于10，则变大
      if (op.oppoint == 1 || op.oppoint == 3) {
        let dist = DDeiUtil.getPointDistance(op.x, op.y, ex, ey);
        if (Math.abs(dist) <= 5) {
          op.isMiddle = true
          this.stage.tempCursorOPpoint = op
          delete op.mode
          hasPoint = true;
        }
      }
      //判定是否圆心，判定点到圆心的距离
      if (op.oppoint == 3) {
        let rotate = this.model.rotate;
        if (!rotate) {
          rotate = 0
        }

        let bpv = DDeiUtil.pointsToZero([this.model.bpv], this.model.cpv, rotate)[0]
        let scaleX = Math.abs(bpv.x / 100)
        let scaleY = Math.abs(bpv.y / 100)
        let dist1 = DDeiUtil.getPointDistance(0, 0, (ex - op.x) / scaleX, (ey - op.y) / scaleY);
        if (Math.abs(op.r - dist1) <= 5) {
          let dr = op.r - dist1
          let rotate = DDeiUtil.getLineAngle(op.x, op.y, ex, ey)
          let dx = dr * Math.cos(rotate * DDeiConfig.ROTATE_UNIT)
          let dy = dr * Math.sin(rotate * DDeiConfig.ROTATE_UNIT)
          let op1 = new Vector3(ex + dx, ey + dy, 1)
          op1.model = this.model
          op1.oppoint = op.oppoint
          pots.push(op1)
          hasPoint = true;
        }
      } else {
        let angle = DDeiUtil.getLineAngle(this.model.cpv.x, this.model.cpv.y, op.x, op.y)
        angle -= (this.model.rotate ? this.model.rotate : 0)
        op.sita = angle
        appendPoints.push(op)
      }
    })

    //过滤靠近centerOppoints的点
    pots.forEach(po => {
      let insert = true;
      for (let i = 0; i < centerOpPoints.length; i++) {
        let co = centerOpPoints[i]

        if (co.isMiddle) {
          let dist = DDeiUtil.getPointDistance(po.x, po.y, co.x, co.y);
          if (Math.abs(dist) <= 5) {
            insert = false
          }
        }

      }
      if (insert) {
        let angle = DDeiUtil.getLineAngle(this.model.cpv.x, this.model.cpv.y, po.x, po.y)
        angle -= (this.model.rotate ? this.model.rotate : 0)
        po.sita = angle
        this.stage.tempCursorOPpoint = po
        appendPoints.push(po)
      }
    })
    if (appendPoints.length > 0) {
      appendPoints.forEach(po => {
        this.layer.opPoints.push(po);
      })
      this.layer.opPoints.push({ isSplit: 1 })
    }
    if (hasPoint) {
      this.stage.ddInstance.bus.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'pointer' });
    }
  }
}

export default DDeiAbstractShapeRender