import DDeiConfig from '../../config';
import DDeiAbstractShape from '../../models/shape';
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

    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();
    super.drawShape();
    //保存状态
    ctx.save();
    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;

    //设置旋转，以确保子图形元素都被旋转
    this.doRotate(ctx, ratPos);



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

    if (this.model.models?.size > 0) {

      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;
      let lineOffset = 1 * ratio / 2;
      let areaPVSNoRotated = this.model.layoutManager.getAreasPVS(false);
      let areaPVS = this.model.layoutManager.getAreasPVS();
      let usedMidIds = [];
      for (let n = 0; n < areaPVSNoRotated.length; n++) {
        let pvsN = areaPVSNoRotated[n]
        let pvs = areaPVS[n]

        //遍历子元素，绘制子元素

        for (let m = 0; m < this.model.midList?.length; m++) {
          let key = this.model.midList[m];
          let item = this.model.models.get(key);
          if (usedMidIds.indexOf(item.id) == -1 && pvs?.length > 0 && DDeiAbstractShape.isInsidePolygon(
            pvs, { x: item.centerPointVector.x, y: item.centerPointVector.y })) {
            usedMidIds.push(item.id)
            //保存状态
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < pvsN.length; i++) {
              if (i == pvsN.length - 1) {
                ctx.lineTo(pvsN[0].x * ratio + lineOffset, pvsN[0].y * ratio + lineOffset);
              } else if (i == 0) {
                ctx.moveTo(pvsN[i].x * ratio + lineOffset, pvsN[i].y * ratio + lineOffset);
                ctx.lineTo(pvsN[i + 1].x * ratio + lineOffset, pvsN[i + 1].y * ratio + lineOffset);
              } else {
                ctx.lineTo(pvsN[i + 1].x * ratio + lineOffset, pvsN[i + 1].y * ratio + lineOffset);
              }
            }
            ctx.closePath();
            ctx.clip();
            item.render.drawShape();
            //恢复
            ctx.restore();
          }
        }


      }
    }
  }


  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      super.mouseDown(evt);
    }
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      super.mouseUp(evt);
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
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
}

export default DDeiRectContainerCanvasRender