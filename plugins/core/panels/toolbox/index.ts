import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import Toolbox from './Toolbox.vue';

class DDeiCoreToolboxPanel extends DDeiPluginBase{
  name: string = Toolbox.name
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreToolboxPanel = new DDeiCoreToolboxPanel(null);

  static getPanels(editor){
    return DDeiCoreToolboxPanel.defaultIns.getPanels(editor);
  }

  static getOptions(): object {
    return DDeiCoreToolboxPanel.defaultIns.getOptions();
  }

  plugins: object[] = [Toolbox]

  getPanels(editor){
    return this.plugins;
  }

  static getType(): string {
    return DDeiCoreToolboxPanel.defaultIns.getType();
  }

  static getName(): string {
    return DDeiCoreToolboxPanel.defaultIns.getName();
  }


  
  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[Toolbox.name]) {
            for (let i in options[Toolbox.name]) {
              newOptions[i] = options[Toolbox.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreToolboxPanel(newOptions);
        return panels;
      }
    }
    return DDeiCoreToolboxPanel;
  }
}

export default DDeiCoreToolboxPanel