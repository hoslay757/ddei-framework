import DDeiEnumOperateType from '../../enums/operate-type';
import DDeiUtil from '../../util';
import DDeiPolygonCanvasRender from './polygon-render';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape'

/**
 * DDeiPolygonContainer的渲染器类，用于渲染一个普通的容器
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiPolygonContainerCanvasRender extends DDeiPolygonCanvasRender {

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiPolygonContainerCanvasRender {
    return new DDeiPolygonContainerCanvasRender(props)
  }
  

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiPolygonContainerCanvasRender";
  // ============================== 方法 ===============================

  enableRefreshShape() {
    super.enableRefreshShape()
    this.model.models?.forEach(model => {
      model.render?.enableRefreshShape()
    })
  }

  clearCachedValue(): void {
    super.clearCachedValue()
    this.model.models.forEach(item => {
      item?.render?.clearCachedValue()
    });
  }

  /**
   * 绘制图形
   */
  drawShape(tempShape, composeRender: number = 0, inRect: object | null = null, zIndex: number = 0): void {
    if (!inRect || this.model.isInRect(inRect.x, inRect.y, inRect.x1, inRect.y1)) {
      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_BEFORE", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.ddRender.model, null)
      if (composeRender || rsState == 0 || rsState == 1) {
        let rsState1 = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", DDeiEnumOperateType.VIEW, { models: [this.model], tempShape: tempShape, composeRender: composeRender }, this.ddRender.model, null)
        if (rsState1 == 0 || rsState1 == 1) {
          if (!this.model.hidden && (this.refreshShape || this.isEditoring)) {

            //创建准备图形
            this.createTempShape();
            //将当前控件以及composes按照zindex顺序排列并输出
            let rendList = [];
            if (this.model.composes?.length > 0) {
              rendList = rendList.concat(this.model.composes);
            }
            rendList.push(this.model)
            rendList.sort((a, b) => {

              if ((a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
                return a.cIndex - b.cIndex
              } else if ((a.cIndex || a.cIndex == 0) && !(b.cIndex || b.cIndex == 0)) {
                return 1
              } else if (!(a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
                return -1
              } else {
                return 0
              }
            })
            for (let ri = 0; ri < rendList.length; ri++) {
              let c = rendList[ri]
              if (c == this.model) {
                //获得 2d 上下文对象
                let canvas = this.getCanvas();
                let ctx = canvas.getContext('2d');


                if (!tempShape && this.stageRender.operateState == DDeiEnumOperateState.QUICK_EDITING || this.stageRender.operateState == DDeiEnumOperateState.QUICK_EDITING_TEXT_SELECTING) {
                  if (this.isEditoring) {
                    // tempShape = { border: { type: 1, dash: [10, 10], width: 1.25, color: "#017fff" } }
                  } else if (this.stage.render?.editorShadowControl) {
                    if (this.model.id + "_shadow" == this.stage.render.editorShadowControl.id) {
                      return;
                    }
                  }
                } else if (!tempShape && this.stage?.selectedModels?.size == 1 && Array.from(this.stage?.selectedModels.values())[0].id == this.model.id) {
                  tempShape = { border: { type: 1, width: 1, color: "#017fff", dash: [10, 5] }, drawCompose: false }
                }
                let oldRat1 = this.ddRender.ratio
                this.ddRender.oldRatio = oldRat1
                //获取缩放比例
                if (this.tempCanvas) {

                  let scaleSize = oldRat1 < 2 ? 2 / oldRat1 : 1
                  let rat1 = oldRat1 * scaleSize
                  //去掉当前被编辑控件的边框显示
                  this.ddRender.ratio = rat1
                }
                this.calScaleType3Size(tempShape);
                ctx.save();
                //拆分并计算pvss
                this.calPVSS(tempShape)
                //创建剪切区
                this.createClip(tempShape);

                //绘制填充
                this.drawFill(tempShape);
                //绘制文本
                this.drawText(tempShape);
                //根据pvss绘制边框
                this.drawBorder(tempShape);

                this.drawChildrenShapes(tempShape);
                ctx.restore();
                if (this.tempCanvas) {
                  this.ddRender.ratio = oldRat1
                  delete this.ddRender.oldRatio
                }

              } else {
                //绘制组合控件的内容
                if (tempShape && tempShape?.drawCompose == false) {
                  c.render.drawShape(null, composeRender + 1, null, zIndex + ri)
                } else {
                  c.render.drawShape(tempShape, composeRender + 1, null, zIndex + ri)
                }
              }
            }

            if (!this.isEditoring) {
              this.refreshShape = false
            }
          }

          //外部canvas
          this.drawSelfToCanvas(composeRender)

        }
        if (!composeRender) {
          DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW_AFTER", DDeiEnumOperateType.VIEW, { models: [this.model] }, this.ddRender.model, null)
        }

      }
    }else{
      let rsState = DDeiUtil.invokeCallbackFunc("EVENT_CONTROL_VIEW", "VIEW-HIDDEN", { models: [this.model] }, this.ddRender.model, null)
      if (rsState == 0 || rsState == 1) {
        //将canvas移动至画布位置
        this.tempCanvas?.remove()
      }
    }
  }

  /**
   * 绘制自身到最外层canvas
   */
  drawSelfToCanvas(composeRender) {
    if (this.tempCanvas) {
      let model = this.model
      let stage = model.stage
      let ruleWeight = 0
      if (stage.render.tempRuleDisplay == 1 || stage.render.tempRuleDisplay == '1') {
        ruleWeight = 15
      }
      let stageRatio = this.model.getStageRatio()
  
      //获取model的绝对位置
      if (!this.tempCanvas.parentElement) {
        //将canvas移动至画布位置
        let viewerEle = this.model.layer.render.containerViewer
        viewerEle.appendChild(this.tempCanvas)
      }

      this.tempCanvas.style.zIndex = this.tempZIndex
      this.tempCanvas.style.left = (this.model.cpv.x * stageRatio + this.model.stage.wpv.x) - this.tempCanvas.offsetWidth / 2 - ruleWeight + "px"
      this.tempCanvas.style.top = (this.model.cpv.y * stageRatio + this.model.stage.wpv.y) - this.tempCanvas.offsetHeight / 2 - ruleWeight + "px"

      for (let m = 0; m < this.model.midList?.length; m++) {
        let key = this.model.midList[m];
        let item = this.model.models.get(key);
        item.render?.drawSelfToCanvas(composeRender)
      }
    }




  }

  /**
   * 绘制子元素
   */
  drawChildrenShapes(tempShape, inRect: boolean = true, hidden: boolean = false): void {

    if (this.model.models?.size > 0) {
      let canvas = this.getCanvas();
      let ctx = canvas.getContext('2d');
      //获取全局缩放比例
      let stageRatio = this.stage.getStageRatio()
      let ratio = this.ddRender.ratio * stageRatio;

      let lineOffset = 0//1 * ratio / 2;
      let areaPVS = this.model.layoutManager.getAreasPVS();
      let usedMidIds = [];
      for (let n = 0; n < areaPVS.length; n++) {
        let pvs = areaPVS[n]

        for (let m = 0; m < this.model.midList?.length; m++) {
          let key = this.model.midList[m];
          let item = this.model.models.get(key);
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
          // ctx.clip();
          item.render.tempZIndex = this.tempZIndex + (m + 1)
          item.render.drawShape(tempShape);
          //恢复
          ctx.restore();
        }


      }
    }
  }
}
export {DDeiPolygonContainerCanvasRender}
export default DDeiPolygonContainerCanvasRender