import DDeiConfig from '../../config';
import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';

/**
 * DDeiRectContainer的渲染器类，用于渲染一个普通的容器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiRectContainerCanvasRender extends DDeiRectangleCanvasRender {

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiRectContainerCanvasRender {
    return new DDeiRectContainerCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiRectContainerCanvasRender";
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
    if (this.model.models) {
      //遍历子元素，绘制子元素
      this.model.midList.forEach(key => {
        let model = this.model.models.get(key);
        if (model && model.isInAreaLoose(evt.offsetX, evt.offsetY, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2)) {
          model.render.mouseMove(evt);
        }
      });
    }
  }
}

export default DDeiRectContainerCanvasRender