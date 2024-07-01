import DDeiEditorArrtibute from "./attribute/editor-attribute";
import DDeiAbstractShape from "../../framework/js/models/shape";
import DDeiEditor from "./editor";
import DDeiConfig from "../../framework/js/config";
import DDeiUtil from "../../framework/js/util";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "./enums/editor-command-type";
import DDeiEditorState from "./enums/editor-state";
import DDeiLineLink from "../../framework/js/models/linelink";
import { Matrix3 } from "three";
import DDeiRectContainer from "../../framework/js/models/rect-container";
import DDei from "../../framework/js/ddei";
import DDeiFuncCallResult from "@ddei-core/lifecycle/callresult";

class DDeiEditorUtil {

  // ============================ 静态方法 ============================

  //最新使用的工具栏
  static recentlyToolGroups = null

  //外部传入的图标定义
  static ICONS = null

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
    let CTIVE_INSTANCE;
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
            delete ddInstance.stage.brushDataText
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
          inputEle.onkeyup = function (evt) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            editor.bus.push(DDeiEnumBusCommandType.TextEditorChangeSelectPos);
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
   * 获取样式属性值
   * @param name 属性名称
   * @param ddInstance ddei实例
   */
  static getStyleValue(name: string, ddInstance: DDei) {
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance);
    let element = document.getElementById(editor.containerid); // 替换为你想要获取变量的元素id
    let styles = getComputedStyle(element);
    let cssVariable = styles.getPropertyValue('--' + name); // 替换为你想获取的CSS变量名
    return cssVariable;
  }

  static getEditorId(ddInstance: DDei) {
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance);
    
    return editor.id;
  }

  static getEditorInsByDDei(ddInstance:DDei){
    let editor;
    if (ddInstance){
      DDeiEditor.INSTANCE_POOL.forEach(editorIns => {
        if (editorIns.ddInstance == ddInstance || editorIns.ddInstance?.id == ddInstance?.id) {
          editor = editorIns;
        }
      })
    }
    if (!editor) {
      editor = DDeiEditor.ACTIVE_INSTANCE;
    }
    return editor;
  }

  static notifyChange(ddInstance: DDei):void {
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance);
    editor?.notifyChange();
  }

  //钩子函数,判断当前实例是否可以在后台激活，允许后台激活的实例，在当前实例为非ACTIVE_INSTANCE时，依然能够执行部分后台操作
  static isBackActive(ddInstance:DDei):boolean{
    if (!ddInstance){
      return false
    }else{
      let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance);
      if (!editor){
        return false
      }else{
        return (DDeiEditor.ACTIVE_INSTANCE && editor.id == DDeiEditor.ACTIVE_INSTANCE.id) || editor.GLOBAL_ALLOW_BACK_ACTIVE
      }
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
  static getSubControlJSON(modelCode: string,ddInstance:DDei): object {
    //如果存在初始化子控件的json，则记录在类变量上
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance);
    let controlDefine = editor.controls?.get(modelCode);
    if (controlDefine.subcontrol) {
      let subControlDefine = editor.controls?.get(controlDefine.subcontrol);
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
  static getMenuControlId(editor:DDeiEditor|undefined|null): string {
    return editor.id+"_menu_dialog"
  }

  /**
   * 显示菜单
   */
  static showContextMenu(control: any,ddInstance:DDei, evt: Event): void {
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance)
    let menuJSON = DDeiUtil.getMenuConfig(control, editor);

    if (menuJSON?.length > 0 && editor?.setCurrentMenu) {
      //记录当前控件
      let stage = ddInstance.stage;
      if (stage) {
        stage.render.currentMenuShape = control;
        //显示菜单
        editor.setCurrentMenu(menuJSON);
        let menuDialogId = DDeiUtil.getMenuControlId(editor);
        let menuEle = document.getElementById(menuDialogId);
        let elePos = DDeiUtil.getDomAbsPosition(evt.currentTarget,editor)
        if (menuEle) {
          if (elePos.left + 200 > document.body.clientWidth) {
            menuEle.style.left = (document.body.clientWidth-200) + "px";
          } else {
            menuEle.style.left = elePos.left + "px";
          }

          if (elePos.top + menuJSON.length * 40 > document.body.clientHeight) {
            menuEle.style.top = (document.body.clientHeight - menuJSON.length * 40) + "px";
          } else {
            menuEle.style.top = elePos.top + "px";
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
  static getMenuConfig(model: object, editor: DDeiEditor | null | undefined): object | null {
    if (editor?.menuMapping){
      let menus = editor?.menuMapping[model?.modelType]
      if (menus?.length > 0){
        return menus;
      }
    }
  }

  /**
   * 从配置定义中获取属性值，优先从code中获取，其次从mapping获取
   * @param configModel 配置模型，如果包含了attrDefineMap等数据，则直接获取数据,如果只包含id则通过id取原始数据
   * @param paths 属性路径,支持传入多个
   * @return 由构成的属性的实际路径和配置中对应的值组成的Map
   */
  static getAttrValueByConfig(configModel: object, paths: string[] | string,editor:DDeiEditor|null|undefined): Map<string, object> {
    if (!editor){
      if (configModel.modelType == 'DDeiStage'){
        editor = DDeiEditorUtil.getEditorInsByDDei(configModel.ddInstance)
      }else{
        editor = DDeiEditorUtil.getEditorInsByDDei(configModel.stage?.ddInstance)
      }
      
    }
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
        let control = editor.controls?.get(id);
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
    let editor = DDeiEditorUtil.getEditorInsByDDei(configModel.stage?.ddInstance)
    let id = configModel.modelCode ? configModel.modelCode : configModel.id;
    //找到控件定义
    return editor.controls?.get(id);
  }

  /**
    * 获取数据源数据
    */
  static getDataSource(editor:DDeiEditor, attrDefine: DDeiEditorArrtibute, searchText: string | null = null): object[] | null {
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
          let data = editor[configData];
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
            if (DDeiEditorUtil.ICONS && DDeiEditorUtil.ICONS[item.img]) {
              item.img = DDeiEditorUtil.ICONS[item.img].default;
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
   * @param el 事件的元素
   */
  static showDialog(editor:DDeiEditor, id: string, data: object, pos: object, el: object, isPop: boolean = false, keepState: boolean = false) {
    if (!isPop && !editor.tempDialogData) {
      editor.tempDialogData = {}
    } else if (isPop && !editor.tempPopData) {
      editor.tempPopData = {}
    }
    //查看是否有同一group的弹出框，如果有则关闭同一group的其它弹出框
    if (data.group) {
      let loopData
      if (isPop) {
        loopData = editor.tempPopData
      } else {
        loopData = editor.tempDialogData
      }
      for (let oid in loopData) {
        if (oid != id) {
          let otherDialogData = loopData[oid]
          if (otherDialogData && otherDialogData.group == data.group) {
            DDeiEditorUtil.closeDialog(editor,oid)
          }
        }
      }

    }
    //记录临时变量
    if (data) {
      data.keepState = keepState
    }
    if (isPop) {
      editor.tempPopData[id] = data
    } else {
      editor.tempDialogData[id] = data
      if (!keepState) {
        editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      }
    }

    //修改编辑器状态为快捷编辑中
    editor?.dialogs[id]?.viewer?.forceRefreshView();
    setTimeout(() => {
      if (!pos?.hiddenMask) {
        // let editor = DDeiEditor.ACTIVE_INSTANCE;
        let backEle = document.getElementById(editor.id+"_dialog_background_div");
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
      }

      let dialog = document.getElementById(editor.id+"_"+id);
      if (dialog){
        dialog.style.display = "block";
        let msgEle = dialog.getElementsByClassName("msg")[0];
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
            //自由设置位置
            case 99: {
              left = pos.left
              top = pos.top
            } break;
            //基于触发元素的底部
            case 2: {
              let absPos = DDeiUtil.getDomAbsPosition(el, editor)
              left = absPos.left + (pos.dx ? pos.dx : 0)
              top = (absPos.top - dialog?.clientHeight + (pos.dy ? pos.dy : 0))
            } break;
            //基于触发元素的底部居中
            case 3: {
              let absPos = DDeiUtil.getDomAbsPosition(el, editor)
              left = absPos.left - (dialog.clientWidth / 2 - el.clientWidth / 2) + (pos.dx ? pos.dx : 0)
              top = (absPos.top - dialog?.clientHeight + (pos.dy ? pos.dy : 0))
            } break;
            //基于触发元素的顶部
            case 4: {
              let absPos = DDeiUtil.getDomAbsPosition(el, editor)
              left = absPos.left + (pos.dx ? pos.dx : 0)
              top = (absPos.top + el.clientHeight + (pos.dy ? pos.dy : 0))
            } break;
            //基于触发元素的顶部居中
            case 5: {
              let absPos = DDeiUtil.getDomAbsPosition(el, editor)
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
      }
    }, 50);



  }

  /**
   * 显示弹出框
   * @param id 弹出框ID
   * @param pos 位置信息
   * @param el 事件的元素
   */
  static displayDialog(editor: DDeiEditor, id: string, data: object, pos: object, el: object) {
    if (!pos?.hiddenMask) {
      let backEle = document.getElementById(editor.id + "_dialog_background_div");
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
    }

    let dialog = document.getElementById(editor.id+"_"+id);
    if(dialog){
      dialog.style.display = "block";

      //设置位置信息
      if (pos?.type) {
        let left, top
        switch (pos.type) {
          //自由设置位置
          case 99: {
            left = pos.left
            top = pos.top
          } break;
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
    }



  }

  /**
   * 隐藏弹出框
   * @param id 弹出框ID
   */
  static hiddenDialog(editor: DDeiEditor, id: string) {
    let backEle = document.getElementById(editor.id + "_dialog_background_div");
    if (backEle) {
      backEle.style.display = "none"
    }
    let dialogEle = document.getElementById(editor.id+"_"+id);
    if (dialogEle) {
      dialogEle.style.display = "none"
    }
  }


  /**
   * 关闭弹出框
   * @param id 
   */
  static closeDialog(editor: DDeiEditor, id: string, isPop: boolean = false) {
    let dialog = document.getElementById(editor.id+"_"+id);
    if (dialog){
      dialog.style.display = "none";
    }
    let dialogData
    if (!isPop && editor.tempDialogData) {
      dialogData = editor.tempDialogData[id]
      editor.tempDialogData[id] = null
    } else if (isPop && editor.tempPopData) {
      dialogData = editor.tempPopData[id]
      editor.tempPopData[id] = null
    }
    
    let backEle = document.getElementById(editor.id + "_dialog_background_div");
    if (backEle){
      backEle.style.background = "none"
      backEle.style.display = "none";
    }
    if (!dialogData || !dialogData.keepState) {
      editor.changeState(DDeiEditorState.DESIGNING);
    }
  }

  static closeDialogs(editor: DDeiEditor, groups: string[], isPop: boolean = false) {
    if (isPop) {

      for (let oid in editor.tempPopData) {
        let otherDialogData = editor.tempPopData[oid]
        if (otherDialogData && (groups && groups.indexOf(otherDialogData.group) != -1 || !groups || groups.length == 0)) {
          DDeiEditorUtil.closeDialog(editor,oid, isPop)
        }
      }
    } else {
      for (let oid in editor.tempDialogData) {
        let otherDialogData = editor.tempDialogData[oid]
        if (otherDialogData && (groups && groups.indexOf(otherDialogData.group) != -1 || !groups || groups.length == 0)) {
          DDeiEditorUtil.closeDialog(editor,oid, isPop)
        }
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
  static showOrCloseDialog(editor: DDeiEditor, id: string, data: object, pos: object, el: object, isPop: boolean = false, keepState: boolean = false) {
    if (!isPop && editor.tempDialogData && editor.tempDialogData[id]) {
      DDeiEditorUtil.closeDialog(editor,id, isPop)
    } else if (isPop && editor.tempPopData && editor.tempPopData[id]) {
      DDeiEditorUtil.closeDialog(editor,id, isPop)
    } else {
      DDeiEditorUtil.showDialog(editor,id, data, pos, el, isPop, keepState)
    }
  }


  /**
   * 获取控件的小图标
   */
  static getControlIcons(editor: DDeiEditor): Promise{
    return new Promise((resolve, reject) => {
      if (editor.icons && JSON.stringify(editor.icons) != "{}") {
        resolve(editor.icons);
      } else {
        if (editor.ddInstance) {
          let promiseArr = []
          let ddInstance = editor.ddInstance
          editor.icons = {}
          editor?.controls.forEach(controlDefine => {
            let cacheData = localStorage.getItem("ICON-CACHE-" + editor.id+"-" + controlDefine.id)
            if (cacheData) {
              editor.icons[controlDefine.id] = cacheData
              return;
            } else {
              promiseArr.push(new Promise((resolve, reject) => {
                try {
                  let canvas = document.createElement('canvas');
                  //获取缩放比例
                  let rat1 = ddInstance.render.ratio;
                  ddInstance.render.tempCanvas = canvas;
                  //创建图形对象
                  let models = DDeiEditorUtil.createControl(controlDefine,editor)
                  let iconPos = controlDefine?.define?.iconPos;
                  let outRect = DDeiAbstractShape.getOutRectByPV(models);
                  outRect.width += (iconPos?.dw ? iconPos.dw : 0)
                  outRect.height += (iconPos?.dh ? iconPos.dh : 0)
                  //基准大小
                  let baseWidth = 50
                  let baseHeight = 50

                  //按高度缩放
                  if (outRect.width > 0 && outRect.height > 0) {
                    if (outRect.width > outRect.height) {
                      baseWidth *= outRect.width / outRect.height
                    } else {
                      baseHeight *= outRect.height / outRect.width
                    }

                    //构建缩放矩阵，缩放到基准大小
                    let scaleMatrix = new Matrix3(
                      baseWidth / outRect.width, 0, 0,
                      0, baseHeight / outRect.height, 0,
                      0, 0, 1);
                    models.forEach(model => {
                      model.transVectors(scaleMatrix)
                    });

                    outRect = DDeiAbstractShape.getOutRectByPV(models);
                  }
                  if (!outRect.height) {
                    outRect.height = baseHeight
                  }
                  if (!outRect.width) {
                    outRect.width = baseWidth
                  }
                  outRect.width += (iconPos?.dw ? iconPos.dw : 0)
                  outRect.height += (iconPos?.dh ? iconPos.dh : 0)
                  let width = (outRect.width + 4) * rat1
                  let height = (outRect.height + 4) * rat1

                  canvas.setAttribute("width", width)
                  canvas.setAttribute("height", height)
                  canvas.style.width = width + 'px';
                  canvas.style.height = height + 'px';
                  //获得 2d 上下文对象

                  let ctx = canvas.getContext('2d', { willReadFrequently: true });

                  ctx.translate(width / 2 + (iconPos?.dx ? iconPos.dx : 0), height / 2 + (iconPos?.dy ? iconPos.dy : 0))
                  models.forEach(model => {
                    model.initRender()
                    model.render.drawShape({ weight: 3, border: { width: 1.5 } })
                  })
                  let dataURL = canvas.toDataURL("image/png");
                  localStorage.setItem("ICON-CACHE-" + editor.id + "-" + controlDefine.id, dataURL)
                  editor.icons[controlDefine.id] = dataURL
                } catch (e) { console.error(e) }
                resolve()
              }));
            }
          });
          Promise.all(promiseArr).then(all => {
            ddInstance.render.tempCanvas = null;
            resolve(editor.icons)
          })
        }
      }
    });
  }

  /**
   * 清空控件小图标
   */
  static clearControlIcons(editor: DDeiEditor):void{
    editor.icons = {}
    editor?.controls.forEach(controlDefine => {
      localStorage.removeItem("ICON-CACHE-" +editor.id+"-"+ controlDefine.id)
    })
  }


  /**
    * 创建控件
    */
  static createControl(control, editor:DDeiEditor):[] {
    let ddInstance: DDei = editor.ddInstance;
    ddInstance.render.inEdge = 0;
    let stage = ddInstance.stage;
    let layer = stage.layers[stage.layerIndex];
    let models = [];

    let cc = control


    //根据control的定义，初始化临时控件，并推送至上层Editor
    let searchPaths = [
      "width",
      "height",
      "text",
      "subcontrol",
      "layout",
    ];
    let configAtrs = DDeiEditorUtil.getAttrValueByConfig(
      cc,
      searchPaths
    );

    stage.idIdx++
    let dataJson = {
      id: cc.code + "_" + (stage.idIdx),
      modelCode: cc.id,
    };


    //设置配置的属性值
    searchPaths.forEach((key) => {
      if (configAtrs.get(key)) {
        dataJson[key] = configAtrs.get(key).data;
      }
      if (cc[key] != undefined && cc[key] != null) {
        dataJson[key] = cc[key];
      }
    });
    if (cc.img) {
      dataJson.fill = { type: 2, image: cc.img };
    }
    for (let i in cc?.define) {
      dataJson[i] = cc.define[i];
    }
    //如果有from则根据from读取属性
    delete dataJson.ovs
    let model: DDeiAbstractShape = editor.controlModelClasses[cc.type].initByJSON(
      dataJson,
      { currentStage: stage, currentLayer: layer,currentDdInstance:ddInstance }
    );
    models.push(model)
    //处理others
    control.others?.forEach(oc => {
      let otherModels = DDeiEditorUtil.createControl(oc, editor)
      if (otherModels?.length > 0) {
        models = models.concat(otherModels);
      }
    });


    //处理merge和create=false
    if (control?.define?.create == false) {
      models.splice(0, 1)
    }

    //添加初始linkModels以及控件关联
    if (control?.define?.iLinkModels) {
      for (let ilk in control?.define?.iLinkModels) {
        let linkData = control?.define?.iLinkModels[ilk]
        let cIndex = parseInt(ilk)
        if (cIndex != -1) {
          cIndex++
          let linkControl = models[cIndex]
          let lineLink = new DDeiLineLink({
            line: cc,
            type: linkData.type,
            dm: linkControl,
            dx: linkData.dx,
            dy: linkData.dy,
          })
          models[0].linkModels.set(linkControl.id, lineLink);
        }
      }
    }
    //添加初始merge
    if (control?.define?.initMerges) {

      let mergeControls = [models[0]]
      for (let m in control?.define?.initMerges) {
        let mIndex = control?.define?.initMerges[m];
        if (mIndex != -1) {
          mIndex++
          let mControl = models[mIndex]
          if (mergeControls.indexOf(mControl) == -1) {
            mergeControls.push(mControl)
          }
        }
      }
      //执行控件合并
      if (mergeControls.length > 1) {
        let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
        let stageRatio = ddInstance.stage?.getStageRatio()
        //获取选中图形的外接矩形
        let outRect = DDeiAbstractShape.getOutRectByPV(mergeControls);
        //创建一个容器，添加到画布,其坐标等于外接矩形
        let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
          id: "comp_" + ddInstance.stage.idIdx,
          initCPV: {
            x: outRect.x + outRect.width / 2,
            y: outRect.y + outRect.height / 2,
            z: 1
          },
          layout: "compose",
          modelCode: "100202",
          fill: {
            type: 0
          },
          border: {
            top: { type: 0 }
          },
          width: outRect.width / stageRatio,
          height: outRect.height / stageRatio
        },
          {
            currentLayer: layer,
            currentStage: ddInstance.stage,
            currentContainer: layer
          });

        mergeControls.forEach(mc => {
          if (mc) {
            container.addModel(mc)
            mc.pModel = container
          }
        })
        //更新新容器大小
        container?.changeParentsBounds()
        //下标自增1
        ddInstance.stage.idIdx++;
        //返回合并后的控件
        models.splice(0, mergeControls.length, container);
      }
    }
    return models;

  }


  /**
   * 执行调用回调函数
   * @param ddInstance ddeis实例
   * @param editor 设计器对象实例
   */
  static invokeCallbackFunc(name: string, operate:any, data:any,ddInstance:DDei,evt:Event):number{
    let result = 0;
    let editor = DDeiEditorUtil.getEditorInsByDDei(ddInstance)
    let selectAfter = DDeiUtil.getConfigValue(name, ddInstance);
    let funcArr = editor.funcIndex.get(name)
    let callResult = new DDeiFuncCallResult();
    if (selectAfter) {
      
      let cr = selectAfter(operate, data, ddInstance, evt);
      callResult = cr ? cr : callResult
    }
    if (callResult?.state > 0) {
      result = 1;
    } else if (callResult?.state < 0) {
      result = -1;
    }
    if (callResult.state == 0 || callResult.state == 1 || callResult.state == -1){
      if (funcArr?.length > 0) {
        for (let fa = 0; fa < funcArr.length; fa++) {
          let func = funcArr[fa]["func"]
          if (func) {
            callResult = func(operate, data, ddInstance, evt);
            if (callResult){
              if (callResult.state > 0){
                result = 1;
              } else if (callResult.state < 0) {
                result = -1;
              }
              if (!(callResult.state == 0 || callResult.state == 1 || callResult.state == -1)) {
                break;
              }
            }
          }
        }
      }
    }

    return result;
  }



}
export { DDeiEditorUtil}
export default DDeiEditorUtil
