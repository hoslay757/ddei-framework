import DDeiConfig from '../config'
import DDeiLayer from './layer';
import DDei from '../ddei';
import DDeiAbstractShape from './shape';

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
   * 添加图层到某一层，如果不指定则添加到最外层
   * @param layer 被添加的图层
   * @param layerIndex 图层Index
   */
  addLayer(layer: DDeiLayer | undefined, layerIndex: number | undefined): DDeiLayer {
    //如果layer不存在，创建一个空图层，添加进去
    if (!layer) {
      let curIdx = this.idIdx++;
      layer = DDeiLayer.initByJSON({ id: "layer_" + curIdx });
      layer.stage = this;
    }
    //如果layerIndex不存在，则添加到最外层
    if (!layerIndex || layerIndex < 0) {
      layerIndex = 0;
    }
    //如果下标超过了background图层，则确保一定在background图层之前
    else if (layerIndex > this.layers.length - 1) {
      layerIndex = this.layers.length - 1
    }
    //添加图层到相应位置
    this.layers.splice(layerIndex, 0, layer);
    //对所有的图层属性进行维护
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].index = i;
    }
    //设置当前图层为新建图层
    this.layerIndex = layerIndex;

    return layer;
  }

  /**
   * 修改当前图层
   * @param layerIndex 图层下标
   */
  changeLayer(layerIndex: number) {
    this.layerIndex = layerIndex;
  }

  /**
   * 隐藏图层
   * @param layerIndex 图层下标，不传则为当前图层
   */
  hiddenLayer(layerIndex: number) {
    if (!layerIndex) {
      layerIndex = this.layerIndex;
    }
    this.layers[layerIndex].display = 0
  }

  /**
  * 显示图层
  * @param layerIndex 图层下标，不传则为当前图层
  * @param top 是否显示在最顶层
  */
  displayLayer(layerIndex: number, top: boolean) {
    if (!layerIndex || layerIndex < 0 || layerIndex > this.layers[layerIndex].length - 1) {
      layerIndex = this.layerIndex;
    }
    if (top) {
      this.layers[layerIndex].display = 2
      //将其他在顶层显示的图层改为非顶层
      for (let i = 0; i < this.layers.length; i++) {
        if (i != layerIndex && this.layers[i].display == 2) {
          this.layers[i].display = 1;
        }
      }
    } else {
      this.layers[layerIndex].display = 1
    }
  }

  /**
   * 移除图层,如果不指定则移除当前图层
   * @param layerIndex 移除图层的index
   */
  removeLayer(layerIndex: number | undefined): DDeiLayer {
    //如果layers只剩下background图层，则不允许移除
    if (this.layers.length <= 1) {
      return null;
    }
    //如果layerIndex不存在，创建一个空图层，添加进去
    if (!layerIndex) {
      layerIndex = this.layerIndex;
    }
    //如果layerIndex小于0，则移除最外层图层
    if (layerIndex < 0) {
      layerIndex = 0;
    }
    //如果下标超过了background图层，则移除background之前的一个图层
    else if (layerIndex > this.layers.length - 2) {
      layerIndex = this.layers.length - 2
    }

    //获取要移除的图层
    let layer = this.layers[layerIndex];

    //添加图层到相应位置
    this.layers.splice(layerIndex, 1);
    if (layerIndex > this.layers.length - 1) {
      layerIndex = this.layers.length - 1
    }
    //对所有的图层属性进行维护
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].index = i;
    }
    //设置当前图层为新建图层
    this.layerIndex = layerIndex;

    return layer;
  }

  /**
   * 添加模型到当前图层
   */
  addModel(model: DDeiAbstractShape): void {
    if (this.layerIndex != -1) {
      if (this.layers[this.layerIndex]) {
        this.layers[this.layerIndex].addModel(model);
      }
    }
  }

  /**
   * 移除当前图层模型
   */
  removeModel(model: DDeiAbstractShape): void {
    if (this.layerIndex != -1) {
      if (this.layers[this.layerIndex]) {
        this.layers[this.layerIndex].removeModel(model);
      }
    }
  }

  /**
   * 全部取消所有已选控件
   */
  cancelSelectModels(): void {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].cancelSelectModels();
    }
  }
  /**
   * 获取所有图层的模型
   */
  getLayerModels(): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].models.forEach((item, key) => {
        models.push(item);
      });
    }
    return models;
  }
  /**
   * 获取多个图层之间的所有对齐模型
   * @param bounds 坐标
   * @param souceModels 源模型,可能包含多个
   * @param ignoreModels 忽略判断的模型
   * @returns 
   */
  getAlignModels(bounds: object, souceModels: Map<string, DDeiAbstractShape>): object {
    let models = {
      leftAlignModels: [],
      rightAlignModels: [],
      topAlignModels: [],
      bottomAlignModels: [],
      horizontalCenterAlignModels: [],
      verticalCenterAlignModels: []
    }

    // 计算每个模型与位置的关系
    let sourceP = bounds;
    let distP
    this.getLayerModels().forEach(model => {
      // 排除源模型
      if (souceModels.has(model.id)) {
        return
      }
      // TODO // 包含在分组内则跳过
      // if (isGroupModel && sourceModel.includeModel(model)) {
      //   return
      // }
      distP = { x: model.x, y: model.y, width: model.width, height: model.height }
      if (DDeiAbstractShape.isLeftAlign(sourceP, distP)) {
        models.leftAlignModels.push(model)
      }
      if (DDeiAbstractShape.isRightAlign(sourceP, distP)) {
        models.rightAlignModels.push(model)
      }
      if (DDeiAbstractShape.isTopAlign(sourceP, distP)) {
        models.topAlignModels.push(model)
      }
      if (DDeiAbstractShape.isBottomAlign(sourceP, distP)) {
        models.bottomAlignModels.push(model)
      }
      if (DDeiAbstractShape.isHorizontalCenterAlign(sourceP, distP)) {
        models.horizontalCenterAlignModels.push(model)
      }
      if (DDeiAbstractShape.isVerticalCenterAlign(sourceP, distP)) {
        models.verticalCenterAlignModels.push(model)
      }
    })
    // 按照远近关系排序
    let sortFunc = function (aModel, bModel) {
      let xr = aModel.x - bModel.x
      if (xr !== 0) {
        return xr
      }
      return aModel.y - bModel.y
    }
    for (let key in models) {
      models[key].sort(sortFunc)
    }
    return models
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
