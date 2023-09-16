
/**
 * Bus总线上的Command类别，以Code为准
 */
enum DDeiEditorEnumBusCommandType {
  ClearTemplateUI = "clear-template-ui",//清空临时UI
  RefreshEditorParts = "refresh-editor-parts",//刷新编辑器部件
  FileDirty = "fire-dirty",//文状态改为dirty
}

export default DDeiEditorEnumBusCommandType
