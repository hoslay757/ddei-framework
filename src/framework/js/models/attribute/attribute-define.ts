import DDeiArrtibuteParserString from "./parser/attribute-parser-string";
import DDeiArrtibuteParserNumber from "./parser/attribute-parser-number";
import DDeiArrtibuteParserBool from "./parser/attribute-parser-bool";
import DDeiEnumAttributeType from "../../enums/attribute-type";

/**
 * 属性定义，包含了属性类别、名称、code、描述说明、数据类型、控件类型、数据源、缺省、非空、只读、顺序等内容
 * TODO 拥有校验、联动等关系
 * 属性可以分为图形属性和业务属性和事件，图形属性用来关联图形显示，业务属性用来关联业务，事件用来响应事件
 * 一个模型具备多个属性，但模型只存储属性的key和value，不存储属性的定义信息
 */
class DDeiArrtibuteDefine {
  // ============================ 构造函数 ===============================
  constructor(props: object) {
    this.id = props.id
    this.mapping = props.mapping
    this.type = props.type
    this.code = props.code
    this.name = props.name
    this.desc = props.desc
    this.dataType = props.dataType ? props.dataType : "string"
    this.dataSource = props.dataSource
    this.defaultValue = props.defaultValue
    this.notNull = props.notNull ? props.notNull : false
    this.readonly = props.readonly ? props.readonly : false
    this.isArray = props.isArray ? props.isArray : false;
    this.overwrite = props.overwrite ? props.overwrite : false;
    this.min = props.min ? props.min : 0;
    this.max = props.max ? props.max : 100;
  }
  // ============================ 属性 ===============================
  //属性的ID
  id: string;
  //mapping建立与模型中属性的映射关系，为null时为默认，采用code指向的属性映射；mapping为[]时交由控件编辑器处理值映射
  mapping: string[];
  type: DDeiEnumAttributeType[];//属性类型
  //code，一般为英文名，在同一个模型中code唯一，后面的值会覆盖前面的值
  code: string;
  //名称，一般为中文名
  name: string | null;
  //说明，描述了属性的说明
  desc: string | null;
  //数据类型，用来存储值的类型，存储的属性值会转换为对应dataType指明的类型。
  dataType: string;
  //数据源，用于获取数据，一般为一个json
  dataSource: string | null;
  //属性的缺省值，缺省值会转换为对应dataType指明的类型。
  defaultValue: object;
  //非空
  notNull: boolean;
  // 只读
  readonly: boolean;
  //是否为数组
  isArray: boolean;
  //是否复写
  overwrite: boolean;
  //最小值
  min: number;
  //最大值
  max: number;
  // ============================ 方法 ===============================

  /**
   * 初始化解析器
   */
  getParser(): DDeiAbstractArrtibuteParser {
    if (!this.dataType || this.dataType.toLocaleLowerCase() == 'string') {
      return new DDeiArrtibuteParserString(null, this);
    } else if (this.dataType.toLocaleLowerCase() == 'integer' || this.dataType.toLocaleLowerCase() == 'float' || this.dataType.toLocaleLowerCase() == 'number') {
      return new DDeiArrtibuteParserNumber(null, this);
    } else if (this.dataType.toLocaleLowerCase() == 'boolean' || this.dataType.toLocaleLowerCase() == 'bool') {
      return new DDeiArrtibuteParserBool(null, this);
    }
    return null
  }


}


export { DDeiArrtibuteDefine }

export default DDeiArrtibuteDefine
