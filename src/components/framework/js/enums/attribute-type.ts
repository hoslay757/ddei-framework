import DDeiConfig from '../config'

/**
 * 属性类型的定义
 */
enum DDeiEnumAttributeType {
  //图形属性、这一类属性会影响显示的视觉效果
  GRAPHICS = 1,
  //事件属性、这一类属性会影响事件分发
  EVENT = 3,
  //业务属性、这一类只会存储记录
  BUSINESS = 2
}

export default DDeiEnumAttributeType
