import DDeiConfig from '../../config';
import DDeiEnumOperateType from '../../enums/operate-type';
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
    if (!this.viewBefore || this.viewBefore(
      DDeiEnumOperateType.VIEW,
      [this.model],
      null,
      this.ddRender.model,
      null
    )) {
      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      super.drawShape();
      //保存状态
      ctx.save();
      //获取全局缩放比例
      let rat1 = this.ddRender.ratio;
      let stageRatio = this.model.getStageRatio()
      let ratio = rat1 * stageRatio;
      //计算填充的原始区域
      let fillPVS = this.getFillAreaPVS();
      //剪切当前区域
      ctx.beginPath();
      let lineOffset = 1 * ratio / 2;
      for (let i = 0; i < fillPVS.length; i++) {
        if (i == fillPVS.length - 1) {
          ctx.lineTo(fillPVS[i].x * rat1 + lineOffset, fillPVS[i].y * rat1 + lineOffset);
          ctx.lineTo(fillPVS[0].x * rat1 + lineOffset, fillPVS[0].y * rat1 + lineOffset);
        } else if (i == 0) {
          ctx.moveTo(fillPVS[i].x * rat1 + lineOffset, fillPVS[i].y * rat1 + lineOffset);
        } else {
          ctx.lineTo(fillPVS[i].x * rat1 + lineOffset, fillPVS[i].y * rat1 + lineOffset);
        }
      }
      ctx.closePath();
      //填充矩形
      ctx.clip();
      this.drawChildrenShapes();
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
   * 绘制子元素
   */
  drawChildrenShapes(): void {

    if (this.model.models?.size > 0) {

      let canvas = this.ddRender.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let ratio = this.ddRender.ratio;
      let lineOffset = 1 * ratio / 2;
      let areaPVS = this.model.layoutManager.getAreasPVS();
      let usedMidIds = [];
      for (let n = 0; n < areaPVS.length; n++) {
        let pvs = areaPVS[n]
        //遍历子元素，绘制子元素
        for (let m = 0; m < this.model.midList?.length; m++) {
          let key = this.model.midList[m];
          let item = this.model.models.get(key);
          if (usedMidIds.indexOf(item.id) == -1 && pvs?.length > 0 && DDeiAbstractShape.isInsidePolygon(
            pvs, { x: item.cpv.x, y: item.cpv.y })) {
            usedMidIds.push(item.id)
            //保存状态
            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < pvs.length; i++) {
              if (i == pvs.length - 1) {
                ctx.lineTo(pvs[0].x * ratio + lineOffset, pvs[0].y * ratio + lineOffset);
              } else if (i == 0) {
                ctx.moveTo(pvs[i].x * ratio + lineOffset, pvs[i].y * ratio + lineOffset);
                ctx.lineTo(pvs[i + 1].x * ratio + lineOffset, pvs[i + 1].y * ratio + lineOffset);
              } else {
                ctx.lineTo(pvs[i + 1].x * ratio + lineOffset, pvs[i + 1].y * ratio + lineOffset);
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
        let ex = evt.offsetX;
        let ey = evt.offsetY;
        let stageRatio = this.stage.getStageRatio()
        ex -= this.stage.wpv.x;
        ey -= this.stage.wpv.y
        //遍历子元素，绘制子元素
        this.model.midList.forEach(key => {
          let model = this.model.models.get(key);
          if (model && model.isInAreaLoose(ex, ey, DDeiConfig.SELECTOR.OPERATE_ICON.weight * 2)) {
            model.render.mouseMove(evt);
          }
        });
      }
    }

  }
}

export default DDeiRectContainerCanvasRender