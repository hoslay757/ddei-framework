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
    this.linkChild = props.linkChild ? props.linkChild : false;
    this.linkSelf = props.linkSelf ? props.linkSelf : false;
    this.models = props.models ? props.models : new Map();
    this.midList = props.midList ? props.midList : new Array();
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
      let model = DDeiConfig.MODEL_CLS[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      tempData['currentContainer'] = null;
    }

    container.models = models;
    container.initRender();
    return container;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiRectContainer {
    let container = new DDeiRectContainer(json);
    return container;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiRectContainer";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiRectContainer';
  // 本模型的基础图形
  baseModelType: string = 'DDeiContainer';
  /**
   * 布局方式，null/0自由布局,1九宫格，2表格，3绕圆心，4栅格，缺省null
   * 自由布局：可以修改自身以及子控件的大小、位置，通过linkChild、linkSelf两个属性控制大小联动关系
   * 表格：内部实为一个表格控件，能够调整行列、合并单元格等改变内部布局，不可以自由改动控件的大小
   * 九宫格：空间平均分成9份，不可以自由改动控件的大小
   * 栅格：类似HTML的栅格布局
   */
  layout: number;
  //是否联动子控件，为true时，修改自身大小时，自动会修改子控件大小
  linkChild: boolean = false;
  //是否联动自身，为true时，修改子控件大小时，自动修改自身大小
  linkSelf: boolean = false;
  // 本模型包含多个模型，每添加一个模型，则向midList末尾添加一条数据
  models: Map<string, DDeiAbstractShape>;
  // 模型的ID按照添加顺序的索引
  midList: Array<string>;

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
    this.midList.push(model.id);
    model.pModel = this;
    model.layer = this.layer;
    this.resortModelByZIndex();
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
    model.pModel = null;
    model.stage = null;
    model.render = null;
    this.resortModelByZIndex();
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
          if (item.baseModelType == "DDeiContainer") {
            let rm = item.getModelById(id);
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
    if (this.linkSelf) {
      this.updateBoundsByModels();
      if (this.pModel) {
        this.pModel.changeParentsBounds();
      }
    }
    return true;
  }

  /**
   * 修改子元素大小
   */
  changeChildrenBounds(originRect, newRect): boolean {
    if (this.linkChild) {
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
          item.changeChildrenBounds(originBound, changedBound)
        };
      })
    }
    return true;
  }
}

export default DDeiRectContainer
