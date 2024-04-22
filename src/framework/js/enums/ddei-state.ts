import DDeiConfig from '../config'

/**
 * ddei实例的状态
 */
enum DDeiEnumState {
  //未激活状态，例如外部正在拖拽框架
  IN_ACTIVITY = -1,
  //无特殊状态
  NONE = 0,
}

export { DDeiEnumState }
export default DDeiEnumState
