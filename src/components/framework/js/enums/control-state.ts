import DDeiConfig from '../config'

/**
 * 控件状态的定义
 * 不同的控件状态表现为不同的样式和相应的事件
 * 控件状态可能与操作状态相呼应、也可能独立存在
 */
enum DDeiEnumControlState {
  //普通缺省状态，没有被选中的任何状态
  DEFAULT = "default",
  //选中状态
  SELECTED = "selected",
  //选中状态
  CREATING = "creating"
}

export default DDeiEnumControlState
