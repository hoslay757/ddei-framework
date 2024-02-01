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

  //最新使用的工具栏
  static recentlyToolGroups = null

  /**
   * 读取最近工具栏
   */
  static readRecentlyToolGroups() {
    let groups = localStorage.getItem("ddei-recently-tool-groups");
    if (groups) {
      try {
        DDeiEditorUtil.recentlyToolGroups = JSON.parse(groups)
      } catch (e) { }
    }
  }

  /**
   * 写入最近工具栏
   */
  static whiteRecentlyToolGroups(groups) {
    DDeiEditorUtil.recentlyToolGroups = []
    groups.forEach(group => {
      if (group.display) {
        DDeiEditorUtil.recentlyToolGroups.push({ id: group.id, expand: group.expand })
      }
    });
    localStorage.setItem("ddei-recently-tool-groups", JSON.stringify(DDeiEditorUtil.recentlyToolGroups));
  }

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
          inputEle.setAttribute("style", "width:100px;filter: opacity(0);user-select: none;pointer-events: none;border:none;resize:none;padding:0;z-index:9999;position:fixed;left:0;top:0;display:none;outline:none;");
          document.body.appendChild(inputEle);
          editor.quickEditorInput = inputEle;
          inputEle.enterValue = function () {
            //设置属性值
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let ddInstance = editor?.ddInstance;
            if (editor.quickEditorModel) {
              editor.quickEditorModel.sptStyle = ddInstance.stage.render.editorShadowControl.sptStyle
              ddInstance.stage.render.editorShadowControl = null;
              editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { models: [editor.quickEditorModel], paths: ["text"], value: inputEle.value }, null, true);
              editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
              editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
              editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
            }
            inputEle.value = "";
            editor.changeState(DDeiEditorState.DESIGNING);
            editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
            editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
            editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, { parts: ["topmenu"] });
            editor.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels);
            editor.bus?.executeAll();

          }
          inputEle.onkeydown = function () {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
            editor.bus.executeAll();
          }
          inputEle.addEventListener("compositionend", function () {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let ddInstance = editor?.ddInstance;
            if (ddInstance.stage.render.editorShadowControl) {
              DDeiEditorUtil.quickEditorToControl();
            }
          })
          inputEle.addEventListener("input", () => {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let ddInstance = editor?.ddInstance;
            if (ddInstance.stage.render.editorShadowControl) {
              DDeiEditorUtil.quickEditorToControl();
            }
          })


        }
      }
      return editor.quickEditorInput;
    }

  }

  /**
   * 设置编辑器值到控件
   */
  static quickEditorToControl(inputEle) {
    let editorInput = DDeiEditorUtil.getEditorText();
    if (!inputEle) {
      inputEle = editorInput
    }
    if (inputEle != editorInput) {
      editorInput.value = inputEle.value
      editorInput.selectionStart = inputEle.selectionStart
      editorInput.selectionEnd = inputEle.selectionEnd
    }
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    let ddInstance = editor?.ddInstance;
    //删除选择区域内样式，然后新增样式
    let oldStr = ddInstance.stage.render.editorShadowControl.text
    let newStr = inputEle.value
    let curstrIdx = Math.min(ddInstance.stage.render.editorShadowControl.tempCursorStart, inputEle.selectionStart)
    //提取新增的文本
    let beforeStr = oldStr.substring(0, curstrIdx)
    //拼接新的样式信息
    let beforeSPT = {};
    for (let i = 0; i < curstrIdx; i++) {
      if (ddInstance.stage.render.editorShadowControl.sptStyle[i]) {
        beforeSPT[i] = ddInstance.stage.render.editorShadowControl.sptStyle[i];
      }
    }
    //计算after的特殊样式，此时还不知道中间的append需要多少
    let sptIndex = curstrIdx
    let afterStr = oldStr.substring(ddInstance.stage.render.editorShadowControl.tempCursorEnd)
    let afterSPT = {}
    for (let i = ddInstance.stage.render.editorShadowControl.tempCursorEnd; i < oldStr.length; i++) {
      if (ddInstance.stage.render.editorShadowControl.sptStyle[i]) {
        afterSPT[i] = ddInstance.stage.render.editorShadowControl.sptStyle[i];
      }
    }
    //计算append以及append的特殊样式
    let bIndex = newStr.indexOf(beforeStr) + beforeStr.length;
    let appendStr = null

    if (afterStr) {
      appendStr = newStr.substring(bIndex, newStr.lastIndexOf(afterStr))
    } else {
      appendStr = newStr.substring(bIndex)
    }

    let oriStyle = bIndex == 0 ? afterSPT[bIndex] : beforeSPT[bIndex - 1];
    if (oriStyle && appendStr) {
      let cloneSPTStr = JSON.stringify(oriStyle);
      for (let i = 0; i < appendStr.length; i++, sptIndex++) {
        beforeSPT[sptIndex] = JSON.parse(cloneSPTStr);
      }
    }
    let appendStrLen = newStr.length - oldStr.length;
    for (let i in afterSPT) {
      beforeSPT[parseInt(i) + appendStrLen] = afterSPT[i]
    }
    ddInstance.stage.render.editorShadowControl.sptStyle = beforeSPT


    ddInstance.stage.render.editorShadowControl.tempCursorStart = inputEle.selectionStart
    ddInstance.stage.render.editorShadowControl.tempCursorEnd = inputEle.selectionEnd

    ddInstance.stage.render.editorShadowControl.text = inputEle.value;
    ddInstance.stage.render.editorShadowControl.render.setCachedValue("text", inputEle.value)
    editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
    editor.bus.executeAll();
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
        if (id.indexOf("_shadow") != -1) {
          id = id.substring(id, id.lastIndexOf("_shadow"))
        }
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
   * 返回控件原始定义
   * @param modelCode model或id
   */
  static getControlDefine(configModel: DDeiAbstractShape) {
    let id = configModel.modelCode ? configModel.modelCode : configModel.id;
    //找到控件定义
    return controlOriginDefinies.get(id);
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
  /**
   * 打开弹出框
   * @param id 弹出框ID
   * @param data 数据以及回调函数等选项
   * @param pos 位置信息
   * @param el 事件的➗元素
   */
  static showDialog(id: string, data: object, pos: object, el: object) {
    if (!DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
      DDeiEditor.ACTIVE_INSTANCE.tempDialogData = {}
    }
    //查看是否有同一group的弹出框，如果有则关闭同一group的其它弹出框
    if (data.group) {
      for (let oid in DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
        if (oid != id) {
          let otherDialogData = DDeiEditor.ACTIVE_INSTANCE.tempDialogData[oid]
          if (otherDialogData && otherDialogData.group == data.group) {
            DDeiEditorUtil.closeDialog(oid)
          }
        }
      }
    }
    //记录临时变量
    DDeiEditor.ACTIVE_INSTANCE.tempDialogData[id] = data
    //修改编辑器状态为快捷编辑中
    DDeiEditor.ACTIVE_INSTANCE.changeState(DDeiEditorState.PROPERTY_EDITING);
    DDeiEditorUtil.dialogViewer.forceRefreshDialog(id)
    setTimeout(() => {
      let backEle = document.getElementById("dialog_background_div");
      if (data.background) {
        backEle.style.background = data.background;
        backEle.style.display = "block";
        if (data.opacity) {
          backEle.style.opacity = data.opacity;
        }
      }
      if (data.event == -1) {
        backEle.style.pointerEvents = "auto";
      } else {
        backEle.style.pointerEvents = "";
      }
      let dialog = document.getElementById(id);
      dialog.style.display = "block";
      let msgEle = dialog?.getElementsByClassName("msg")[0];
      if (msgEle) {
        msgEle.innerHTML = "";
        if (data.msg) {
          msgEle.innerHTML = data.msg;
        }
      }
      //设置位置信息
      if (pos?.type) {
        let left, top
        switch (pos.type) {
          //基于触发元素的底部
          case 2: {
            let absPos = DDeiUtil.getDomAbsPosition(el)
            left = absPos.left + (pos.dx ? pos.dx : 0)
            top = (absPos.top - dialog?.clientHeight + (pos.dy ? pos.dy : 0))
          } break;
          //基于触发元素的底部居中
          case 3: {
            let absPos = DDeiUtil.getDomAbsPosition(el)
            left = absPos.left - (dialog.clientWidth / 2 - el.clientWidth / 2) + (pos.dx ? pos.dx : 0)
            top = (absPos.top - dialog?.clientHeight + (pos.dy ? pos.dy : 0))
          } break;
          //基于触发元素的顶部
          case 4: {
            let absPos = DDeiUtil.getDomAbsPosition(el)
            left = absPos.left + (pos.dx ? pos.dx : 0)
            top = (absPos.top + el.clientHeight + (pos.dy ? pos.dy : 0))
          } break;
          //基于触发元素的顶部居中
          case 5: {
            let absPos = DDeiUtil.getDomAbsPosition(el)
            left = absPos.left - (dialog.clientWidth / 2 - el.clientWidth / 2) + (pos.dx ? pos.dx : 0)
            top = (absPos.top + el.clientHeight + (pos.dy ? pos.dy : 0))
          } break;
        }
        if (left + dialog?.clientWidth > document.body.scrollWidth) {
          left = document.body.scrollWidth - dialog?.clientWidth - 10
        }
        if (top + dialog?.clientHeight > document.body.scrollHeight) {
          top = document.body.scrollHeight - dialog?.clientHeight - 10
        }
        dialog.style.left = left + "px"
        dialog.style.top = top + "px"
      }
    }, 50);



  }


  /**
   * 关闭弹出框
   * @param id 
   */
  static closeDialog(id: string) {
    let dialog = document.getElementById(id);
    dialog.style.display = "none";
    if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
      DDeiEditor.ACTIVE_INSTANCE.tempDialogData[id] = null
    }
    let backEle = document.getElementById("dialog_background_div");
    backEle.style.background = "none"
    backEle.style.display = "none";
  }

  static closeDialogs(groups: string[]) {
    for (let oid in DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
      let otherDialogData = DDeiEditor.ACTIVE_INSTANCE.tempDialogData[oid]
      if (otherDialogData && (groups.indexOf(otherDialogData.group) != -1 || !groups || groups.length == 0)) {
        DDeiEditorUtil.closeDialog(oid)
      }
    }
  }

  /**
   * 打开或关闭弹出框
   * @param id 
   * @param data 
   * @param pos 
   * @param el 
   */
  static showOrCloseDialog(id: string, data: object, pos: object, el: object) {
    if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData && DDeiEditor.ACTIVE_INSTANCE.tempDialogData[id]) {
      DDeiEditorUtil.closeDialog(id)
    } else {
      DDeiEditorUtil.showDialog(id, data, pos, el)
    }
  }
}

export default DDeiEditorUtil
