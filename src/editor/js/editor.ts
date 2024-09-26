import DDeiKeyAction from "../../hotkeys/key-action"
import DDeiEditorState from "./enums/editor-state";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEditorUtil from "./editor-util";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiBus from "@ddei-core/framework/js/bus/bus";
import DDeiFile from "./file";
import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import { markRaw } from "vue";
import config from "./config"
import { clone, cloneDeep } from "lodash";
import FONTS from "../../framework/js/fonts/font"
import { Matrix3, Vector3 } from 'three'
import DDeiThemeBase from "@ddei-core/themes/theme";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import  DDeiLifeCycle  from "@ddei-core/lifecycle/lifecycle";
import  DDeiFuncData  from "@ddei-core/lifecycle/funcdata";
import { DDeiModelArrtibuteValue } from "@ddei-core/framework/js/models/attribute/attribute-value";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "./enums/editor-command-type";
import { DDeiActiveType } from "./enums/active-type";
import { DDeiLink } from "@ddei-core/framework/js/models/link"
import type DDeiStage from "../../framework/js/models/stage";
import DDeiLine from "../../framework/js/models/line"
import DDeiFileState from "./enums/file-state";
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
    if (props.currentLayout){
      this.currentLayout = props.currentLayout
    }
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

  //以下字段为初始化时传入初始化字段，在运行时会用作缺省值
  //主题风格
  theme: string|null = null;
  //以上字段为初始化时传入初始化字段，在运行时会用作缺省值



  //以下字段为初始化时传入的全局控制变量或钩子函数，在运行时不会改变

  //是否开启风格本地缓存
  GLOBAL_LOCAL_CACHE_THEME: boolean = true;

  // 键盘对齐,开启后允许通过上下左右来改变控件位置
  GLOBAL_KEYBOARD_ALIGN_ENABLE: boolean = true;


  //是否允许同时打开多个图层，开启后展示图层切换按钮
  GLOBAL_ALLOW_OPEN_MULT_LAYERS: boolean = true;

  /**
   * 加载文件的函数，加载后的文件会进入文件列表，此方法为外部传入的勾子函数，由外部对文件进行加载
   * 必须为一个async函数
   */
  EVENT_LOAD_FILE: Function|null = null;

  /**
   * 保存文件的函数，保存后文件会从dirty状态变为普通状态，此方法为外部传入的勾子函数，由外部对文件进行保存和存储
   * 必须为一个async函数
   */
  EVENT_SAVE_FILE: Function|null = null;

  /**
 * 发布文件的函数，发布后文件从业务上转变为正式文件，此方法为外部传入的勾子函数，由外部对文件状态进行控制
 * 必须为一个async函数
 */
  EVENT_PUBLISH_FILE: Function | null = null;

  /**
   * 控件选择前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_BEFORE: Function | null = null;

  /**
   * 控件选择后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_AFTER: Function | null = null;

  /**
 * 移动视窗，此方法为外部传入的勾子函数
 */
  EVENT_STAGE_CHANGE_WPV: Function | null = null;

  /**
   * 全剧缩放，此方法为外部传入的勾子函数
   */
  EVENT_STAGE_CHANGE_RATIO: Function | null = null;
  //以上字段为初始化时传入的全局控制变量或钩子函数，在运行时不会改变

  //是否允许后台激活，允许后台激活的实例，在当前实例为非ACTIVE_INSTANCE时，依然能够执行部分后台操作
  GLOBAL_ALLOW_BACK_ACTIVE:boolean = false;

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
      if (!DDeiEditor.INSTANCE_POOL.get(id)) {
        //初始化DDeiEditor对象
        let editorInitOptions = clone(options)
        editorInitOptions.id = id
        editorInitOptions.containerid = containerid
        let editorInstance = new DDeiEditor(editorInitOptions);
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
        if (!DDeiUtil.getStyleValue) {
          DDeiUtil.getStyleValue = DDeiEditorUtil.getStyleValue;
        }
        if (!DDeiUtil.getEditorId) {
          DDeiUtil.getEditorId = DDeiEditorUtil.getEditorId;
        }
        if (!DDeiUtil.invokeCallbackFunc) {
          DDeiUtil.invokeCallbackFunc = DDeiEditorUtil.invokeCallbackFunc;
        }
        if (!DDeiUtil.notifyChange) {
          DDeiUtil.notifyChange = DDeiEditorUtil.notifyChange;
        }
        if (!DDeiUtil.isBackActive) {
          DDeiUtil.isBackActive = DDeiEditorUtil.isBackActive;
        }
        
        
        
        //将DDeiEditor对象装入全局缓存
        DDeiEditor.INSTANCE_POOL.set(id, editorInstance);
        if (active) {
          DDeiEditor.ACTIVE_INSTANCE = editorInstance;
        }
        //初始化ddInstance
        let ddInstance = DDei.newInstance(
          editorInstance.id,
          editorInstance.id+"_canvas",null,
          editorInstance
        );
        
        //初始化编辑器bus
        ddInstance.bus.invoker = editorInstance;
        editorInstance.bus = ddInstance.bus;

        

        
        
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
          editorInstance.hotKeyMapping.sort((a: object, b: object) => {
            if (a.times && b.times) {
              return 0
            } else if (a.times && !b.times) {
              return -1
            } else if (!a.times && b.times) {
              return 1
            } else if (!a.times && !b.times) {
              return 0
            }
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

          //将生命周期插件中的回调函数进行升序排序,建立调用索引
          editorInstance.lifecyclies.forEach(lifeCycle=>{
            for (let i in lifeCycle){
              if (lifeCycle[i] && lifeCycle[i] instanceof DDeiFuncData){
                if (!editorInstance.funcIndex.has(i)){
                  editorInstance.funcIndex.set(i,[]);
                }
                let funcArray = editorInstance.funcIndex.get(i);
                funcArray?.push(lifeCycle[i])
              }
            }
          })
          editorInstance.funcIndex.forEach(funcArr=>{
            funcArr.sort((a: DDeiFuncData, b: DDeiFuncData)=>{
              if(a.sort && b.sort){
                return a.sort - b.sort
              } else if (a.sort && !b.sort) {
                return 1
              } else if (!a.sort && b.sort) {
                return -1
              } else if (!a.sort && !b.sort) {
                return 0
              }
            })
          })
        }


        return editorInstance;
      } else {
        return DDeiEditor.INSTANCE_POOL.get(id)
      }
    }
    return null;
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
        this.dialogs[dialog.name] = cloneDeep(dialog)
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

    //加载字体插件
    if (plugin.getFonts) {
      //注册并加载菜单
      let fonts = plugin.getFonts(this)
      fonts?.forEach(font => {
        this.fonts.push(font)
        let fontObj = new FontFace(font.ch, 'url(' + font.font + ')')
        fontObj.load().then(f => {
          document.fonts.add(f)
        })
      });

    }

    //加载主题样式
    if (plugin.getThemes) {
      //注册并加载菜单
      let themes = plugin.getThemes(this)
      themes?.forEach(theme => {
        let finded = false;
        for (let i = 0; i < this.themes?.length; i++) {
          if (this.themes[i].name == theme.name) {
            finded = true
            this.themes[i] = theme;
            break;
          }
        }
        if (!finded){
          this.themes.push(theme)
        }
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


    //加载转换器
    if (plugin.getConverters) {
      let converters = plugin.getConverters(this)
      converters?.forEach(converter => {
        this.converters[converter.name] = converter
      });
    }

    //加载生命周期插件
    if (plugin.getLifeCyclies){
      let lifeCyclies = plugin.getLifeCyclies(this)
      lifeCyclies?.forEach(lifeCycle => {
        this.lifecyclies.push(lifeCycle)
      });
    }
    
    if (plugin.installed){
      plugin.installed(this)
    }

    
    let options = null;
    if (plugin.getOptions){
      options = plugin.getOptions() 
    }
    if (options){
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
  }


  /**
   * 应用外部配置文件
   * @param custConfig 
   */
  applyConfig(custConfig: Object): void {

    if(config){
      //普通值、JSON、数组、MAP
      for (let i in config) {
        // let outConfigValue = config[i];
        // let configValue = this[i];
        //深度遍历属性，然后进行设置
        this[i] = config[i]
        
      }
      if (this.ddInstance) {
        this.ddInstance.applyConfig(config)
      }
    }
    if (custConfig) {
      //普通值、JSON、数组、MAP
      for (let i in custConfig) {
        // let outConfigValue = custConfig[i];
        // let configValue = this[i];
        //深度遍历属性，然后进行设置
        this[i] = custConfig[i]
      }
      if (this.ddInstance) {
        this.ddInstance.applyConfig(custConfig)
      }
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
  // viewEditor: object | null = null;
  // //底部菜单UI对象
  // bottomMenuViewer: object | null = null;
  // //顶部菜单UI对象
  // topMenuViewer: object | null = null;
  // //toolbarUI对象
  // toolBarViewer: object | null = null;
  // //属性栏UI对象
  // properyViewer: object | null = null;
  // //文件浏览器对象
  // openFilesViewer: object | null = null;

  //钩子函数，设置当前右键菜单
  setCurrentMenu: Function | null = null;

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

  //自定义viewer的映射，key为model.id, value为渲染元素
  viewerMap: Map<string, object> = markRaw(new Map());
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
  //当前引入的外部主题样式
  themes: DDeiThemeBase[] = markRaw([])
  //当前缺省主题
  currentTheme: string = ''
  //当前布局的名称，如果为空，则获取最后一个有效的布局
  currentLayout: string = "ddei-core-layout-standard";
  //转换器，用于对输入和输出的数据进行转换或适配
  converters: object = markRaw({});

  //生命周期插件
  lifecyclies: DDeiLifeCycle[] = markRaw([]);

  //排序后的回调函数索引
  funcIndex: Map<string,DDeiFuncData[]> = new Map();

  // ============================ 方法 ============================

  /**
   * 修改当前编辑模式
   * @param mode 编辑模式
   */
  changeEditMode(mode:number): void {
    if (this.editMode != mode) {
      this.editMode = mode
    }
  }


  /**
   * 加载文件到设计器中
   * @param fileJson 文件json
   * @param append 是否添加
   */
  loadData(fileJson:string|object,append:boolean = false):void{
    if (fileJson){
      
      if (typeof (fileJson) == 'string'){
        fileJson = JSON.parse(fileJson)
      }
      let json = fileJson
      //json中有一级content
      //追加文件
      let file 
      if (json?.content) {
        file = DDeiFile.loadFromJSON(json.content, {
          currentDdInstance: this.ddInstance,
        });
        file.id = json.id;
        file.publish = json.publish;
        file.name = json.name;
        file.path = json.path;
        file.desc = json.desc;
        file.version = json.version;
        file.extData = json.extData;
        file.busiData = json.busiData;
      }else{
        file = DDeiFile.loadFromJSON(json, {
          currentDdInstance: this.ddInstance,
        });
      }
      
      file.state = DDeiFileState.NONE;
      //追加文件
      if (append){
        this.addFile(file)
        this.files.forEach(f=>{
          f.active = DDeiActiveType.NONE;
        })
        this.currentFileIndex = this.files.indexOf(file)
      }
      //覆盖文件
      else{
        this.files[this.currentFileIndex] = file
      }

      //显示当前文件内容
      if (file && file.sheets?.length > 0) {
        file.active = DDeiActiveType.ACTIVE;
        let sheets = file?.sheets;
        file.changeSheet(file.currentSheetIndex);
        let stage = sheets[file.currentSheetIndex].stage;
        stage.ddInstance = this.ddInstance;
        //记录文件初始日志
        file.initHistroy();
        //刷新页面
        this.ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
      }
      this.notifyChange()
    }
  }

  /**
   * 添加文件到列表中,默认添加到最后面
   */
  addFile(file: DDeiFile, index: number|null = null): void {
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
  exchangeFile(indexA: number, indexB: number): void {
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
    let isActive = false;
    if(document.activeElement?.tagName == 'BODY'){
      isActive = true
    }else{
      //控件必须是当前editor的子控件
      isActive = DDeiEditorUtil.isEditorSubElement(document.activeElement, DDeiEditor.ACTIVE_INSTANCE)
    }
    if (isActive && DDeiKeyAction.route(evt)) {
      evt.preventDefault()
    }

  }

  /**
   * 键盘弹起
   */
  keyUp(evt: Event): void {
    let isActive = false;
    if (document.activeElement?.tagName == 'BODY') {
      isActive = true
    } else {
      //控件必须是当前editor的子控件
      isActive = DDeiEditorUtil.isEditorSubElement(document.activeElement, this)
    }
    if (isActive){
      DDeiKeyAction.updateKeyState(evt);
    }
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
   * 获取布局
   */
  getLayout(): object {
    
    return this.layouts[this.currentLayout];
  }

  /**
  * 获取布局选项
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

  /**
   * 获取开启的转换器
   * fileData 文件内容
   */
  getEnabledConverters(fileData:object,sort:number = 1) {
    let returnArray = []
    for(let i in this.converters){
      let converter = this.converters[i];
      if (converter.isEnable(fileData)){
        returnArray.push(converter);
      }
    }
    if (sort == 1){
      returnArray.sort((c1, c2) => {
        if(c1.sort && c2.sort){
          return c1?.sort - c2?.sort
        } else if (c1.sort && !c2.sort) {
          return 1
        } else if (!c1.sort && c2.sort) {
          return -1;
        } else{
          return 0;
        }
      })
    }else{
      returnArray.sort((c1, c2) => {
        if (c1.sort && c2.sort) {
          return c2?.sort - c1?.sort
        } else if (c1.sort && !c2.sort) {
          return -1
        }else if (!c1.sort && c2.sort) {
          return 1;
        } else {
          return 0;
        }
      })
    }
    return returnArray;
  }

  /**
   * 设置当前主题
   * @param themeName 主题名称
   */
  changeTheme(themeName: string){
    if(!themeName){
      if (this.GLOBAL_LOCAL_CACHE_THEME){
        themeName = localStorage.getItem("ddei-theme-" + this.id);
      }
    }
    let finded = false;
    let defaultJSON = null;
    for (let i = 0; i < this.themes?.length;i++){
      if (this.theme && this.themes[i].name == this.theme) {
        defaultJSON = this.themes[i]
      }else if (this.themes[i].default == true){
        defaultJSON = this.themes[i]
      }
      if (this.themes[i].name == themeName){
        finded = true
        this.currentTheme = themeName
        let themeConfig = this.themes[i];
        this.changeStyle(this.currentTheme,themeConfig);
        break;
      }
    }
    if (!finded){
      this.currentTheme = defaultJSON.name;
      let themeConfig = defaultJSON
      this.changeStyle(this.currentTheme,themeConfig);
    }
  }

  changeStyle(name:string,obj: object){
    let container = document.getElementById(this.containerid);
    container?.setAttribute("theme",name);
    //清空已有属性
    let removeProperties = []
    for(let i = 0;i < container.style.length;i++){
      if (container.style[i] && container.style[i].startsWith("--")){
        removeProperties.push(container.style[i])
        
      }
    }
    removeProperties.forEach(prop=>{
      container.style.removeProperty(prop);
    });
   
    for (let key in obj) {
      if (obj[key]){
        container.style.setProperty(`--${key}`, obj[key]);
      }
    }
    //刷新清空画布缓存颜色，刷新画布
    if(this.ddInstance?.stage?.render){
      this.ddInstance?.stage?.render?.clearCachedValue();
      this.ddInstance.stage.render.refresh = true
    }
    //更新图标
    if (this.GLOBAL_LOCAL_CACHE_THEME){
      let curInsTheme = localStorage.getItem("ddei-theme-" + this.id);
      if (!curInsTheme || curInsTheme != name) {
        localStorage.setItem("ddei-theme-" + this.id, name);
      }
    }
    
  };



  /**
   * 向当前画布添加控件,缺省坐标为当前画布的中心
   * @param controls 要添加的控件
   * @param applyRatio 应用缩放
   * @param notify 通知刷新
   */
  addControls(controls: object[],applyRatio: boolean = true, notify: boolean = true):DDeiAbstractShape[]{
    if (controls?.length > 0){
    //添加控件到图层
    let stage = this.ddInstance.stage
    let layer = stage?.layers[stage?.layerIndex];
    let shapes: DDeiAbstractShape[] = []
    if (layer) {
      controls.forEach(control => {
        //读取配置
        let controlDefine = this.controls.get(control.model);
        if (controlDefine) {
          //根据配置创建控件
          let controlModel = DDeiEditorUtil.createControl(controlDefine, this)
          if (controlModel?.length > 0) {
            let cc = controlModel[0]
            //设置控件值
            for (let i in control){
              if (i != 'spv' && i != 'hpv' && i != 'cpv' && i != 'x' && i != 'y' && i!='width' && i != 'height' && (control[i] || control[i] == 0 || control[i] == false)){
                cc[i] = control[i];
              }
            }
            
            //设置大小以及坐标
            let stageRatio1 = stage.getStageRatio();
            let stageRatio = !applyRatio ? 1 / stageRatio1 :1
            
            let m1 = new Matrix3()
            //缩放至目标大小
            if (control.width || control.height) {
              let width = (control.width ? control.width : 0) * stageRatio
              let height = (control.height ? control.height : 0) * stageRatio
              let scaleMatrix = new Matrix3(
                width / cc.essBounds.width, 0, 0,
                0, height / cc.essBounds.height, 0,
                0, 0, 1);
              m1.premultiply(scaleMatrix)
            }
                      
            
            
            let moveMatrix = new Matrix3(
              1, 0, -stage.wpv.x + (this.ddInstance.render.canvas.width / this.ddInstance.render.ratio) / 2,
              0, 1, -stage.wpv.y + (this.ddInstance.render.canvas.height / this.ddInstance.render.ratio) / 2 ,
              0, 0, 1);

            
            m1.premultiply(moveMatrix)
            //位移至画布中心的相对位置
            if (control.offsetX || control.offsetY) {
              let move1Matrix = new Matrix3(
                1, 0, control.offsetX ? control.offsetX * stageRatio : 0,
                0, 1, control.offsetY ? control.offsetY * stageRatio : 0,
                0, 0, 1);
              m1.premultiply(move1Matrix)
            } else if ((control.x || control.x == 0) && (control.y || control.y == 0)){
              let move1Matrix = new Matrix3(
                1, 0, -(-stage.wpv.x + (this.ddInstance.render.canvas.width / this.ddInstance.render.ratio) / 2) + control.x * stageRatio,
                0, 1, -(-stage.wpv.y + (this.ddInstance.render.canvas.height / this.ddInstance.render.ratio) / 2) + control.y * stageRatio,
                0, 0, 1);
              m1.premultiply(move1Matrix)
            }
            cc.transVectors(m1)
            cc.updateLinkModels()

            layer.addModel(cc, false)
            //绑定并初始化渲染器
            cc.initRender();
            shapes.push(cc);
          }
        }
      });
      if (notify) {
        this.notifyChange();
      }
    }
    return shapes;
    }
  }

  /**
   * 向特定图层添加控件,缺省坐标为当前画布的中心
   * @param controls 要添加的控件
   * @param layerIndex 图层下标
   * @param applyRatio 应用缩放
   * @param notify 通知刷新
   */
  addControlsToLayer(controls: object[], layerIndex: number = -1, applyRatio: boolean = true, notify: boolean = true): DDeiAbstractShape[]|null {
    //添加控件到图层
    let stage = this.ddInstance.stage
    if (layerIndex > -1 && layerIndex < stage?.layers?.length){
      
      let layer = stage?.layers[layerIndex];
      let shapes: DDeiAbstractShape[] = []
      if (layer) {
        controls.forEach(control => {
          //读取配置
          let controlDefine = this.controls.get(control.model);
          if (controlDefine) {
            //根据配置创建控件
            let controlModel = DDeiEditorUtil.createControl(controlDefine, this)
            if (controlModel?.length > 0) {
              let cc = controlModel[0]
              //设置控件值
              for (let i in control) {
                if (i != 'spv' && i != 'hpv' && i != 'cpv' && i != 'x' && i != 'y' && i != 'width' && i != 'height' && (control[i] || control[i] == 0 || control[i] == false)) {
                  cc[i] = control[i];
                }
              }

              //设置大小以及坐标
              let stageRatio = !applyRatio ? 1/stage.getStageRatio() : 1;
              let m1 = new Matrix3()
              //缩放至目标大小
              if (control.width || control.height) {
                let width = (control.width ? control.width : 0) * stageRatio
                let height = (control.height ? control.height : 0) * stageRatio
                let scaleMatrix = new Matrix3(
                  width / cc.essBounds.width, 0, 0,
                  0, height / cc.essBounds.height, 0,
                  0, 0, 1);
                m1.premultiply(scaleMatrix)
              }

              let moveMatrix = new Matrix3(
                1, 0, -stage.wpv.x + (this.ddInstance.render.canvas.width / this.ddInstance.render.ratio) / 2, //+ this.ddInstance.render.container.offsetWidth/2,
                0, 1, -stage.wpv.y + (this.ddInstance.render.canvas.height / this.ddInstance.render.ratio) / 2,// + this.ddInstance.render.container.offsetHeight / 2,
                0, 0, 1);

              m1.premultiply(moveMatrix)
              //位移至画布中心的相对位置
              if (control.offsetX || control.offsetY) {
                let move1Matrix = new Matrix3(
                  1, 0, control.offsetX ? control.offsetX * stageRatio : 0,
                  0, 1, control.offsetY ? control.offsetY * stageRatio : 0,
                  0, 0, 1);
                m1.premultiply(move1Matrix)
              } else if ((control.x || control.x == 0) && (control.y || control.y == 0)) {
                let move1Matrix = new Matrix3(
                  1, 0, -(-stage.wpv.x + (this.ddInstance.render.canvas.width / this.ddInstance.render.ratio) / 2) + control.x * stageRatio,
                  0, 1, -(-stage.wpv.y + (this.ddInstance.render.canvas.height / this.ddInstance.render.ratio) / 2) + control.y * stageRatio,
                  0, 0, 1);
                m1.premultiply(move1Matrix)
              }
              cc.transVectors(m1)
              cc.updateLinkModels()

              layer.addModel(cc, false)
              //绑定并初始化渲染器
              cc.initRender();
              shapes.push(cc);
            }
          }
        });
        if (notify) {
          this.notifyChange();
        }
      }
      
      return shapes;
    }
    return null
  }

  /**
   * 向当前画布添加连线
   * @param controls 要添加的控件
   * @param applyRatio 应用缩放
   * @param notify 通知刷新
   */
  addLines(controls: object[],calPoints:boolean = true,applyRatio: boolean = true,notify:boolean = true): DDeiAbstractShape[] {
    //添加控件到图层
    let stage = this.ddInstance.stage
    let layer = stage?.layers[stage?.layerIndex];
    let shapes: DDeiAbstractShape[] = []
    if (layer) {
      let stageRatio = !applyRatio ? 1/stage.getStageRatio() : 1

      let moveX = -stage.wpv.x + (this.ddInstance.render.canvas.width / this.ddInstance.render.ratio) / 2
      let moveY = -stage.wpv.y + (this.ddInstance.render.canvas.height / this.ddInstance.render.ratio) / 2
      
      controls.forEach(control => {
        if (control.startPoint && control.endPoint) {
          //读取配置
          let lineJson = DDeiUtil.getLineInitJSON();
          lineJson.id = "line_" + (++stage.idIdx)
          //线段类型
          lineJson.type = 2
          
          //根据线的类型生成不同的初始化点
          lineJson.type = 2
          //直线两个点
          let sx,sy,ex,ey
          if (control.startPoint.offsetX || control.startPoint.offsetX == 0) {
            sx = moveX + control.startPoint.offsetX * stageRatio
          } else if (control.startPoint.x || control.startPoint.x == 0) {
            sx = control.startPoint.x * stageRatio
          }
          if (control.startPoint.offsetY || control.startPoint.offsetY == 0) {
            sy = moveY + control.startPoint.offsetY * stageRatio
          } else if (control.startPoint.y || control.startPoint.y == 0) {
            sy = control.startPoint.y * stageRatio
          }
          if (control.endPoint.offsetX || control.endPoint.offsetX == 0) {
            ex = moveX + control.endPoint.offsetX * stageRatio
          } else if (control.endPoint.x || control.endPoint.x == 0) {
            ex = control.endPoint.x * stageRatio
          }
          if (control.endPoint.offsetY || control.endPoint.offsetY == 0) {
            ey = moveY + control.endPoint.offsetY * stageRatio
          } else if (control.endPoint.y || control.endPoint.y == 0) {
            ey = control.endPoint.y * stageRatio
          }
          control.spvs?.forEach(spv => {
            spv.x = spv.x * stageRatio
            spv.y = spv.y * stageRatio
          });
          
          //跳过计算点
          if (!calPoints && control.pvs?.length >= 2) {
            lineJson.pvs = []
            control.pvs.forEach(pv => {
              let pvx,pvy
              if (pv.offsetX || pv.offsetX == 0) {
                pvx = moveX + pv.offsetX * stageRatio
              } else if (pv.x || pv.x == 0) {
                pvx = pv.x * stageRatio
              }
              if (pv.offsetY || pv.offsetY == 0) {
                pvy = moveY + pv.offsetY * stageRatio
              } else if (pv.y || pv.y == 0) {
                pvy = pv.y * stageRatio
              }
              lineJson.pvs.push(new Vector3(pvx, pvy, 1))
            });
          }else{
            lineJson.pvs = [new Vector3(sx, sy, 1), new Vector3(ex, ey, 1)]
          }
          lineJson.cpv = lineJson.pvs[0]
          //初始化开始点和结束点

          let cc = DDeiLine.initByJSON(lineJson, { currentStage: stage, currentLayer: layer, currentContainer: layer });
          
          //设置控件值
          for (let i in control) {
            if (i != 'startPoint' && i != 'endPoint' && i != 'pvs' && i != 'spv' && i != 'hpv' && i != 'cpv' && i != 'x' && i != 'y' && i != 'width' && i != 'height' && (control[i] || control[i] == 0 || control[i] == false)) {
              cc[i] = control[i];
            }
          }
         
          //构造线段关键属性
          let smodel,emodel
          if (control.smodel) {
            smodel = this.getControlById(control.smodel.id)
            //创建连接点
            let id = "_" + DDeiUtil.getUniqueCode()
            smodel.exPvs[id] = new Vector3(sx, sy, 1)
            smodel.exPvs[id].rate = control.smodel.rate
            smodel.exPvs[id].sita = control.smodel.sita
            smodel.exPvs[id].index = control.smodel.index
            smodel.exPvs[id].id = id
            let link = new DDeiLink({
              sm: smodel,
              dm: cc,
              smpath: "exPvs." + id,
              dmpath: "startPoint",
              stage: stage
            });
            stage.addLink(link)
            
          }
          if (control.emodel) {
            emodel = this.getControlById(control.emodel.id)
            //创建连接点
            let id = "_" + DDeiUtil.getUniqueCode()
            emodel.exPvs[id] = new Vector3(ex, ey, 1)
            emodel.exPvs[id].rate = control.emodel.rate
            emodel.exPvs[id].sita = control.emodel.sita
            emodel.exPvs[id].index = control.emodel.index
            emodel.exPvs[id].id = id
            let link = new DDeiLink({
              sm: emodel,
              dm: cc,
              smpath: "exPvs." + id,
              dmpath: "endPoint",
              stage: stage
            });
            stage.addLink(link)
          }
          if (!control.isShadowControl) {
            layer.addModel(cc, false)
            cc.initRender()
          }else{
            layer.shadowControls.push(cc);
            cc.initRender()
          }
          if (calPoints){
            smodel?.updateLinkModels();
            emodel?.updateLinkModels();
          }
          shapes.push(cc);
          
        }
      });
      if (notify){
        this.notifyChange();
      }
    }
    return shapes;
  }

  notifyChange(){
    this.bus.push(DDeiEnumBusCommandType.UpdatePaperArea);
    this.bus.push(DDeiEnumBusCommandType.NodifyChange);
    this.bus.push(DDeiEnumBusCommandType.RefreshShape);
    this.bus.push(DDeiEnumBusCommandType.AddHistroy);
    this.changeState(DDeiEditorState.DESIGNING);
    // this.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);

    this.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts);
    this.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels);
    this.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
    this.bus.executeAll()
  }

  /**
   * 移除当前画布控件
   */
  removeControls(ids: string[], notify: boolean = true): void {
    this.ddInstance.stage?.removeModelById(ids)
    if (notify){
      this.notifyChange();
    }
  }

  

  /**
   * 清除当前画布所有控件
   */
  clearModels(destroy: boolean = false,notify:boolean = true): void {
    this.ddInstance.stage?.clearModels(destroy)
    if (notify) {
      this.notifyChange();
    }
  }

  /**
   * 根据ID获取控件
   */
  getControlById(id: string): DDeiAbstractShape {
    return this.ddInstance.stage?.getModelById(id,true);
  }


  /**
   * 设置是否可以编辑
   */
  setEditable(editable: boolean): void {
    if (!editable) {
      this.ddInstance["AC_DESIGN_CREATE"] = false
      this.ddInstance["AC_DESIGN_EDIT"] = false
      this.ddInstance["AC_DESIGN_DRAG"] = false
      this.ddInstance["AC_DESIGN_LINK"] = false
      this.ddInstance["AC_DESIGN_DEL"] = false
      this.ddInstance["AC_DESIGN_ROTATE"] = false
      this.ddInstance["AC_DESIGN_SCALE"] = false
      this.ddInstance["AC_DESIGN_COMPOSE"] = false
    } else {
      this.ddInstance["AC_DESIGN_CREATE"] = true
      this.ddInstance["AC_DESIGN_EDIT"] = true
      this.ddInstance["AC_DESIGN_DRAG"] = true
      this.ddInstance["AC_DESIGN_SELECT"] = true
      this.ddInstance["AC_DESIGN_LINK"] = true
      this.ddInstance["AC_DESIGN_DEL"] = true
      this.ddInstance["AC_DESIGN_ROTATE"] = true
      this.ddInstance["AC_DESIGN_SCALE"] = true
      this.ddInstance["AC_DESIGN_COMPOSE"] = true
    }
  }

  setAccessInfo(config:object): void {
    if (config) {
      for (let i in config){
        if (config[i] == true || config[i] == false ){
          this.ddInstance["AC_" + this.MODE_NAME + "_" + i] = config[i]
        }
      }
    }
  }

  /**
     * 将模型转换为JSON
     */
  toJSON():Array<Object> {
    let jsonArray = new Array()
    this.files.forEach(file=>{
      jsonArray.push(file.toJSON())
    })
    return jsonArray;
  }

  /**
   * 根据属性搜索控件
   * @param keywords 关键字/正则表达式
   * @param attr 搜索的属性
   * @param isReg 是否正则表达式
   * @param area 搜索范围，1本页/2本文档/3所有打开文件
   * @param matchCase 区分大小写
   * @param matchAll 全字匹配
   */
  searchModels(keywords:string,attr:string,isReg:boolean = false,area:number = 1,matchCase:boolean = false,matchAll:boolean = false):Array<object>{
    let resultArray = new Array()
    if (keywords && attr){
      switch(area){
        //当前页
        case 1: {
          for(let i = 0;i < this.files.length;i++){
            for (let j = 0; j < this.files[i].sheets.length; j++) {
              if (this.files[i].sheets[j].stage == this.ddInstance.stage){
                let rs =  this.ddInstance.stage.searchModels(keywords, attr, isReg, matchCase, matchAll);
                rs?.forEach(r => {
                  r.fileIndex = i
                  r.sheetIndex = j
                  resultArray.push(r);
                });
                return resultArray
              }
            }
          }
          
        }
        //当前文档
        case 2: {
          let rs = this.files[this.currentFileIndex].searchModels(keywords, attr, isReg, matchCase, matchAll);
          rs?.forEach(r => {
            r.fileIndex = this.currentFileIndex;
            resultArray.push(r);
          });
        }
        //所有打开文件
        case 3: {
          for(let i = 0;i < this.files.length;i++){
            let rs = this.files[i].searchModels(keywords, attr, isReg, matchCase, matchAll)
            rs?.forEach(r => {
              r.fileIndex = i;
              resultArray.push(r);
            });
          }
        } break;
      }
    }
    return resultArray;
  }

  /**
   * 将舞台可视区域的中心点移动到控件的外接矩形中心
   * @param modelIds 
   */
  centerModels(stage:DDeiStage ,...modelIds:string[]):void{
    if(!stage){
      stage = this.ddInstance.stage
    }
    if (modelIds?.length > 0){
      let models = new Array();
      for (let i = 0; i < modelIds.length;i++){
        if(modelIds[i]){
          let model = stage.getModelById(modelIds[i],true);
          if (model){
            models.push(model)
          }
        }
      }
      if (models.length > 0){
        let stageRatio = stage.getStageRatio()
        let outRect = DDeiAbstractShape.getOutRectByPV(models, stageRatio);
        stage.wpv.x = -(outRect.x+outRect.width/2) + (stage.ddInstance.render.canvas.width / stage.ddInstance.render.ratio) / 2
        stage.wpv.y = -(outRect.y + outRect.height / 2) + (stage.ddInstance.render.canvas.height / stage.ddInstance.render.ratio) / 2
      }
    }
  }

  /**
   * 切换文件
   * @param file 
   */
  changeFile(fileIndex:number,sheetIndex:number = -1):void{
    let ddInstance = this?.ddInstance;
    let file:DDeiFile|null = null;
    if (fileIndex || fileIndex ==0){
      file = this.files[fileIndex];
    }
    if (file) {
      this.files.forEach((item) => {
        item.active = DDeiActiveType.NONE;
      });
      file.active = DDeiActiveType.ACTIVE;
      //刷新画布
      this.currentFileIndex = fileIndex;
      let sheets = file?.sheets;

      if (file && sheets && ddInstance) {
        if (sheetIndex >=0){
          file.changeSheet(sheetIndex)
        }
        ddInstance.stage.destroyed()
        let stage = sheets[file.currentSheetIndex].stage;
        
        stage.ddInstance = ddInstance;
        //刷新页面
        ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
      }
    }

  }

  /**
   * 替换模型数据
   * @param models 被替换的模型
   * @param attr 属性
   * @param sIdx 开始下标
   * @param eIdx 结束下标
   * @param data 数据
   */
  replaceModelsData(models:Array<DDeiAbstractShape>, attr: string,sIdx:number = -1,eIdx:number = -1, data:string = '',notify:boolean = true): void{
    if (models?.length > 0 && attr && sIdx != -1 && eIdx != -1 && eIdx >=sIdx) {
      models.forEach(model=>{
        let oldValue = model[attr];
        if (oldValue && typeof(oldValue) == 'string'){
          let sStr = oldValue.substring(0,sIdx)
          let eStr = oldValue.substring(eIdx, oldValue.length)
          let newValue = sStr+data+eStr;
          model[attr] = newValue
        }
      })
    }
    if(notify){
      this.notifyChange()
    }
  }

  /**
   * 返回画布图片
   * @models 选中控件模型，如果不传入则返回整个画布
   */
  toImageDataUrl(models: DDeiAbstractShape[] | null = null): string | null {
    return this.ddInstance.stage.toImageDataUrl(models);
  }
}
export { DDeiEditor }
export default DDeiEditor