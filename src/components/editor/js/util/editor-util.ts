import { controlOriginDefinies } from "../../configs/toolgroup"

class DDeiEditorUtil {

  // ============================ 静态方法 ============================

  /**
   * 从配置定义中获取属性值，优先从code中获取，其次从mapping获取
   * @param configModel 配置模型，如果包含了attrDefineMap等数据，则直接获取数据,如果只包含id则通过id取原始数据
   * @param paths 属性路径,支持传入多个
   * @return 由构成的属性的实际路径和配置中对应的值组成的Map
   */
  static getAttrValueByConfig(configModel: object, paths: string[] | string): Map<string, object> {
    let returnDatas: Map<string, object> = new Map();
    if (configModel && paths) {
      let searchPaths = null;
      if (typeof (paths) == 'string') {
        searchPaths = paths.split(",");
      } else {
        searchPaths = paths;
      }
      let searchMap: Map<string, object> | null = null;
      if (configModel.attrDefineMap && configModel.attrDefineMap.size > 0) {
        searchMap = configModel.attrDefineMap;
      } else if (configModel.id || configModel.modelCode) {
        let id = configModel.modelCode ? configModel.modelCode : configModel.id;
        //找到控件定义
        let control = controlOriginDefinies.get(id);
        searchMap = control.attrDefineMap;

      }
      if (searchMap) {
        let noCodeMatchPaths: string[] = [];
        searchPaths.forEach(searchPath => {
          if (searchMap.has(searchPath)) {
            let attrDefine = searchMap.get(searchPath);

            if (!attrDefine.mapping) {
              //获取属性值
              returnDatas.set(searchPath, { "overwrite": attrDefine.overwrite ? attrDefine.overwrite : false, "data": attrDefine.parser.getDefaultValue() });
            } else {
              noCodeMatchPaths.push(searchPath);
            }
          } else {
            noCodeMatchPaths.push(searchPath);
          }
        });
        let hasMappingAttrs = Array.from(searchMap.values());
        for (let i = 0; i < noCodeMatchPaths.length; i++) {
          let searchPath = noCodeMatchPaths[i];
          for (let j = 0; j < hasMappingAttrs.length; j++) {
            let attrDefine = hasMappingAttrs[j];
            //找到mapping中对应的属性
            if (attrDefine.mapping && attrDefine.mapping.indexOf(searchPath) != -1) {
              returnDatas.set(searchPath, { "overwrite": attrDefine.overwrite ? attrDefine.overwrite : false, "data": attrDefine.parser.getDefaultValue() });
              break;
            }
          }
        }
      }
    }

    return returnDatas;
  }

}

export default DDeiEditorUtil
