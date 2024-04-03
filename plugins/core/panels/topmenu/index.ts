import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import TopMenu from './TopMenu.vue';

class DDeiCoreTopMenuPanel extends DDeiPluginBase{
  
  name: string = TopMenu.name
  
  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreTopMenuPanel = new DDeiCoreTopMenuPanel(null);

  static getPanels(editor){
    return DDeiCoreTopMenuPanel.defaultIns.getPanels(editor);
  }

  static getOptions(): object {
    return DDeiCoreTopMenuPanel.defaultIns.getOptions();
  }

  plugins: object[] = [TopMenu]

  getPanels(editor){
    return this.plugins;
  }


  static getType(): string {
    return DDeiCoreTopMenuPanel.defaultIns.getType();
  }

  static getName(): string {
    return DDeiCoreTopMenuPanel.defaultIns.getName();
  }
  
  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[TopMenu.name]) {
            for (let i in options[TopMenu.name]) {
              newOptions[i] = options[TopMenu.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreTopMenuPanel(newOptions);
        return panels;
      }
    }
    return DDeiCoreTopMenuPanel;
  }
}

export default DDeiCoreTopMenuPanel