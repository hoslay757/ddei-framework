import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import PositionDialog from './PositionDialog.vue';

class DDeiCorePositionDialog extends DDeiPluginBase{
  
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCorePositionDialog = new DDeiCorePositionDialog(null);


  plugins: object[] = [PositionDialog]

  getDialogs(editor){
    return this.plugins;
  }

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[PositionDialog.name]) {
            for (let i in options[PositionDialog.name]) {
              newOptions[i] = options[PositionDialog.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCorePositionDialog(newOptions);
        return panels;
      }
    }
    return DDeiCorePositionDialog;
  }
}

export default DDeiCorePositionDialog