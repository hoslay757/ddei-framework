import DDeiConfig from "@ddei-core/framework/js/config";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";
import DDeiRectContainer from "@ddei-core/framework/js/models/rect-container";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import DDeiKeyAction from "@ddei-core/hotkeys/key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEditorState from "@ddei-core/editor/js/enums/editor-state";

/**
 * 键行为:组合
 * 组合已选择的图形，至少两个图形才可以完成组合
 */
class DDeiKeyActionCompose extends DDeiKeyAction {
  name: string = "ddei-core-keyaction-compose"


  /**
   * 缺省实例
   */
  static defaultIns: DDeiKeyActionCompose = new DDeiKeyActionCompose();

  defaultOptions: object = {
    'keys': [
      //组合
      { keys: "71", ctrl: 1, editorState: DDeiEditorState.DESIGNING },
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
          if (options[DDeiKeyActionCompose.defaultIns.name]) {
            for (let i in options[DDeiKeyActionCompose.defaultIns.name]) {
              newOptions[i] = options[DDeiKeyActionCompose.defaultIns.name][i]
            }
          }
        }
      } else {
        newOptions = options
      }
      if (newOptions && Object.keys(newOptions).length !== 0) {
        let panels = new DDeiKeyActionCompose(newOptions);
        return panels;
      }
    }
    return DDeiKeyActionCompose;
  }
  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance) {
      //当前激活的图层
      ddInstance.bus.push(DDeiEnumBusCommandType.ModelMerge, null, evt);
      ddInstance.bus.executeAll();

    }
  }

}


export default DDeiKeyActionCompose
