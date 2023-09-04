import DDeiConfig from '../config'

/**
 * Bus总线上的Action类别，以Code为准
 */
enum DDeiEnumBusActionType {
  ModelChangeSelect = "model-change-select",//模型改变选择状态
  StageChangeSelectModels = "stage-change-select-models",//Stage改变选择控件
}

export default DDeiEnumBusActionType
