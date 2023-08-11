import DDeiConfig from '../config';
import DDeiEnumControlState from '../enums/control-state';
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
  baseModelType: string = 'DDeiContainer';
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
    model.layer = this.layer;
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

  /**
   * 通过下层模型更新本层模型的信息
   */
  updateBoundsByModels(): void {
    let subModels = Array.from(this.models.values());
    //换算为上层容器坐标
    subModels.forEach((si, key) => {
      si.x = si.x + this.x
      si.y = si.y + this.y
    });
    let outRect = DDeiAbstractShape.getOutRect(subModels);
    this.setBounds(outRect.x, outRect.y, outRect.width, outRect.height);
    //换算为下层容器坐标
    subModels.forEach((si, key) => {
      si.x = si.x - this.x
      si.y = si.y - this.y
    });
  }

  /**
  * 获取选中状态的所有控件
  * @returns 
  */
  getSelectedModels(): Map<string, DDeiAbstractShape> {
    let controls = new Map();
    this.models.forEach((item, key) => {
      if (item.state == DDeiEnumControlState.SELECTED) {
        controls.set(item.id, item);
      }
    });
    return controls;
  }

  /**
   * 取消选择控件,默认取消所有
   */
  cancelSelectModels(models: DDeiAbstractShape[] | undefined): void {
    if (!models) {
      models = Array.from(this.models.values());
    }
    models.forEach(item => {
      item.state = DDeiEnumControlState.DEFAULT
    });
  }

  /**
   * 取消选择控件,默认取消所有
   */
  cancelAllLevelSelectModels(): void {
    this.models.forEach(item => {
      item.state = DDeiEnumControlState.DEFAULT
      if (item.baseModelType == "DDeiContainer") {
        item.cancelAllLevelSelectModels();
      }
    });
  }
  /**
   * 修改子模型的大小
   */
  changeSelfAndChildrenBounds(originRect, newRect): boolean {
    let models: DDeiAbstractShape[] = Array.from(this.models.values());
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
      item.x = newRect.width * originPosMap.get(item.id).xR
      item.width = newRect.width * originPosMap.get(item.id).wR
      item.y = newRect.height * originPosMap.get(item.id).yR
      item.height = newRect.height * originPosMap.get(item.id).hR
      //如果当前模型是容器，则按照容器比例更新子元素的大小
      if (item.baseModelType == "DDeiContainer") {
        let changedBound = { x: item.x, y: item.y, width: item.width, height: item.height };
        item.changeSelfAndChildrenBounds(originBound, changedBound)
      };
    })
    return true;
  }
}

export default DDeiRectContainer
