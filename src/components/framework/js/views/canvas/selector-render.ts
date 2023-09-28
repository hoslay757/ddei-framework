import DDeiConfig from '../../config.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiEnumState from '../../enums/ddei-state.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiUtil from '../../util.js';
import DDeiRectangleCanvasRender from './rectangle-render.js';
import { Matrix3, Vector3 } from 'three';
import { clone } from 'lodash'

/**
 * DDeiSelector的渲染器类，用于渲染选择器
 */
class DDeiSelectorCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 方法 ===============================


  /**
   * 创建图形
   */
  drawShape(): void {
    if (this.model.state != DDeiEnumControlState.DEFAULT) {
      this.model.updatedBoundsByModels();
    }
    //绘制边框
    this.drawBorder();

    //绘制边框上的操作图形
    this.drawOperatorShape();

    //绘制选中控件特效
    this.drawIncludedStyle();

  }

  /**
    * 根据模型的值，设置旋转
    */
  doRotate(ctx, ratPos): void {

  }

  /**
   * 获取边框上的操作图形
   * @param tempBorder 
   */
  drawOperatorShape(tempBorder: object | null): void {
    if (this.model.state != DDeiEnumControlState.SELECTED) {
      return;
    }
    //获得 2d 上下文对象
    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //保存状态
    ctx.save();
    //设置旋转
    //操作图标的宽度
    let width = DDeiConfig.SELECTOR.OPERATE_ICON.weight * ratio;
    let halfWidth = width * 0.5;
    for (let i = 1; i <= 9; i++) {
      //如果被选中，使用选中的边框，否则使用缺省边框
      let disabled = null;
      let color = null;
      let opacity = null;
      let bWidth = null;
      if (i <= 2 || i == 9) {
        disabled = this.getBorderInfo(tempBorder, 1, "disabled");
        color = this.getBorderInfo(tempBorder, 1, "color");
        opacity = this.getBorderInfo(tempBorder, 1, "opacity");
        bWidth = this.getBorderInfo(tempBorder, 1, "width");
      } else if (i <= 4) {
        disabled = this.getBorderInfo(tempBorder, 2, "disabled");
        color = this.getBorderInfo(tempBorder, 2, "color");
        opacity = this.getBorderInfo(tempBorder, 2, "opacity");
        bWidth = this.getBorderInfo(tempBorder, 2, "width");
      } else if (i <= 6) {
        disabled = this.getBorderInfo(tempBorder, 3, "disabled");
        color = this.getBorderInfo(tempBorder, 3, "color");
        opacity = this.getBorderInfo(tempBorder, 3, "opacity");
        bWidth = this.getBorderInfo(tempBorder, 3, "width");
      } else if (i <= 8) {
        disabled = this.getBorderInfo(tempBorder, 4, "disabled");
        color = this.getBorderInfo(tempBorder, 4, "color");
        opacity = this.getBorderInfo(tempBorder, 4, "opacity");
        bWidth = this.getBorderInfo(tempBorder, 4, "width");
      }

      //如果边框未被disabled，则绘制边框
      if (!disabled && color && (!opacity || opacity > 0) && bWidth > 0) {

        //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
        let lineOffset = bWidth * ratio / 2;
        ctx.lineWidth = bWidth * ratio;
        ctx.beginPath();

        //透明度
        if (opacity != null && opacity != undefined) {
          ctx.globalAlpha = opacity
        }
        //颜色
        ctx.strokeStyle = DDeiUtil.getColor(color);
        //填充操作图标的颜色
        let defaultFillColor = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.default);
        ctx.fillStyle = defaultFillColor;


        //设置填充样式
        if (this.model.passIndex == i) {
          ctx.fillStyle = DDeiUtil.getColor(DDeiConfig.SELECTOR.OPERATE_ICON.FILL.pass);
        }
        let opvs = this.model?.currentOPVS;
        if (opvs?.length > 0) {

          if (i >= 1 <= 8) {
            ctx.ellipse(opvs[i].x * ratio + lineOffset, opvs[i].y * ratio + lineOffset, halfWidth, halfWidth, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            if (this.model.passIndex == i) {
              //填充一个圆形
              ctx.ellipse(opvs[9].x * ratio + lineOffset, opvs[9].y * ratio + lineOffset, halfWidth, halfWidth, 0, 0, Math.PI * 2)
              ctx.fill();
            } else {
              //绘制旋转按钮
              ctx.arc(opvs[9].x * ratio + lineOffset, opvs[9].y * ratio + lineOffset, halfWidth, 50, Math.PI * 1.6)
              ctx.stroke()
            }
          }
        }


      }
    }
    //恢复状态
    ctx.restore();
  }

  /**
   * 获取边框信息
   * @param tempBorder 
   */
  getBorderInfo(tempBorder, direct, path): object {
    let borderInfo = null;
    if (tempBorder) {
      try {
        let returnJSON = DDeiUtil.getDataByPath(tempBorder, path.split('.'));
        borderInfo = returnJSON.data
      } catch (e) {

      }
    } else {
      borderInfo = DDeiModelArrtibuteValue.getAttrValueByState(this.model, "border" + "." + path, true);
    }
    return borderInfo;
  }


  /**
   * 计算除边框外的填充区域，用于填充颜色和字体
   */
  getFillArea(): object {
    //获取边框区域，实际填充区域=坐标-边框区域
    let disabled = this.getBorderInfo(null, 1, "disabled");
    let color = this.getBorderInfo(null, 1, "color");
    let opacity = this.getBorderInfo(null, 1, "opacity");
    let width = this.getBorderInfo(null, 1, "width");

    //计算填充的原始区域
    if (!(!disabled && color && (!opacity || opacity > 0) && width > 0)) {
      width = 0
    }
    let absBounds = this.model.getAbsBounds();
    let fillAreaE = {
      x: absBounds.x - width,
      y: absBounds.y - width,
      width: absBounds.width + 2 * width,
      height: absBounds.height + 2 * width
    }
    return fillAreaE;
  }

  /**
   * 绘制选中图形特效
   */
  drawIncludedStyle(): void {
    //选中被选择器包含的控件
    let includedModels: Map<string, DDeiAbstractShape> | null = null;
    let selectNumber = 0
    if (this.model.state == DDeiEnumControlState.DEFAULT) {
      includedModels = this.model.getIncludedModels();
    } else if (this.model.state == DDeiEnumControlState.SELECTED) {
      includedModels = this.stage.layers[this.stage.layerIndex].getSelectedModels();
      selectNumber = 1
    }
    if (includedModels && includedModels.size > selectNumber) {
      includedModels.forEach((model, key) => {
        //绘制临时Border
        //TODO 样式的配置
        model.render.drawBorder({ width: 1, color: "red" });
      });
    }

  }

  /**
   * 鼠标移动事件，经由上层容器分发
   */
  mouseMove(evt: Event): void {
    let offsetX = evt.offsetX;
    let offsetY = evt.offsetY;
    //判断当前坐标是否位于操作按钮上
    if (this.isIconOn(1, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 1 }, evt);
    }
    //右上
    else if (this.isIconOn(2, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 2 }, evt);
    }
    //右中
    else if (this.isIconOn(3, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 3 }, evt);
    }
    //右下
    else if (this.isIconOn(4, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 4 }, evt);
    }
    //中下
    else if (this.isIconOn(5, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 5 }, evt);
    }
    //左下
    else if (this.isIconOn(6, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 6 }, evt);
    }
    //左中
    else if (this.isIconOn(7, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 7 }, evt);
    }
    //左上
    else if (this.isIconOn(8, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 8 }, evt);
    }
    //旋转
    else if (this.isIconOn(9, offsetX, offsetY)) {
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 9 }, evt);
    } else {
      //判断是否在某个具体选中的控件上，如果是则分发事件
      let models = this.stage?.layers[this.stage?.layerIndex].findModelsByArea(offsetX, offsetY);
      if (models && models.length > 0) {
        //普通拖动
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: 10 }, evt);
      } else {
        //清空
        this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeSelectorPassIndex, { passIndex: -1 }, evt);
      }
    }
    this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
  }

  /**
  * 鼠标按下事件，经由上层容器分发
  */
  mouseDown(evt: Event): void {
    //判断当前坐标是否位于操作按钮上,如果是则改变状态为响应状态

    if (this.model.passIndex >= 1 && this.model.passIndex <= 8) {
      let dragObj = {
        x: evt.offsetX,
        y: evt.offsetY,
        dx: this.model.centerPointVector.x - evt.offsetX,//鼠标在控件中心坐标的增量位置
        dy: this.model.centerPointVector.y - evt.offsetY,
      }
      //获取当前层次选择的控件
      //计算移动后的坐标以及大小
      let pContainerModel = this.stage.render.currentOperateContainer;
      let selectedModels = pContainerModel.getSelectedModels();
      let layer = this.stage.layers[this.stage.layerIndex]
      selectedModels.forEach(m => {
        let md = DDeiUtil.getShadowControl(m);
        layer.shadowControls.push(md);
      });
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
      //当前操作状态：改变控件大小中
      this.stageRender.operateState = DDeiEnumOperateState.CONTROL_CHANGING_BOUND

    }
    //旋转
    else if (this.model.passIndex == 9) {
      let dragObj = {
        x: evt.offsetX,
        y: evt.offsetY
      }
      this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.UpdateDragObj, { dragObj: dragObj }, evt);
      //当前操作状态：改变控件大小中
      this.stageRender.operateState = DDeiEnumOperateState.CONTROL_ROTATE
    }
    //记录当前拖拽状态
    if (this.model.passIndex != -1) {

    }
  }


  /**
  * 计算移动后的坐标
  * @param x 
  * @param y
  * @param er 是否等比
  */
  getMovedBounds(x: number, y: number, er: boolean = false): object {
    let returnBounds = { x: this.model.x, y: this.model.y, width: this.model.width, height: this.model.height }
    //中心点
    let centerPointVector = this.model.centerPointVector;
    //旋转角度
    let rotate = this.model.rotate;
    //高度和宽度的比例
    let wbh = returnBounds.width / returnBounds.height;
    switch (this.model.passIndex) {
      //上中
      case 1: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        if (er) {
          returnBounds.x = returnBounds.x + dy * wbh / 2
          returnBounds.width = returnBounds.width - dy * wbh
        }
        break;
      }
      //上右
      case 2: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        let dx = x - centerPointVector.x - returnBounds.width / 2
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        returnBounds.width = returnBounds.width + dx
        break;
      }
      //中右
      case 3: {
        let dx = x - centerPointVector.x - returnBounds.width / 2
        returnBounds.width = returnBounds.width + dx
        if (er) {
          returnBounds.y = returnBounds.y - (dx / wbh / 2)
          returnBounds.height = returnBounds.height + (dx / wbh)
        }
        break;
      }
      //下右
      case 4: {
        let dx = x - centerPointVector.x - returnBounds.width / 2
        let dy = y - centerPointVector.y - returnBounds.height / 2
        returnBounds.width = returnBounds.width + dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //下中
      case 5: {
        let dy = y - centerPointVector.y - returnBounds.height / 2
        returnBounds.height = returnBounds.height + dy
        if (er) {
          returnBounds.x = returnBounds.x - dy * wbh / 2
          returnBounds.width = returnBounds.width + dy * wbh
        }
        break;
      }
      //下左
      case 6: {
        let dy = y - centerPointVector.y - returnBounds.height / 2
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //中左
      case 7: {
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        if (er) {
          returnBounds.y = returnBounds.y + (dx / wbh / 2)
          returnBounds.height = returnBounds.height - (dx / wbh)
        }
        break;
      }
      //上左
      case 8: {
        let dy = y - (centerPointVector.y - returnBounds.height / 2)
        let dx = -((centerPointVector.x - x) - returnBounds.width / 2)
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        break;
      }
      default: {
        break;
      }
    }
    return returnBounds;
  }

  /**
   * 判断是否在某个图标上
   * @param direct 
   */
  isIconOn(direct: number, x: number, y: number): boolean {
    if (this.model?.currentOPVS[direct]) {
      let pv = this.model.currentOPVS[direct];
      if (pv) {
        //操作图标的宽度
        //获取全局缩放比例
        let width = DDeiConfig.SELECTOR.OPERATE_ICON.weight;
        let halfWidth = width * 0.5;
        return DDeiAbstractShape.isInsidePolygon(
          [
            { x: pv.x - halfWidth, y: pv.y - halfWidth },
            { x: pv.x + halfWidth, y: pv.y - halfWidth },
            { x: pv.x + halfWidth, y: pv.y + halfWidth },
            { x: pv.x - halfWidth, y: pv.y + halfWidth }
          ]
          , { x: x, y: y });
      }
    }
    return false;
  }
}

export default DDeiSelectorCanvasRender