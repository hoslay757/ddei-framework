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
        this.stageRender?.selector.updatePVSByModels();
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
      //获取图标图形
      let { startDX, startDY, endDX, endDY } = this.getPointShapeSize();
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
          ctx.moveTo((pvs[0].x + startDX) * rat1, (pvs[0].y + startDY) * rat1)
          for (let i = 1; i < pvs.length; i++) {
            if (i == pvs.length - 1) {
              ctx.lineTo((pvs[i].x + endDX) * rat1, (pvs[i].y + endDY) * rat1)
            } else {
              ctx.lineTo(pvs[i].x * rat1, pvs[i].y * rat1)
            }
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
              if (i == 4) {
                ctx.moveTo((pvs[i0].x + startDX) * rat1, (pvs[i0].y + startDY) * rat1)
              } else {
                ctx.moveTo(pvs[i0].x * rat1, pvs[i0].y * rat1)
              }
              if (i == pvs.length) {
                ctx.bezierCurveTo(pvs[i1].x * rat1, pvs[i1].y * rat1, pvs[i2].x * rat1, pvs[i2].y * rat1, (pvs[i3].x + endDX) * rat1, (pvs[i3].y + endDY) * rat1);
              } else {
                ctx.bezierCurveTo(pvs[i1].x * rat1, pvs[i1].y * rat1, pvs[i2].x * rat1, pvs[i2].y * rat1, pvs[i3].x * rat1, pvs[i3].y * rat1);

              }
              ctx.stroke();
              ctx.closePath()
            }
          } else {
            ctx.beginPath()
            ctx.moveTo((pvs[0].x + startDX) * rat1, (pvs[0].y + startDY) * rat1)
            ctx.lineTo((pvs[0].x + endDX) * rat1, pvs[0].y * rat1, pvs[1].x * rat1, (pvs[1].y + endDY) * rat1);
            ctx.stroke();
            ctx.closePath()
          }
        } break;
      }

      ctx.restore();
    }
  }

  /**
   * 获取点图形所占用的空间
   * @returns
   */
  getPointShapeSize(): { startDX: number, startDY: number, endDX: number, endDY: number } {
    let stageRatio = this.model.getStageRatio()
    let pvs = this.model.pvs;
    let startDX = 0;
    let endDX = 0;
    let startDY = 0;
    let endDY = 0;
    //计算开始和结束点的单位增量
    //计算不同类型箭头下的增量与减量
    let stype = this.getCachedValue("stype");
    let etype = this.getCachedValue("etype");
    //旋转
    let startRotate = DDeiUtil.getLineAngle(pvs[1].x, pvs[1].y, pvs[0].x, pvs[0].y)
    let endRotate = DDeiUtil.getLineAngle(pvs[pvs.length - 2].x, pvs[pvs.length - 2].y, pvs[pvs.length - 1].x, pvs[pvs.length - 1].y)
    let startAngle = (startRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
    let endAngle = (endRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
    let startVectorUnit = new Vector3(1, 0, 1)
    let endVectorUnit = new Vector3(1, 0, 1)
    let startRotateMatrix = new Matrix3(
      Math.cos(startAngle), Math.sin(startAngle), 0,
      -Math.sin(startAngle), Math.cos(startAngle), 0,
      0, 0, 1);
    startVectorUnit.applyMatrix3(startRotateMatrix)
    let endRotateMatrix = new Matrix3(
      Math.cos(endAngle), Math.sin(endAngle), 0,
      -Math.sin(endAngle), Math.cos(endAngle), 0,
      0, 0, 1);
    endVectorUnit.applyMatrix3(endRotateMatrix)

    let wl = 0;
    switch (stype) {
      case 1:
        wl = stageRatio;
        break;
      case 2:
        wl = 6 * stageRatio;
        break;
      case 3:
        wl = 6 * stageRatio;
        break;
      case 4:
        wl = 12 * stageRatio;
        break;
      case 5:
        wl = 6 * stageRatio;
        break;
    }
    startDX = -startVectorUnit.x * wl
    startDY = startVectorUnit.y * wl
    switch (etype) {
      case 1:
        wl = stageRatio;
        break;
      case 2:
        wl = 6 * stageRatio;
        break;
      case 3:
        wl = 6 * stageRatio;
        break;
      case 4:
        wl = 12 * stageRatio;
        break;
      case 5:
        wl = 6 * stageRatio;
        break;
    }
    endDX = -endVectorUnit.x * wl
    endDY = endVectorUnit.y * wl
    return { startDX: startDX, startDY: startDY, endDX: endDX, endDY: endDY }
  }
  /**
  * 绘制端点
  */
  drawPoint(): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');

    //获取绘图属性
    let color = this.getCachedValue("color");
    let weight = this.getCachedValue("weight");

    let opacity = this.getCachedValue("opacity");
    let pvs = this.model.pvs;

    if (pvs?.length >= 2 && color && (!opacity || opacity > 0) && weight > 0) {

      let stype = this.getCachedValue("stype");
      let etype = this.getCachedValue("etype");
      //开始节点
      this.drawOnePoint(1, stype, ctx)

      //结束节点
      this.drawOnePoint(2, etype, ctx)


    }
  }

  /**
   * 绘制单个端点
   * @param type 
   * @param direct 
   */
  private drawOnePoint(pointType: number, type: number, ctx): void {
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
    let pvs = this.model.pvs;

    let point = null;
    let upPoint = null;
    let lineWidth = ratio;
    ctx.lineWidth = lineWidth;
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
    ctx.strokeStyle = DDeiUtil.getColor(color);

    //旋转
    let rotate = DDeiUtil.getLineAngle(upPoint.x, upPoint.y, point.x, point.y)
    if (rotate != 0) {
      ctx.translate(point.x * rat1, point.y * rat1)
      ctx.rotate(rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-point.x * rat1, -point.y * rat1)
    }

    switch (type) {
      case 1: {
        let wl = 6 * stageRatio;
        ctx.beginPath()
        ctx.moveTo((point.x - wl) * rat1, (point.y - 0.8 * wl) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1, (point.y + 0.8 * wl) * rat1)
        ctx.stroke()
        ctx.closePath()
        break;
      }
      case 21:
      case 2: {
        //圆形
        let wl = 6 * stageRatio;
        ctx.beginPath()
        ctx.ellipse((point.x - wl / 2) * rat1 - lineWidth / 2, point.y * rat1, wl, wl, 0, 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke();
        if (type == 21) {
          ctx.fill()
        }
        break;
      }
      case 31:
      case 3: {
        let wl = 6 * stageRatio;
        //方形
        ctx.beginPath()
        ctx.moveTo((point.x - wl) * rat1 - lineWidth / 2, (point.y - wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, (point.y - wl / 2) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth / 2, (point.y + wl / 2) * rat1)
        ctx.lineTo((point.x - wl) * rat1 - lineWidth / 2, (point.y + wl / 2) * rat1)
        ctx.closePath()
        ctx.stroke();
        if (type == 31) {
          ctx.fill();
        }
        break;
      }
      case 41:
      case 4: {
        let wl = 2 * stageRatio;
        //菱形
        ctx.beginPath()
        ctx.moveTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - 3 * wl) * rat1 - lineWidth, (point.y - 2 * wl) * rat1)
        ctx.lineTo((point.x - 6 * wl) * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - 3 * wl) * rat1 - lineWidth, (point.y + 2 * wl) * rat1)
        ctx.lineTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.closePath()
        ctx.stroke();
        if (type == 41) {
          ctx.fill()
        }
        break;
      }
      case 51:
      case 5: {
        let wl = 6 * stageRatio;
        ctx.beginPath()
        ctx.moveTo(point.x * rat1 - lineWidth, point.y * rat1)
        ctx.lineTo((point.x - wl) * rat1, (point.y - 0.8 * wl) * rat1)
        ctx.lineTo((point.x - wl) * rat1, (point.y + 0.8 * wl) * rat1)
        ctx.closePath()
        ctx.stroke()
        if (type == 51) {
          ctx.fill()
        }
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