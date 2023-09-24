import DDeiRectangle from './rectangle'

/**
 * diamond（菱型）可以看作一个矩形，继承自矩形
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiDiamond extends DDeiRectangle {

  /**
  * 计算当前图形旋转后的顶点，根据位移以及层次管理
  */
  calRotatePointVectors(): void {

    super.calRotatePointVectors();
    let pv = []
    for (let i = 0; i < this.pointVectors.length; i++) {
      let s = null;
      let e = null;
      if (i == this.pointVectors.length - 1) {
        s = this.pointVectors[i];
        e = this.pointVectors[0];
      } else {
        s = this.pointVectors[i];
        e = this.pointVectors[i + 1];
      }
      let p = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 }
      pv.push(p);
    }
    this.pointVectors = pv;
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let model = new DDeiDiamond(json);
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
  static initByJSON(json): DDeiDiamond {
    let shape = new DDeiDiamond(json);
    return shape;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiDiamond";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiDiamond';
  // 本模型的基础图形
  baseModelType: string = 'DDeiRectangle';

}

export default DDeiDiamond
