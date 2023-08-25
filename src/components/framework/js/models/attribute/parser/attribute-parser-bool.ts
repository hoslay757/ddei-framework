import DDeiAbstractArrtibuteParser from "./attribute-parser";

/**
 * 属性解析器、用来解析属性值，以确保返回和输入的属性都能和dataType对应
 */
class DDeiArrtibuteParserBool extends DDeiAbstractArrtibuteParser {
  // ============================ 构造函数 ===============================

  // ============================ 属性 ===============================
  // ============================ 方法 ===============================

  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  getValue(): boolean {
    return false;
  }

  /**
   * 设置缺省值
   * 根据dataType返回不同的结果
   */
  setValue(value: boolean): void {

  }

  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  getDefaultValue(): boolean {
    let value = this.define.defaultValue;
    if (value) {
      if (this.define.isArray) {
        if (Array.isArray(value)) {
          return value;
        }
      } else if (value == true || value.toLocaleLowerCase() == "true") {
        return true;
      } else {
        return false
      }
    } else {
      return false
    }
  }
}




export default DDeiArrtibuteParserBool
