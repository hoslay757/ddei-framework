/**
 * DDeiStage的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
import DDeiConfig from '../../config.js'

const global = window

const DDeiStageCanvasRender = function (props) {
  this.model = props.model;
}

// ============================ 类方法 Start ============================
/**
 * 初始化
 */
DDeiStageCanvasRender.prototype.init = function () {
  this.ddRender = this.model.ddInstance.render
}

/**
 * 创建图形
 */
DDeiStageCanvasRender.prototype.drawShape = function () {
  for (let i = this.model.layers.length - 1; i >= 0; i--) {
    this.model.layers[i].render.drawShape();
  }
}

// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// ============================ 静态函数 End ============================

global.DDeiStageCanvasRender = DDeiStageCanvasRender

export default DDeiStageCanvasRender