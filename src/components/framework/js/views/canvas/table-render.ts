import DDeiConfig from '../../config';
import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';
import DDeiAbstractShapeRender from './shape-render-base';

/**
 * 表格控件的渲染器
 */
class DDeiTableCanvasRender extends DDeiRectangleCanvasRender {

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableCanvasRender {
    return new DDeiTableCanvasRender(props)
  }


  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCanvasRender";
  // ============================== 方法 ===============================

  /**
   * 绘制图形
   */
  drawShape(): void {

    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();


    super.drawShape();
    //保存状态
    ctx.save();
    //设置旋转，以确保子图形元素都被旋转
    this.doRotate(ctx, ratPos);


    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
    //剪切当前区域
    ctx.rect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    ctx.clip();

    this.drawCells();
    ctx.restore();
  }

  /**
   * 绘制单元格
   */
  drawCells(): void {
    //更新所有单元格     
    for (let i = 0; i < this.model.rows.length; i++) {
      let rowObj = this.model.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.render.drawShape();
      }
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

export default DDeiTableCanvasRender