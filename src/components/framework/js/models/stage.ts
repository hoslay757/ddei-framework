import DDeiConfig from '../config'
import DDeiLayer from './layer';
import DDei from '../ddei';
import DDeiAbstractShape from './shape';
import DDeiUtil from '../util';
import DDeiLink from './link';
import { Vector3 } from 'three';
import DDeiLine from './line';


/**
 * Stage(舞台),代表一张完整的图像。
 * 每个Stage包含多个Layer（图层），图层上才会承载图像
 */
//批量修改模型属性的方法
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
    this.ratio = props.ratio ? props.ratio : DDeiConfig.STAGE_RATIO;
    this.width = props.width ? props.width : DDeiConfig.STAGE_WIDTH;
    this.height = props.height ? props.height : DDeiConfig.STAGE_HEIGHT;
    this.wpv = props.wpv;
    this.mark = props.mark;
    this.paper = props.paper;
    this.ruler = props.ruler;
    this.grid = props.grid;
    this.global = props.global;
    if (props.spv) {
      this.spv = new Vector3(props.spv.x, props.spv.y, 1)
    }

    this.links = []
    props?.links?.forEach(link => {
      this.links.push(link)
    });
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
    //加载links
    if (stage.links) {
      let links = []
      stage.links.forEach(lk => {
        let sm = null;
        let dm = null;
        if (lk.sm) {
          sm = lk.sm
        } else if (lk.smid) {
          sm = stage.getModelById(lk.smid)
        }
        if (lk.dm) {
          dm = lk.dm
        } else if (lk.dmid) {
          dm = stage.getModelById(lk.dmid)
        }
        let link = new DDeiLink({
          group: lk.group,
          smpath: lk.smpath,
          dmpath: lk.dmpath,
          stage: stage,
          sm: sm,
          dm: dm
        });
        links.push(link);
      })
      stage.links = links;
      stage.refreshLinkCache()
    }
    //初始化线
    let lines = stage.getModelsByBaseType("DDeiLine");
    lines.forEach(line => {
      line.initPVS()
      line.initLinkModels();
    })
    return stage;
  }

  /**
   * 通过JSON初始化对象，数据未传入时将初始化数据
   */
  static initByJSON(json: object, tempData: object = {}): DDeiStage {
    let stage = new DDeiStage(json);
    stage.ddInstance = tempData["currentDdInstance"]
    //初始化三个Layer
    let dDeiLayer1 = DDeiLayer.initByJSON({ id: "layer_default", name: "图层" });
    dDeiLayer1.index = 0;
    dDeiLayer1.stage = stage;
    stage.layers[0] = dDeiLayer1;
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
  //运行时的唯一标识，不会序列化
  unicode: string;

  //当前stage的缩放比率，默认1.0
  ratio: number = 1.2;

  //默认画布为2000 * 2000
  width: number;
  height: number;
  //当前视窗开始点，缺省为0，0, 0
  wpv: object;

  //关联，维护了统一画布上，跨图层的图形关联
  links: DDeiLink[];

  /**
   * 水印依附于stage存在，每个stage都可以有自己的水印
   * 水印可以控制大小，方向，透明度,字体，颜色等信息。可以是图片或文字
   * 可以经由外部动态传入
   */
  mark: any;

  /**
   * 纸张依附于stage存在，每种纸张都有自己的尺寸大小，方向
   * 大小以1.0缩放为基准
   * 一个画布上可以同时并排多张纸，也可以不设纸张，采用自动扩展的方式增加纸张
   */
  paper: any;

  //纸张和标量开始点的位置，初始化时默认为中心
  spv: Vector3 | null = null;

  /**
   * 标尺,可以控制标尺是否显示
   * 大小以1.0缩放为基准
   * 可以调整标尺的显示单位
   * 标尺的刻度随缩放大小而改变
   */
  ruler: any;

  /**
   * 网格线，可以调整是否显示网格线
   * 大小以1.0缩放为基准
   * 网格线的尺寸随缩放大小而改变
   */
  grid: any;

  modelCode: string = "DDeiStage"


  // ============================ 方法 ===============================


  /**
   * 添加连接点
   * @param link 链接点
   */
  addLink(...links: DDeiLink): void {
    links?.forEach(link => {
      if (link) {
        if (this.links.indexOf(link) == -1) {
          this.links.push(link);
        }
      }
    });
    this.refreshLinkCache()
  }

  /**
   * 删除连接点
   * @param link 链接点
   */
  removeLink(...links: DDeiLink): void {
    links?.forEach(link => {
      if (link) {
        let index = this.links.indexOf(link)
        if (index != -1) {
          this.links.splice(index, 1)
        }
      }
    });
    this.refreshLinkCache()
  }



  /**
   * 刷新链接缓存
   */
  refreshLinkCache(): void {
    this.sourceLinkCache = new Map()
    this.distLinkCache = new Map()
    this.links.forEach(link => {
      if (link.sm) {
        let smid = link.sm.id;
        if (!this.sourceLinkCache.has(smid)) {
          this.sourceLinkCache.set(smid, [])
        }
        let sourceLinks = this.sourceLinkCache.get(smid)
        if (sourceLinks.indexOf(link) == -1) {
          sourceLinks.push(link)
        }
      }
      if (link.dm) {
        let dmid = link.dm.id;
        if (!this.distLinkCache.has(dmid)) {
          this.distLinkCache.set(dmid, [])
        }
        let distLinks = this.distLinkCache.get(dmid)
        if (distLinks.indexOf(link) == -1) {
          distLinks.push(link)
        }
      }

    })
  }

  /**
   * 获取源模型的链接
   * @param modelId 模型ID
   */
  getSourceModelLinks(modelId: string): DDeiLink[] {
    if (modelId) {
      return this.sourceLinkCache?.get(modelId)
    }
  }

  /**
   * 获取目标模型的链接
   * @param modelId 模型ID
   */
  getDistModelLinks(modelId: string): DDeiLink[] {
    if (modelId) {
      return this.distLinkCache?.get(modelId)
    }
  }

  /**
   * 计算当前stage的模型总数量
   */
  calModelNumber(): number {
    let num = 0;
    this.layers.forEach(layer => {
      num += layer.calModelNumber()
    })
    return num;
  }




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
    //计算线的交叉
    DDeiLine.calLineCrossSync(this.layers[this.layerIndex]);
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
      layer = DDeiLayer.initByJSON({ id: "layer_" + curIdx, name: "图层-" + curIdx });
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
     * 获取画布缩放比率
     */
  getStageRatio(): number {
    let stageRatio = parseFloat(this.ratio) ? parseFloat(this.ratio) : 1.0
    if (!stageRatio || isNaN(stageRatio)) {
      stageRatio = DDeiConfig.STAGE_RATIO
    }
    return stageRatio
  }

  /**
   * 设置全局缩放比率
   */
  setStageRatio(newValue: number = 1.0): void {
    if (newValue != this.ratio) {
      if (this.ratio || this.ratio == 0) {
        this.oldRatio = this.ratio
      }
      this.ratio = newValue;
    }
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
  * @param temp 是否临时显示
  */
  displayLayer(layerIndex: number, temp: boolean = false) {
    if (!layerIndex || layerIndex < 0 || layerIndex > this.layers[layerIndex].length - 1) {
      layerIndex = this.layerIndex;
    }
    if (temp) {
      this.layers.forEach(layer => {
        layer.tempDisplay = false
      })
      this.layers[layerIndex].tempDisplay = true
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
    if (!layerIndex && layerIndex != 0) {
      layerIndex = this.layerIndex;
    }
    //如果layerIndex小于0，则移除最外层图层
    if (layerIndex < 0) {
      layerIndex = 0;
    }
    //如果下标超过了background图层，则移除background之前的一个图层
    else if (layerIndex > this.layers.length - 1) {
      layerIndex = this.layers.length - 1
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
  removeModel(model: DDeiAbstractShape, destroy: boolean = false): void {
    if (this.layerIndex != -1) {
      if (this.layers[this.layerIndex]) {
        this.layers[this.layerIndex].removeModel(model, destroy);
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
   * 根据基础模型获取控件
   * @param bmt 基础模型类别
   */
  getModelsByBaseType(bmt: string): DDeiAbstractShape[] {
    let returnValues = []
    this.layers.forEach(layer => {
      let datas = layer.getModelsByBaseType(bmt);
      datas.forEach(dt => {
        returnValues.push(dt);
      });
    })

    return returnValues;
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
  getLayerModels(ignoreModelIds: string[], level: number = 1): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    for (let i = 0; i < this.layers.length; i++) {
      let subModels = this.layers[i].getSubModels(ignoreModelIds, level)
      models = models.concat(subModels);
    }
    return models;
  }
  /**
   * 获取多个图层之间的所有对齐模型
   * @param data 判定的数据
   * @param souceModels 源模型,可能包含多个
   * @param points 判定的点，如果传入，则直接以这个点作为判定点，忽略其他点
   * @returns 
   */
  getAlignData(data: object, souceModels: Map<string, DDeiAbstractShape> | Array<DDeiAbstractShape>, points: object[] = null): object {
    //若干条横线和竖线
    let hpoint = {}
    let vpoint = {}
    let hasH = false
    let hasV = false
    //吸附
    let hAds = Infinity;
    let vAds = Infinity;

    // 排除源模型
    if (souceModels.set) {
      souceModels = Array.from(souceModels.values());
    }
    let fModel = null
    let sourceModelKeys = [];
    for (let k = 0; k < souceModels.length; k++) {
      let item = souceModels[k]
      let id = item.id;
      if (id.lastIndexOf("_shadow") != -1) {
        id = id.substring(id, id.lastIndexOf("_shadow"))
      }
      sourceModelKeys.push(id)
      if (!fModel) {
        fModel = this.getModelById(id);
      }
    }

    //当前当前屏幕、层级的所有控件
    let canvas = this.ddInstance.render.getCanvas();
    let rat1 = this.ddInstance.render.ratio
    let x = -this.wpv.x;
    let y = -this.wpv.y;
    let x1 = x + canvas.width / rat1;
    let y1 = y + canvas.height / rat1;
    let curLevelModels = fModel.pModel.getSubModels(sourceModelKeys, 1, { x: x, y: y, x1: x1, y1: y1 });
    curLevelModels.forEach(model => {
      //判定每一个点以及中心点,如果旋转角度不同，则只判断中心点

      let outPVS = points?.length > 0 ? points : data.pvs
      let inPVS = model.getAPVS()

      outPVS.forEach(pv => {
        inPVS?.forEach(mpv => {

          //横向相等
          let pvy = pv.y
          let pvx = pv.x
          let mpvy = mpv.y
          let mpvx = mpv.x
          if (Math.abs(pvy - mpvy) < 1) {
            hasH = true;
            if (!hpoint[pvy]) {
              hpoint[pvy] = { sx: Math.min(pvx, mpvx), ex: Math.max(pvx, mpvx) }
            } else {
              hpoint[pvy].sx = Math.min(hpoint[pvy].sx, pvx, mpvx)
              hpoint[pvy].ex = Math.max(hpoint[pvy].sx, pvx, mpvx)
            }
          }
          if (hAds == Infinity && Math.abs(pvy - mpvy) <= DDeiConfig.GLOBAL_ADV_WEIGHT) {
            hAds = pvy - mpvy;
          }
          //纵向相等
          if (Math.abs(pvx - mpvx) < 1) {
            hasV = true;
            if (!vpoint[pvx]) {
              vpoint[pvx] = { sy: Math.min(pvy, mpvy), ey: Math.max(pvy, mpvy) }
            } else {
              vpoint[pvx].sy = Math.min(vpoint[pvx].sy, pvy, mpvy)
              vpoint[pvx].ey = Math.max(vpoint[pvx].sy, pvy, mpvy)
            }
          }

          if (vAds == Infinity && Math.abs(pvx - mpvx) <= DDeiConfig.GLOBAL_ADV_WEIGHT) {
            vAds = pvx - mpvx;
          }
        });
      });
    })
    return { hpoint: hasH ? hpoint : null, vpoint: hasV ? vpoint : null, hAds: hAds, vAds: vAds }
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
          } else if (this[i].set && this[i].has) {
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
