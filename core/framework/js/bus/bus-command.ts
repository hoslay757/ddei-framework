import DDeiBus from './bus';
/**
 * 总线行为定义，Command采用单例模式，不承载数据，数据由Bus本身承载
 * 总线行为包含名称、编码和行为
 * Command与对应的data相匹配，即特定aciton处理特定data
 * Command的行为分为，before（前置行为），Command（行为），和after（后置行为）
 */
abstract class DDeiBusCommand {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.code = props.code
    this.name = props.name
    this.desc = props.desc
  }

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================
  //Command的唯一编号
  code: string;
  //Command的名称
  name: string;
  //Command的描述备注
  desc: string;

  // ============================ 方法 ===============================
  /**
   * 前置行为，一般用于校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  abstract before(data: object, bus: DDeiBus, evt: Event): boolean

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  abstract action(data: object, bus: DDeiBus, evt: Event): boolean

  /**
   * 后置行为，一般用于分发联动
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  abstract after(data: object, bus: DDeiBus, evt: Event): boolean


}


export default DDeiBusCommand
