
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

}

// 修改页面中的样式变量值
const changeStyle = (obj: any) => {
  for (let key in obj) {
    document
      .getElementsByTagName('body')[0]
      .style.setProperty(`--${key}`, obj[key]);
  }
};
export { DDeiThemeBase, changeStyle }
export default DDeiThemeBase;