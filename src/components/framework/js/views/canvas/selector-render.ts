import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiUtil from '../../util.js';
import DDeiRectangleCanvasRender from './rectangle-render.js';

/**
 * DDeiSelector的渲染器类，用于渲染选择器
 */
class DDeiSelectorCanvasRender extends DDeiRectangleCanvasRender {
  // ============================== 方法 ===============================


  /**
   * 创建图形
   */
  drawShape(): void {

    this.drawBorder();

    //绘制填充
    this.drawFill();

    //绘制选中控件特效
    this.drawIncludedStyle();
  }

  /**
   * 取得边框的绘制区域
   */
  getBorderRatPos() {
    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    let ratPos = DDeiUtil.getRatioPosition(this.model, ratio);
    if (this.model.state == DDeiEnumControlState.SELECTED) {
      let paddingWidth: number = 10 * ratio;
      ratPos.x = ratPos.x - paddingWidth
      ratPos.y = ratPos.y - paddingWidth
      ratPos.width = ratPos.width + 2 * paddingWidth
      ratPos.height = ratPos.height + 2 * paddingWidth
    }
    return ratPos;
  }

  /**
   * 获取边框信息
   * @param tempBorder 
   */
  getBorderInfo(tempBorder, direct): object {
    let borderInfo = null;
    if (tempBorder) {
      borderInfo = tempBorder;
    } else {
      if (this.model.state == DDeiEnumControlState.SELECTED) {
        borderInfo = this.model.border && this.model.border && this.model.border.selected ? this.model.border.selected : DDeiConfig.SELECTOR.BORDER.selected;
      } else {
        borderInfo = this.model.border && this.model.border && this.model.border.default ? this.model.border.default : DDeiConfig.SELECTOR.BORDER.default;
      }
    }
    return borderInfo;
  }

  /**
   * 绘制选中图形特效
   */
  drawIncludedStyle(): void {
    //选中被选择器包含的控件
    let includedModels: Map<string, DDeiAbstractShape> | null = null;
    if (this.model.state == DDeiEnumControlState.DEFAULT) {
      includedModels = this.model.getIncludedModels();
    } else if (this.model.state == DDeiEnumControlState.SELECTED) {
      includedModels = this.model.layer.getSelectedModels();
    }
    if (includedModels && includedModels.size > 0) {
      includedModels.forEach((model, key) => {
        //绘制临时Border
        //TODO 样式的配置
        model.render.drawBorder({ width: 2, color: "red" });
      });
    }

  }
}

export default DDeiSelectorCanvasRender