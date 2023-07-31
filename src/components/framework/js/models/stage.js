/**
 * Stage(舞台),代表一张完整的图像。
 * 每个Stage包含多个Layer（图层），图层上才会承载图像
 */
import DDeiConfig from '../config'

const global = window

const DDeiStage = function (props) {
  this.id = props.id
  // 一个舞台包含多个图层
  this.layers = [];
  // 当前的图层下标
  this.layerIndex = props.layerIndex ? props.layerIndex : -1;
  //当前图形的ID种子，用于生成图形ID，在新增过程中会不断增加，会序列化以确保ID不重复
  this.idIdx = props.idIdx ? props.idIdx : 0;
  // 本模型的唯一名称
  this.modelType = 'DDeiStage'
  // 当前模型挂载的ddei实例
  this.ddInstance = null;

}

// ============================ 类方法 Start ============================

/**
 * 初始化渲染器
 */
DDeiStage.prototype.initRender = function () {
  //绑定并初始化渲染器
  DDeiConfig.bindRender(this);
  this.render.init();
  //加载所有图层的渲染器
  for (let i = 0; i < this.layers.length; i++) {
    this.layers[i].initRender();
  }
}

/**
 * 转换为JSON的序列化方法
 */
DDeiStage.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  let layersJSON = [];
  //遍历获取模型的JSON
  for (let i = 0; i < this.layers.length; i++) {
    layersJSON[i] = this.layers[i].toJSON();
  }
  json.layers = layersJSON;
  return json
}

/**
 * 获取基本JSON
 */
DDeiStage.prototype.getBaseJSON = function () {
  var json = {
    id: this.id,
    layerIndex: this.layerIndex,
    modelType: this.modelType
  }
  return json
}


// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
DDeiStage.loadFromJSON = function (json) {
}

// 通过JSON初始化对象，数据未传入时将初始化数据
DDeiStage.initByJSON = function (json) {
  let stage = new DDeiStage(json);
  //初始化三个Layer
  let dDeiLayer1 = DDeiLayer.initByJSON({ id: "layer_top" });
  dDeiLayer1.index = 0;
  dDeiLayer1.stage = stage;
  let dDeiLayer2 = DDeiLayer.initByJSON({ id: "layer_background", type: 99 });
  dDeiLayer2.index = 1;
  dDeiLayer2.stage = stage;
  stage.layers[0] = dDeiLayer1;
  stage.layers[1] = dDeiLayer2;
  stage.layerIndex = 0;
  return stage;
}

// ============================ 静态函数 End ============================

global.DDeiStage = DDeiStage

export default DDeiStage
