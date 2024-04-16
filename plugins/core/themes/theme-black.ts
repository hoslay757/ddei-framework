import DDeiThemeBase from "@ddei-core/themes/theme";
/**
 * 复制页签
 */
class DDeiCoreThemeBlack extends DDeiThemeBase {


  name: string = "ddei-core-theme-black"

  label: string = "黑色"

  backgroundColor: string = "black"

  fontTitleColor: string = "white"

  /**
   * 缺省实例
   */
  static defaultIns: DDeiCoreThemeBlack = new DDeiCoreThemeBlack();

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[DDeiCoreThemeBlack.defaultIns.name]) {
            for (let i in options[DDeiCoreThemeBlack.defaultIns.name]) {
              newOptions[i] = options[DDeiCoreThemeBlack.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiCoreThemeBlack(newOptions);
        return panels;
      }
    }
    return DDeiCoreThemeBlack;
  }
}

export default DDeiCoreThemeBlack;
