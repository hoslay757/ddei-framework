import DDeiConfig, { MODEL_CLS } from '../config'
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
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
    this.models = props.models ? props.models : new Map();
    this.midList = props.midList ? props.midList : new Array();
    this.stage = null;
    this.index = -1;
    this.background = props.background ? props.background : null;
    this.display = props.display ? props.display : 1;
    this.unicode = props.unicode ? props.unicode : DDeiUtil.getUniqueCode()
    this.bg = props.bg

  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let layer = new DDeiLayer(json);
    layer.stage = tempData['currentStage']
    tempData['currentLayer'] = layer;
    tempData[layer.id] = layer;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    for (let key in json.models) {
      let item = json.models[key];
      let model = MODEL_CLS[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
    }
    tempData['currentLayer'] = null;
    layer.models = models;
    layer.initRender();
    return layer;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiLayer {
    let layer = new DDeiLayer(json);
    return layer;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLayer";
  // ============================ 属性 ===============================
  id: string;
  // 一个图层包含多个模型，每添加一个模型，则向midList末尾添加一条数据
  models: Map<string, DDeiAbstractShape>;
  // 模型的ID按照添加顺序的索引
  midList: Array<string>;
  // 本模型的唯一名称
  modelType: string = 'DDeiLayer';
  baseModelType: string = 'DDeiLayer';
  // 当前layer所在的stage
  stage: DDeiStage | null;
  // 当前layer的下标，该属性与实际的图层index保持同步
  index: number;
  // 背景信息，为一个json，包含了背景的类型，以及各种类型下的详细定义
  background: any;
  // 当前图层是否显示，0不显示，1正常显示，2显示在最顶层
  display: number = 1;
  // 当前图层是否锁定，true显示，false不显示
  lock: boolean = false;
  unicode: string;

  bg: object | null;

  //操作点对象，用于显示操作点，操作点点击后，会进行不同的操作，操作点临时存在，不满足出现条件时就会删除，操作点不会序列化
  opPoints: object[] = [];

  //布局管理器
  layoutManager: object;
  //因容器拖入操作而产生的向量
  dragInPoints: object[] = [];

  //因容器拖入操作而产生的向量
  dragOutPoints: object[] = [];

  //拖拽时的影子控件，拖拽完成或取消后会销毁
  shadowControls: DDeiAbstractShape[] = []

  modelCode: string = "DDeiLayer"

  //模型是否发生改变，当移动、改变大小、旋转、修改文本等操作会引起改变
  modelChanged: boolean = true;


  // ============================ 方法 ===============================

  /**
   * 计算当前layer的模型总数量
   */
  calModelNumber(): number {
    let num = 0;
    this.midList.forEach(mid => {
      let model = this.models.get(mid)
      if (model?.baseModelType == 'DDeiContainer') {
        num += model.calModelNumber()
      } else if (model?.baseModelType == 'DDeiTable') {
        num += model.calModelNumber()
      } else {
        num++
      }
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
    //加载所有模型的渲染器
    this.models.forEach((item, key) => {
      item.initRender()
    });
  }

  /**
   * 获取画布缩放比率
   */
  getStageRatio(): number {
    if (this.stage) {
      let stageRatio = parseFloat(this.stage.ratio) ? parseFloat(this.stage.ratio) : 1.0
      if (!stageRatio || isNaN(stageRatio)) {
        stageRatio = DDeiConfig.STAGE_RATIO
      }
      return stageRatio
    } else {
      return 1.0
    }
  }


  /**
   * 获取子模型
   */
  getSubModels(ignoreModelIds: string[], level: number = 1): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    this.midList.forEach(mid => {
      if (ignoreModelIds && ignoreModelIds?.indexOf(mid) != -1) {
        return;
      }
      let subModel = this.models.get(mid)
      if (level > 1 && subModel.getSubModels) {
        let subModels = subModel.getSubModels(ignoreModelIds, level - 1);
        models = models.concat(subModels)
      }
      models.push(subModel);
    })
    return models;
  }

  /**
   * 添加模型，并维护关系
   * @param model 被添加的模型
   */
  addModel(model: DDeiAbstractShape): void {
    if (this.midList.indexOf(model.id) == -1) {
      model.stage = this.stage;
      //将模型添加进图层
      this.models.set(model.id, model);
      if (this.midList && this.midList.length > 0) {
        model.zIndex = this.models.get(this.midList[this.midList.length - 1]).zIndex;
      }
      this.midList.push(model.id);

      model.layer = this;
      model.pModel = this;
      this.resortModelByZIndex();
    }
  }

  /**
  * 移除模型，并维护关系
  * @param model 被移除的模型
  */
  removeModels(models: DDeiAbstractShape[]): void {
    models?.forEach(model => {
      this.removeModel(model)
    })
  }

  /**
   * 移除模型，并维护关系
   * @param model 被移除的模型
   */
  removeModel(model: DDeiAbstractShape): void {
    this.models.delete(model.id);
    let idx = this.midList.indexOf(model.id);
    if (idx != -1) {
      this.midList.splice(idx, 1);
    }
    //清除原有的zindex属性
    model.zIndex = null;
    model.layer = null;
    model.stage = null;
    model.render = null;
    this.resortModelByZIndex();
  }

  /**
     * 获取当前图形的除layer的所有父节点对象
     */
  getParents(): DDeiAbstractShape[] {
    return []
  }
  /**
  * 将控件设置到顶层
  */
  pushTop(models: DDeiAbstractShape[]): void {
    models.forEach(item => {
      let lastItem = this.models.get(this.midList[this.midList.length - 1]);
      if (lastItem.id != item.id) {
        let lastIndex = lastItem.zIndex ? lastItem?.zIndex : 0
        item.zIndex = lastIndex + 1;
      }
    })
    this.resortModelByZIndex()
  }

  /**
   * 将控件设置到底层
   */
  pushBottom(models: DDeiAbstractShape[]): void {
    models.forEach(item => {
      item.zIndex = null
      let oldIdIndex = this.midList.indexOf(item.id);
      if (oldIdIndex > 0) {
        this.midList.splice(oldIdIndex, 1);
        this.midList.splice(0, 0, item.id);
      }
    })
    this.resortModelByZIndex()
  }

  /**
  * 将控件设置到上一层
  */
  pushUp(models: DDeiAbstractShape[]): void {
    models.forEach(item => {
      if (!item.zIndex) {
        item.zIndex = 1
      } else {
        item.zIndex++;
      }
    })
    this.resortModelByZIndex()
  }

  /**
   * 将控件设置到下一层
   */
  pushDown(models: DDeiAbstractShape[]): void {
    models.forEach(item => {
      if (!item.zIndex || item.zIndex <= 1) {
        item.zIndex = null
        let oldIdIndex = this.midList.indexOf(item.id);
        if (oldIdIndex > 0) {
          let temp = this.midList[oldIdIndex];
          this.midList[oldIdIndex] = this.midList[oldIdIndex - 1]
          this.midList[oldIdIndex - 1] = temp;
        }
      } else {
        item.zIndex--;
      }
    })
    this.resortModelByZIndex()
  }

  /**
   * 按照Zindex的顺序，从小到大排列，并重新设置子元素的zindex确保其连续，最后将排序后的List设置成新的midList
   */
  resortModelByZIndex(): void {
    //zIndex按照从大到小排列,按从小到大排列，找到第一个有zIndex的项目
    let newMidList: Array<string> = new Array();
    let hadZIndexList: Array<string> = new Array();
    for (let mg = 0; mg < this.midList.length; mg++) {
      let item = this.models.get(this.midList[mg]);
      if (item.zIndex && item.zIndex > 0) {
        //找到hadZIndexList中zIndex等于当前zIndex的最大元素
        let insertIndex = hadZIndexList.length;
        for (let j = 0; j < hadZIndexList.length; j++) {
          if (this.models.get(hadZIndexList[j]).zIndex > item.zIndex) {
            insertIndex = j;
            break;
          }
        }
        hadZIndexList.splice(insertIndex, 0, item.id);
      } else {
        newMidList.push(item.id);
      }
    }
    this.midList = newMidList.concat(hadZIndexList);
  }

  /**
  * 获取当前图形的绝对旋转坐标值
  */
  getAbsRotate(): number {
    return 0;
  }
  /**
   * 取消选择控件,默认取消所有
   */
  cancelSelectModels(models: DDeiAbstractShape[] | undefined, ignoreModels: DDeiAbstractShape[] | undefined): void {
    if (!models) {
      models = Array.from(this.models.values());
    }
    models.forEach(item => {
      if (!ignoreModels || ignoreModels?.indexOf(item) == -1) {
        item.setState(DDeiEnumControlState.DEFAULT)
      }
    });
  }

  /**
   * 取消选择控件,默认取消所有
   */
  cancelAllLevelSelectModels(ignoreModels: DDeiAbstractShape[] | undefined): void {
    this.models.forEach(item => {
      if (!ignoreModels || ignoreModels?.indexOf(item) == -1) {
        item.setState(DDeiEnumControlState.DEFAULT)
      }
      if (item.baseModelType == "DDeiContainer") {
        item.cancelAllLevelSelectModels(ignoreModels);
      }

    });
  }

  /**
   * 获取绝对的控件坐标
   */
  getAbsPosition(pm): object {
    return { x: 0, y: 0 }

  }

  getPosition(): object {
    return { x: 0, y: 0 }
  }


  /**
   * 获取某个选中区域的所有控件
   * @param area 选中区域
   * @returns 
   */
  findModelsByArea(x = undefined, y = undefined, width = 0, height = 0): DDeiAbstractShape[] | null {
    let controls = [];
    this.models.forEach((item) => {
      //如果射线相交，则视为选中
      if (DDeiAbstractShape.isInsidePolygon(item.pvs, { x: x, y: y })) {
        controls.push(item);
      }
    });
    //TODO 对控件进行排序，按照zIndex > 添加顺序
    return controls;
  }

  /**
  * 修改上层模型大小
  */
  changeParentsBounds(): boolean {

    return true;
  }


  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainer(): DDeiAbstractShape {
    return this;
  }

  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainerByPos(x: number, y: number): DDeiLayer {
    return this;
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
   * 设置当前模型为被修改状态
   */
  setModelChanged(): void {
    this.modelChanged = true;
  }

  /**
  * 判断当前模型是否已被修改
  */
  isModelChanged(): boolean {
    return this.modelChanged;
  }



  /**
   * 根据ID获取模型
   * @param id 模型id
   */
  getModelById(id: string): DDeiAbstractShape | null {
    let reutrnModel = null;
    if (id) {
      if (this.models.has(id)) {
        reutrnModel = this.models.get(id);
      } else {
        //遍历所有容器
        this.models.forEach(item => {
          let container = item.getAccuContainer()
          if (container) {
            let rm = container.getModelById(id);
            if (rm) {
              reutrnModel = rm;
            }
          }
        });
      }
    }
    if (!reutrnModel) {
      reutrnModel = null;
    }
    return reutrnModel;
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
              if (element?.toJSON) {
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


}

export default DDeiLayer
