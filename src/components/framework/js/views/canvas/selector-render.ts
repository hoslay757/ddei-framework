import DDeiSelector from '../../models/selector.js';
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
    //绘制边框
    this.drawBorder();

    //绘制填充
    this.drawFill();

    //绘制选中控件特效
    this.drawIncludedStyle();
  }

  /**
   * 绘制选中图形特效
   */
  drawIncludedStyle(): void {
    //选中被选择器包含的控件
    let includedModels: Map<string, AbstractShape> = this.model.getIncludedModels();
    if (includedModels.size > 0) {
      includedModels.forEach((model, key) => {
        //绘制临时Border
        //TODO 样式的配置
        model.render.drawBorder({ width: 2, color: "red" });
      });
    }

  }
}

export default DDeiSelectorCanvasRender