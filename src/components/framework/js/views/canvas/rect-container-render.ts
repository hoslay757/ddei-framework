import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';

/**
 * DDeiRectContainer的渲染器类，用于渲染一个普通的容器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiRectContainerCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 方法 ===============================
  /**
     * 创建图形
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

    this.drawChildrenShapes();




    ctx.restore();
  }
  /**
   * 绘制子元素
   */
  drawChildrenShapes(): void {
    if (this.model.models) {
      //遍历子元素，绘制子元素
      this.model.midList.forEach(key => {
        let item = this.model.models.get(key);
        item.render.drawShape();
      });
    }
  }
}

export default DDeiRectContainerCanvasRender