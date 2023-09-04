import DDei from "../ddei";
import DDeiEnumBusActionInstance from "../enums/bus-action-ins";
import DDeiEnumBusActionType from "../enums/bus-action-type";

/**
 * DDeiBus图形框架的交换类，用于和其他外部应用进行数据交换
 * 例如：外部设计器选中控件后，控件的选中状态被修改，此时通过Bus，将这一状态变化和响应的事件联动进行解耦
 * 外部注入的事件，可以通过bus进行逻辑拦截和增加
 * 每一个DDei实例和它的外部调用者共同，持有一个Bus
 */
class DDeiBus {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.ddInstance = props.ddInstance
    this.invoker = props.invoker
  }
  // ============================ 静态变量 ============================

  // ============================ 属性 ============================
  //ddei实例
  ddInstance: DDei;
  // ddei的外部调用者
  invoker: object;
  // TODO 渲染数据队列，属于图形的事件会进入渲染队列，渲染队列会确保唯一，并且会确保普通queue完成后才执行
  // drawQueue: object[] = [];
  // 普通队列，普通queue完成后才执行drawQueue
  queue: object[] = [];

  // ============================ 方法 ============================

  /**
   * 推送事件进入总线
   * @param actionType 类型
   * @param data 承载数据
   * @param evt 事件
   */
  push(actionType: string, data: object, evt: Event): void {
    if (actionType) {
      this.queue.push({ type: actionType, data: data, evt: evt });
      //TODO 暂时一进入就执行，后续考虑改成多线程并行
      this.execute();
      console.log("push")
    }
  }

  /**
   * 取出队列并执行
   */
  execute(): void {
    if (this.queue && this.queue.length > 0) {
      let firstActionData = this.queue[0];
      this.queue.splice(0, 1);
      let action = null;
      if (firstActionData) {
        switch (firstActionData.type) {
          case DDeiEnumBusActionType.ModelChangeSelect:
            action = DDeiEnumBusActionInstance.ModelChangeSelect;
            break;
          case DDeiEnumBusActionType.StageChangeSelectModels:
            action = DDeiEnumBusActionInstance.StageChangeSelectModels;
            break;
          default: break;
        }
        //执行action逻辑
        if (action) {
          let validResult = action.before(firstActionData.data, this, firstActionData.evt);
          if (validResult) {

            let actionResult = action.action(firstActionData.data, this, firstActionData.evt);
            if (actionResult) {
              action.after(firstActionData.data, this, firstActionData.evt);
            }
          }
        }
      }
    }
  }


}

export default DDeiBus