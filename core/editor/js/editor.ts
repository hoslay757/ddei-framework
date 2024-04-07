import DDeiEnumKeyActionInst from "./enums/key-action-inst";
import DDeiKeyAction from "./hotkeys/key-action"
import DDeiEditorState from "./enums/editor-state";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEditorUtil from "./util/editor-util";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiBus from "@ddei-core/framework/js/bus/bus";
import type DDeiFile from "./file";
import DDeiConfig from "@ddei-core/framework/js/config";
import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import { markRaw } from "vue";
/**
 * DDei图形编辑器类，用于维护编辑器实例、全局状态以及全局属性
 */
class DDeiEditor {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.containerid = props.containerid
    this.files = props.files ? props.files : []
    this.currentFileIndex = props.currentFileIndex ? props.currentFileIndex : -1;
    this.state = DDeiEditorState.DESIGNING;
  }
  // ============================ 静态变量 ============================



  /**
   * 所有当前被初始化的DDei实例
   */
  static INSTANCE_POOL: Map<string, DDeiEditor> = new Map();

  /**
   * 日志的级别，file：记录整个文件的变化，stage：只记录stage的变化
   */
  static HISTROY_LEVEL: string = 'file'

  /**
   * 当前活动的实例
   */
  static ACTIVE_INSTANCE: DDeiEditor | null = null;

  // 键盘对齐,开启后允许通过上下左右来改变控件位置,每次改变位置的大小为GLOBAL_HELP_LINE_WEIGHT
  static GLOBAL_KEYBOARD_ALIGN_ENABLE: boolean = true;

  //是否允许同时打开多个文件，开启后展示多文件列表，并可以切换
  static GLOBAL_ALLOW_OPEN_MULT_FILES: boolean = true;

  //是否允许同时打开多个Sheet，开启后展示多Sheet，并可以切换
  static GLOBAL_ALLOW_OPEN_MULT_SHEETS: boolean = true;

  //是否允许同时打开多个图层，开启后展示图层切换按钮
  static GLOBAL_ALLOW_OPEN_MULT_LAYERS: boolean = true;

  //是否允许快捷编辑颜色
  static GLOBAL_ALLOW_QUICK_COLOR: boolean = true;




  // 快捷键-键行为映射配置
  static HOT_KEY_MAPPING: object[] = [
    //全选,ctrl 0/null 不按下，1必须按下，2可选按下
    { ctrl: 1, keys: "65", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.AllSelect },
    //取消全选,500毫秒内，连续按两下esc键
    { keys: "27", times: 2, interval: 500, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelSelect },
    //删除
    { keys: "8", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RemoveModels },
    { keys: "46", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RemoveModels },
    //F2快捷编辑
    { keys: "113", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.StartQuickEdit },
    //ESC取消快捷编辑
    { keys: "27", editorState: DDeiEditorState.QUICK_EDITING, action: DDeiEnumKeyActionInst.CancelQuickEdit },
    //ESC关闭弹出框
    { keys: "27", editorState: DDeiEditorState.PROPERTY_EDITING, action: DDeiEnumKeyActionInst.CloseDialog },
    //ESC取消控件创建
    { keys: "27", editorState: DDeiEditorState.CONTROL_CREATING, action: DDeiEnumKeyActionInst.CancelControlCreating },
    //ESC取消当前的正在进行的动作
    { keys: "27", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelCurrentAction },
    //Enter确定快捷编辑
    { keys: "13", shift: 1, editorState: DDeiEditorState.QUICK_EDITING, action: DDeiEnumKeyActionInst.EnterQuickEdit },
    //表格内部回车，往下一行
    { keys: "13", modelType: 'DDeiTable', editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.TableNextRow },
    //表格内部tab，往下一列
    { keys: "9", modelType: 'DDeiTable', editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.TableNextCol },
    //上
    { shift: 2, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.UpMoveModels },
    //下
    { shift: 2, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.DownMoveModels },
    //左
    { shift: 2, keys: "37", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.LeftMoveModels },
    //右
    { shift: 2, keys: "39", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RightMoveModels },
    //组合
    { keys: "71", ctrl: 1, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.MakeCompose },
    //取消组合
    { keys: "71", ctrl: 1, shift: 1, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelCompose },
    //置于上层
    { ctrl: 1, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushUpModels },
    //置于下层
    { ctrl: 1, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushDownModels },
    //置于顶层
    { ctrl: 1, shift: 1, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushTopModels },
    //置于底层
    { ctrl: 1, shift: 1, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushBottomModels },
    //复制
    { ctrl: 1, keys: "67", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Copy },
    //剪切
    { ctrl: 1, keys: "88", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CUT },
    //复制为图片
    { ctrl: 1, keys: "73", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CopyImage },
    //粘贴
    { ctrl: 1, keys: "86", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Paste },
    //格式刷
    { ctrl: 1, shift: 1, keys: "67", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.BrushData },
    //清除格式刷
    { keys: "27", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ClearBrushData },

    //撤销
    { ctrl: 1, keys: "90", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Revoke },

    //反撤销
    { ctrl: 1, keys: "89", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ReRevoke },
    { ctrl: 1, shift: 1, keys: "90", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ReRevoke },

    //保存
    { ctrl: 1, keys: "83", action: DDeiEnumKeyActionInst.SaveFile },

  ];

  /**
   * 加载文件的函数，加载后的文件会进入文件列表，此方法为外部传入的勾子函数，由外部对文件进行加载
   * 必须为一个async函数
   */
  static EVENT_LOAD_FILE: Function;

  /**
   * 保存文件的函数，保存后文件会从dirty状态变为普通状态，此方法为外部传入的勾子函数，由外部对文件进行保存和存储
   * 必须为一个async函数
   */
  static EVENT_SAVE_FILE: Function;

  /**
 * 发布文件的函数，发布后文件从业务上转变为正式文件，此方法为外部传入的勾子函数，由外部对文件状态进行控制
 * 必须为一个async函数
 */
  static EVENT_PUBLISH_FILE: Function;



  /**
   * 返回文件列表，此方法为外部传入的勾子函数
   */
  static EVENT_GOBACK_FILE_LIST: Function;

  /**
   * 控件选择前，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_SELECT_BEFORE: Function;

  /**
   * 控件选择后，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_SELECT_AFTER: Function;

  /**
 * 移动视窗，此方法为外部传入的勾子函数
 */
  static EVENT_STAGE_CHANGE_WPV: Function;

  /**
   * 全剧缩放，此方法为外部传入的勾子函数
   */
  static EVENT_STAGE_CHANGE_RATIO: Function;


  // ============================ 静态方法 ============================
  /**
   * 给予container构建一个DDei实例
   * 每一个DDei至少包含1个文件
   * @param {id} id 文件id
   * @param {containerid} containerid 容器id
   * @param {active} active 是否设置为活动实例，缺省是
  */
  static newInstance(id: string, containerid: string, active: boolean = true, options: object = {}): DDeiEditor {
    if (id && containerid) {
      if (!DDeiEditor.INSTANCE_POOL[id]) {
        //初始化DDeiEditor对象
        let editorInstance = new DDeiEditor({ id: id, containerid: containerid });
        if (!DDeiUtil.getAttrValueByConfig) {
          DDeiUtil.getAttrValueByConfig = DDeiEditorUtil.getAttrValueByConfig;
        }
        if (!DDeiUtil.getControlDefine) {
          DDeiUtil.getControlDefine = DDeiEditorUtil.getControlDefine;
        }

        if (!DDeiUtil.getMenuConfig) {
          DDeiUtil.getMenuConfig = DDeiEditorUtil.getMenuConfig;
        }
        if (!DDeiUtil.getMenuControlId) {
          DDeiUtil.getMenuControlId = DDeiEditorUtil.getMenuControlId;
        }
        if (!DDeiUtil.showContextMenu) {
          DDeiUtil.showContextMenu = DDeiEditorUtil.showContextMenu;
        }

        if (!DDeiUtil.getSubControlJSON) {
          DDeiUtil.getSubControlJSON = DDeiEditorUtil.getSubControlJSON;
        }
        if (!DDeiUtil.getLineInitJSON) {
          DDeiUtil.getLineInitJSON = DDeiEditorUtil.getLineInitJSON;
        }
        if (!DDeiUtil.getBusiData) {
          DDeiUtil.getBusiData = DDeiEditorUtil.getBusiData;
        }
        if (!DDeiUtil.getEditorText) {
          DDeiUtil.getEditorText = DDeiEditorUtil.getEditorText;
        }



        //将DDeiEditor对象装入全局缓存
        DDeiEditor.INSTANCE_POOL[id] = editorInstance;
        if (active) {
          DDeiEditor.ACTIVE_INSTANCE = editorInstance;
        }

        //装载插件
        if (options) {
          editorInstance.options = options
          options.extensions?.forEach(item => editorInstance.registerExtension(item))
        }


        return editorInstance;
      } else {
        throw new Error('实例池中已存在ID相同的实例，初始化失败')
      }
    }
  }

  /**
   * 注册外部插件
   */
  registerExtension(plugin): void {
    if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
      plugin = plugin.defaultIns
    } 
    if (plugin.getComponents) {
      //注册并加载组件
      let components = plugin.getComponents(this)
      components?.forEach(component => {
        this.components[component.name] = component
      }); 
    }
    if (plugin.getDialogs) {
      //注册并加载弹出框
      let dialogs = plugin.getDialogs(this)
      dialogs?.forEach(dialog => {
        this.dialogs[dialog.name] = dialog
      }); 
    }
    if (plugin.getPanels) {
      //注册并加载面板
      let panels = plugin.getPanels(this)
      panels?.forEach(panel => {
        this.panels[panel.name] = panel
      }); 
    }

    if (plugin.getLayouts) {
      //注册并加载面板
      let layouts = plugin.getLayouts(this)
      layouts?.forEach(layout => {
        this.layouts[layout.name] = layout
      }); 
    }

    if (plugin.getPropEditors) {
      //注册并加载属性编辑器
      let propEditors = plugin.getPropEditors(this)
      propEditors?.forEach(propEditor => {
        this.propeditors[propEditor.name] = propEditor
      }); 
    }
    
    
    let options = plugin.getOptions() 
    
    let pluginType = plugin.getType();
    
 
    if (pluginType == 'plugin'){
      let pluginName = plugin.getName();
      if (pluginName){
        this.options[pluginName] = options;
      }
    } else if (pluginType == 'package') {
      this.options = Object.assign({}, this.options, options)
    }
  }

  /**
   * 注销外部插件
   */
  static ungisterExtension(plugin): void {
  }


  /**
   * 应用外部配置文件，覆写配置文件内容
   * @param config 
   */
  static applyConfig(config: Object): void {

    if (config) {
      //普通值、JSON、数组、MAP
      for (let i in config) {
        let outConfigValue = config[i];
        let configValue = DDeiEditor[i];
        if (i != "HOT_KEY_MAPPING") {
          //深度遍历属性，然后进行设置
          DDeiEditor[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
        }
      }
      if (config.HOT_KEY_MAPPING) {
        config.HOT_KEY_MAPPING.forEach(hotkey => {
          let ctrl = hotkey.ctrl;
          let shift = hotkey.shift;
          let keys = hotkey.keys;
          let times = hotkey.times;
          let interval = hotkey.interval;
          let editorState = hotkey.editorState
          //寻找是否已存在相同的键定义
          let index = -1;
          for (let i = 0; i < DDeiEditor.HOT_KEY_MAPPING.length; i++) {
            let hk1 = DDeiEditor.HOT_KEY_MAPPING[i]
            if (hk1.ctrl == ctrl && hk1.shift == shift && hk1.keys == keys && hk1.times == times && hk1.interval == interval && hk1.editorState == editorState) {
              index = i;
              break;
            }
          }
          if (index != -1) {
            DDeiEditor.HOT_KEY_MAPPING.splice(index, 1, hotkey);
          } else {
            DDeiEditor.HOT_KEY_MAPPING.push(hotkey)
          }
        });
      }
      //将配置文件传递到DDei框架
      DDeiConfig.applyConfig(config);
    }
  }

  /**
   * 应用外部配置文件
   * @param config 
   */
  applyConfig(config: Object): void {
    if (config) {
      //普通值、JSON、数组、MAP
      for (let i in config) {
        let outConfigValue = config[i];
        let configValue = this[i];
        if (i != "HOT_KEY_MAPPING") {
          //深度遍历属性，然后进行设置
          this[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
        }
      }
      if (config.HOT_KEY_MAPPING) {
        this.HOT_KEY_MAPPING = []
        config.HOT_KEY_MAPPING.forEach(hotkey => {
          //寻找是否已存在相同的键定义
          this.HOT_KEY_MAPPING.push(hotkey)
        });
      }
    }
  }

  static {
    //加载外部配置
    const global_config_ctx = import.meta.glob('@/ddei/config', { eager: true });
    for (let i in global_config_ctx) {
      let configData = global_config_ctx[i].default;
      //载入外部配置
      if (configData) {
        DDeiEditor.applyConfig(configData)
      }
      break;
    }

  }

  // ============================ 属性 ============================
  id: string;
  // 承载的容器id
  containerid: string;

  //当前打开的文件列表
  files: DDeiFile[];

  //当前打开的文件下标
  currentFileIndex: number;

  // 当前实例的状态
  state: DDeiEditorState | null;
  //当前模型的类型
  modelType: string = "DDeiEditor";
  //当前的实例
  ddInstance: DDei | null = null;
  //上下左右四个方向的大小
  leftWidth: number = 0;
  topHeight: number = 0;
  rightWidth: number = 0;
  bottomHeight: number = 0;
  middleWidth: number = 0;
  middleHeight: number = 0;

  //当前bus
  bus: DDeiBus | null = null;

  //编辑器UI对象
  viewEditor: object | null = null;
  //底部菜单UI对象
  bottomMenuViewer: object | null = null;
  //顶部菜单UI对象
  topMenuViewer: object | null = null;
  //toolbarUI对象
  toolBarViewer: object | null = null;
  //属性栏UI对象
  properyViewer: object | null = null;
  //文件浏览器对象
  openFilesViewer: object | null = null;

  //当前编辑模式，1：指针，2：手，3:文本创建，4:线段创建
  editMode: number = 1;

  //当前引入的外部组件
  components: object = markRaw({});
  //当前引入的外部属性编辑器
  propeditors: object = markRaw({});
  //当前引入的外部面板
  panels: object = markRaw({});
  //当前引入的外部布局
  layouts: object = markRaw({});
  //当前引入的外部弹出框
  dialogs: object = markRaw({});
  //当前布局的名称，如果为空，则获取最后一个有效的布局
  currentLayout: string = "ddei-core-layout-standard";

  // ============================ 方法 ============================

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
   * 添加文件到列表中,默认添加到最后面
   */
  addFile(file: DDeiFile, index: number): void {
    if (index || index == 0) {
      this.files.splice(index, 0, file);
    } else {
      this.files.push(file);
    }
  }

  /**
   * 移除文件
   */
  removeFile(file: DDeiFile, index: number): void {
    if (file) {
      if (this.files.indexOf(file) != -1) {
        this.files.splice(this.files.indexOf(file), 1);
      }
    } else if (index || index == 0) {
      this.files.splice(index, 1);
    }
  }

  /**
   * 交换文件的位置
   */
  changeFile(indexA: number, indexB: number): void {
    let fileA = this.files[indexA];
    let fileB = this.files[indexB];
    this.files[indexA] = fileB
    this.files[indexB] = fileA
  }

  // ============================ 事件 ============================
  /**
   * 绑定事件
   */
  bindEvent(): void {
    window.removeEventListener('blur', this.blur);
    document.removeEventListener('keydown', this.keyDown);
    document.removeEventListener('keyup', this.keyUp);
    document.addEventListener('keydown', this.keyDown);
    document.addEventListener('keyup', this.keyUp);
    window.addEventListener('blur', this.blur);
  }


  /**
   * 改变编辑器状态
   * @param state 新状态
   */
  changeState(state: DDeiEditorState): void {
    if (this.state != state) {
      this.state = state
    }


  }


  /**
   * 键盘按下
   */
  keyDown(evt: Event): void {
    if (DDeiKeyAction.route(evt)) {
      evt.preventDefault()
    }

  }

  /**
   * 键盘弹起
   */
  keyUp(evt: Event): void {
    DDeiKeyAction.updateKeyState(evt);
  }


  /**
   * 失去焦点
   */
  blur(): void {
    DDei.KEY_DOWN_STATE.clear()
    if (this.ddInstance?.render) {
      this.ddInstance.render.inEdge = 0;
    }
  }

  /**
   * 获取属性编辑器
   */
  getPropEditor(controlType: string): object {
    if(controlType && this.propeditors && this.propeditors['pv-'+controlType]){
      
      return this.propeditors['pv-'+controlType]
    }
  }

  /**
   * 获取属性编辑器
   */
  getLayout(): object {
    
    return this.layouts[this.currentLayout];
  }

  /**
  * 获取属性编辑器
  */
  getLayoutOptions(): object {
    return this.options[this.currentLayout];
  }

  /**
   * 返回所有弹出框以及选项
   */
  getDialogs() {
    let returnArray = []
    for (let i in this.dialogs){
      let dialog = this.dialogs[i];
    
      //根据名称获取配置
      if (dialog){
        let dialogOption = this.options[i];
        let options = null;
        if (typeof (dialogOption) == 'string') {
          //解析当前配置
          options = this.options[dialogOption]
        } else if (dialogOption?.getName) {
          //解析当前配置
          options = dialogOption.getOptions();
        }else{
          options = dialogOption
        }
        returnArray.push({ dialog: dialog, options: options })
      } 
    }
   
    return returnArray
  }

  /**
   * 获取options中的各个部分的配置
   */
  getPartPanels(options:object,part: string) {
    
    let partOption = null;
    if (options && options[part]) {
      if (options[part]) {
        partOption = options[part];
      }
    }
    if (partOption && this.panels) {
      let returnArray = []
      partOption.forEach(poption => {
        //根据名称获取配置
        if (typeof (poption) == 'string') {
          if (this.panels[poption]) {
            let comp = this.panels[poption]
            //解析当前配置
            let opts = this.options[poption]
            returnArray.push({ comp: comp, options: opts })
          }
        } else if (poption instanceof DDeiPluginBase) {
          let name = poption.getName()
          if (this.panels[name]) {
            let comp = this.panels[name]
            //解析当前配置
            let opts = poption.getOptions();
            returnArray.push({ comp: comp, options: opts })
          }
        } else if (DDeiPluginBase.isSubclass(poption, DDeiPluginBase)) {
          let name = poption.defaultIns.getName()
          if (this.panels[name]) {
            let comp = this.panels[name]
            //解析当前配置
            let opts = poption.defaultIns.getOptions();
            returnArray.push({ comp: comp, options: opts })
          }
        } 
      })
      return returnArray;
    }
  }
}

export default DDeiEditor