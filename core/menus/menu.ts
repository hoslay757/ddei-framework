
import DDeiConfig from '../framework/js/config';
import DDei from '../framework/js/ddei';
import DDeiEditor from '../editor/js/editor'
import DDeiPluginBase from '../plugin/ddei-plugin-base'

abstract class DDeiMenuBase extends DDeiPluginBase {
  
  // ============================ 属性 ===============================
  //文本
  label: string;
  //图标
  icon: string;
  //失效
  disabled:boolean;

  // ============================ 方法 ===============================
  /**
   * 键行为
   * @param evt 事件
   */
  abstract action(evt: Event, ddInstance: DDei): void;

  /**
   * 判定是否显示的方法
   */
  abstract isVisiable(model: object): boolean;

  getMenus(editor) {
    let option = this.getOptions()
    if (option) {
      for (let i in option) {
        if (i != 'name') {
          this[i] = option[i];
        }
      }
    }
    return [this];
  }

}


export default DDeiMenuBase
