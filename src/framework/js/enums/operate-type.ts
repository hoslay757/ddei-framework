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
  SELECT = "SELECT",
  ROTATE = "ROTATE",
  SCALE = "SCALE",
  COMPOSE = "COMPOSE",
}

export { DDeiEnumOperateType }
export default DDeiEnumOperateType
