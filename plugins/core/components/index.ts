import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";

const buttons = import.meta.glob('./buttons/*.vue', { eager: true })


class DDeiCoreComponents extends DDeiPluginBase{

  type: string = "package"

  constructor(options: object | null | undefined) {
    super(options)
    for (let i in buttons) {
      if (buttons[i].default) {
        this.plugins.push(buttons[i].default)
      }
    }
    
  }
  
  /**
   * 缺省实例
   */
  static defaultIns:DDeiCoreComponents = new DDeiCoreComponents(null);

  static getComponents(editor){
    return DDeiCoreComponents.defaultIns.getComponents(editor);
  }

  static getOptions(): object {
    return DDeiCoreComponents.defaultIns.getOptions();
  }


  getComponents(editor){
    return this.plugins;
  }

  static getType(): string {
    return DDeiCoreComponents.defaultIns.getType();
  }
  

  static configuraton(options) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      this.plugins?.forEach(plugin => {
        if (options[plugin.name]) {
          newOptions[plugin.name] = options[plugin.name]
        }
      });
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreComponents(newOptions);
        return panels;
      }
    }
    return DDeiCoreComponents;
  }
}

export default DDeiCoreComponents