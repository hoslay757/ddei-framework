import DDeiEnumAttributeType from "../../enums/attribute-type";

/**
 * 属性定义，包含了属性类别、名称、code、描述说明、数据类型、控件类型、数据源、缺省、非空、只读、顺序等内容
 * TODO 拥有校验、联动等关系
 * 属性可以分为图形属性和业务属性和事件，图形属性用来关联图形显示，业务属性用来关联业务，事件用来响应事件
 * 一个模型具备多个属性，但模型只存储属性的key和value，不存储属性的定义信息
 */
abstract class DDeiAbstractArrtibuteDefine {
  // ============================ 构造函数 ===============================
  constructor(props: object) {
    this.type = props.type
    this.code = props.code
    this.name = props.name
    this.desc = props.desc
    this.dataType = props.dataType ? props.dataType : "string"
    this.controlType = props.controlType ? props.controlType : "text"
    this.dataSource = props.dataSource
    this.defaultValue = props.defaultValue
    this.notNull = props.notNull ? props.notNull : false
    this.readonly = props.readonly ? props.readonly : false
    this.orderNo = props.orderNo
  }
  // ============================ 属性 ===============================
  //属性类别
  type: DDeiEnumAttributeType;
  //code，一般为英文名，在同一个模型中code唯一，后面的值会覆盖前面的值
  code: string;
  //名称，一般为中文名
  name: string | null;
  //说明，描述了属性的说明
  desc: string | null;
  //数据类型，用来存储值的类型，存储的属性值会转换为对应dataType指明的类型。
  dataType: string;
  //控件类型，用来编辑属性时的控件
  controlType: string;
  //数据源，用于获取数据，一般为一个json
  dataSource: string | null;
  //属性的缺省值，缺省值会转换为对应dataType指明的类型。
  defaultValue: object;
  //非空
  notNull: boolean;
  // 制度
  readonly: boolean;
  // 顺序号
  orderNo: number | null;
  // ============================ 方法 ===============================
}




export default DDeiAbstractArrtibuteDefine
