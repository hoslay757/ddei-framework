import { controlOriginDefinies } from "../../configs/toolgroup"
import DDeiEditorArrtibute from "../attribute/editor-attribute";
import CONFIGS from "../../js/config"
import ICONS from "../../js/icon"
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiEditor from "../editor";

class DDeiEditorUtil {

  // ============================ 静态方法 ============================


  /**
   * 获取子元素定义的json信息
   */
  static getSubControlJSON(modelCode: string): object {
    //如果存在初始化子控件的json，则记录在类变量上
    let controlDefine = controlOriginDefinies.get(modelCode);
    if (controlDefine.subcontrol) {
      let subControlDefine = controlOriginDefinies.get(controlDefine.subcontrol);
      let configAtrs = DDeiEditorUtil.getAttrValueByConfig(subControlDefine, [
        "layout",
      ]);
      if (subControlDefine) {
        let subControlJSON = {
          modelCode: subControlDefine.id,
          layout: configAtrs.get("layout")?.data,
        };
        return subControlJSON;
      }
    }

  }

  /**
   * 获取菜单控件ID
   * @returns 控件ID
   */
  static getMenuControlId(): string {
    return "ddei_editor_menu_dialog"
  }

  /**
     * 获取菜单配置
     * @param configModel 配置模型，如果包含了attrDefineMap等数据，则直接获取数据,如果只包含id则通过id取原始数据
     * @param paths 属性路径,支持传入多个
     * @return 由构成的属性的实际路径和配置中对应的值组成的Map
     */
  static getMenuConfig(model: object): object | null {
    let controlDefine = controlOriginDefinies.get(model.modelCode);
    if (controlDefine) {
      return controlDefine.menus;
    }
    return null;
  }

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
        if (control) {
          searchMap = control.attrDefineMap;
        }

      }
      if (searchMap) {
        let noCodeMatchPaths: string[] = [];
        searchPaths.forEach(searchPath => {
          if (searchMap.has(searchPath)) {
            let attrDefine = searchMap.get(searchPath);

            if (!attrDefine.mapping) {
              //获取属性值
              returnDatas.set(searchPath, { "overwrite": attrDefine.overwrite ? attrDefine.overwrite : false, "data": attrDefine.getParser().getDefaultValue() });
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
              returnDatas.set(searchPath, { "overwrite": attrDefine.overwrite ? attrDefine.overwrite : false, "data": attrDefine.getParser().getDefaultValue() });
              break;
            }
          }
        }
      }
    }

    return returnDatas;
  }

  /**
    * 获取数据源数据
    */
  static getDataSource(attrDefine: DDeiEditorArrtibute, searchText: string | null = null): object[] | null {
    if (attrDefine.dataSource) {
      let dsDefine = attrDefine.dataSource;
      let dataSource = null;
      if (Array.isArray(dsDefine)) {
        dataSource = dsDefine;
      } else {
        let type = dsDefine.type;
        if (!type || type == 'static') {
          dataSource = dsDefine.data;
        }
        //从配置中获取数据
        else if (type == 'config') {
          dataSource = [];
          let configData = dsDefine.data;
          let data = CONFIGS[configData];
          if (data) {
            let textKey = dsDefine.text;
            let valueKey = dsDefine.value;
            let boldKey = dsDefine.bold;
            let descKey = dsDefine.desc;
            let underlineKey = dsDefine.underline;
            let disabledKey = dsDefine.disabled;
            let deletedKey = dsDefine.deleted;
            let searchTextKey = dsDefine.searchText;
            let fontFamilyKey = dsDefine.fontFamily;
            data.forEach(item => {
              let text = item[textKey];
              let value = item[valueKey];
              let bold = item[boldKey];
              let desc = item[descKey];
              let underline = item[underlineKey];
              let disabled = item[disabledKey];
              let deleted = item[deletedKey];
              let searchText = item[searchTextKey];
              let fontFamily = item[fontFamilyKey];
              let rowData = {
                'text': text, 'searchText': searchText, 'value': value,
                'bold': bold, 'desc': desc, 'underline': underline, 'disabled': disabled, 'deleted': deleted, 'fontFamily': fontFamily
              }
              dataSource.push(rowData);
            });
            dsDefine.type = 'static';
            dsDefine.data = dataSource;
          }
        }
      }
      //处理图片,处理搜索
      let returnDatas = [];
      if (dataSource) {
        dataSource.forEach(item => {
          if (item.img) {
            if (ICONS[item.img]) {
              item.img = ICONS[item.img].default;
            }
          }
          if (searchText) {
            if (item.text.indexOf(searchText) != -1 || item.value.indexOf(searchText) != -1 || (item.searchText && item.searchText.indexOf(searchText) != -1)) {
              returnDatas.push(item);
            }
          } else {
            returnDatas.push(item);
          }
        });
      }
      //过滤搜索条件
      return returnDatas
    }
    return [];
  }

}

export default DDeiEditorUtil
