
import DDeiConfig from '../framework/js/config';
import DDei from '../framework/js/ddei';
import DDeiEditor from '../editor/js/editor'
import DDeiPluginBase from '../plugin/ddei-plugin-base'
/**
 * 键行为的定义
 * 键行为包含名称、编码和行为
 * 通过配置将一组快捷键与一个行为绑定
 * 在不同的控件上按下快捷键可能会出现不同的行为
 */
class DDeiKeyAction extends DDeiPluginBase {
  // ============================ 构造函数 ============================
  constructor(props: object | null | undefined) {
    super(props)
    this.name = props?.name
    this.desc = props?.desc
  }

  // ============================ 静态方法 ============================

  /**
   * 更新按键状态
   */
  static updateKeyState(evt: Event): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE
    //获取实例
    let ddInstance: DDei = editor?.ddInstance;
    if (ddInstance?.disabled) {
      DDei.KEY_DOWN_STATE.clear()
      return;
    }
    //获取是否按下ctrl、command、alt、shift等键
    let ctrl = evt.ctrlKey || evt.metaKey;
    let shift = evt.shiftKey;
    let alt = evt.altKey
    if (ctrl == true) {
      DDei.KEY_DOWN_STATE.set("ctrl", true);
    } else {
      DDei.KEY_DOWN_STATE.set("ctrl", false);
    }
    if (shift == true) {
      DDei.KEY_DOWN_STATE.set("shift", true);
    } else {
      DDei.KEY_DOWN_STATE.set("shift", false);
    }
    if (alt == true) {
      DDei.KEY_DOWN_STATE.set("alt", true);
    } else {
      DDei.KEY_DOWN_STATE.set("alt", false);
    }
    if (evt.keyCode != 93 && evt.keyCode != 18 && evt.keyCode != 16 && evt.keyCode != 17) {
      DDei.KEY_DOWN_STATE.set("" + evt.keyCode, true);
    }
  }

  /**
   * 根据快捷键配置以及当前操作的上下文环境
   * 路由到合理的键行为实例上
   */
  static route(evt: Event): boolean {
    let editor = DDeiEditor.ACTIVE_INSTANCE
    //获取实例
    let ddInstance: DDei = editor?.ddInstance;
    if (ddInstance?.disabled) {
      return false;
    }
    //获取是否按下ctrl、command、alt、shift等键
    let ctrl = evt.ctrlKey || evt.metaKey;
    let shift = evt.shiftKey;
    let alt = evt.altKey
    DDeiKeyAction.updateKeyState(evt);
    //唯一选择控件
    let onlySelectModel = null;
    let selectedModels = editor.ddInstance.stage?.selectedModels;
    if (selectedModels?.size == 1) {
      onlySelectModel = Array.from(selectedModels.values())[0]
    }
    let m1Str = editor.state + "_";

    m1Str += editor.ddInstance?.stage?.render?.operateState + "_";


    if (ctrl == true) {
      m1Str += "ctrl_"
    }
    if (shift == true) {
      m1Str += "shift_"
    }
    if (alt == true) {
      m1Str += "alt_"
    }
    if (evt.keyCode != 93 && evt.keyCode != 18 && evt.keyCode != 16 && evt.keyCode != 17) {
      m1Str += evt.keyCode
    }
    let matched = false
    //执行下发逻
    for (let it = 0; it < editor.hotKeyMapping?.length; it++) {
      let item = editor.hotKeyMapping[it];
      let matchStr = null;
      if (item.editorState) {
        matchStr = item.editorState + "_";
      } else {
        matchStr = editor.state + "_";
      }

      if (item.operateState) {
        matchStr += item.operateState + "_";
      } else {
        matchStr += editor.ddInstance?.stage?.render?.operateState + "_";
      }


      if (item.ctrl == 1) {
        matchStr += "ctrl_"
      } else if (item.ctrl == 2 && ctrl == true) {
        matchStr += "ctrl_"
      }
      if (item.shift == 1) {
        matchStr += "shift_"
      } else if (item.shift == 2 && shift == true) {
        matchStr += "shift_"
      }
      if (item.alt == 1) {
        matchStr += "alt_"
      } else if (item.alt == 2 && alt == true) {
        matchStr += "alt_"
      }
      if (item.keys) {
        matchStr += item.keys
      }
      //如果匹配则下发
      if (m1Str == matchStr) {
        //处理计数器,如果设置了计数器，则必须满足计数器触发条件
        if (!item.modelType || (item.modelType && item.modelType == onlySelectModel?.baseModelType)) {
          if (item.times && item.times > 1 && item.interval && item.interval > 0) {
            if (!DDeiConfig.KEY_DOWN_TIMES.has(m1Str)) {
              //记录开始次数1
              DDeiConfig.KEY_DOWN_TIMES.set(m1Str, 1)
              //记录开始时间
              DDeiConfig.KEY_DOWN_INTERVAL.set(m1Str, Date.now())
            } else {
              //开始时间
              let startTime = DDeiConfig.KEY_DOWN_INTERVAL.get(m1Str);
              let nowTime = Date.now()
              //已达到的次数，不算当次
              let times = DDeiConfig.KEY_DOWN_TIMES.get(m1Str);
              //如果在时间差内达到了次数，则触发，否则丢弃，并重新计算
              if (nowTime - startTime <= item.interval && times + 1 >= item.times) {
                item.action.action(evt, ddInstance, editor,item);
                //清空记录
                DDeiConfig.KEY_DOWN_TIMES.delete(m1Str)
                //记录开始时间
                DDeiConfig.KEY_DOWN_INTERVAL.delete(m1Str)
                break;
              } else {
                //记录开始次数1
                DDeiConfig.KEY_DOWN_TIMES.set(m1Str, 1)
                //记录开始时间
                DDeiConfig.KEY_DOWN_INTERVAL.set(m1Str, nowTime)
              }
            }
          } else {
            let state = item.action.action(evt, ddInstance, editor,item);
            if (state == undefined || state === true) {
              matched = true;
              if (item.break == true || item.break == 1) {
                break;
              }
            }
            
          }
        }
      }
    }
    return matched
  }

  // ============================ 属性 ===============================
  //键盘事件的名称
  name: string;
  //键盘事件的描述备注
  desc: string;

  // ============================ 方法 ===============================
  /**
   * 键行为
   * @param evt 事件
   */
  action(evt: Event, ddInstance: DDei): void | boolean {

  }

}

export { DDeiKeyAction }
export default DDeiKeyAction
