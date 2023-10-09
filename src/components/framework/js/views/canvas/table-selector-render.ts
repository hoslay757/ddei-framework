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
    //填充选择的单元格
    this.fillSelectedCell();
  }


  /**
   * 填充选中单元格
   */
  fillSelectedCell(): void {
    let table = this.model.table;
    //如果拥有填充色，则使用填充色
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;

    //缩放填充区域
    //保存状态
    ctx.save();
    ctx.fillStyle = DDeiUtil.getColor("rgb(210,210,210)")
    ctx.globalAlpha = 0.5
    let rect = this.model.getBounds();
    let oriRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    //转换为缩放后的坐标
    let ratPos = DDeiUtil.getRatioPosition(rect, ratio);
    //设置旋转角度
    this.doRotate(ctx, ratPos);


    let rect1 = null;
    //切割矩形区域
    if (table.curRow != -1 && table.curCol != -1) {
      let curCell = table.rows[table.curRow][table.curCol]
      if (curCell) {
        let cellBounds = curCell.getAbsBounds();
        //左上角
        if (rect.y - cellBounds.y == 0 && rect.x - cellBounds.x == 0) {
          rect1 = {
            x: rect.x,
            y: rect.y + cellBounds.height - this.model.border.width,
            width: rect.width,
            height: rect.height - cellBounds.height + this.model.border.width
          }
          rect = {
            x: rect.x + cellBounds.width,
            y: rect.y,
            width: rect.width - cellBounds.width,
            height: cellBounds.height
          }
        }
        //右上角
        else if (rect.y - cellBounds.y == 0 && rect.x + rect.width - cellBounds.x - cellBounds.width == 0) {
          rect1 = {
            x: rect.x,
            y: rect.y + cellBounds.height - this.model.border.width,
            width: rect.width,
            height: rect.height - cellBounds.height + this.model.border.width,
          }
          rect = {
            x: rect.x,
            y: rect.y,
            width: rect.width - cellBounds.width,
            height: cellBounds.height
          }
        }
        //左下角
        else if (rect.y + rect.height - cellBounds.y - cellBounds.height == 0 && rect.x - cellBounds.x == 0) {
          rect1 = {
            x: rect.x + cellBounds.width,
            y: cellBounds.y - this.model.border.width,
            width: rect.width - cellBounds.width,
            height: cellBounds.height + this.model.border.width,
          }
          rect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height - cellBounds.height
          }
        }
        //右下角
        else if (rect.y + rect.height - cellBounds.y - cellBounds.height == 0 && rect.x + rect.width - cellBounds.x - cellBounds.width == 0) {
          rect1 = {
            x: rect.x,
            y: cellBounds.y - this.model.border.width,
            width: rect.width - cellBounds.width,
            height: cellBounds.height + this.model.border.width
          }
          rect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height - cellBounds.height
          }
        }
      }
    }
    rect.x += this.model.border.width;
    rect.y += this.model.border.width;
    rect.width -= this.model.border.width;
    rect.height -= this.model.border.width;
    ratPos = DDeiUtil.getRatioPosition(rect, ratio);
    ctx.fillRect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    if (rect1?.width > 0 && rect1?.height > 0) {
      rect1.x += this.model.border.width;
      rect1.y += this.model.border.width;
      rect1.width -= this.model.border.width;
      rect1.height -= this.model.border.width;
      ratPos = DDeiUtil.getRatioPosition(rect1, ratio);
      ctx.fillRect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    }
    //恢复状态
    ctx.restore();


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