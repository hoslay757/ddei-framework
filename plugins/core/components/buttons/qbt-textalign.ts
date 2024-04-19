import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import QBTEditTextAlign from './QBTEditTextAlign.vue';

class DDeiCoreEditTextAlignButton extends DDeiPluginBase{
  name: string = QBTEditTextAlign.name
  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreEditTextAlignButton = new DDeiCoreEditTextAlignButton(null);


  plugins: object[] = [QBTEditTextAlign]

  getComponents(editor){
    return this.plugins;
  }

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[QBTEditTextAlign.name]) {
            for (let i in options[QBTEditTextAlign.name]) {
              newOptions[i] = options[QBTEditTextAlign.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreEditTextAlignButton(newOptions);
        return panels;
      }
    }
    return DDeiCoreEditTextAlignButton;
  }
}

export default DDeiCoreEditTextAlignButton