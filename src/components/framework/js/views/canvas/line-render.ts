import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
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
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from '../../enums/operate-type.js';


/**
 * DDeiLine的渲染器类，用于渲染连线
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiLineCanvasRender extends DDeiAbstractShapeRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiRectangleCanvasRender {
    return new DDeiLineCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLineCanvasRender";

  /**
   * 用于绘图时缓存属性等信息
   */
  textUsedArea: object[] = [];

  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.stage.ddInstance.render
    this.stage = this.model.stage
    this.stageRender = this.model.stage.render
    if (this.model.layer) {
      this.layer = this.model.layer
      this.layerRender = this.model.layer.render
    }
    //展示前逻辑
    this.viewBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_VIEW_BEFORE",
      this.ddRender.model
    );
    //展示后逻辑
    this.viewAfter = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_VIEW_AFTER",
      this.ddRender.model
    );
  }

  /**
   * 创建图形
   */
  drawShape(): void {
    if (!this.viewBefore || this.viewBefore(
      DDeiEnumOperateType.VIEW,
      [this.model],
      null,
      this.ddRender.model,
      null
    )) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      ctx.save();


      //绘制线段
      this.drawLine();

      ctx.restore();
      if (this.viewAfter) {
        this.viewAfter(
          DDeiEnumOperateType.VIEW,
          [this.model],
          null,
          this.ddRender.model,
          null
        )
      }
    }
  }


  /**
  * 绘制线段
  */
  drawLine(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');

    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;

    //获取绘图属性
    let color = this.getCachedValue("color");
    let weight = this.getCachedValue("weight");
    let dash = this.getCachedValue("dsh");
    let round = this.getCachedValue("round");
    let type = this.getCachedValue("type");
    let stype = this.getCachedValue("stype");
    let etype = this.getCachedValue("etype");
    let opacity = this.getCachedValue("etype");
    let pvs = this.model.pvs;

    //绘制线段
    if (pvs?.length >= 2 && color && (!opacity || opacity > 0) && weight > 0) {

      let lineWidth = weight * ratio;
      ctx.lineWidth = lineWidth;
      //线段、虚线样式
      if (dash) {
        ctx.setLineDash(dash);
      }
      //透明度
      if (opacity != null && opacity != undefined) {
        ctx.globalAlpha = opacity
      }
      //颜色
      ctx.strokeStyle = DDeiUtil.getColor(color);

      //直线
      ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
      ctx.lineTo(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1)
      ctx.stroke();
      // //折线
      // ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
      // for (let i = 1; i < pvs.length; i++) {
      //   ctx.lineTo(pvs[i].x * rat1, pvs[i].y * rat1)
      // }
      // ctx.stroke();
      // //曲线1
      // ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
      // ctx.bezierCurveTo(pvs[1].x * rat1, pvs[1].y * rat1, pvs[2].x * rat1, pvs[2].y * rat1, pvs[3].x * rat1, pvs[3].y * rat1);

      // ctx.stroke();


      // //曲线2
      // ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
      // ctx.bezierCurveTo(pvs[1].x * rat1, pvs[1].y * rat1, pvs[1].x * rat1, pvs[1].y * rat1, pvs[2].x * rat1, pvs[2].y * rat1);

      // ctx.stroke();

    }
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    super.mouseDown(evt);
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    super.mouseUp(evt);
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    super.mouseMove(evt);
  }
}

export default DDeiLineCanvasRender