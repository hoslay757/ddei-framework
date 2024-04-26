import DDeiBus from './bus/bus'
import DDeiConfig from './config'
import DDeiEnumState from './enums/ddei-state'
import DDeiEnumOperateType from './enums/operate-type'
import DDeiAbstractShape from './models/shape'
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
    this.EVENT_CONTROL_SELECT_BEFORE = DDei.beforeOperateValid
    this.EVENT_CONTROL_CREATE_BEFORE = DDei.beforeOperateValid
    this.EVENT_CONTROL_DRAG_BEFORE = DDei.beforeOperateValid
    this.EVENT_CONTROL_DEL_BEFORE = DDei.beforeOperateValid
    this.EVENT_CONTROL_EDIT_BEFORE = DDei.beforeOperateValid
    this.EVENT_CONTROL_VIEW_BEFORE = DDei.beforeOperateValid
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



  // ============================ 静态方法 ============================


  /**
   * 选中前，一般用于校验，默认根据权限配置参数进行校验
   */
  static beforeOperateValid(operate: DDeiEnumOperateType, models: DDeiAbstractShape[], propName: string, ddInstance: DDei, evt: Event): boolean {
    //获取权限
    let modeName = DDeiUtil.getConfigValue("MODE_NAME", ddInstance);
    for (let i = 0; i < models.length; i++) {
      let access = DDeiUtil.isAccess(
        operate,
        models[i],
        propName,
        modeName,
        ddInstance
      );
      if (!access) {
        return false
      }
    }
    return true;
  }


  /**
   * 给予container构建一个DDei实例
   * 每一个DDei至少包含1个文件
   * @param {id} id 文件id
   * @param {containerid} containerid 容器id
   * @param {stagejson} stagejson 内容JSON,如果没有则会创建一个
  */
  static newInstance(id: string, containerid: string, stagejson: string): DDei {
    if (id && containerid) {
      if (!DDei.INSTANCE_POOL.get(id)) {
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
        DDei.INSTANCE_POOL.set(id,ddInstance);

        //初始化bus
        ddInstance.bus = new DDeiBus({ ddInstance: ddInstance }); 
        return ddInstance;
      } else {
        let ddInstance = DDei.INSTANCE_POOL.get(id);
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

  //当前引入的外部控件模型定义
  controlModelClasses: object;
  //当前引入的外部控件视图定义
  controlViewClasses: object;

  //当前实例的状态
  state: DDeiEnumState = DDeiEnumState.NONE;

  //当前bus
  bus: DDeiBus | null = null;

  //当前编辑模式，1：指针，2：手，3:文本创建，4:线段创建
  editMode: number = 1;

  //以下字段为初始化时传入初始化字段，在运行时会改变或用作缺省值
  //缺省画布大小
  width: number = 0;
  height: number = 0;
  //缩放比例
  ratio: number = 1.0;
  //水印
  mark:string|object|null = null;
  //标尺
  ruler:boolean|object|null = null;
  //网格0无、1网格、2点阵
  grid:number|null = null;
  //纸张
  paper:string|object|null = null;
  //背景
  background:string|object|null =  null;
  //以上字段为初始化时传入初始化字段，在运行时会改变或用作缺省值

  //以下字段为初始化时传入的全局控制变量或钩子函数，在运行时不会改变
  //自动扩展画布大小
  EXT_STAGE_WIDTH: boolean = true;
  EXT_STAGE_HEIGHT: boolean = true;
  //是否开启全局缩放
  GLOBAL_ALLOW_STAGE_RATIO = true;
  // 是否打开辅助对齐线
  GLOBAL_HELP_LINE_ENABLE: boolean = true;
  /**
   * 加载文件的函数，加载后的文件会进入文件列表，此方法为外部传入的勾子函数，由外部对文件进行加载
   * 必须为一个async函数
   */
  EVENT_LOAD_FILE: Function|null = null;

  /**
   * 保存文件的函数，保存后文件会从dirty状态变为普通状态，此方法为外部传入的勾子函数，由外部对文件进行保存和存储
   * 必须为一个async函数
   */
  EVENT_SAVE_FILE: Function | null = null;

  /**
 * 发布文件的函数，发布后文件从业务上转变为正式文件，此方法为外部传入的勾子函数，由外部对文件状态进行控制
 * 必须为一个async函数
 */
  EVENT_PUBLISH_FILE: Function | null = null;

  /**
   * 返回文件列表，此方法为外部传入的勾子函数
   */
  EVENT_GOBACK_FILE_LIST: Function | null = null;

  /**
   * 控件选择前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_BEFORE: Function | null = null;

  /**
   * 控件选择后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_AFTER: Function | null = null;

  /**
   * 控件创建前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_CREATE_BEFORE: Function | null = null;

  /**
   * 当前正在执行鼠标相关的动作，此方法为外部传入的钩子函数
   */
  EVENT_MOUSE_OPERATING: Function | null = null;

  /**
   * 控件创建后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_CREATE_AFTER: Function | null = null;

  /**
   * 控件拖拽前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DRAG_BEFORE: Function | null = null;

  /**
   * 控件拖拽后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DRAG_AFTER: Function | null = null;

  /**
   * 线段拖拽前，此方法为外部传入的勾子函数
   */
  EVENT_LINE_DRAG_BEFORE: Function | null = null;

  /**
   * 线段拖拽后，此方法为外部传入的勾子函数
   */
  EVENT_LINE_DRAG_AFTER: Function | null = null;

  /**
   * 控件删除前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DEL_BEFORE: Function | null = null;

  /**
   * 控件删除后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DEL_AFTER: Function | null = null;

  /**
   * 控件属性编辑前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_EDIT_BEFORE: Function | null = null;

  /**
   * 控件属性编辑后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_EDIT_AFTER: Function | null = null;
  /**
   * 控件查看前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_VIEW_BEFORE: Function | null = null;

  /**
   * 控件查看后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_VIEW_AFTER: Function | null = null;

  /**
   * 移动视窗，此方法为外部传入的勾子函数
   */
  EVENT_STAGE_CHANGE_WPV: Function | null = null;

  /**
   * 全剧缩放，此方法为外部传入的勾子函数
   */
  EVENT_STAGE_CHANGE_RATIO: Function | null = null;
  //以上字段为初始化时传入的全局控制变量或钩子函数，在运行时不会改变

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

export {DDei}
export default DDei