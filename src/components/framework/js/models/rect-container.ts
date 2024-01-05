import DDeiConfig, { MODEL_CLS } from '../config';
import DDeiEnumControlState from '../enums/control-state';
import DDeiRectangle from './rectangle'
import DDeiAbstractShape from './shape';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManager from '../layout/layout-manager';
import DDeiLayoutManagerFactory from '../layout/layout-manager-factory';
import DDei from '../ddei';

/**
 * 普通容器是一个矩形，能包含其他容器
 */
class DDeiRectContainer extends DDeiRectangle {

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
    let container = new DDeiRectContainer(json);

    container.layer = tempData['currentLayer']
    container.stage = tempData['currentStage']
    container.pModel = tempData['currentContainer']
    if (!container.pModel) {
      container.pModel = container.layer;
    }
    tempData[container.id] = container;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    for (let key in json.models) {
      tempData['currentContainer'] = container;
      let item = json.models[key];
      let model = MODEL_CLS[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      tempData['currentContainer'] = null;
    }

    container.models = models;
    container.initPVS();
    container.initRender();
    return container;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiRectContainer {
    let model = new DDeiRectContainer(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiRectContainer";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiRectContainer';
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
   * 添加模型，并维护关系
   * @param model 被添加的模型
   */
  addModel(model: DDeiAbstractShape): void {
    if (this.midList.indexOf(model.id) == -1) {
      model.stage = this.stage;

      //将模型添加进图层
      this.models.set(model.id, model);
      this.midList.push(model.id);
      model.pModel = this;
      model.layer = this.layer;
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
    model.destroyed();
    //清除原有的zindex属性
    model.zIndex = null;
    model.pModel = null;
    model.stage = null;
    model.render = null;
    this.resortModelByZIndex();
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
  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean }): void {
    super.transVectors(matrix, params)
    this.midList.forEach(key => {
      let item = this.models.get(key);
      item.transVectors(matrix, params)
    });
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
    //归于0，设置大小，然后旋转，再恢复到新坐标
    this.cpv.x = 0
    this.cpv.y = 0
    this.pvs[0].x = -width / 2
    this.pvs[0].y = -height / 2
    this.pvs[1].x = width / 2
    this.pvs[1].y = -height / 2
    this.pvs[2].x = width / 2
    this.pvs[2].y = height / 2
    this.pvs[3].x = -width / 2
    this.pvs[3].y = height / 2

    let m1 = new Matrix3()
    let angle = -(this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
    let rotateMatrix = new Matrix3(
      Math.cos(angle), Math.sin(angle), 0,
      -Math.sin(angle), Math.cos(angle), 0,
      0, 0, 1);
    let move2Matrix = new Matrix3(
      1, 0, x + width / 2,
      0, 1, y + height / 2,
      0, 0, 1);
    m1.premultiply(rotateMatrix).premultiply(move2Matrix)
    this.transSelfVectors(m1)
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

    this.updateBoundsByModels();
    if (this.pModel) {
      this.pModel.changeParentsBounds();
    }

    return true;
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

}

export default DDeiRectContainer
