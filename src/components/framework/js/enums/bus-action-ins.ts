import DDeiBusActionCancelCurLevelSelectedModels from "../bus/actions/cancel-curlevel-selected-models";
import DDeiBusActionClearTemplateVars from "../bus/actions/clear-template-vars";
import DDeiBusActionRefreshShape from "../bus/actions/refresh-shape";
import DDeiBusActionModelChangeSelect from "../bus/actions/model-change-select";
import DDeiBusActionStageChangeSelectModels from "../bus/actions/stage-change-select-models";
import DDeiBusActionUpdateSelectorBounds from "../bus/actions/update-selector-bounds";
import DDeiBusActionModelChangeContainer from "../bus/actions/model-change-container";
import DDeiBusActionModelChangeBounds from "../bus/actions/model-change-bounds";
import DDeiBusActionSetHelpLine from "../bus/actions/set-helpline";
import DDeiBusActionUpdateDragObj from "../bus/actions/update-drawobj";

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
  ModelChangeContainer = new DDeiBusActionModelChangeContainer({ code: "model-change-container", name: "", desc: "" }),//模型修改所在容器
  ModelChangeBounds = new DDeiBusActionModelChangeBounds({ code: "model-change-bounds", name: "", desc: "" }),//模型修改大小和位置
  SetHelpLine = new DDeiBusActionSetHelpLine({ code: "set-helpline", name: "", desc: "" }),//设置辅助线
  UpdateDragObj = new DDeiBusActionUpdateDragObj({ code: "update-dragobj", name: "", desc: "" }),//更新临时变量dragobj
}

export default DDeiEnumBusActionInstance
