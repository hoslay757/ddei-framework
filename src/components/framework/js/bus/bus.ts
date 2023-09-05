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
  * 插入事件进入总线指定位置,默认最前方
  * @param actionType 类型
  * @param data 承载数据
  * @param evt 事件
  */
  insert(actionType: string, data: object, evt: Event, index: number = 0): void {
    if (actionType) {
      this.queue.splice(index, 0, { type: actionType, data: data, evt: evt });
    }
  }

  /**
   * 推送事件进入总线
   * @param actionType 类型
   * @param data 承载数据
   * @param evt 事件
   */
  push(actionType: string, data: object, evt: Event): void {
    if (actionType) {
      this.queue.push({ type: actionType, data: data, evt: evt });
    }
  }

  /**
   * 推送多个事件进入总线
   * @param actions 多个action
   * @param evt 事件
   */
  pushMulit(actions: object[], evt: Event): void {
    if (actions) {
      actions.forEach(item => {
        this.push(item.actionType, item.data, evt);
      });
    }
  }

  /**
   * 按照先进先出的顺序执行所有action
   */
  executeAll(): void {
    let result = true;
    while (this?.queue?.length > 0 && result) {
      result = this.execute();
    }
    if (!result) {
      console.log("中断")
    }
  }

  /**
   * 取出队列并执行
   */
  execute(): boolean {
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
          case DDeiEnumBusActionType.CancelCurLevelSelectedModels:
            action = DDeiEnumBusActionInstance.CancelCurLevelSelectedModels;
            break;
          case DDeiEnumBusActionType.UpdateSelectorBounds:
            action = DDeiEnumBusActionInstance.UpdateSelectorBounds;
            break;
          case DDeiEnumBusActionType.ClearTemplateVars:
            action = DDeiEnumBusActionInstance.ClearTemplateVars;
            break;
          case DDeiEnumBusActionType.RefreshShape:
            action = DDeiEnumBusActionInstance.RefreshShape;
            break;
          case DDeiEnumBusActionType.ModelChangeContainer:
            action = DDeiEnumBusActionInstance.ModelChangeContainer;
            break;
          case DDeiEnumBusActionType.ModelChangeBounds:
            action = DDeiEnumBusActionInstance.ModelChangeBounds;
            break;
          case DDeiEnumBusActionType.SetHelpLine:
            action = DDeiEnumBusActionInstance.SetHelpLine;
            break;
          case DDeiEnumBusActionType.UpdateDragObj:
            action = DDeiEnumBusActionInstance.UpdateDragObj;
            break;
          case DDeiEnumBusActionType.ChangeSelectorPassIndex:
            action = DDeiEnumBusActionInstance.ChangeSelectorPassIndex;
            break;
          case DDeiEnumBusActionType.ChangeCursor:
            action = DDeiEnumBusActionInstance.ChangeCursor;
            break;
          case DDeiEnumBusActionType.ModelChangeRotate:
            action = DDeiEnumBusActionInstance.ModelChangeRotate;
            break;
          case DDeiEnumBusActionType.ResetSelectorState:
            action = DDeiEnumBusActionInstance.ResetSelectorState;
            break;
          case DDeiEnumBusActionType.ModelPush:
            action = DDeiEnumBusActionInstance.ModelPush;
            break;
          default: break;
        }
        //执行action逻辑
        if (action) {
          let validResult = action.before(firstActionData.data, this, firstActionData.evt);
          if (validResult) {
            let actionResult = action.action(firstActionData.data, this, firstActionData.evt);
            if (actionResult) {
              return action.after(firstActionData.data, this, firstActionData.evt);
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
      }
    }
    return true;
  }


}

export default DDeiBus