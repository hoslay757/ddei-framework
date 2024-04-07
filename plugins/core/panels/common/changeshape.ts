import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import ChangeShape from './ChangeShape.vue';

class DDeiCoreChangeShapePanel extends DDeiPluginBase{
  
  name: string = ChangeShape.name
  
  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreChangeShapePanel = new DDeiCoreChangeShapePanel(null);


  plugins: object[] = [ChangeShape]

  getPanels(editor){
    return this.plugins;
  }


  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[ChangeShape.name]) {
            for (let i in options[ChangeShape.name]) {
              newOptions[i] = options[ChangeShape.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreChangeShapePanel(newOptions);
        return panels;
      }
    }
    return DDeiCoreChangeShapePanel;
  }
}

export default DDeiCoreChangeShapePanel