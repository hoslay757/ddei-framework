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
      //如果线段类型发生了改变，则重新绘制线段，计算中间点坐标
      if (this.inited && this.model.id.indexOf("_shadow") == -1 && (!this.upLineType || this.upLineType != this.model.type)) {
        this.upLineType = this.model.type
        this.model.freeze = 0
        this.model.spvs = []
        this.model.initPVS()
      } else if (!this.inited) {
        this.inited = true;
        this.upLineType = this.model.type
      }

      //绘制线段
      this.drawLine();

      //绘制端点
      this.drawPoint();

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
  drawLine(tempLine): void {

    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();

    let ctx = canvas.getContext('2d');

    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;

    //获取绘图属性
    let color = tempLine?.color ? tempLine.color : this.getCachedValue("color");
    let weight = tempLine?.weight ? tempLine.weight : this.getCachedValue("weight");
    let dash = tempLine?.dash ? tempLine.dash : this.getCachedValue("dash");
    let round = tempLine?.round ? tempLine.round : this.getCachedValue("round");
    let type = this.getCachedValue("type");
    let opacity = tempLine?.opacity ? tempLine.opacity : this.getCachedValue("opacity");

    let pvs = this.model.pvs;

    //绘制线段
    if (pvs?.length >= 2 && color && (!opacity || opacity > 0) && weight > 0) {
      ctx.save()
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

      switch (type) {
        case 1: {
          //直线
          ctx.beginPath()
          ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
          ctx.lineTo(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1)
          ctx.stroke();
          ctx.closePath()
        } break;
        case 2: {
          //折线
          ctx.beginPath()
          ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
          for (let i = 1; i < pvs.length; i++) {
            ctx.lineTo(pvs[i].x * rat1, pvs[i].y * rat1)
          }
          ctx.stroke();
          ctx.closePath()
        } break;
        case 3: {
          if (pvs.length >= 4) {
            //曲线
            for (let i = 4; i <= pvs.length; i += 3) {
              ctx.beginPath()
              let i0 = i - 4;
              let i1 = i - 3;
              let i2 = i - 2;
              let i3 = i - 1;
              ctx.moveTo(pvs[i0].x * rat1, pvs[i0].y * rat1)
              ctx.bezierCurveTo(pvs[i1].x * rat1, pvs[i1].y * rat1, pvs[i2].x * rat1, pvs[i2].y * rat1, pvs[i3].x * rat1, pvs[i3].y * rat1);
              ctx.stroke();
              ctx.closePath()
            }
          } else {
            ctx.beginPath()
            ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
            ctx.lineTo(pvs[0].x * rat1, pvs[0].y * rat1, pvs[1].x * rat1, pvs[1].y * rat1);
            ctx.stroke();
            ctx.closePath()
          }
        } break;
      }

      ctx.restore();
    }
  }

  /**
  * 绘制端点
  */
  drawPoint(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');

    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()

    //获取绘图属性
    let color = this.getCachedValue("color");
    let weight = this.getCachedValue("weight");

    let opacity = this.getCachedValue("opacity");
    let pvs = this.model.pvs;

    if (pvs?.length >= 2 && color && (!opacity || opacity > 0) && weight > 0) {

      let stype = this.getCachedValue("stype");
      let etype = this.getCachedValue("etype");
      //开始节点
      this.drawOnePoint(1, stype, weight * stageRatio, ctx)

      //结束节点
      this.drawOnePoint(2, etype, weight * stageRatio, ctx)


    }
  }

  /**
   * 绘制单个端点
   * @param type 
   * @param direct 
   */
  private drawOnePoint(pointType: number, type: number, weight: number, ctx): void {
    if (!type) {
      return;
    }
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let rat1 = this.ddRender.ratio;
    let ratio = rat1 * stageRatio;

    //获取绘图属性
    let color = this.getCachedValue("color");
    let opacity = this.getCachedValue("opacity");
    ctx.save()
    let lineWidth = weight * ratio;
    let pvs = this.model.pvs;
    ctx.lineWidth = lineWidth;

    let point = null;
    let upPoint = null;
    //开始
    if (pointType == 1) {
      point = this.model.startPoint;
      upPoint = pvs[1];
    }
    //结束
    else if (pointType == 2) {
      point = this.model.endPoint;
      upPoint = pvs[pvs.length - 2];
    }
    point = new Vector3(point.x, point.y, 1)

    //透明度
    if (opacity != null && opacity != undefined) {
      ctx.globalAlpha = opacity
    }
    //颜色
    ctx.fillStyle = DDeiUtil.getColor(color);
    //颜色
    ctx.strokeStyle = DDeiUtil.getColor("black");

    switch (type) {
      case 1: {
        //箭头
        ctx.strokeStyle = DDeiUtil.getColor(color);
        //旋转
        let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)
        if (rotate != 0) {
          ctx.translate(point.x * rat1, point.y * rat1)
          ctx.rotate(rotate * DDeiConfig.ROTATE_UNIT);
          ctx.translate(-point.x * rat1, -point.y * rat1)
        }
        ctx.beginPath()
        ctx.moveTo(point.x * rat1, point.y * rat1)
        ctx.lineTo((point.x - 2 * weight) * rat1, (point.y - 2 * weight) * rat1)
        ctx.lineTo(point.x * rat1, point.y * rat1)
        ctx.lineTo((point.x - 2 * weight) * rat1, (point.y + 2 * weight) * rat1)
        ctx.stroke()
        ctx.closePath()
        break;
      }
      case 2: {
        //圆形
        ctx.beginPath()
        ctx.ellipse(point.x * rat1, point.y * rat1, weight * 1.5, weight * 1.5, 0, 0, Math.PI * 2)
        ctx.stroke();
        ctx.fill()
        ctx.closePath()
        break;
      }
      case 3: {
        let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)
        if (rotate != 0) {
          ctx.translate(point.x * rat1, point.y * rat1)
          ctx.rotate(rotate * DDeiConfig.ROTATE_UNIT);
          ctx.translate(-point.x * rat1, -point.y * rat1)
        }
        //方形
        ctx.strokeRect((point.x - weight) * rat1, (point.y - weight) * rat1, 2 * weight * rat1, 2 * weight * rat1)
        ctx.fillRect((point.x - weight) * rat1, (point.y - weight) * rat1, 2 * weight * rat1, 2 * weight * rat1)
        break;
      }
      case 4: {
        let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)

        ctx.translate(point.x * rat1, point.y * rat1)
        ctx.rotate((rotate + 45) * DDeiConfig.ROTATE_UNIT);
        ctx.translate(-point.x * rat1, -point.y * rat1)

        //菱形
        ctx.strokeRect((point.x - weight) * rat1, (point.y - weight) * rat1, 2 * weight * rat1, 2 * weight * rat1)
        ctx.fillRect((point.x - weight) * rat1, (point.y - weight) * rat1, 2 * weight * rat1, 2 * weight * rat1)
        break;
      }
      case 5: {
        //三角形
        //旋转
        let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)
        if (rotate != 0) {
          ctx.translate(point.x * rat1, point.y * rat1)
          ctx.rotate(rotate * DDeiConfig.ROTATE_UNIT);
          ctx.translate(-point.x * rat1, -point.y * rat1)
        }
        ctx.beginPath()
        ctx.moveTo(point.x * rat1, point.y * rat1)
        ctx.lineTo((point.x - weight * 2) * rat1, (point.y - weight * 1.5) * rat1)
        ctx.lineTo((point.x - weight * 2) * rat1, (point.y + weight * 1.5) * rat1)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        break;
      }
    }
    ctx.restore();
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

  }
}

export default DDeiLineCanvasRender