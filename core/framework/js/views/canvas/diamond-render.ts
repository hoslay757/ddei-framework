import DDeiConfig from '../../config'
import DDeiRectangle from '../../models/rectangle';
import DDeiCircle from '../../models/circle';
import DDeiUtil from '../../util'
import DDeiRectangleCanvasRender from './rectangle-render';
import DDeiEnumControlState from '../../enums/control-state';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value';

/**
 * DDeiDiamond的渲染器类，用于渲染菱形,继承自矩形渲染器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiDiamondCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiDiamondCanvasRender {
    return new DDeiDiamondCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiDiamondCanvasRender";
  // ============================== 方法 ===============================


  /**
  * 创建图形
  */
  drawShape(): void {

    //绘制边框
    this.drawBorderAndFill();

    //绘制图片
    this.drawImage();

    //绘制文本
    this.drawText();


  }

  /**
   * 填充图片
   */
  drawImage(): void {
    //如果有图片，则绘制
    if (this.imgObj) {
      //获得 2d 上下文对象
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let stageRatio = parseFloat(this.stage.ratio) ? this.stage.ratio : 1.0
      if (!stageRatio || isNaN(stageRatio)) {
        stageRatio = 1.0
      }
      let ratio = this.ddRender.ratio * stageRatio;
      //计算填充的原始区域
      let fillAreaE = this.getFillArea();
      //转换为缩放后的坐标
      let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
      //缩放填充区域
      //保存状态
      ctx.save();
      //设置旋转角度
      this.doRotate(ctx, ratPos);

      //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
      let imgFillInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "image.opacity", true);
      //透明度
      if (imgFillInfo) {
        ctx.globalAlpha = imgFillInfo
      }
      ctx.beginPath();
      ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
      ctx.lineTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.clip();


      ctx.drawImage(this.imgObj, ratPos.x, ratPos.y, ratPos.width, ratPos.height);
      ctx.closePath();
      //恢复状态
      ctx.restore();
    }
  }
  /**
   * 绘制边框
   * @param tempBorder 临时边框，优先级最高
   */
  drawBorderAndFill(tempBorder: object | null): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    //1,2,3,4 上，右，下，左
    //保存状态
    ctx.save();
    //设置旋转角度
    if (this.model.rotate) {
      ctx.translate(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height * 0.5)
      ctx.rotate(this.model.rotate * DDeiConfig.ROTATE_UNIT);
      ctx.translate(-ratPos.x - ratPos.width * 0.5, -ratPos.y - ratPos.height * 0.5)
    }
    for (let i = 1; i <= 4; i++) {
      //如果被选中，使用选中的边框，否则使用缺省边框
      let disabled = this.getBorderInfo(tempBorder, i, "disabled");
      let color = this.getBorderInfo(tempBorder, i, "color");
      let opacity = this.getBorderInfo(tempBorder, i, "opacity");
      let width = this.getBorderInfo(tempBorder, i, "width");
      let dash = this.getBorderInfo(tempBorder, i, "dash");
      //绘制四个方向的边框
      //如果边框未被disabled，则绘制边框
      if (!disabled && color && (!opacity || opacity > 0) && width > 0) {

        ctx.beginPath();
        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        ctx.lineWidth = width * ratio;

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
        if (i == 1) {
          ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
          ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
        } else if (i == 2) {
          ctx.moveTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
          ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
        } else if (i == 3) {
          ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
          ctx.lineTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
        } else if (i == 4) {
          ctx.moveTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
          ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
        }
        ctx.stroke();
        ctx.closePath();
      }
    }
    //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
    let fillColor = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.color", true);
    //如果拥有填充色，则使用填充色
    if (fillColor) {

      ctx.fillStyle = DDeiUtil.getColor(fillColor);
      //透明度
      let fillOpac = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "fill.opacity", true);
      if (fillOpac) {
        ctx.globalAlpha = fillOpac
      }
      ctx.beginPath();
      ctx.moveTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y + ratPos.height);
      ctx.lineTo(ratPos.x, ratPos.y + ratPos.height * 0.5);
      ctx.lineTo(ratPos.x + ratPos.width * 0.5, ratPos.y);
      ctx.closePath()
      //填充矩形
      ctx.fill();
    }
    //恢复状态
    ctx.restore();
  }


}

export default DDeiDiamondCanvasRender