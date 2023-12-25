import DDeiConfig from '../config'

/**
 * Bus总线上的Command类别，以Code为准
 */
enum DDeiEnumBusCommandType {
  ModelChangeSelect = "model-change-select",//模型改变选择状态
  StageChangeSelectModels = "stage-change-select-models",//Stage改变选择控件
  CancelCurLevelSelectedModels = "cancel-curlevel-selected-models",//取消所有的选中
  UpdateSelectorBounds = "update-selector-bounds",//更新选择器状态
  ClearTemplateVars = "clear-template-vars",//清楚临时变量，重置状态
  RefreshShape = "refresh-shape",//重绘图形
  ModelChangeContainer = "model-change-container",//模型修改所在容器
  ModelChangeBounds = "model-change-bounds",//模型修改大小
  ModelChangePosition = "model-change-position",//模型修改位置
  ModelEdgePosition = "model-edge-position",//模型修改位置移动到了边缘
  SetHelpLine = "set-helpline",//设置辅助线
  UpdateDragObj = "update-dragobj",//更新辅助变量dragobj
  ChangeSelectorPassIndex = "change-selector-passindex",
  ChangeCursor = "change-cursor",
  ModelChangeRotate = "model-change-rotate",
  ResetSelectorState = "reset-selector-state",
  ModelPush = "model-push",
  ModelChangeValue = "model-change-value",
  ChangeLayout = "change-layout",
  CopyStyle = "copy-style",
  AddHistroy = "add-histroy",
  ModelAlign = "model-align",
  ModelMerge = "model-merge",
  ModelCancelMerge = "model-cancel-merge",
  ModelAutoPos = "model-auto-pos",
  ChangeEditMode = "change-edit-mode",
  ChangeStageRatio = "change-stage-ratio",
  ChangeStageWPV = "change-stage-wpv",
  CenterStageWPV = "center-stage-wpv",
  NodifyChange = "nodify-change",
  NodifyControlCreated = "nodify-control-created",
  ChangeLinePoint = "change-line-point",
  TextEditorChangeSelectPos = "texteditor-change-select-pos",
  OVSChangePosition = "ovs-change-position",
}

export default DDeiEnumBusCommandType
