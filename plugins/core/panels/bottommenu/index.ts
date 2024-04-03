import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import BottomMenu from './BottomMenu.vue';

class DDeiCoreBottomMenuPanel extends DDeiPluginBase{
  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreBottomMenuPanel = new DDeiCoreBottomMenuPanel(null);

  static getPanels(editor){
    return DDeiCoreBottomMenuPanel.defaultIns.getPanels(editor);
  }

  static getOptions(): object {
    return DDeiCoreBottomMenuPanel.defaultIns.getOptions();
  }

  plugins: object[] = [BottomMenu]

  getPanels(editor){
    return this.plugins;
  }

  static getName(): string {
    return DDeiCoreBottomMenuPanel.defaultIns.getName();
  }

  static getType(): string {
    return DDeiCoreBottomMenuPanel.defaultIns.getType();
  }

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[BottomMenu.name]) {
            for (let i in options[BottomMenu.name]) {
              newOptions[i] = options[BottomMenu.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreBottomMenuPanel(newOptions);
        return panels;
      }
    }
    return DDeiCoreBottomMenuPanel;
  }
}

export default DDeiCoreBottomMenuPanel