import DDeiConfig from '../config';
import DDeiEnumControlState from '../enums/control-state';
import DDeiRectangle from './rectangle'
import DDeiAbstractShape from './shape';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManager from '../layout/layout-manager';
import DDeiLayoutManagerFactory from '../layout/layout-manager-factory';
import DDeiModelArrtibuteValue from './attribute/attribute-value'
import DDeiUtil from '../util';
import { cloneDeep } from 'lodash-es';
import DDeiPolygon from './polygon';

/**
 * 普通容器是一个矩形，能包含其他容器
 */
class DDeiPolygonContainer extends DDeiPolygon {

  constructor(props: object) {
    super(props);
    this.layout = props.layout;
    this.layoutData = props.layoutData;
    this.models = props.models ? props.models : new Map();
    this.midList = props.midList ? props.midList : new Array();
    this.layoutManager = DDeiLayoutManagerFactory.getLayoutInstance(this.layout);
    this.layoutManager.container = this;
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let container = new DDeiPolygonContainer(json);

    container.layer = tempData['currentLayer']
    container.stage = tempData['currentStage']
    container.pModel = tempData['currentContainer']
    if (!container.pModel) {
      container.pModel = container.layer;
    }
    let ddInstance = container.stage?.ddInstance;
    tempData[container.id] = container;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    let midList = new Array()
    for (let key in json.models) {
      tempData['currentContainer'] = container;
      let item = json.models[key];
      let model = ddInstance.controlModelClasses[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      tempData['currentContainer'] = null;
      midList.push(model.id)
    }

    container.models = models;
    container.midList = midList;
    container.initPVS();
    container.initRender();
    return container;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiPolygonContainer {
    let model = new DDeiPolygonContainer(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiPolygonContainer";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiPolygonContainer';
  // 本模型的基础图形
  baseModelType: string = 'DDeiContainer';
  /**
   * 布局方式，null/free自由布局，full完全填充,nine九宫格，table表格，cc绕圆心，缺省null
   * 自由布局：可以修改自身以及子控件的大小、位置，通过linkChild、linkSelf两个属性控制大小联动关系
   * 完全填充：单个控件完全填充容器
   * 表格：内部实为一个表格控件，能够调整行列、合并单元格等改变内部布局，不可以自由改动控件的大小
   * 九宫格：空间平均分成9份，不可以自由改动控件的大小
   * 绕圆心：围绕圆心进行布局
   */
  layout: string;
  //布局数据，布局管理器会利用这个数据来修改控件的位置，大小坐标等
  layoutData: object;
  //布局管理器，用来实现布局的效果
  layoutManager: DDeiLayoutManager;
  // 本模型包含多个模型，每添加一个模型，则向midList末尾添加一条数据
  models: Map<string, DDeiAbstractShape>;
  // 模型的ID按照添加顺序的索引
  midList: Array<string>;

  //当前容器模型数量
  modelNumber: number = 0;

  // ============================ 方法 ===============================


  /**
   * 计算当前容器的模型总数量
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

    delete this.__destroyed
  }
  /**
   * 添加模型，并维护关系
   * @param model 被添加的模型
   */
  addModel(model: DDeiAbstractShape,notify: boolean = true): void {
    if (this.midList.indexOf(model.id) == -1) {
      model.stage = this.stage;

      //将模型添加进图层
      this.models.set(model.id, model);
      this.midList.push(model.id);
      model.pModel = this;
      model.layer = this.layer;
      // this.resortModelByZIndex();
      if (notify) {
        this.notifyChange()
      }
    }
  }

  /**
   * 移除模型，并维护关系
   * @param model 被移除的模型
   * @param destroy 销毁，缺省false
   */
  removeModels(models: DDeiAbstractShape[], destroy: boolean = false, notify: boolean = true): void {
    models?.forEach(model => {
      this.removeModel(model, destroy)
    })
    if (notify) {
      this.notifyChange()
    }
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
    model.pModel = null;
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
   * 移除自身的方法
   */
  destroyed() {
    this.midList.forEach(key => {
      let item = this.models.get(key);
      item.destroyed();
    });
    super.destroyed();
  }

  /**
   * 移除渲染器
   */
  destroyRender() {    
    super.destroyRender();
    this.midList.forEach(key => {
      let item = this.models.get(key);
      item?.destroyRender();
    });
  }

  /**
    * 仅变换自身向量
    */
  transSelfVectors(matrix: Matrix3): void {
    super.transVectors(matrix)
  }

  /**
  * 变换向量
  */
  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean, ignoreChildren: boolean }): void {
    super.transVectors(matrix, params)
    if (!params?.ignoreChildren) {
      this.midList.forEach(key => {
        let item = this.models.get(key);
        item.transVectors(matrix, params)
      });
    }
  }

  /**
  * 变换向量,只能用于两个结构和数据相同的变量进行交换，如影子控件
  */
  syncVectors(source: Matrix3): void {
    super.syncVectors(source)
    this.midList.forEach(key => {
      let itemDist: DDeiAbstractShape = this.models.get(key);
      let itemSource: DDeiAbstractShape = source.models.get(key);
      itemDist.syncVectors(itemSource)
    });
  }

  /**
   * 获取实际的内部容器控件
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainer(): DDeiAbstractShape {
    return this.layoutManager ? this.layoutManager.getAccuContainer() : this;
  }

  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainerByPos(x: number, y: number): DDeiAbstractShape {
    return this.layoutManager ? this.layoutManager.getAccuContainerByPos(x, y) : this;
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
   * 获取子模型
   */
  getSubModels(ignoreModelIds: string[], level: number = 1, rect: object): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    this.midList.forEach(mid => {
      if (ignoreModelIds && ignoreModelIds?.indexOf(mid) != -1) {
        return;
      }
      let subModel = this.models.get(mid)
      if (subModel) {
        if (!rect || subModel.isInRect(rect.x, rect.y, rect.x1, rect.y1)) {
          if (level > 1 && subModel.getSubModels) {
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
  getSubModelsByFilter(filterName: string | null = null, ignoreModelIds: string[], level: number = 1, params: object): DDeiAbstractShape[] {
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
        if (filterName) {
          let define = DDeiUtil.getControlDefine(subModel)
          if (define && define.filters && define.filters[filterName]) {
            filterMethod = define.filters[filterName];
          }
        }
        if (!filterMethod || filterMethod(subModel, params)) {
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
  * 将控件设置到顶层
  */
  pushTop(models: DDeiAbstractShape[], notify: boolean = true): void {
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
    for (let i = sortedModels.length - 1; i >= 0; i--) {
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
    for (let i = sortedModels.length - 1; i >= 0; i--) {
      //找到当前元素下方元素
      let md = sortedModels[i]
      let exchangeMdIndex = -1
      let mdIndex = this.midList.indexOf(md.id)
      let j = mdIndex + 1
      for (; j < this.midList.length; j++) {
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
      for (; j >= 0; j--) {
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


  cascadeRemoveSelf(): void {
    let newContainer = this.pModel;
    if (newContainer.baseModelType == "DDeiLayer" && !newContainer.layoutManager) {
      let freeLayoutManager = DDeiLayoutManagerFactory.getLayoutInstance("free");
      freeLayoutManager.container = newContainer;
      newContainer.layoutManager = freeLayoutManager;
    }
    //当只剩一个控件，且为组合时，移除组合关系，将内部控件上提一级
    if (this.layout == 'compose' && this.models.size <= 1) {

      let models = Array.from(this.models.values())
      //交由新容器的布局管理器进行控件移入或交换
      newContainer.layoutManager?.append(null, null, models);
      //更新新容器大小
      newContainer.changeParentsBounds()
      //重新设置布局
      newContainer.layoutManager?.updateLayout(null, null, models);
      newContainer.removeModel(this, true)
    }
    newContainer?.cascadeRemoveSelf();
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
   * 修改上层模型大小
   */
  changeParentsBounds(): boolean {

    if (this.layoutManager) {
      this.layoutManager.changeParentsBounds();
    }

    return true;
  }

  /**
   * 通过下层模型更新本层模型的信息
   */
  updateBoundsByModels(): void {
    let subModels = Array.from(this.models.values());
    let outRect = DDeiAbstractShape.getOutRectByPV(subModels);
    this.setSelfBounds(outRect.x, outRect.y, outRect.width, outRect.height);
    this.setModelChanged()
  }

  //仅设置自身的大小以及宽高
  setSelfBounds(x, y, width, height) {

    let m1 = new Matrix3()
    let move1Matrix = new Matrix3(
      1, 0, -this.cpv.x,
      0, 1, -this.cpv.y,
      0, 0, 1);
    m1.premultiply(move1Matrix)
    if(this.rotate){
      let angle = DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      m1.premultiply(rotateMatrix)
    }

    let scaleMatrix = new Matrix3(
      width / this.essBounds.width, 0, 0,
      0, height / this.essBounds.height, 0,
      0, 0, 1);
    m1.premultiply(scaleMatrix)
    
    if (this.rotate) {
      let angle = -DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      m1.premultiply(rotateMatrix)
    }

    let move2Matrix = new Matrix3(
      1, 0, x + width / 2,
      0, 1, y + height / 2,
      0, 0, 1);
    m1.premultiply(move2Matrix)
    this.transSelfVectors(m1)
  }

  /**
   * 修改子元素大小
   */
  changeChildrenBounds(): boolean {
    if (this.layoutManager) {
      this.layoutManager.changeSubModelBounds();
    }
    return true;
  }

  /**
   * 更新关联图形
   */
  updateLinkModels(ignoreModelIds: string[]): void {
    super.updateLinkModels(ignoreModelIds);
    this.models.forEach(model => {
      model.updateLinkModels(ignoreModelIds);
    })
  }



  getAPVS() {
    let arr = [this.cpv]
    this.models.forEach(model => {
      let modelarr = model.getAPVS()
      arr = arr.concat(modelarr);

    });
    return arr;
  }



  removeModelById(ids: string[],destroy: boolean = true, notify: boolean = true): void {
    ids?.forEach(id => {
      let model = this.getModelById(id)
      if (model) {
        this.removeModel(model, destroy, false);
      }
    });
    this.models.forEach(model => {
      if (model.baseModelType == 'DDeiContainer') {
        model.removeModelById(ids, destroy,false);
      }
    })
    if (notify) {
      this.notifyChange()
    }
  }

  toJSON(): Object {
    let json = super.toJSON()
    //标尺单位
    let ruleDisplay
    let ruleInit
    if (this.stage.ruler?.display || this.stage.ruler?.display == 0 || this.stage.ruler?.display == false) {
      ruleDisplay = this.stage.ruler.display;
    } else if (this.stage.ddInstance.ruler != null && this.stage.ddInstance.ruler != undefined) {
      if (typeof (this.stage.ddInstance.ruler) == 'boolean') {
        ruleDisplay = this.stage.ddInstance.ruler ? 1 : 0;
      } else {
        ruleInit = this.stage.ddInstance.ruler
        ruleDisplay = ruleInit.display;
      }
    } else {
      ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "ruler.display", true);
    }
    let unit = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "ruler.unit", true, ruleInit);

    //处理点坐标变换
    if (ruleDisplay) {
      if (this.cpv) {
        json.cpv = cloneDeep(this.cpv);
        let cpv = DDeiUtil.toRulerCoord({ x: this.cpv.x, y: this.cpv.y }, this.stage, unit)
        json.cpv.x = cpv.x
        json.cpv.y = cpv.y
      }
      if (this.pvs) {
        json.pvs = cloneDeep(this.pvs);
        for (let i = 0; i < this.pvs.length; i++) {
          let pv = DDeiUtil.toRulerCoord({ x: this.pvs[i].x, y: this.pvs[i].y }, this.stage, unit)
          json.pvs[i].x = pv.x
          json.pvs[i].y = pv.y
        }
      }
      if (this.exPvs) {
        json.exPvs = cloneDeep(this.exPvs);
        for (let i in this.exPvs) {
          let pv = DDeiUtil.toRulerCoord({ x: this.exPvs[i].x, y: this.exPvs[i].y }, this.stage, unit)
          json.exPvs[i].x = pv.x
          json.exPvs[i].y = pv.y
        }
      }
    }
    return json;
  }
}

export { DDeiPolygonContainer }
export default DDeiPolygonContainer
