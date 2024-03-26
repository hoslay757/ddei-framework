import DDeiAbstractShape from "../../shape";
import DDeiArrtibuteDefine from "../attribute-define";
import DDeiAbstractArrtibuteParser from "./attribute-parser";

/**
 * 属性解析器、用来解析属性值，以确保返回和输入的属性都能和dataType对应
 */
class DDeiArrtibuteParserString extends DDeiAbstractArrtibuteParser {
  // ============================ 构造函数 ===============================
  // ============================ 属性 ===============================

  // ============================ 方法 ===============================


  /**
  * 转换一个外部值到正确的值
  * 根据dataType返回不同的结果
  */
  parseValue(value: any): any {
    if (value) {
      if (this.define.isArray) {
        if (Array.isArray(value)) {
          return value;
        }
      } else {
        return value.toString();
      }
    } else {
      return null;
    }
  }


  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  getDefaultValue(): string | null {
    let value = this.define.defaultValue;
    if (value) {
      if (this.define.isArray) {
        if (Array.isArray(value)) {
          return value;
        }
      } else {
        return value.toString();
      }
    } else {
      return null;
    }
  }
}




export default DDeiArrtibuteParserString
