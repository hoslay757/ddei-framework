
/**
 * Bus总线上的Command类别，以Code为准
 */
enum DDeiEditorEnumBusCommandType {
  ClearTemplateUI = "clear-template-ui",//清空临时UI
  RefreshEditorParts = "refresh-editor-parts",//刷新编辑器部件
}

export default DDeiEditorEnumBusCommandType
