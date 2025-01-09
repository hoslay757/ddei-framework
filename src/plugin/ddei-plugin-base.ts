import { cloneDeep } from 'lodash-es'

class DDeiPluginBase{

  private installedComponents: [] = []

  private installedDialogs: [] = []

  private installedPanels: [] = []

  private installedLayouts: [] = []

  private installedPEs:[] = []

  private installedHotkeys: [] = []

  private installedMenus: [] = []

  private installedControls: [] = []

  private installedViewClasses:[] = []

  private installedModels: [] = []

  private installedGroups: [] = []

  private installedLifes:[] = []

  private installedConverts:[] = []


  constructor(options: object | null | undefined) {
    this.options = options;
  }

  installed(editor): void {

  }

  unInstalled(editor): void {

  }

  mount(editor):void{
    let plugin = this;
    if (plugin.getLangs) {
      //注册并加载组件
      let langs = plugin.getLangs(editor)
      editor.registerLangs(langs)
    }


    if (plugin.getComponents) {
      //注册并加载组件
      let components = plugin.getComponents(editor)
      components?.forEach(component => {
        editor.panels[component.name] = component
        plugin.installedComponents.push(component)
      });
    }
    if (plugin.getDialogs) {
      //注册并加载弹出框
      let dialogs = plugin.getDialogs(editor)
      dialogs?.forEach(dialog => {
        let d = cloneDeep(dialog)
        editor.dialogs[dialog.name] = d
        plugin.installedDialogs.push(d)
      });
    }
    if (plugin.getPanels) {
      //注册并加载面板
      let panels = plugin.getPanels(editor)
      panels?.forEach(panel => {
        editor.panels[panel.name] = panel
        plugin.installedPanels.push(panel)
      });
    }

    if (plugin.getLayouts) {
      //注册并加载面板
      let layouts = plugin.getLayouts(editor)
      layouts?.forEach(layout => {
        editor.layouts[layout.name] = layout
        plugin.installedLayouts.push(layout)
      });
    }

    if (plugin.getPropEditors) {
      //注册并加载属性编辑器
      let propEditors = plugin.getPropEditors(editor)
      propEditors?.forEach(propEditor => {
        editor.propeditors[propEditor.name] = propEditor
        plugin.installedPEs.push(propEditor)
      });
    }


    if (plugin.getHotKeys) {
      //注册并加载快捷键
      let hotKeys = plugin.getHotKeys(editor)
      hotKeys?.forEach(hotkey => {

        editor.hotkeys[hotkey.name] = hotkey

        plugin.installedHotkeys.push(hotkey)

      });
    }

    //加载字体插件
    if (plugin.getFonts) {
      //注册并加载菜单
      let fonts = plugin.getFonts(editor)
      fonts?.forEach(font => {
        editor.fonts.push(font)
        let fontObj = new FontFace(font.ch, 'url(' + font.font + ')')
        fontObj.load().then(f => {
          document.fonts.add(f)
        })
      });

    }

    //加载主题样式
    if (plugin.getThemes) {
      //注册并加载菜单
      let themes = plugin.getThemes(editor)
      themes?.forEach(theme => {
        let finded = false;
        for (let i = 0; i < editor.themes?.length; i++) {
          if (editor.themes[i].name == theme.name) {
            finded = true
            editor.themes[i] = theme;
            break;
          }
        }
        if (!finded) {
          editor.themes.push(theme)
        }
      });

    }

    //加载菜单相关插件
    if (plugin.getMenus) {
      //注册并加载菜单
      let menus = plugin.getMenus(editor)
      menus?.forEach(menu => {
        editor.menus[menu.name] = menu;
        plugin.installedMenus.push(menu)
      });
    }

    //加载控件相关插件
    //控件配置
    if (plugin.getControls) {
      //注册并加载控件
      let controls = plugin.getControls(editor)
      controls?.forEach(control => {

        editor.controls.set(control.id, control)
        plugin.installedControls.push(control)
      });
    }


    //控件分组
    if (plugin.getGroups) {
      //注册并加载分组
      let groups = plugin.getGroups(editor)
      groups?.forEach(group => {
        let finded = false;
        for (let i = 0; i < editor.groups.length; i++) {
          if (editor.groups[i].id == group.id) {
            editor.groups[i] = group
            finded = true
            break;
          }
        }
        if (!finded) {
          editor.groups.push(group)
          plugin.installedGroups.push(group)
        }
      });
    }

    //控件模型定义
    if (plugin.getModels) {
      //注册并加载控件
      let models = plugin.getModels(editor)
      models?.forEach(model => {
        editor.controlModelClasses[model.ClsName] = model
        plugin.installedModels.push(model)
      });
    }

    //控件视图定义
    if (plugin.getViews) {
      //注册并加载控件
      let views = plugin.getViews(editor)
      views?.forEach(view => {
        editor.controlViewClasses[view.ClsName] = view
        plugin.installedViewClasses.push(view)
      });
    }


    //加载转换器
    if (plugin.getConverters) {
      let converters = plugin.getConverters(editor)
      converters?.forEach(converter => {
        editor.converters[converter.name] = converter
        plugin.installedConverts.push(converter)
        
      });
    }

    //加载生命周期插件
    if (plugin.getLifeCyclies) {
      let lifeCyclies = plugin.getLifeCyclies(editor)
      lifeCyclies?.forEach(lifeCycle => {
        editor.lifecyclies.push(lifeCycle)
        plugin.installedLifes.push(lifeCycle)
      });
    }

    if (plugin.installed) {
      plugin.installed(editor)
    }

    let options = null;
    if (plugin.getOptions) {
      options = plugin.getOptions()
    }
    if (options) {
      let pluginType = plugin.getType();
      if (pluginType == 'plugin') {
        let pluginName = plugin.getName();
        if (pluginName) {
          editor.options[pluginName] = options;
        }
      } else if (pluginType == 'package') {
        editor.options = Object.assign({}, editor.options, options)
      }
    }
    editor.plugins.push(this);
  }

  unmount(editor):void{
    this.installedComponents.forEach(comp => {
      if (comp?.name) {
        delete editor.panels[comp.name]
      }
    });
    this.installedComponents = []

    this.installedDialogs.forEach(dialog => {
      if (dialog?.name) {
        delete editor.dialogs[dialog.name]
      }
    });

    this.installedDialogs = []

    this.installedPanels.forEach(panel => {
      if (panel?.name) {
        delete editor.panels[panel.name]
      }
    });

    this.installedPanels = []

    this.installedLayouts.forEach(layout => {
      if (layout?.name) {
        delete editor.layouts[layout.name]
      }
    });

    this.installedLayouts = []

    this.installedPEs.forEach(pe => {
      if (pe?.name) {
        delete editor.propeditors[pe.name]
      }
    });

    this.installedPEs = []

    this.installedHotkeys.forEach(hk => {
      if (hk?.name) {
        delete editor.hotkeys[hk.name]
      }
    });

    this.installedHotkeys = []

    this.installedMenus.forEach(hk => {
      if (hk?.name) {
        delete editor.menus[hk.name]
      }
    });

    this.installedMenus = []

    this.installedHotkeys = []

    this.installedControls.forEach(control => {
      if (control?.id) {
        editor.controls.remove(control.id)
      }
    });

    this.installedControls = []


    this.installedViewClasses.forEach(control => {
      if (control?.ClsName) {
        delete editor.controlModelClasses[control.ClsName]
      }
    });

    this.installedViewClasses = []

    this.installedModels.forEach(control => {
      if (control?.ClsName) {
        delete editor.controlModelClasses[control.ClsName]
      }
    });

    this.installedModels = []

    this.installedGroups.forEach(control => {
      if (control) {
        let idx = editor.groups.indexOf(control);
        if (idx != -1){
          editor.groups.slice(idx,1)
        }
      }
    });

    this.installedGroups = []


    this.installedLifes.forEach(control => {
      if (control) {
        let idx = editor.lifecyclies.indexOf(control);
        if (idx != -1) {
          editor.lifecyclies.slice(idx, 1)
        }
      }
    });

    this.installedLifes = []

    this.installedConverts.forEach(convert => {
      if (convert?.name) {
        delete editor.converters[convert.name]
      }
    });

    this.installedConverts = []

    this.unInstalled(editor);
    let idx = editor.plugins.indexOf(this);
    if (idx != -1){
      editor.plugins.slice(idx,1);
    }
  }

  getOptions(): object {
    let options = {}
    if (this.type == 'package') {
      this.plugins?.forEach(plugin => {
        let pluginOptions
        let pluginName
        let pluginType
        if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
          pluginOptions = plugin.defaultIns.getOptions()
          pluginName = plugin.defaultIns.getName()
          pluginType = plugin.defaultIns.type
        } else if (plugin instanceof DDeiPluginBase) {
          pluginOptions = plugin.getOptions()
          pluginName  = plugin.getName()
          pluginType = plugin.type
        }
        if (pluginOptions) {
          if (pluginType == 'package'){
            for (let i in pluginOptions){
              options[i] = pluginOptions[i]
            }
            
          }else{
            options[pluginName] = pluginOptions
          }
          
        }
      });
    } else if (this.type == 'plugin') {
        if (this.options){
          options = this.options;
        } else if (this.defaultOptions){
          options = this.defaultOptions;
        }
        if (options && options.config instanceof Function) {
          options = options.config(cloneDeep(this.defaultOptions));
        }
    }
    
    return options;
  }

  init() {
    
    
  }

  /**
   * 修改自身的方法，通过传入一个回调函数，让插件使用者可以更灵活的修改插件属性
   * @param fn 
   * @returns 
   */
  modify(fn: Function): DDeiPluginBase {
    let cloneThis = cloneDeep(this);
    fn(cloneThis)
    return cloneThis;
  }


  getInitConfig():object{
    return this.initConfig
  }
  getName(): string {
    return this.name;
  }
  name: string = ""

  type: string = "plugin"

  getType(){
    return this.type;
  }

  static isSubclass<T, U>(a: new (...args: any[]) => T, b: new (...args: any[]) => U): boolean {
    return a.prototype && (Object.getPrototypeOf(a.prototype) === b.prototype || a.prototype instanceof b)
  }
  

  options: object | null |undefined;

  defaultOptions: object | null | undefined;

  plugins:object[] = [];

  //排序号，从小到大的顺序调用
  order:number = 1

  //初始化配置
  initConfig:object|null = null;

}

export { DDeiPluginBase }
export default DDeiPluginBase