/**
 * 编辑器的状态定义
 * 不同的状态具有不同的行为、会响应不同的事件等等
 */
enum DDeiEditorState {
  //设计中
  DESIGNING = "designing",
  //编辑属性中
  PROPERTY_EDITING = "property_editing",
  //快捷编辑中
  QUICK_EDITING = "quick_editing",
  //控件创建中
  CONTROL_CREATING = "control_creating",
  //工具栏控件激活中
  TOOLBOX_ACTIVE = "toolbox_active",
  //框架大小改变中
  FRAME_CHANGING = "frame_changing",
  //上方菜单操作中
  TOP_MENU_OPERATING = "top_menu_operating",
}

export default DDeiEditorState
