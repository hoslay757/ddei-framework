/**
 * Layer（图层），图层上才会承载图像，多个图层之间可以切换上下级关系。
 * 位于上层的图层将覆盖位于下层的图层，事件从上层图层往下传递
 */
import DDeiConfig from '../config'

const global = window

const DDeiLayer = function (props) {
  this.id = props.id
  // 一个图层包含多个图像
  this.models = {};
  // 本模型的唯一名称
  this.modelType = 'DDeiLayer'
  // 当前layer所在的stage
  this.stage = null;
  // 当前layer的下标，该属性与实际的图层index保持同步
  this.index = -1;
  /**
   * 图层类型：0普通图层,99背景图层，
   * 背景图层：只有背景相关信息，没有事件等
   * 普通图层：除了背景还能相应事件等
   */
  this.type = props.type ? props.type : 0;
  // 背景信息，为一个json，包含了背景的类型，以及各种类型下的详细定义
  this.background = props.background ? props.background : null;
  // 当前图层是否显示，true显示，false不显示
  this.display = props.display ? props.display : true;
}

// ============================ 类方法 Start ============================

/**
 * 初始化渲染器
 */
DDeiLayer.prototype.initRender = function () {

  //绑定并初始化渲染器
  DDeiConfig.bindRender(this);
  this.render.init();
  //加载所有模型的渲染器
  for (let i in this.models) {
    this.models[i].initRender();
  }
}

/**
 * 转换为JSON的序列化方法
 */
DDeiLayer.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  let modelsJSON = {};
  //遍历获取模型的JSON
  for (let i in this.models) {
    modelsJSON[i] = this.models[i].toJSON();
  }
  json.models = modelsJSON;
  return json
}

/**
 * 获取基本JSON
 */
DDeiLayer.prototype.getBaseJSON = function () {
  var json = {
    id: this.id,
    modelType: this.modelType
  }
  return json
}
// ============================ 类方法 End ============================



// ============================ 静态函数 Start ============================

// 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
DDeiLayer.loadFromJSON = function (json) {
}

// 通过JSON初始化对象，数据未传入时将初始化数据
DDeiLayer.initByJSON = function (json) {
  let layer = new DDeiLayer(json);
  return layer;
}

// ============================ 静态函数 End ============================

global.DDeiLayer = DDeiLayer

export default DDeiLayer
