import DDeiConfig from "@ddei-core/framework/js/config";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";
import DDeiRectContainer from "@ddei-core/framework/js/models/rect-container";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import DDeiKeyAction from "@ddei-core/hotkeys/key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";
import DDeiEditorState from "@ddei-core/editor/js/enums/editor-state";

/**
 * 键行为:关闭弹出框
 * 关闭已打开的的弹出框
 */
class DDeiKeyActionCloseDialog extends DDeiKeyAction {
  name: string = "ddei-core-keyaction-close-dialog"


  /**
   * 缺省实例
   */
  static defaultIns: DDeiKeyActionCloseDialog = new DDeiKeyActionCloseDialog();

  defaultOptions: object = {
    'keys': [
      //ESC关闭弹出框
      { keys: "27", editorState: DDeiEditorState.PROPERTY_EDITING },
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
          if (options[DDeiKeyActionCloseDialog.defaultIns.name]) {
            for (let i in options[DDeiKeyActionCloseDialog.defaultIns.name]) {
              newOptions[i] = options[DDeiKeyActionCloseDialog.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiKeyActionCloseDialog(newOptions);
        return panels;
      }
    }
    return DDeiKeyActionCloseDialog;
  }
  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    DDeiEditorUtil.closeDialogs(["bottom-dialog", "property-dialog", "top-dialog", "toolbox-dialog"])
  }

}


export default DDeiKeyActionCloseDialog
