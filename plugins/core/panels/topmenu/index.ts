import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import TopMenu from './TopMenu.vue';

class DDeiCoreTopMenuPanel extends DDeiPluginBase{
  
  name: string = TopMenu.name
  
  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreTopMenuPanel = new DDeiCoreTopMenuPanel(null);


  plugins: object[] = [TopMenu]

  getPanels(editor){
    return this.plugins;
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