import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiRectangle from './rectangle'

/**
 * circle（圆型）包含了椭圆和正圆，可以看作一个矩形，继承自矩形
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiCircle extends DDeiRectangle {

  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let model = new DDeiCircle(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;
    model.initRender();
    return model;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiCircle {
    let shape = new DDeiCircle(json);
    return shape;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiCircle";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiCircle';
  // 本模型的基础图形
  baseModelType: string = 'DDeiRectangle';

}

export {DDeiCircle}
export default DDeiCircle
