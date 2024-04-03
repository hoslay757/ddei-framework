class DDeiPluginBase{


  constructor(options: object|null|undefined) {
    if(options){
      this.options = options;
    }
  }

  getOptions(): object {
    let options = {}
    if (this.type == 'package') {
      this.plugins?.forEach(plugin => {
        let pluginOptions
        let pluginName
        if (DDeiPluginBase.isSubclass(plugin, DDeiPluginBase)) {
          pluginOptions = Object.assign({}, options, plugin.defaultIns.getOptions())
          pluginName = plugin.defaultIns.getName()
        } else if (plugin instanceof DDeiPluginBase) {
          pluginOptions = Object.assign({}, options, plugin.getOptions())
          pluginName  = plugin.getName()
        }
        if (pluginOptions) {
          
          options[pluginName] = pluginOptions
        }
      });
    } else if (this.type == 'plugin') {
      options = this.options;
    }
    return options;
  }

  init() {
    
    
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
    return a.prototype && Object.getPrototypeOf(a.prototype) === b.prototype;
  }
  

  options:object;

  plugins:object[] = [];

}

export default DDeiPluginBase