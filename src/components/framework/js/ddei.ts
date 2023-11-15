import DDeiBus from './bus/bus'
import DDeiConfig from './config'
import DDeiEnumState from './enums/ddei-state'
import DDeiStage from './models/stage'
import DDeiUtil from './util'

/**
 * DDei图形框架的基础类，通过此类对图形框架进行初始化
 * DDei静态资源维护公共变量与实例池
 * DDei实例与一个容器（如：div）绑定，同一个页面上可以允许存在多个实例
 * DDei实例作为页面上打开操作的临时实例，一般只在页面存续期间有效，不会被序列化
 * TODO 国际化
 */
class DDei {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.containerid = props.containerid
    this.stage = null
  }
  // ============================ 静态变量 ============================
  /**
   * 所有当前被初始化的DDei实例
   */
  static INSTANCE_POOL: Map<string, DDei> = new Map();

  /**
  * 所有特殊按键的按下状态，当键盘按下时会触发事件，并修改当前全局状态
  * 通过全局状态可以判断一些键鼠组合操作，如按下ctrl和鼠标左键时追加选择
  */
  static KEY_DOWN_STATE: Map<string, boolean> = new Map();

  /**
   * 同步KEY_DOWN_STATE状态
   * @param stateMap 状态
   */
  static syncKeyDownState(stateMap: Map<string, boolean>) {
    if (stateMap) {
      DDei.KEY_DOWN_STATE.clear();
      stateMap.forEach((item, key) => {
        DDei.KEY_DOWN_STATE.set(key, item);
      });
    }
  }

  // ============================ 静态方法 ============================
  /**
   * 给予container构建一个DDei实例
   * 每一个DDei至少包含1个文件
   * @param {id} id 文件id
   * @param {containerid} containerid 容器id
   * @param {stagejson} stagejson 内容JSON,如果没有则会创建一个
  */
  static newInstance(id: string, containerid: string, stagejson: string): DDei {
    if (id && containerid) {
      if (!DDei.INSTANCE_POOL[id]) {
        //初始化DDei对象
        let ddInstance = new DDei({ id: id, containerid: containerid });
        //初始化DDeiStage对象，如果存在stagejson则加载，不存在则初始化
        if (stagejson) {
          ddInstance.stage = DDeiStage.loadFromJSON(stagejson, { currentDdInstance: ddInstance });
        } else {
          ddInstance.stage = DDeiStage.initByJSON({ id: "stage_1" }, { currentDdInstance: ddInstance });
        }
        ddInstance.stage.ddInstance = ddInstance;
        //将DDei对象装入全局缓存
        DDei.INSTANCE_POOL[id] = ddInstance;

        //初始化bus
        ddInstance.bus = new DDeiBus({ ddInstance: ddInstance });
        //初始化渲染器
        ddInstance.initRender();
        //设置视窗位置到中央
        if (!ddInstance.stage.wpv) {
          //缺省定位在画布中心点位置
          ddInstance.stage.wpv = {
            x: -(ddInstance.stage.width - ddInstance.render.container.clientWidth) / 2, y: -(ddInstance.stage.height - ddInstance.render.container.clientHeight) / 2, z: 0
          };
        }
        //通过当前装载的stage更新图形
        ddInstance.render.drawShape();
        return ddInstance;
      } else {
        let ddInstance = DDei.INSTANCE_POOL[id];
        ddInstance.initRender();
        ddInstance.render.drawShape();
        return ddInstance;
      }
    }
  }

  // ============================ 属性 ============================
  id: string;
  // 承载的容器id
  containerid: string;
  // 关联的舞台对象，实例的canvas只会绘制当前的stage
  stage: DDeiStage | null;
  //当前模型的类型
  modelType: string = "DDei";

  //当前实例的状态
  state: DDeiEnumState = DDeiEnumState.NONE;

  //当前bus
  bus: DDeiBus | null = null;

  //当前编辑模式，1：指针，2：手，3:文本创建，4:线段创建
  editMode: number = 1;

  // ============================ 方法 ============================
  /**
   * 初始化渲染器
   */
  initRender(): void {
    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
    //加载场景渲染器
    this.stage.initRender();
  }

  /**
   * 修改当前编辑模式
   * @param mode 编辑模式
   */
  changeEditMode(mode): void {
    if (this.editMode != mode) {
      this.editMode = mode
    }
  }

  /**
  * 应用外部配置文件，覆写配置文件内容
  * @param config 
  */
  applyConfig(config: Object): void {
    if (config) {
      //普通值、JSON、数组、MAP
      for (let i in config) {
        let outConfigValue = config[i];
        let configValue = this[i];
        if (i != "SERI_FIELDS") {
          //深度遍历属性，然后进行设置
          this[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
        }
      }
    }
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

export default DDei