
import DDeiConfig from '../config'
import DDeiEnumBusCommandType from '../enums/bus-command-type';
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
    this.name = props.name
    this.models = props.models ? props.models : new Map();
    this.midList = props.midList ? props.midList : new Array();
    this.stage = null;
    this.index = -1;
    this.background = props.background ? props.background : null;
    this.display = props.display || props.display == 0 ? props.display : 1;
    this.tempDisplay = props.tempDisplay ? props.tempDisplay : false;
    this.lock = props.lock ? props.lock : false;
    this.print = props.print ? props.print : true;
    this.unicode = props.unicode ? props.unicode : DDeiUtil.getUniqueCode()
    this.bg = props.bg
    if (props.extData) {
      if (typeof (props.extData) == 'string') {
        this.extData = JSON.parse(props.extData);
      } else {
        this.extData = props.extData;
      }
    }



  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let layer = new DDeiLayer(json);
    layer.stage = tempData['currentStage']
    tempData['currentLayer'] = layer;
    let ddInstance = layer.stage?.ddInstance;
    tempData[layer.id] = layer;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    let midList = layer.midList ? layer.midList : new Array();
    for (let key in json.models) {
      let item = json.models[key];
      let model = ddInstance.controlModelClasses[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      if (midList.indexOf(model.id) == -1){
        midList.push(model.id)
      }
    }
    tempData['currentLayer'] = null;
    layer.models = models;
    layer.midList = midList;
    layer.initRender();
    layer.calModelNumber()
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
  //图层名称，主要用于显示和操作区分
  name: string;
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
  // 当前图层是否显示，0不显示，1正常显示
  display: number = 1;
  // 当前图层是否临时显示，不临时显示，临时显示
  tempDisplay: boolean = false;
  // 当前图层是否锁定，true显示，false不显示
  lock: boolean = false;

  // 当前图层是否打印，true打印，false不打印
  print: boolean = true;

  unicode: string;
  /**
   * 扩展属性
   */
  extData: object = {}


  bg: object | null;

  //操作点对象，用于显示操作点，操作点点击后，会进行不同的操作，操作点临时存在，不满足出现条件时就会删除，操作点不会序列化
  opPoints: object[] = [];

  //操作线对象，用于显示操作线，以提示用户点击，操作线不会序列化
  opLine: object = null;

  //控件的中心点操作点对象，用于快速连线等逻辑
  centerOpPoints: object[] = [];

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

  //当前文件的模型数量
  modelNumber: number = 0;


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
    this.modelNumber = num
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
        stageRatio = this.stage.ddInstance.ratio
      }
      return stageRatio
    } else {
      return 1.0
    }
  }

  notifyChange() {
    this.stage?.notifyChange();
  }

  /**
   * 获取子模型
   */
  getSubModels(ignoreModelIds: string[], level: number = 1, rect: object): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    this.midList.forEach(mid => {
      if (ignoreModelIds && ignoreModelIds?.indexOf(mid) != -1) {
        return;
      }
      let subModel = null
      if (this.models.get) {
        subModel = this.models.get(mid)
      } else {
        subModel = this.models[mid]
      }
      if (subModel) {
        if (!rect || subModel.isInRect(rect.x, rect.y, rect.x1, rect.y1)) {
          if (level > 1 && subModel?.getSubModels) {
            let subModels = subModel.getSubModels(ignoreModelIds, level - 1, rect);
            models = models.concat(subModels)
          }
          models.push(subModel);
        }
      }
    })
    return models;
  }

  /**
   * 获取子模型,通过一个过滤器
   */
  getSubModelsByFilter(filterName: string|null = null,ignoreModelIds: string[], level: number = 1, params:object): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    this.midList.forEach(mid => {
      if (ignoreModelIds && ignoreModelIds?.indexOf(mid) != -1) {
        return;
      }
      let subModel = null
      if (this.models.get) {
        subModel = this.models.get(mid)
      } else {
        subModel = this.models[mid]
      }
      if (subModel) {
        let filterMethod = null;
        if (filterName){
          let define = DDeiUtil.getControlDefine(subModel)
          if (define && define.filters && define.filters[filterName]){
            filterMethod = define.filters[filterName];
          }
        }
        if (!filterMethod || filterMethod(subModel,params)) {
          if (level > 1 && subModel?.getSubModelsByFilter) {
            let subModels = subModel.getSubModelsByFilter(filterName, ignoreModelIds, level - 1, params);
            models = models.concat(subModels)
          }
          models.push(subModel);
        }
        
      }
    })
    return models;
  }


  /**
   * 添加模型，并维护关系
   * @param model 被添加的模型
   */
  addModel(model: DDeiAbstractShape,notify:boolean = true): void {
    if (this.midList.indexOf(model.id) == -1) {
      model.stage = this.stage;
      //将模型添加进图层
      this.models.set(model.id, model);
      // if (this.midList && this.midList.length > 0) {
      //   model.zIndex = this.models.get(this.midList[this.midList.length - 1]).zIndex;
      // }
      this.midList.push(model.id);

      model.layer = this;
      model.pModel = this;
      // this.resortModelByZIndex();
      if (notify){
        this.notifyChange()
      }
    }
  }

  /**
  * 移除模型，并维护关系
  * @param model 被移除的模型
  * @param destroy 销毁，缺省false
  */
  removeModels(models: DDeiAbstractShape[], destroy: boolean = false,notify:boolean = true): void {
    models?.forEach(model => {
      this.removeModel(model, destroy,false)
    })
    if (notify) {
      this.notifyChange()
    }
  }

  /**
   * 移除所有元素
   */
  clearModels(destroy:boolean = false): void {
    this.models.forEach(model => {
      this.removeModel(model, destroy);
    })
  }

  cascadeRemoveSelf(): void {
  }

  /**
   * 移除自身的方法
   */
  destroyed() {
    if (this.render?.containerViewer) {

      this.render.containerViewer.remove()
      delete this.render.containerViewer
    }
    this.render = null

    this.models?.forEach((item,key)=>{
      item?.destroyed()
    })
  }

  /**
   * 移除渲染器
   */
  destroyRender() {
    if (this.render?.containerViewer) {
      this.render.containerViewer.remove()
      delete this.render.containerViewer
    }
    
    this.models?.forEach((item, key) => {
      item?.destroyRender()
    })
    this.render = null
  }

  /**
   * 移除模型，并维护关系
   * @param model 被移除的模型
   * @param destroy 销毁，缺省false
   */
  removeModel(model: DDeiAbstractShape, destroy: boolean = false,notify:boolean = true): void {
    this.models.delete(model.id);

    let idx = this.midList.indexOf(model.id);
    if (idx != -1) {
      this.midList.splice(idx, 1);
    }
    if (destroy) {
      model.destroyed();
    }
    //清除原有的zindex属性
    // model.zIndex = null;
    model.layer = null;
    model.stage = null;
    model.render = null;
    // this.resortModelByZIndex();
    //重新计算错线
    if (this.stage?.render) {
      this.stage.render.refreshJumpLine = false
    }
    if (notify) {
      this.notifyChange()
    }
  }

  /**
   * 根据ID删除元素
   */
  removeModelById(ids: string[], destroy: boolean = true,notify:boolean = true):void{
    ids?.forEach(id => {
      let model = this.getModelById(id)
      if(model){
        this.removeModel(model,destroy,false);
      }
    });
    this.models.forEach(model=>{
      if(model.baseModelType == 'DDeiContainer'){
        model.removeModelById(ids, destroy,false);
      }
    })
    if (notify) {
      this.notifyChange()
    }
  }

  /**
   * 根据基础模型获取控件
   * @param bmt 基础模型类别
   */
  getModelsByBaseType(bmt: string): DDeiAbstractShape[] {
    let returnValues = []
    this.midList.forEach(mid => {
      let model = this.models.get(mid)
      if (model?.baseModelType == bmt) {
        returnValues.push(model)
      } else if (model?.baseModelType == 'DDeiContainer') {
        let datas = model.getModelsByBaseType(bmt);
        datas.forEach(dt => {
          returnValues.push(dt);
        });
      }
    })
    return returnValues;
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
  pushTop(models: DDeiAbstractShape[],notify:boolean = true): void {
    let sortedModels = [...models]
    sortedModels.sort((a, b) => {
      if (this.midList.indexOf(a.id) > this.midList.indexOf(b.id)) {
        return 1
      } else if (this.midList.indexOf(a.id) < this.midList.indexOf(b.id)) {
        return -1
      } else {
        return 0
      }
    })
    for (let i = 0; i < sortedModels.length; i++) {
      let item = sortedModels[i]
      let index = this.midList.indexOf(item.id)
      this.midList.splice(index, 1)
      //放到最后面
      this.midList.push(item.id)
    }
    
    if (notify) {
      this.notifyChange()
    }
  }

  /**
   * 将控件设置到底层
   */
  pushBottom(models: DDeiAbstractShape[], notify: boolean = true): void {
    let sortedModels = [...models]
    sortedModels.sort((a, b) => {
      if (this.midList.indexOf(a.id) > this.midList.indexOf(b.id)) {
        return 1
      } else if (this.midList.indexOf(a.id) < this.midList.indexOf(b.id)) {
        return -1
      } else {
        return 0
      }
    })
    //插入最前面
    for (let i = sortedModels.length-1; i >=0; i--) {
      let item = sortedModels[i]
      let index = this.midList.indexOf(item.id)
      this.midList.splice(index, 1)
      this.midList.splice(0, 0, item.id)
    }
   
    if (notify) {
      this.notifyChange()
    }
  }

  /**
  * 将控件设置到上一层
  */
  pushUp(models: DDeiAbstractShape[], notify: boolean = true): void {
    let sortedModels = [...models]
    sortedModels.sort((a, b) => {
      if (this.midList.indexOf(a.id) > this.midList.indexOf(b.id)) {
        return 1
      } else if (this.midList.indexOf(a.id) < this.midList.indexOf(b.id)) {
        return -1
      } else {
        return 0
      }
    })
    //找到当前容器中lastModel之后的元素，交换坐标
    for (let i = sortedModels.length-1;i>=0;i--){
      //找到当前元素下方元素
      let md = sortedModels[i]
      let exchangeMdIndex = -1
      let mdIndex = this.midList.indexOf(md.id)
      let j = mdIndex+1
      for(;j<this.midList.length;j++){
        let md1 = this.models.get(this.midList[j]);
        if(md1.isInRect(md.essBounds.x, md.essBounds.y, md.essBounds.x + md.essBounds.width, md.essBounds.y + md.essBounds.height)){
          exchangeMdIndex = j;
          break;
        }
      }
      if(exchangeMdIndex != -1){
        
        let exchangeId = this.midList[exchangeMdIndex];
        this.midList[exchangeMdIndex] = md.id
        this.midList[mdIndex] = exchangeId
      }
    }
    if (notify) {
      this.notifyChange()
    }
  }

  /**
   * 将控件设置到下一层
   */
  pushDown(models: DDeiAbstractShape[], notify: boolean = true): void {
    let sortedModels = [...models]
    sortedModels.sort((a, b) => {
      if (this.midList.indexOf(a.id) > this.midList.indexOf(b.id)) {
        return 1
      } else if (this.midList.indexOf(a.id) < this.midList.indexOf(b.id)) {
        return -1
      } else {
        return 0
      }
    })
    //找到当前容器中lastModel之后的元素，交换坐标
    for (let i = 0; i < sortedModels.length; i++) {
      //找到当前元素下方元素
      let md = sortedModels[i]
      let exchangeMdIndex = -1
      let mdIndex = this.midList.indexOf(md.id)
      let j = mdIndex - 1
      for (; j >=0; j--) {
        let md1 = this.models.get(this.midList[j]);
        if (md1.isInRect(md.essBounds.x, md.essBounds.y, md.essBounds.x + md.essBounds.width, md.essBounds.y + md.essBounds.height)) {
          exchangeMdIndex = j;
          break;
        }
      }
      if (exchangeMdIndex != -1) {
        let exchangeId = this.midList[exchangeMdIndex];
        this.midList[exchangeMdIndex] = md.id
        this.midList[mdIndex] = exchangeId
      }
    }
    if (notify) {
      this.notifyChange()
    }
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
  * 根据坐标获取操作点
  * @param x 
  * @param y 
  * @returns 操作点
  */
  getOpPointByPos(x: number = 0, y: number = 0): object {
    let minLength = Infinity
    let minPoint = null
    if (x && y && (this.opPoints?.length > 0 || this.centerOpPoints?.length > 0)) {
      for (let i = 0; i < this.opPoints?.length; i++) {
        let point = this.opPoints[i]
        let absX = Math.abs(x - point.x)
        let absY = Math.abs(y - point.y)
        if (absX <= 8 && absY <= 8) {
          if (absX + absY < minLength) {
            minLength = absX + absY
            minPoint = point
          }
        }
      }
      for (let i = 0; i < this.centerOpPoints?.length; i++) {
        let point = this.centerOpPoints[i]
        let absX = Math.abs(x - point.x)
        let absY = Math.abs(y - point.y)
        if (absX <= 8 && absY <= 8) {
          if (absX + absY < minLength) {
            minLength = absX + absY
            minPoint = point
          }
        }
      }
    }
    return minPoint;
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

export {DDeiLayer}
export default DDeiLayer
