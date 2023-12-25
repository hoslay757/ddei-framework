import DDeiConfig from '../config'

/**
 * 操作状态的定义
 * TODO 叠加状态
 * TODO 状态优先级
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
  //控件修改大小中
  CONTROL_CHANGING_BOUND = 4,
  //控件旋转中
  CONTROL_ROTATE = 5,
  //选择器工作中
  SELECT_WORKING = 10,
  //表格内部拖拽
  TABLE_INNER_DRAG = 11,
  //抓手工作中
  GRAB_WORKING = 20,
  //画布滚动条工作中
  STAGE_SCROLL_WORKING = 21,
  //创建文本中
  TEXT_CREATING = 30,
  //线段修改点中
  LINE_POINT_CHANGING = 40,
  //线段修改点确认中
  LINE_POINT_CHANGING_CONFIRM = 41,
  //快捷编辑中
  QUICK_EDITING = 50,
  //快捷编辑器的待确认选中
  QUICK_EDITING_TEXT_SELECTING = 51,
  //特殊操作点修改中
  OV_POINT_CHANGING = 60,
}

export default DDeiEnumOperateState
