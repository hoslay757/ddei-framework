import DDeiConfig from '../config'
import DDeiAbstractShape from './shape'
import DDeiUtil from '../util';

/**
 * polygon由3个以上点构成的图形
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiPolygon extends DDeiAbstractShape {
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
    //图片base64
    this.imgBase64 = props.imgBase64 ? props.imgBase64 : "";

    //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
    this.textStyle = props.textStyle ? props.textStyle : null;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json: object, tempData: object = {}): DDeiPolygon {
    let model = new DDeiPolygon(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    model.initRender();
    return model;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json: object, tempData: object = {}): DDeiPolygon {
    let model = new DDeiPolygon(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiPolygon";
  // ============================ 属性 ===============================
  //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
  border: any;
  //填充，包含了选中/未选中，填充的颜色等配置
  fill: any;
  //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
  font: any;
  //图片base64
  imgBase64: string;
  //文本内容
  text: string;
  //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
  textStyle: any;
  // 本模型的唯一名称
  modelType: string = 'DDeiPolygon';
  // 本模型的基础图形
  baseModelType: string = 'DDeiPolygon';
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
   * 返回某个点，相对于该图形的角度
   */
  getPointAngle(point): number {
    //上
    if (DDeiUtil.isPointInLine(point, this.pvs[0], this.pvs[1])) {
      return DDeiUtil.getLineAngle(0, 0, 0, -2)
    }
    //右
    else if (DDeiUtil.isPointInLine(point, this.pvs[1], this.pvs[2])) {
      return DDeiUtil.getLineAngle(0, 0, 2, 0)
    }
    //下
    else if (DDeiUtil.isPointInLine(point, this.pvs[2], this.pvs[3])) {
      return DDeiUtil.getLineAngle(0, 0, 0, 2)
    }
    //左
    else if (DDeiUtil.isPointInLine(point, this.pvs[3], this.pvs[0])) {
      return DDeiUtil.getLineAngle(0, 0, -2, 0)
    }
  }



}


export default DDeiPolygon
