/**
 * 生命周期插件的方法调用返回数据
 */
class DDeiFuncCallResult{
  /**
   * 状态：0不存在无回调函数，继续调用/1调用成功，继续调用/2调用成功，中断调用/-1调用失败，继续调用/-2调用失败，中断调用。
   */
  state:number = 0
}

export { DDeiFuncCallResult }
export default DDeiFuncCallResult
