import DDeiConfig from '../config'

/**
 * Bus总线上的Action类别，以Code为准
 */
enum DDeiEnumBusActionType {
  ModelChangeSelect = "model-change-select",//模型改变选择状态
  StageChangeSelectModels = "stage-change-select-models",//Stage改变选择控件
  CancelCurLevelSelectedModels = "cancel-curlevel-selected-models",//取消所有的选中
  UpdateSelectorBounds = "update-selector-bounds",//更新选择器状态
  ClearTemplateVars = "clear-template-vars",//清楚临时变量，重置状态
  RefreshShape = "refresh-shape",//重绘图形
}

export default DDeiEnumBusActionType
