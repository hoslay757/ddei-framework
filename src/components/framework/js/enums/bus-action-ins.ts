import DDeiBusActionModelChangeSelect from '../bus/bus-action-model-change-select'
import DDeiBusActionStageChangeSelectModels from '../bus/bus-action-stage-change-select-models'
import DDeiConfig from '../config'

/**
 * Bus总线上的Action实例
 */
enum DDeiEnumBusActionInstance {
  ModelChangeSelect = new DDeiBusActionModelChangeSelect({ code: "model-change-select", name: "", desc: "" }),//模型改变选择状态
  StageChangeSelectModels = new DDeiBusActionStageChangeSelectModels({ code: "stage-change-select-models", name: "", desc: "" }),//Stage改变选择控件
}

export default DDeiEnumBusActionInstance
