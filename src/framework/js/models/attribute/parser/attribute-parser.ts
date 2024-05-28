import DDeiAbstractShape from "../../shape";
import DDeiArrtibuteDefine from "../attribute-define";

/**
 * 属性解析器、用来解析属性值，以确保返回和输入的属性都能和dataType对应
 */
abstract class DDeiAbstractArrtibuteParser {
  // ============================ 构造函数 ===============================
  constructor(model: DDeiAbstractShape, define: DDeiArrtibuteDefine) {
    this.model = model;
    this.define = define;
  }
  // ============================ 属性 ===============================
  //模型
  model: DDeiAbstractShape;
  //属性定义
  define: DDeiArrtibuteDefine;

  // ============================ 方法 ===============================


  /**
  * 转换一个外部值到正确的值
  * 根据dataType返回不同的结果
  */
  abstract parseValue(value: any): any;

  /**
   * 获取缺省值
   * 根据dataType返回不同的结果
   */
  abstract getDefaultValue(): any;
}



export { DDeiAbstractArrtibuteParser }
export default DDeiAbstractArrtibuteParser
