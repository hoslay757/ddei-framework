import DDeiUtil from '../../util.js';
import DDeiSelectorCanvasRender from './selector-render.js';

/**
 * DDeiTableSelector渲染器类，用于渲染表格的选择器
 */
class DDeiTableSelectorCanvasRender extends DDeiSelectorCanvasRender {
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableSelectorCanvasRender {
    return new DDeiTableSelectorCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableSelectorCanvasRender";

  /**
   * 创建图形
   */
  drawShape(): void {
    this.model.updatedBounds();
    //绘制边框
    this.drawBorder();
  }

  /**
   * 绘制边框
   * @param tempBorder 临时边框，优先级最高
   */
  drawBorder(tempBorder: object | null): void {
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    //1,2,3,4 上，右，下，左
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
        //保存状态
        ctx.save();
        //设置旋转
        this.doRotate(ctx, ratPos);


        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = width * ratio / 2;
        ctx.lineWidth = width * ratio;
        ctx.beginPath();
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
          ctx.moveTo(ratPos.x + lineOffset, ratPos.y + lineOffset);
          ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + lineOffset);
        } else if (i == 2) {
          ctx.moveTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + lineOffset);
          ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + ratPos.height + lineOffset);
        } else if (i == 3) {
          ctx.moveTo(ratPos.x + lineOffset, ratPos.y + ratPos.height + lineOffset);
          ctx.lineTo(ratPos.x + ratPos.width + lineOffset, ratPos.y + ratPos.height + lineOffset);
        } else if (i == 4) {
          ctx.moveTo(ratPos.x + lineOffset, ratPos.y + lineOffset);
          ctx.lineTo(ratPos.x + lineOffset, ratPos.y + ratPos.height + lineOffset);
        }

        ctx.stroke();
        //恢复状态
        ctx.restore();
      }

    }
  }
}

export default DDeiTableSelectorCanvasRender