import DDeiThemeBase from "@ddei-core/themes/theme";

class DDeiExtThemeTest extends DDeiThemeBase {
  
  name: string = "ddei-ext-theme-test"

  label: string = "测试"

  background: string = "red"

  theme: string = "yellow"

  text: string = "green"

  /**
   * 缺省实例
   */
  static defaultIns: DDeiExtThemeTest = new DDeiExtThemeTest();

  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[DDeiExtThemeTest.defaultIns.name]) {
            for (let i in options[DDeiExtThemeTest.defaultIns.name]) {
              newOptions[i] = options[DDeiExtThemeTest.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiExtThemeTest(newOptions);
        return panels;
      }
    }
    return DDeiExtThemeTest;
  }
}
export {DDeiExtThemeTest}
export default DDeiExtThemeTest;