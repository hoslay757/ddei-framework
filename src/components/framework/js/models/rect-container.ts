import DDeiConfig from '../config';
import DDeiRectangle from './rectangle'
import DDeiAbstractShape from './shape';

/**
 * 普通容器是一个矩形，能包含其他容器
 */
class DDeiRectContainer extends DDeiRectangle {

  constructor(props: object) {
    super(props);
    this.layout = props.layout;
    this.models = props.models ? props.models : new Map();
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json): any {
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiRectContainer {
    let container = new DDeiRectContainer(json);
    return container;
  }

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiRectContainer';
  // 本模型的基础图形
  baseModelType: string = 'DDeiRectangle';
  //布局方式，null/0自由布局，缺省null
  layout: number;
  // 本容器包含的所有模型
  models: Map<string, DDeiAbstractShape>;

  // ============================ 方法 ===============================

  /**
  * 初始化渲染器
  */
  initRender(): void {

    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
    //加载所有模型的渲染器
    this.models.forEach((item, key) => {
      item.initRender()
    });
  }
  /**
   * 添加模型，并维护关系
   * @param model 被添加的模型
   */
  addModel(model: DDeiAbstractShape): void {
    model.stage = this.stage;
    //将模型添加进图层
    this.models.set(model.id, model);
    model.pModel = this;
  }

  /**
   * 移除模型，并维护关系
   * @param model 被移除的模型
   */
  removeModel(model: DDeiAbstractShape): void {
    this.models.delete(model.id);
    model.pModel = null;
    model.stage = null;
    model.render = null;
  }
}

export default DDeiRectContainer
