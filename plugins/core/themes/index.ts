import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import DDeiCoreThemeDefault from "./theme-default"
import DDeiCoreThemeBlack from "./theme-black"


/**
 * 快捷键扩展
 */
class DDeiCoreThemes extends DDeiPluginBase{

  type: string = "package"
  /**
   * 缺省实例
   */
  static defaultIns:DDeiCoreThemes = new DDeiCoreThemes(null);


  plugins: object[] = [DDeiCoreThemeDefault, DDeiCoreThemeBlack]


  getThemes(editor){
    let themes = []
    this.plugins?.forEach(plugin=>{
      let ls
      if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
        ls = plugin.defaultIns.getThemes(editor);
      } else if (plugin instanceof DDeiPluginBase) {
        ls = plugin.getThemes(editor);
      }

      if (ls?.length > 0) {
        themes = themes.concat(ls);
      }
    })
    return themes
  }


  static configuraton(options) {
    let themes = new DDeiCoreThemes(options);
    for (let i = 0; i < themes.plugins?.length;i++){
      themes.plugins[i] = themes.plugins[i].configuraton(options,true)
    }
    return themes;
  }
}
export { DDeiCoreThemeBlack, DDeiCoreThemeDefault ,DDeiCoreThemes}
export default DDeiCoreThemes