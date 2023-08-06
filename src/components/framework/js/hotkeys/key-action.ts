import DDeiConfig from "../config";
import DDei from "../ddei";

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
  static route(evt: Event, ddInstance: DDei): void {
    //获取是否按下ctrl、command、alt、shift等键
    let ctrl = evt.ctrlKey || evt.metaKey;
    let shift = evt.shiftKey;
    let alt = evt.altKey
    let m1Str = "_"
    if (ctrl == true) {
      m1Str += "ctrl_"
      DDei.KEY_DOWN_STATE.set("ctrl", true);
    }
    if (shift == true) {
      m1Str += "shift_"
      DDei.KEY_DOWN_STATE.set("shift", true);
    }
    if (alt == true) {
      m1Str += "alt_"
      DDei.KEY_DOWN_STATE.set("alt", true);
    }
    if (evt.keyCode != 93 && evt.keyCode != 18 && evt.keyCode != 16 && evt.keyCode != 17) {
      m1Str += evt.keyCode
      DDei.KEY_DOWN_STATE.set("" + evt.keyCode, true);
    }
    //执行下发逻
    for (let it = 0; it < DDeiConfig.HOT_KEY_MAPPING.length; it++) {
      let item = DDeiConfig.HOT_KEY_MAPPING[it];
      let matchStr = "_"
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
        if (item.times && item.times > 1 && item.interval && item.interval > 0) {

          if (!DDei.KEY_DOWN_TIMES.has(m1Str)) {
            //记录开始次数1
            DDei.KEY_DOWN_TIMES.set(m1Str, 1)
            //记录开始时间
            DDei.KEY_DOWN_INTERVAL.set(m1Str, Date.now())
          } else {
            //开始时间
            let startTime = DDei.KEY_DOWN_INTERVAL.get(m1Str);
            let nowTime = Date.now()
            //已达到的次数，不算当次
            let times = DDei.KEY_DOWN_TIMES.get(m1Str);
            //如果在时间差内达到了次数，则触发，否则丢弃，并重新计算
            if (nowTime - startTime <= item.interval && times + 1 >= item.times) {
              item.action.action(evt, ddInstance);
              //清空记录
              DDei.KEY_DOWN_TIMES.delete(m1Str)
              //记录开始时间
              DDei.KEY_DOWN_INTERVAL.delete(m1Str)
              break;
            } else {
              //记录开始次数1
              DDei.KEY_DOWN_TIMES.set(m1Str, 1)
              //记录开始时间
              DDei.KEY_DOWN_INTERVAL.set(m1Str, nowTime)
            }
          }
        } else {
          item.action.action(evt, ddInstance);
          break;
        }
      }



    }
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
  abstract action(evt: Event, ddInstance: DDei): void

}


export default DDeiKeyAction
