import DDeiConfig from '../config'
import DDeiLayer from './layer';
import DDei from '../ddei';
import DDeiAbstractShape from './shape';
import DDeiUtil from '../util';


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
    this.layerIndex = props.layerIndex != undefined && props.layerIndex != null && props.layerIndex >= 0 ? props.layerIndex : -1;
    this.idIdx = props.idIdx ? props.idIdx : 0;
    this.unicode = props.unicode ? props.unicode : DDeiUtil.getUniqueCode()
    this.histroy = props.histroy ? props.histroy : [];
    this.histroyIdx = props.histroyIdx || props.histroyIdx == 0 ? props.histroyIdx : -1;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================



  /**
   * 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
   */
  static loadFromJSON(json: object, tempData: object = {}): any {
    let stage = new DDeiStage(json);
    stage.ddInstance = tempData["currentDdInstance"]
    tempData['currentStage'] = stage
    tempData[stage.id] = stage
    let layers = [];
    json.layers.forEach(layer => {
      let model = DDeiLayer.loadFromJSON(layer, tempData);
      layers.push(model);
    })
    stage.layers = layers
    stage.initHistroy();
    stage.initRender();
    return stage;
  }

  /**
   * 通过JSON初始化对象，数据未传入时将初始化数据
   */
  static initByJSON(json: object, tempData: object = {}): DDeiStage {
    let stage = new DDeiStage(json);
    stage.ddInstance = tempData["currentDdInstance"]
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

    stage.initHistroy();
    return stage;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiStage";

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
  // 当前画布、当前layer选中的图形，切换画布layerIndex后会变化
  selectedModels: Map<string, DDeiAbstractShape> | null = null;

  //操作日志，用于保存、撤销和恢复
  histroy: object[] = []
  histroyIdx: number = -1;

  unicode: string;
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
  cancelSelectModels(models: DDeiAbstractShape[] | undefined, ignoreModels: DDeiAbstractShape[] | undefined): void {
    for (let i = 0; i < this.layers.length; i++) {
      this.layers[i].cancelSelectModels(models, ignoreModels);
    }
  }

  /**
   * 根据ID获取控件
   * @param id 控件ID
   * @param allLayer 是否查询所有layer，true是，false只查询当前layer
   */
  getModelById(id: string, allLayer: boolean = false): DDeiAbstractShape | null {
    let reutrnModel = null;
    let curLayer = this.layers[this.layerIndex];
    if (curLayer) {
      reutrnModel = curLayer.getModelById(id);
    }
    if (!reutrnModel && allLayer) {
      for (let i = 0; i < this.layers.length; i++) {
        if (i != this.layerIndex) {
          reutrnModel = this.layers[i].getModelById(id);
          if (reutrnModel) {
            break;
          }
        }
      }
    }
    return reutrnModel;
  }

  /**
   * 更改选中控件
   */
  changeSelecetdModels(selectedModels: Map<string, DDeiAbstractShape> | null) {
    if (this.selectedModels != selectedModels) {
      this.selectedModels = selectedModels;
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
  getAlignModels(bounds: object, souceModels: Map<string, DDeiAbstractShape> | Array<DDeiAbstractShape>): object {
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
      if (souceModels.set) {
        souceModels = Array.from(souceModels.values());
      }
      let find = false;
      for (let k = 0; k < souceModels.length; k++) {
        if (souceModels[k]?.id == model.id) {
          find = true;
          break;
        }
      }
      if (find) {
        return;
      }

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
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    let skipFields = DDeiConfig.SERI_FIELDS[this.modelType]?.SKIP;
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.SKIP;
    }
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.SKIP;
    }

    let toJSONFields = DDeiConfig.SERI_FIELDS[this.modelType]?.TOJSON;
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.TOJSON;
    }
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.TOJSON;
    }
    for (let i in this) {
      if ((!skipFields || skipFields?.indexOf(i) == -1)) {
        if (toJSONFields && toJSONFields.indexOf(i) != -1 && this[i]) {
          if (Array.isArray(this[i])) {
            let array = [];
            this[i].forEach(element => {
              if (Array.isArray(element)) {
                let subArray = [];
                element.forEach(subEle => {

                  if (subEle?.toJSON) {
                    subArray.push(subEle.toJSON());
                  } else {
                    subArray.push(subEle);
                  }
                })
                array.push(subArray);
              } else if (element?.toJSON) {
                array.push(element.toJSON());
              } else {
                array.push(element);
              }
            });
            json[i] = array;
          } else if (this[i].set) {
            let map = {};
            this[i].forEach((element, key) => {
              if (element?.toJSON) {
                map[key] = element.toJSON();
              } else {
                map[key] = element;
              }
            });
            json[i] = map;
          } else if (this[i].toJSON) {
            json[i] = this[i].toJSON();
          } else {
            json[i] = this[i];
          }
        } else {
          json[i] = this[i];
        }
      }
    }
    return json;
  }

  /**
   * 初始化日志，记录初始化状态
   */
  initHistroy() {
    if (this.histroy.length == 0 && this.histroyIdx == -1) {
      this.histroy.push({ time: new Date().getTime(), data: JSON.stringify(this.toJSON()) })
      this.histroyIdx = 0
    }
  }
  /**
   * 记录日志
   * @param layerIndex 图层下标
   */
  addHistroy(data: object) {
    //抛弃后面的记录
    if (this.histroyIdx == -1) {
      this.histroy = this.histroy.slice(0, 1)
      this.histroyIdx = 0
    } else {
      this.histroy = this.histroy.slice(0, this.histroyIdx + 1)
    }
    //插入新纪录，并设置下标到最后
    this.histroy.push({ time: new Date().getTime(), data: data });
    this.histroyIdx = this.histroy.length - 1;
  }

  /**
   * 返回上一个历史数据，并将下标-1
   * @param layerIndex 图层下标
   */
  revokeHistroyData() {
    //抛弃后面的记录
    if (this.histroyIdx != -1) {
      this.histroyIdx--;
      if (this.histroyIdx == -1) {
        this.histroyIdx = 0
        return this.histroy[0];
      } else {
        return this.histroy[this.histroyIdx];
      }
    }
  }

  /**
   * 撤销上一次撤销并将下标+1
   * @param layerIndex 图层下标
   */
  reRevokeHistroyData() {
    //抛弃后面的记录
    if (this.histroyIdx < this.histroy.length - 1) {
      this.histroyIdx++;
      return this.histroy[this.histroyIdx];
    }
  }

}

export default DDeiStage
