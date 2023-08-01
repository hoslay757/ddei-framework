/**
 * rectangle（矩形）包含了正方形与长方形。
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
import DDeiConfig from '../config'

const global = window

const DDeiRectangle = function (props) {
  this.id = props.id
  //坐标与宽高，实际的图形区域，根据这四个属性用来绘制图形
  this.x = props.x ? props.x : 0
  this.y = props.y ? props.y : 0
  this.width = props.width ? props.width : 0
  this.height = props.height ? props.height : 0

  /**
   * 外部区域，用来响应相关事件的虚拟图形
   * 绘制图形时才会初始化，比实际图形区域要大一些
   * 序列化时不会保存
   */
  this.outerArea = null;

  //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
  this.border = props.border ? props.border : null;

  //填充，包含了选中/未选中，填充的颜色等配置
  this.fill = props.fill ? props.fill : null;

  //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
  this.font = props.font ? props.font : null;


  //文本内容
  this.text = props.text ? props.text : "";

  //文本区域，文本绘制时的有效区域，由多个矩形数组构成，缺省为图形本身区域构造成的一个矩形，需要修改图形属性后维护。
  this.textArea = props.textArea ? props.textArea : null;

  //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
  this.textStyle = props.textStyle ? props.textStyle : null;

  //TODO 镂空，0/null不镂空，1镂空，缺省0，合并到textStyle属性中
  this.hollow = props.hollow ? props.hollow : null;
  // 旋转,0/null 不旋转，默认0
  this.rotate = props.rotate ? props.rotate : null;
  // 缩放,1/null，不缩放,默认1
  this.zoom = props.zoom ? props.zoom : null;



  // 是否选中为false
  this.selected = false

  // 本模型的唯一名称
  this.modelType = 'DDeiRectangle'
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
DDeiRectangle.prototype.initRender = function () {

  //绑定并初始化渲染器
  DDeiConfig.bindRender(this);
  this.render.init();
}

/**
 * 转换为JSON的序列化方法
 */
DDeiRectangle.prototype.toJSON = function () {
  var json = this.getBaseJSON()
  return json
}

/**
 * 获取基本JSON
 */
DDeiRectangle.prototype.getBaseJSON = function () {
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
DDeiRectangle.loadFromJSON = function (json) {
}

// 通过JSON初始化对象，数据未传入时将初始化数据
DDeiRectangle.initByJSON = function (json) {
  let shape = new DDeiRectangle(json);
  return shape;
}
// ============================ 静态函数 End ============================

global.DDeiRectangle = DDeiRectangle

export default DDeiRectangle
