import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiKeyAction from "@ddei-core/hotkeys/key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorState from "@ddei-core/editor/js/enums/editor-state";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";

/**
 * 键行为:清除格式刷格式
 */
class DDeiKeyActionClearBrushData extends DDeiKeyAction {

  name: string = "ddei-core-keyaction-clear-brushdata"


  /**
   * 缺省实例
   */
  static defaultIns: DDeiKeyActionClearBrushData = new DDeiKeyActionClearBrushData();

  defaultOptions: object = {
    'keys': [
      { keys: "27", editorState: DDeiEditorState.DESIGNING },
    ]
  }

  getHotKeys(editor) {
    return [this];
  }


  static configuraton(options, fullConfig: boolean = false) {
    //解析options，只使用自己相关的
    if (options) {
      let newOptions = {}
      if (fullConfig) {
        if (fullConfig) {
          if (options[DDeiKeyActionClearBrushData.defaultIns.name]) {
            for (let i in options[DDeiKeyActionClearBrushData.defaultIns.name]) {
              newOptions[i] = options[DDeiKeyActionClearBrushData.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiKeyActionClearBrushData(newOptions);
        return panels;
      }
    }
    return DDeiKeyActionClearBrushData;
  }
  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //记录当前格式信息，修改状态为刷子状态
    if (ddInstance && ddInstance.stage) {
      let stage = ddInstance.stage
      if (stage) {
        stage.brushData = null;
        ddInstance?.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'default' })
        ddInstance?.bus?.executeAll();
      }
    }
  }

}


export default DDeiKeyActionClearBrushData
