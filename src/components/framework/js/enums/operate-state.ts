import DDeiConfig from '../config'

/**
 * 操作状态的定义
 */
enum DDeiEnumOperateState {
  //无，没有任何状态
  NONE = 0,
  //控件状态确认中
  CONTROL_CONFIRMING = 1,
  //控件创建中
  CONTROL_CREATING = 2,
  //控件拖拽中
  CONTROL_DRAGING = 3,
  //选择器工作中
  SELECT_WORKING = 10,
}

export default DDeiEnumOperateState
