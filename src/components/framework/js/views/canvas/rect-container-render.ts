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
    // //保存状态
    // ctx.save();
    // //设置旋转，以确保子图形元素都被旋转
    // this.doRotate(ctx, ratPos);


    // //获取全局缩放比例
    // let ratio = this.ddRender.ratio;
    // //计算填充的原始区域
    // let fillAreaE = this.getFillArea();
    // //转换为缩放后的坐标
    // ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
    // //剪切当前区域
    // // ctx.rect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    // // ctx.clip();

    this.drawChildrenShapes();


    this.pointVectors = null;

    // ctx.restore();
  }

  /**
   * 处理自身的位移以及子元素的位移
   */
  doRotate(ctx, ratPos): void {
    //以当前元素父元素为基准，沿自身圆心旋转
    super.doRotate(ctx, ratPos)
    //对所有子元素，沿自身圆心旋转
    this.doSubRotate(ctx, this.m1, this.m1Array);

  }

  doSubRotate(ctx, m1, m1Array): void {
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

          if (item.render.pointVectors?.length > 0) {
            vc = item.render.centerPointVector;
            vc1 = item.render.pointVectors[0];
            vc2 = item.render.pointVectors[1];
            vc3 = item.render.pointVectors[2];
            vc4 = item.render.pointVectors[3];
          } else {
            item.render.pointVectors = []
            let absBoundsOrigin = item.getAbsBounds()
            vc = new Vector3(absBoundsOrigin.x + halfWidth, absBoundsOrigin.y + halfHeight, 1);
            vc1 = new Vector3(vc.x - halfWidth, vc.y - halfHeight, 1);
            vc2 = new Vector3(vc.x + halfWidth, vc.y - halfHeight, 1);
            vc3 = new Vector3(vc.x + halfWidth, vc.y + halfHeight, 1);
            vc4 = new Vector3(vc.x - halfWidth, vc.y + halfHeight, 1);
            item.render.pointVectors.push(vc1)
            item.render.pointVectors.push(vc2)
            item.render.pointVectors.push(vc3)
            item.render.pointVectors.push(vc4)
            item.render.centerPointVector = vc;
          }
          vc1.applyMatrix3(m1);
          vc2.applyMatrix3(m1);
          vc3.applyMatrix3(m1);
          vc4.applyMatrix3(m1);
          vc.applyMatrix3(m1);
        }
        if (item.baseModelType == "DDeiContainer") {
          item.render.doSubRotate(ctx, m1, m1Array);
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