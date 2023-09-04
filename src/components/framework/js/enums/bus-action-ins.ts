
import DDeiBusActionCancelCurLevelSelectedModels from '../bus/bus-action-cancel-curlevel-selected-models'
import DDeiBusActionClearTemplateVars from '../bus/bus-action-clear-template-vars'
import DDeiBusActionModelChangeSelect from '../bus/bus-action-model-change-select'
import DDeiBusActionRefreshShape from '../bus/bus-action-refresh-shape'
import DDeiBusActionStageChangeSelectModels from '../bus/bus-action-stage-change-select-models'
import DDeiBusActionUpdateSelectorBounds from '../bus/bus-action-update-selector-bounds'
import DDeiConfig from '../config'

/**
 * Bus总线上的Action实例
 */
enum DDeiEnumBusActionInstance {
  ModelChangeSelect = new DDeiBusActionModelChangeSelect({ code: "model-change-select", name: "", desc: "" }),//模型改变选择状态
  StageChangeSelectModels = new DDeiBusActionStageChangeSelectModels({ code: "stage-change-select-models", name: "", desc: "" }),//Stage改变选择控件
  CancelCurLevelSelectedModels = new DDeiBusActionCancelCurLevelSelectedModels({ code: "cancel-selected-models", name: "", desc: "" }),//取消所有的选中
  UpdateSelectorBounds = new DDeiBusActionUpdateSelectorBounds({ code: "update-selector-bounds", name: "", desc: "" }),//更新选择器状态
  ClearTemplateVars = new DDeiBusActionClearTemplateVars({ code: "clear-template-vars", name: "", desc: "" }),//清楚临时变量，重置状态
  RefreshShape = new DDeiBusActionRefreshShape({ code: "refresh-shape", name: "", desc: "" }),//重绘图形

}

export default DDeiEnumBusActionInstance
