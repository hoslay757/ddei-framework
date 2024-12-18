import DDeiConfig from '../config'

/**
 * ddei涉及的操作类别
 */
enum DDeiEnumOperateType {
  CREATE = "CREATE",
  EDIT = "EDIT",
  VIEW = "VIEW",
  DRAG = "DRAG",
  LINK = "LINK",
  DEL = "DEL",
  DESTROYED = "DESTROYED",
  SELECT = "SELECT",
  ROTATE = "ROTATE",
  SCALE = "SCALE",
  MIRROR = "MIRROR",
  COMPOSE = "COMPOSE",
}

export { DDeiEnumOperateType }
export default DDeiEnumOperateType
