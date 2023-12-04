import { controlOriginDefinies } from "../../configs/toolgroup"
import DDeiEditorArrtibute from "../attribute/editor-attribute";
import CONFIGS from "../resource"
import ICONS from "../../js/icon"
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiEditor from "../editor";
import DDeiConfig from "@/components/framework/js/config";
import DDeiUtil from "@/components/framework/js/util";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";
import DDeiEditorState from "../enums/editor-state";

class DDeiEditorUtil {

  // ============================ 静态方法 ============================

  /**
  * 获取线的初始化JSON定义
  */
  static getLineInitJSON(): object {
    let dataJson = {
      modelCode: "100401",
    };

    return dataJson
  }

  /**
  * 获取业务数据
  */
  static getBusiData(): object {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    if (editor) {
      let file = editor.files[editor.currentFileIndex]
      return file?.busiData
    }
  }

  /**
   * 获取快捷编辑文本框
   */
  static getEditorText() {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    if (editor) {
      if (!editor.quickEditorInput) {
        let inputId = editor.id + "_quickeditor";
        let inputEle = document.getElementById(inputId);
        if (!inputEle) {
          inputEle = document.createElement("textarea")
          inputEle.setAttribute("id", inputId)
          inputEle.setAttribute("style", "filter: opacity(0);user-select: none;pointer-events: none;border:none;resize:none;padding:0;z-index:9999;position:absolute;left:0;top:0;display:none;outline:none;");
          document.body.appendChild(inputEle);
          editor.quickEditorInput = inputEle;
          inputEle.enterValue = function () {
            //设置属性值
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let ddInstance = editor?.ddInstance;
            if (editor.quickEditorModel) {
              ddInstance.stage.render.editorShadowControl = null;
              editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { models: [editor.quickEditorModel], paths: ["text"], value: inputEle.value }, null, true);
              editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
              editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
              editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
            }
            inputEle.value = "";
            editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
            editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
            editor.bus.executeAll();
            editor.changeState(DDeiEditorState.DESIGNING);
          }
          inputEle.onkeydown = function () {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
            editor.bus.executeAll();
          }
          inputEle.oninput = function () {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let ddInstance = editor?.ddInstance;
            if (ddInstance.stage.render.editorShadowControl) {
              ddInstance.stage.render.editorShadowControl.text = inputEle.value;
              ddInstance.stage.render.editorShadowControl.render.setCachedValue("text", inputEle.value)
              editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
              editor.bus.executeAll();
            }
          }
        }
      }
      return editor.quickEditorInput;
    }

  }

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
   * 显示菜单
   */
  static showContextMenu(control: any, evt: Event): void {
    let menuJSON = DDeiUtil.getMenuConfig(control);
    if (menuJSON?.length > 0) {
      //记录当前控件
      let stage = DDeiEditor.ACTIVE_INSTANCE?.ddInstance?.stage;
      if (stage) {
        stage.render.currentMenuShape = control;
        //显示菜单
        DDeiUtil.setCurrentMenu(menuJSON);
        let menuDialogId = DDeiUtil.getMenuControlId();
        let menuEle = document.getElementById(menuDialogId);
        if (menuEle) {

          if (evt.layerX + 200 > document.body.clientWidth) {
            menuEle.style.right = "0px";
          } else {
            menuEle.style.left = evt.layerX + "px";
          }
          if (evt.layerY + menuJSON.length * 40 > document.body.clientHeight) {
            menuEle.style.bottom = "0px";
          } else {
            menuEle.style.top = evt.layerY + "px";
          }
          setTimeout(() => {
            menuEle.style.display = "block";
          }, 10);

        }
      }
    }
  }

  /**
     * 获取菜单配置
     * @param configModel 配置模型，如果包含了attrDefineMap等数据，则直接获取数据,如果只包含id则通过id取原始数据
     * @param paths 属性路径,支持传入多个
     * @return 由构成的属性的实际路径和配置中对应的值组成的Map
     */
  static getMenuConfig(model: object): object | null {
    switch (model?.modelType) {
      case "DDeiFile": {

        break
      }
      case "DDeiSheet": {
        let menus = [
          {
            'code': 'copy-sheet',
            'name': '复制',
            'icon': 'icon-insert-row',
          },
          {
            'code': 'remove-sheet',
            'name': '删除',
            'icon': 'icon-insert-col',
          }
        ]
        return menus
      }
      default: {
        let controlDefine = controlOriginDefinies.get(model.modelCode);
        if (controlDefine) {
          return controlDefine.menus;
        }
        return null;
      }
    }

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

            if (!attrDefine.mapping || attrDefine.mapping.length == 0) {
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
          if (!data) {
            data = DDeiConfig[configData]
          }
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

  /**
   * 获取配置属性值
   * @param key key
   */
  static getConfigValue(key: string, editor: DDeiEditor) {
    if (editor && (editor[key] || editor[key] == false || editor[key] == 0)) {
      return editor[key];
    } else {
      return DDeiEditor[key];
    }
  }
}

export default DDeiEditorUtil
