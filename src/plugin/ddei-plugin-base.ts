import { cloneDeep } from 'lodash-es'
import type { DDeiEditor } from '..';

class DDeiPluginBase{


  constructor(options: object | null | undefined) {
    this.options = options;
  }

  installed(editor:DDeiEditor):void{
    
  }

  getOptions(): object {
    let options = {}
    if (this.type == 'package') {
      this.plugins?.forEach(plugin => {
        let pluginOptions
        let pluginName
        let pluginType
        if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
          pluginOptions = plugin.defaultIns.getOptions()
          pluginName = plugin.defaultIns.getName()
          pluginType = plugin.defaultIns.type
        } else if (plugin instanceof DDeiPluginBase) {
          pluginOptions = plugin.getOptions()
          pluginName  = plugin.getName()
          pluginType = plugin.type
        }
        if (pluginOptions) {
          if (pluginType == 'package'){
            for (let i in pluginOptions){
              options[i] = pluginOptions[i]
            }
            
          }else{
            options[pluginName] = pluginOptions
          }
          
        }
      });
    } else if (this.type == 'plugin') {
        if (this.options){
          options = this.options;
        } else if (this.defaultOptions){
          options = this.defaultOptions;
        }
        if (options && options.config instanceof Function) {
          options = options.config(cloneDeep(this.defaultOptions));
        }
    }
    
    return options;
  }

  init() {
    
    
  }

  /**
   * 修改自身的方法，通过传入一个回调函数，让插件使用者可以更灵活的修改插件属性
   * @param fn 
   * @returns 
   */
  modify(fn: Function): DDeiPluginBase {
    let cloneThis = cloneDeep(this);
    fn(cloneThis)
    return cloneThis;
  }


  getInitConfig():object{
    return this.initConfig
  }
  getName(): string {
    return this.name;
  }
  name: string = ""

  type: string = "plugin"

  getType(){
    return this.type;
  }

  static isSubclass<T, U>(a: new (...args: any[]) => T, b: new (...args: any[]) => U): boolean {
    return a.prototype && (Object.getPrototypeOf(a.prototype) === b.prototype || a.prototype instanceof b)
  }
  

  options: object | null |undefined;

  defaultOptions: object | null | undefined;

  plugins:object[] = [];

  //排序号，从小到大的顺序调用
  order:number = 1

  //初始化配置
  initConfig:object|null = null;

}

export { DDeiPluginBase }
export default DDeiPluginBase