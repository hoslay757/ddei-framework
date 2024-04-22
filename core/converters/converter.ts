import DDeiPluginBase from '../plugin/ddei-plugin-base'

abstract class DDeiConverterBase extends DDeiPluginBase {
  
  

  // ============================ 方法 ===============================

  /**
   * 判定是否生效
   */
  isEnable(fileData: object): boolean{
    return true;
  }

  /**
   * 输入
   */
  input(fileData: object): object{
    return fileData;
  }

  /**
   * 输出
   */
  output(fileData: object): object{
    return fileData;
  }

  getConverters(editor) {
    return [this];
  }

}


export default DDeiConverterBase
