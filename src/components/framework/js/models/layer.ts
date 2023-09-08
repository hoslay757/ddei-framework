import DDeiConfig from '../config'
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
    this.type = props.type ? props.type : 0;
    this.background = props.background ? props.background : null;
    this.display = props.display ? props.display : 1;
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
  /**
   * 图层类型：0普通图层,99背景图层，
   * 背景图层：只有背景相关信息，没有事件等
   * 普通图层：除了背景还能相应事件等
   */
  type: number;
  // 背景信息，为一个json，包含了背景的类型，以及各种类型下的详细定义
  background: any;
  // 当前图层是否显示，0不显示，1正常显示，2显示在最顶层
  display: number = 1;
  // 当前图层是否锁定，true显示，false不显示
  lock: boolean = false;
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
    if (this.midList && this.midList.length > 0) {
      model.zIndex = this.models.get(this.midList[this.midList.length - 1]).zIndex;
    }
    this.midList.push(model.id);

    model.layer = this;
    model.pModel = this;
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
    model.layer = null;
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
  * 获取当前图形的绝对旋转坐标值
  */
  getAbsRotate(): number {
    return 0;
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
   * 获取绝对的控件坐标
   */
  getAbsPosition(pm): object {
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
      if (DDeiAbstractShape.isInsidePolygon(item.getRotatedPoints(), { x: x, y: y })) {
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
