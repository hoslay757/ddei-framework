import DDei from "@ddei-core/framework/js/ddei";
import DDeiEnumControlState from "@ddei-core/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiActiveType from "../enums/active-type";
import DDeiStoreLocal from "@ddei-core/framework/js/store/local-store";
import DDeiFileState from "../enums/file-state";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";

/**
 * 键行为:保存文件
 * 保存当前文件
 * TODO做成配置和扩展点，让保存操作走向后端
 */
class DDeiKeyActionSaveFile extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    ddInstance.bus?.push(DDeiEditorEnumBusCommandType.SaveFile, {}, evt)
    ddInstance.bus?.executeAll()
  }

}


export default DDeiKeyActionSaveFile
