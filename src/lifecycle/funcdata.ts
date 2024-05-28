/**
 * 生命周期插件的方法数据，包含了控制回调调用的关键属性以及回调的实现
 */
class DDeiFuncData{

  constructor(name:string|null,sort:number|null,func:Function|null){
    if (name) {
      this.name = name
    }
    if (sort) {
      this.sort = sort
    }
    if (func) {
      this.func = func
    }
  }

  /**
   * 名称，用于标识当前的方法扩展，可以通过名称覆盖已存在的方法
   */
  name:string = "";
  /**
   * 排序号，决定调用顺序
   */
  sort:number | null = null;

  /**
   * 方法实现，由外部传入的回调函数
   */
  func : Function | null = null;
}

export { DDeiFuncData }
export default DDeiFuncData
