import DDeiKeyAction from "../../hotkeys/key-action"
import DDeiEditorState from "./enums/editor-state";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEditorUtil from "./util/editor-util";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiBus from "@ddei-core/framework/js/bus/bus";
import type DDeiFile from "./file";
import DDeiConfig from "@ddei-core/framework/js/config";
import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import { markRaw } from "vue";
import config from "./config"
import { cloneDeep } from "lodash";
import FONTS from "../../framework/js/fonts/font"

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


  //是否允许同时打开多个图层，开启后展示图层切换按钮
  static GLOBAL_ALLOW_OPEN_MULT_LAYERS: boolean = true;


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
        //初始化ddInstance
        let ddInstance = DDei.newInstance(
          editorInstance.id,
          editorInstance.id+"_canvas"
        );
        editorInstance.ddInstance = ddInstance;
        //初始化编辑器bus
        ddInstance.bus.invoker = editorInstance;
        editorInstance.bus = ddInstance.bus;

        

        //将DDeiEditor对象装入全局缓存
        DDeiEditor.INSTANCE_POOL[id] = editorInstance;
        if (active) {
          DDeiEditor.ACTIVE_INSTANCE = editorInstance;
        }
        
        //将编辑器的部分关键变量同步
        ddInstance.controlModelClasses = editorInstance.controlModelClasses
        ddInstance.controlViewClasses = editorInstance.controlViewClasses

        //加载预置模型定义和渲染定义
        let control_ctx = import.meta.glob(
          "../../framework/js/models/*.ts", { eager: true }
        )
        for (let path in control_ctx) {
          let cls = control_ctx[path].default
          if (cls?.ClsName) {
            editorInstance.controlModelClasses[cls.ClsName] = cls
          }
        }
        let view_ctx = import.meta.glob(
          "../../framework/js/views/**", { eager: true }
        )
        for (let path in view_ctx) {
          let cls = view_ctx[path].default
          if (cls?.ClsName) {
            editorInstance.controlViewClasses[cls.ClsName] = cls
          }
        }
       

        //装载插件
        if (options) {
          editorInstance.options = options
          options.extensions?.forEach(item => editorInstance.registerExtension(item))
          //注册快捷键
          for (let i in editorInstance.hotkeys){
            let hotkey = editorInstance.hotkeys[i]
            let options = hotkey.getOptions()
            if (options?.keys) {
              let keys = cloneDeep(options?.keys)
              keys.forEach(key => {
                key.action = hotkey
              });
              editorInstance.hotKeyMapping = editorInstance.hotKeyMapping.concat(keys)
            }
          }
          
          editorInstance.controls?.forEach(control => {
            if(control.menus){
              if (!editorInstance.menuMapping[control.id]) {
                editorInstance.menuMapping[control.id] = control.menus
              }
              let menus = editorInstance.menuMapping[control.id];
              for (let i = 0; i < menus.length;i++){
                for (let j in editorInstance.menus){
                  if (editorInstance.menus[j].name == menus[i].name){
                    menus[i] = editorInstance.menus[j];
                    break;
                  }
                }
              }
            }
            if (control.define) {
              delete control.define.font
              delete control.define.textStyle
              delete control.define.border
              delete control.define.fill
            }
            delete control.attrs
          })
          //加载控件的右键菜单,移除加载控件的临时变量
          for (let i in editorInstance.menus){
            let menu = editorInstance.menus[i]
            let options = menu.getOptions();
            menu.label = options.label ? options.label : ''
            menu.icon = options.icon ? options.icon : ''
            menu.disabled = options.disabled ? options.disabled : false;
            options?.models?.forEach(model => {
              if (!editorInstance.menuMapping[model]){
                editorInstance.menuMapping[model] = []
              }
              let menus = editorInstance.menuMapping[model]
              let finded = false
              for (let j = 0; j < menus.length; j++) {
                if (menu.name == menus[j].name) {
                  finded = true
                  break;
                }
              }
              if (!finded){
                menus.push(menu)
              }
              
            });
          };
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
        this.panels[component.name] = component
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


    if (plugin.getHotKeys) {
      //注册并加载快捷键
      let hotKeys = plugin.getHotKeys(this)
      hotKeys?.forEach(hotkey => {
        
        this.hotkeys[hotkey.name] = hotkey

      });
    }

    //加载菜单相关插件
    if (plugin.getMenus) {
      //注册并加载菜单
      let menus = plugin.getMenus(this)
      menus?.forEach(menu => {
        this.menus[menu.name] = menu;
      });
    }

    //加载控件相关插件
    //控件配置
    if (plugin.getControls) {
      //注册并加载控件
      let controls = plugin.getControls(this)
      controls?.forEach(control => {
        this.controls.set(control.id,control)
      });
    }

    //控件分组
    if (plugin.getGroups) {
      //注册并加载分组
      let groups = plugin.getGroups(this)
      groups?.forEach(group => {
        let finded = false;
        for(let i = 0;i < this.groups.length;i++){
          if(this.groups[i].id == group.id){
            this.groups[i] = group
            finded = true
            break;
          }
        }
        if (!finded){
          this.groups.push(group)
        }
      });
    }

    //控件模型定义
    if (plugin.getModels) {
      //注册并加载控件
      let models = plugin.getModels(this)
      models?.forEach(model => {
        this.controlModelClasses[model.ClsName] = model
      });
    }

    //控件视图定义
    if (plugin.getViews) {
      //注册并加载控件
      let views = plugin.getViews(this)
      views?.forEach(view => {
        this.controlViewClasses[view.ClsName] = view
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
        //深度遍历属性，然后进行设置
        DDeiEditor[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
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
        //深度遍历属性，然后进行设置
        this[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
      }
    }
  }

  static {
    //载入缺省配置
    if (config) {
      DDeiEditor.applyConfig(config)
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
  //当前引入的外部快捷键
  hotkeys: object = markRaw({});
  // 快捷键-键行为映射配置
  hotKeyMapping: object[] = markRaw([]);
  //当前引入的外部菜单
  menus: object = markRaw({});
  //当前引入的外部字体
  fonts: object[] = FONTS;
  //当前引入的外部菜单
  menuMapping: object = markRaw({});
  //当前引入的外部控件配置
  controls: Map<string,object> = markRaw(new Map());
  //当前引入的外部分组配置
  groups: object = markRaw([]);
  //当前引入的外部控件模型定义
  controlModelClasses: object = markRaw({});
  //当前引入的外部控件视图定义
  controlViewClasses: object = markRaw({});
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