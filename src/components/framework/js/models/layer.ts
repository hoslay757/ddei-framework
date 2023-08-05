import DDeiConfig from '../config'
import DDeiEnumControlState from '../enums/control-state';
import DDeiAbstractShape from './shape';
import DDeiStage from './stage';

/**
 * Layer（图层），图层上才会承载图像，多个图层之间可以切换上下级关系。
 * 位于上层的图层将覆盖位于下层的图层，事件从上层图层往下传递
 */
class DDeiLayer {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.models = new Map();
    this.modelType = 'DDeiLayer'
    this.stage = null;
    this.index = -1;
    this.type = props.type ? props.type : 0;
    this.background = props.background ? props.background : null;
    this.display = props.display ? props.display : true;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json): any {
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiLayer {
    let layer = new DDeiLayer(json);
    return layer;
  }
  // ============================ 属性 ===============================
  id: string;
  // 一个图层包含多个图像
  models: Map<string, DDeiAbstractShape>;
  // 本模型的唯一名称
  modelType: string = 'DDeiLayer';
  // 当前layer所在的stage
  stage: DDeiStage | null;
  // 当前layer的下标，该属性与实际的图层index保持同步
  index: number;
  /**
   * 图层类型：0普通图层,99背景图层，
   * 背景图层：只有背景相关信息，没有事件等
   * 普通图层：除了背景还能相应事件等
   */
  type: number;
  // 背景信息，为一个json，包含了背景的类型，以及各种类型下的详细定义
  background: any;
  // 当前图层是否显示，true显示，false不显示
  display: boolean;
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
   * 获取某个选中区域的所有控件
   * @param area 选中区域
   * @returns 
   */
  findModelsByArea(x = undefined, y = undefined, width = 0, height = 0): DDeiAbstractShape[] | null {
    let controls = [];
    this.models.forEach((item, key) => {
      if (item.isInSelectArea(x, y, width, height)) {
        controls.push(item);
      }
    });
    //TODO 对控件进行排序，按照zIndex > 添加顺序
    return controls;
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
   * 转换为JSON的序列化方法
   */
  toJSON(): object {
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
  getBaseJSON(): object {
    var json = {
      id: this.id,
      modelType: this.modelType
    }
    return json
  }

}

export default DDeiLayer
