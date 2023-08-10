import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiAbstractShape from './shape'

/**
 * rectangle（矩形）包含了正方形与长方形。
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiRectangle extends DDeiAbstractShape {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
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
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json): any {
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiRectangle {
    let shape = new DDeiRectangle(json);
    return shape;
  }
  // ============================ 属性 ===============================
  //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
  border: any;
  //填充，包含了选中/未选中，填充的颜色等配置
  fill: any;
  //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
  font: any;
  //文本内容
  text: string;
  //文本区域，文本绘制时的有效区域，由多个矩形数组构成，缺省为图形本身区域构造成的一个矩形，需要修改图形属性后维护。
  textArea: any;
  //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
  textStyle: any;
  // 本模型的唯一名称
  modelType: string = 'DDeiRectangle';
  // 本模型的基础图形
  baseModelType: string = 'DDeiRectangle';
  // ============================ 方法 ===============================

  /**
   * 初始化渲染器
   */
  initRender(): void {

    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
  }

  /**
   * 转换为JSON的序列化方法
   */
  toJSON(): object {
    var json = this.getBaseJSON()
    return json
  }

  /**
   * 获取基本JSON
   */
  getBaseJSON(): object {
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
}


export default DDeiRectangle
