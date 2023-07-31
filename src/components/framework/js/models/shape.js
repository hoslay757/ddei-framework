/**
 * Shape（图像）是一个抽象类，图像分为容器和非容器。
 * 容器可以承载图像，图像则不能包含图像
 * 图像和容器都有一组公共的属性和行为
 * 在展示上，图像显示为一个很简陋的矩形
 * 图形的三个区域：
 *     1.用来响应事件的外部区域，对用户不可见，区域大于组件，存储时不存储该信息。
 *     2.图形固有的区域，等于x、y、width、height围绕的区域
 *     3.图形的文本区域，文本被固定在一个区域内，该区域一般是一个矩形，理论上小于等于第二个区域，存储时属性会同步存储
 */
import DDeiConfig from '../config'

const global = window

const DDeiShape = function (props) {
  this.id = props.id
  // 坐标
  this.x = props.x
  this.y = props.y
  // 大小
  this.width = props.width
  this.height = props.height
  // 本模型的唯一名称
  this.modelType = 'DDeiShape'
  // 当前模型所在的layer
  this.layer = null;
  // 当前模型所在的父模型
  this.pModel = null;
  // 当前模型所在的stage
  this.stage = null;
}

// ============================ 类方法 Start ============================

/**
 * 初始化渲染器
 */
DDeiShape.prototype.initRender = function () {

  //绑定并初始化渲染器
  DDeiConfig.bindRender(this);
  this.render.init();
}

/**
 * 转换为JSON的序列化方法
 */
DDeiShape.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  return json
}

/**
 * 获取基本JSON
 */
DDeiShape.prototype.getBaseJSON = function () {
  var json = {
    id: this.id,
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    modelType: this.modelType
  }
  return json
}
// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================
// 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
DDeiShape.loadFromJSON = function (json) {
}

// 通过JSON初始化对象，数据未传入时将初始化数据
DDeiShape.initByJSON = function (json) {
  let shape = new DDeiShape(json);
  return shape;
}
// ============================ 静态函数 End ============================

global.DDeiShape = DDeiShape

export default DDeiShape
