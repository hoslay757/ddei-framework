import DDeiPluginBase from "@ddei-core/plugin/ddei-plugin-base";
import { loadControlByFrom, loadAndSortGroup } from "./toolgroup"
const control_ctx = import.meta.glob('./control/**', { eager: true })
const group_ctx = import.meta.glob('./group/**', { eager: true })

class DDeiExtUMLControls extends DDeiPluginBase{
  /**
   * 缺省实例
   */
  static defaultIns:DDeiExtUMLControls = new DDeiExtUMLControls(null);

  controls:Map<string,object>  = new Map()

  getControls(editor) {
    //加载控件定义
    for (let i in control_ctx) {
      let control = control_ctx[i].default;
      if (control){
        this.controls.set(control.id, control);
      }
    }
    //初始化控件定义
    this.controls.forEach(control => {
      loadControlByFrom(this.controls, control)
    });
    this.controls.forEach(control => {
      if (control.define) {
        delete control.define.font
        delete control.define.textStyle
        delete control.define.border
        delete control.define.fill
      }
      delete control.attrs
    })
    return this.controls
  }

  getGroups(editor) {
    if (!this.controls){
      this.getControls(editor);
    }
    //加载分组定义
    let groups = [];
    for (let path in group_ctx) {
      groups.push(group_ctx[path].default);
    }
    
    loadAndSortGroup(groups, this.controls)
    return groups;
  } 

  static configuraton(options) {
    if (options){
      let controls = new DDeiExtUMLControls(options);
      return controls;
    }
    return DDeiExtUMLControls;
  }
}


export default DDeiExtUMLControls