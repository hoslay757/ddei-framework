import { DDeiConfig, MODEL_CLS } from '../config';
import DDeiAbstractShape from './shape';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManager from '../layout/layout-manager';
import DDeiLayoutManagerFactory from '../layout/layout-manager-factory';
import DDei from '../ddei';
import DDeiRectContainer from './rect-container';

/**
 * 组合容器继承自容器，仅用于处理组合式控件，组合控件不存在布局管理器，有以下特性：
 * 1.大小联动，容器大小永远等于所有子控件的外接矩形
 * 2.删除容器，子控件一并删除
 * 3.子控件数量<=1时，容器自动删除，组合关系破裂
 */
class DDeiComposeContainer extends DDeiRectContainer {

  constructor(props: object) {
    super(props);
    this.layout = null;
    this.layoutManager = null;
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let container = new DDeiComposeContainer(json);

    container.layer = tempData['currentLayer']
    container.stage = tempData['currentStage']
    container.pModel = tempData['currentContainer']
    if (!container.pModel) {
      container.pModel = container.layer;
    }
    tempData[container.id] = container;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    for (let key in json.models) {
      tempData['currentContainer'] = container;
      let item = json.models[key];
      let model = MODEL_CLS[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      tempData['currentContainer'] = null;
    }

    container.models = models;
    container.initPVS();
    container.initRender();
    return container;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiComposeContainer {
    let model = new DDeiComposeContainer(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiComposeContainer";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiComposeContainer';
  // 本模型的基础图形
  baseModelType: string = 'DDeiContainer';
  // ============================ 方法 ===============================
  /**
   * 修改子元素大小
   */
  changeChildrenBounds(originRect, newRect): boolean {
    let models: DDeiAbstractShape[] = Array.from(this.models.values());
    if (!originRect) {
      originRect = DDeiAbstractShape.pvsToOutRect(models)
    }

    if (!newRect) {
      debugger
    }
    //记录每一个图形在原始矩形中的比例
    let originPosMap: Map<string, object> = new Map();
    //获取模型在原始模型中的位置比例
    for (let i = 0; i < models.length; i++) {
      let item = models[i]
      originPosMap.set(item.id, {
        xR: item.x / originRect.width,
        yR: item.y / originRect.height,
        wR: item.width / originRect.width,
        hR: item.height / originRect.height
      });
    }
    //同步多个模型到等比缩放状态
    models.forEach(item => {
      let originBound = { x: item.x, y: item.y, width: item.width, height: item.height };
      let x = newRect.width * originPosMap.get(item.id).xR
      let width = newRect.width * originPosMap.get(item.id).wR
      let y = newRect.height * originPosMap.get(item.id).yR
      let height = newRect.height * originPosMap.get(item.id).hR
      item.setBounds(x, y, width, height)
      //如果当前模型是容器，则按照容器比例更新子元素的大小
      if (item.baseModelType == "DDeiContainer") {
        let changedBound = { x: item.x, y: item.y, width: item.width, height: item.height };
        item.changeChildrenBounds(originBound, changedBound)
      };
    })
    return true;
  }

}

export default DDeiComposeContainer
