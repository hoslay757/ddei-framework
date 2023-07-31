/**
 * DDeiShape的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
import DDeiConfig from '../../config.js'

const global = window

const DDeiShapeCanvasRender = function (props) {
  this.model = props.model;
}

// ============================ 类方法 Start ============================
/**
 * 初始化
 */
DDeiShapeCanvasRender.prototype.init = function () {
  this.ddRender = this.model.stage.ddInstance.render
}

/**
 * 创建图形
 */
DDeiShapeCanvasRender.prototype.createShape = function () {

}
// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// ============================ 静态函数 End ============================

global.DDeiShapeCanvasRender = DDeiShapeCanvasRender

export default DDeiShapeCanvasRender