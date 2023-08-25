import DDeiAbstractArrtibuteParser from "./attribute-parser";

/**
 * 属性解析器、用来解析属性值，以确保返回和输入的属性都能和dataType对应
 */
class DDeiArrtibuteParserNumber extends DDeiAbstractArrtibuteParser {
  // ============================ 构造函数 ===============================

  // ============================ 属性 ===============================
  // ============================ 方法 ===============================

  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  getValue(): number | null {
    return null;
  }

  /**
   * 设置缺省值
   * 根据dataType返回不同的结果
   */
  setValue(value: number): void {

  }

  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  getDefaultValue(): number | null {
    let value = this.define.defaultValue;
    if (value) {
      if (this.define.isArray) {
        if (Array.isArray(value)) {
          return value;
        }
      } else {
        try {
          return parseFloat(value);
        } catch (e) {
          return null;
        }
      }
    } else {
      return null;
    }
  }
}




export default DDeiArrtibuteParserNumber
