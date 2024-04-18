
import DDeiPluginBase from '../plugin/ddei-plugin-base'

abstract class DDeiThemeBase extends DDeiPluginBase {


  // ============================ 方法 ===============================
  getThemes(editor) {
    let option = this.getOptions()
    if (option){
      for (let i in option) {
        if (i != 'name') {
          this[i] = option[i];
        }
      }
    }
    return [this];
    
  }

  //文本
  label: string;
  //图标
  icon: string;
  //样式文件路径
  css:string;

}
export { DDeiThemeBase }
export default DDeiThemeBase;