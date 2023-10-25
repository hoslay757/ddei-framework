import DDei from "../ddei";
import { COMMANDS } from "../config/command"
import DDeiEnumBusCommandType from "../enums/bus-command-type";

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
  //渲染数据队列，属于图形的事件会进入渲染队列，渲染队列会确保唯一，并且会确保普通queue完成后才执行
  drawQueue: object[] = [];
  // 普通队列，普通queue完成后才执行drawQueue
  queue: object[] = [];

  //拦截器，用于动态将一个或多个action注入到某个action之前或之后，无需手动添加
  //格式{key:{before,execute,after}}
  interceptor: object = {};
  // ============================ 方法 ============================





  /**
  * 插入事件进入总线指定位置,默认最前方
  * @param actionType 类型
  * @param data 承载数据
  * @param evt 事件
  */
  insert(actionType: string, data: object, evt: Event, index: number = 0, parallel: boolean = false): void {
    if (actionType) {
      this.queue.splice(index, 0, { type: actionType, data: data, evt: evt, parallel: parallel });
    }
  }

  /**
   * 推送事件进入总线
   * @param actionType 类型
   * @param data 承载数据
   * @param evt 事件
   */
  push(actionType: string, data: object | undefined | null, evt: Event | undefined | null, parallel: boolean = false): void {
    parallel = false;
    if (actionType) {
      this.queue.push({ type: actionType, data: data, evt: evt, parallel: parallel });
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
    //并行执行的commands

    while (this?.queue?.length > 0 && result) {
      let paralCommands = [];
      let firstActionData = this.queue[0];
      //如果当前data中有并行参数，则并行执行
      if (firstActionData.parallel == true) {
        for (let i = 0; i < this.queue.length; i++) {
          let command = this.queue[i];
          if (command.parallel == true) {
            let commandAction = new Promise((resolve, reject) => {
              this.execute(command);
            });
            paralCommands.push(commandAction);
          } else {
            break;
          }
        }
        //移除加入到并行的Command
        this.queue.splice(0, paralCommands.length);
        //执行并行处理

        Promise.all(paralCommands);
      } else {
        result = this.execute();
      }
    }

    if (this?.drawQueue?.length > 0 && result) {
      result = this.executeDraw();
      this.drawQueue = [];
    }
  }


  /**
   * 取出队列并执行
   */
  execute(command: any): boolean {
    if (this.queue && this.queue.length > 0) {
      let firstActionData = null;
      if (!command) {
        firstActionData = this.queue[0];
        this.queue.splice(0, 1);
      } else {
        firstActionData = command;
      }
      let action = null;
      if (firstActionData) {
        if (firstActionData.type == DDeiEnumBusCommandType.RefreshShape) {
          this.drawQueue.push(firstActionData)
          return true;
        }
        action = COMMANDS.get(firstActionData.type);
        //执行action逻辑
        if (action) {
          if (this.interceptor[firstActionData.type]?.before) {
            let interActions = this.interceptor[firstActionData.type]?.before
            for (let ii = 0; ii < interActions.length; ii++) {
              let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
              if (!result) {
                return false;
              }
            }
          }
          let validResult = action.before(firstActionData.data, this, firstActionData.evt);
          if (validResult) {
            if (this.interceptor[firstActionData.type]?.execute) {
              let interActions = this.interceptor[firstActionData.type]?.execute
              for (let ii = 0; ii < interActions.length; ii++) {
                let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
                if (!result) {
                  return false;
                }
              }
            }
            let actionResult = action.action(firstActionData.data, this, firstActionData.evt);
            if (actionResult) {
              if (this.interceptor[firstActionData.type]?.after) {
                let interActions = this.interceptor[firstActionData.type]?.after
                for (let ii = 0; ii < interActions.length; ii++) {
                  let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
                  if (!result) {
                    return false;
                  }
                }
              }
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

  /**
   * 执行绘图队列
   * @param command 
   * @returns 
   */
  executeDraw(command: any): boolean {
    if (this.drawQueue && this.drawQueue.length > 0) {
      let firstActionData = null;
      if (!command) {
        firstActionData = this.drawQueue[0];
        this.drawQueue.splice(0, 1);
      } else {
        firstActionData = command;
      }
      let action = null;
      if (firstActionData) {
        action = COMMANDS.get(firstActionData.type);
        //执行action逻辑
        if (action) {
          if (this.interceptor[firstActionData.type]?.before) {
            let interActions = this.interceptor[firstActionData.type]?.before
            for (let ii = 0; ii < interActions.length; ii++) {
              let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
              if (!result) {
                return false;
              }
            }
          }
          let validResult = action.before(firstActionData.data, this, firstActionData.evt);
          if (validResult) {
            if (this.interceptor[firstActionData.type]?.execute) {
              let interActions = this.interceptor[firstActionData.type]?.execute
              for (let ii = 0; ii < interActions.length; ii++) {
                let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
                if (!result) {
                  return false;
                }
              }
            }
            let actionResult = action.action(firstActionData.data, this, firstActionData.evt);
            if (actionResult) {
              if (this.interceptor[firstActionData.type]?.after) {
                let interActions = this.interceptor[firstActionData.type]?.after
                for (let ii = 0; ii < interActions.length; ii++) {
                  let result = interActions[ii](firstActionData.data, this, firstActionData.evt);
                  if (!result) {
                    return false;
                  }
                }
              }
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