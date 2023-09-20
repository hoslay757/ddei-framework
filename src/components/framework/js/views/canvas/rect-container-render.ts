import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';
import { Matrix3, Vector3 } from 'three';

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
    // ctx.rect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    // ctx.clip();

    this.drawChildrenShapes();




    ctx.restore();
  }

  /**
   * 处理自身的位移以及子元素的位移
   */
  doRotate(ctx, ratPos): void {
    //以当前元素父元素为基准，沿自身圆心旋转
    super.doRotate(ctx, ratPos)
    //对所有子元素，沿自身圆心旋转
    this.doSubRotate(ctx, this.m1, this.redkrTransMatrix);
    // //遍历子元素,处理子元素旋转
    if (this.model.models) {
      this.model.midList.forEach(key => {
        let item = this.model.models.get(key);
        item.render.doRotate(ctx, ratPos);
      });
    }
    this.vcPoints = null;
  }

  doSubRotate(ctx, m1, redkrTransMatrix): void {
    if (this.model.models) {
      let parentCenterPointVector = this.centerPointVector;
      let pHalfWidth = this.model.width * 0.5;
      let pHalfHeight = this.model.height * 0.5;
      this.model.midList.forEach(key => {
        let item = this.model.models.get(key);
        let halfWidth = item.width * 0.5;
        let halfHeight = item.height * 0.5;
        if (parentCenterPointVector) {
          let vc, vc1, vc2, vc3, vc4;

          if (item.render.vcPoints?.length > 0) {
            vc = item.render.vcPoints[4];
            vc1 = item.render.vcPoints[0];
            vc2 = item.render.vcPoints[1];
            vc3 = item.render.vcPoints[2];
            vc4 = item.render.vcPoints[3];
          } else {
            item.render.vcPoints = []
            vc = new Vector3(parentCenterPointVector.x - pHalfWidth + item.x + halfWidth, parentCenterPointVector.y + pHalfHeight - item.y - halfHeight, 1);
            vc1 = new Vector3(vc.x - halfWidth, vc.y + halfHeight, 1);
            vc2 = new Vector3(vc.x + halfWidth, vc.y + halfHeight, 1);
            vc3 = new Vector3(vc.x + halfWidth, vc.y - halfHeight, 1);
            vc4 = new Vector3(vc.x - halfWidth, vc.y - halfHeight, 1);
            item.render.vcPoints.push(vc1)
            item.render.vcPoints.push(vc2)
            item.render.vcPoints.push(vc3)
            item.render.vcPoints.push(vc4)
            item.render.vcPoints.push(vc)
          }
          vc1.applyMatrix3(m1);
          vc2.applyMatrix3(m1);
          vc3.applyMatrix3(m1);
          vc4.applyMatrix3(m1);
          vc.applyMatrix3(m1);
          let vcc = new Vector3(vc.x, vc.y, 1);
          let vcc1 = new Vector3(vc1.x, vc1.y, 1);
          let vcc2 = new Vector3(vc2.x, vc2.y, 1);
          let vcc3 = new Vector3(vc3.x, vc3.y, 1);
          let vcc4 = new Vector3(vc4.x, vc4.y, 1);


          vcc1.applyMatrix3(redkrTransMatrix);
          vcc2.applyMatrix3(redkrTransMatrix);
          vcc3.applyMatrix3(redkrTransMatrix);
          vcc4.applyMatrix3(redkrTransMatrix);
          vcc = vcc.applyMatrix3(redkrTransMatrix);

          ctx.fillStyle = DDeiUtil.getColor("red");
          //填充矩形
          let mp = this.model.pModel.getAbsPosition(this.model.pModel);
          mp = DDeiUtil.getRatioPosition(mp, this.ddRender.ratio);

          //填充矩形
          ctx.fillRect(mp.x + vcc.x * this.ddRender.ratio, mp.y + vcc.y * this.ddRender.ratio, 10, 10);
          ctx.fillRect(mp.x + vcc1.x * this.ddRender.ratio, mp.y + vcc1.y * this.ddRender.ratio, 10, 10);
          ctx.fillRect(mp.x + vcc2.x * this.ddRender.ratio, mp.y + vcc2.y * this.ddRender.ratio, 10, 10);
          ctx.fillRect(mp.x + vcc3.x * this.ddRender.ratio, mp.y + vcc3.y * this.ddRender.ratio, 10, 10);
          ctx.fillRect(mp.x + vcc4.x * this.ddRender.ratio, mp.y + vcc4.y * this.ddRender.ratio, 10, 10);
        }
        if (item.baseModelType == "DDeiContainer") {
          item.render.doSubRotate(ctx, m1, redkrTransMatrix);
        }
      });
    }

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