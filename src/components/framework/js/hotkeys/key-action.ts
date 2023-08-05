/**
 * 键行为的定义
 * 键行为包含名称、编码和行为
 * 通过配置将一组快捷键与一个行为绑定
 * 在不同的控件上按下快捷键可能会出现不同的行为，TODO 路由判断交由键行为/或路由去决定
 */
abstract class DDeiKeyAction {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.code = props.code
    this.name = props.name
    this.desc = props.desc
  }
  // ============================ 静态方法 ============================

  /**
   * 根据快捷键配置以及当前操作的上下文环境
   * 路由到合理的键行为实例上
   */
  static route(): void {

  }

  // ============================ 属性 ===============================
  //键盘事件的唯一编号
  code: string;
  //键盘事件的名称
  name: string;
  //键盘事件的描述备注
  desc: string;

  // ============================ 方法 ===============================
  /**
   * 键行为
   * @param evt 事件
   */
  abstract action(evt: Event): void

}


export default DDeiKeyAction
