import DDeiThemeBase from "@ddei-core/themes/theme";
/**
 * 复制页签
 */
class DDeiCoreThemeDefault extends DDeiThemeBase {


  name: string = "ddei-core-theme-default"

  label:string = "默认"

  backgroundColor: string = "#F5F6F7"

  fontTitleColor: string = "black"

  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreThemeDefault = new DDeiCoreThemeDefault();

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[DDeiCoreThemeDefault.defaultIns.name]) {
            for (let i in options[DDeiCoreThemeDefault.defaultIns.name]) {
              newOptions[i] = options[DDeiCoreThemeDefault.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreThemeDefault(newOptions);
        return panels;
      }
    }
    return DDeiCoreThemeDefault;
  }
}

export default DDeiCoreThemeDefault;
