import DDeiConfig from '../config'
import DDeiLayer from './layer';
import DDei from '../ddei';

/**
 * Stage(舞台),代表一张完整的图像。
 * 每个Stage包含多个Layer（图层），图层上才会承载图像
 */
//TODO 批量修改模型属性的方法
class DDeiStage {

  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.layers = [];
    this.layerIndex = props.layerIndex ? props.layerIndex : -1;
    this.idIdx = props.idIdx ? props.idIdx : 0;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================
  /**
   * 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
   */
  static loadFromJSON(json: object): any {
  }

  /**
   * 通过JSON初始化对象，数据未传入时将初始化数据
   */
  static initByJSON(json: object): DDeiStage {
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

  // ============================ 属性 ===============================
  id: string;
  // 一个舞台包含多个图层
  layers: DDeiLayer[];
  // 当前的图层下标
  layerIndex: number;
  // 当前图形的ID种子，用于生成图形ID，在新增过程中会不断增加，会序列化以确保ID不重复
  idIdx: number;
  // 本模型的唯一名称
  modelType: string = "DDeiStage";
  // 当前模型挂载的ddei实例
  ddInstance: DDei | null = null;
  // ============================ 方法 ===============================
  /**
   * 初始化渲染器
   */
  initRender(): void {
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
  toJSON(): object {
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
  getBaseJSON(): object {
    var json = {
      id: this.id,
      layerIndex: this.layerIndex,
      modelType: this.modelType
    }
    return json
  }

}

export default DDeiStage
