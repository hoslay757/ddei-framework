import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiLayer from "@/components/framework/js/models/layer";
import DDeiActiveType from "../enums/active-type";
import DDeiFile from "../file";
import DDeiFileState from "../enums/file-state";
import DDeiEditor from "../editor";
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditorUtil from "../util/editor-util";

/**
 * 键行为:反撤销
 * 撤销前一次撤销动作
 */
class DDeiKeyActionReRevoke extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    let editor = DDeiEditor.ACTIVE_INSTANCE;
    let histype = DDeiEditorUtil.getConfigValue("HISTROY_LEVEL", editor);
    if (histype == 'file') {
      if (editor?.files.length > 0 && (editor.currentFileIndex == 0 || editor.currentFileIndex)) {
        let file = editor?.files[editor.currentFileIndex]
        //从历史恢复文件
        if (file?.active == DDeiActiveType.ACTIVE) {
          let hisData = file.reRevokeHistroyData();
          if (hisData?.data) {
            let jsonData = JSON.parse(hisData?.data)
            if (jsonData) {
              let ddInstance = editor?.ddInstance;
              let hisFile = DDeiFile.loadFromJSON(jsonData, {
                currentDdInstance: ddInstance,
              });
              if (hisData.isNew == true) {
                file.state = DDeiFileState.NONE;
              } else {
                file.state = DDeiFileState.MODIFY
              }
              file.name = hisFile?.name;
              file.desc = hisFile?.desc;
              file.lastUpdateTime = hisFile?.lastUpdateTime;
              file.sheets = hisFile?.sheets;
              if (file && file.sheets && ddInstance) {
                file.changeSheet(hisFile.currentSheetIndex);
                let stage = file.sheets[file.currentSheetIndex].stage;
                stage.ddInstance = ddInstance;
                //刷新页面
                ddInstance.stage = stage;
                //加载场景渲染器
                stage.initRender();
                ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
                ddInstance?.bus?.executeAll();
                editor?.editorViewer.forceRefreshBottomMenu();
                editor?.editorViewer.forcePropertyView();
                editor?.editorViewer.forceRefreshOpenFilesView();
                editor?.editorViewer.forceRefreshTopMenuView();
              }
            }
          }
        }
      }
    } else if (histype == 'stage') {
      //修改当前操作控件坐标
      if (ddInstance && ddInstance.stage) {
        let hisData = ddInstance.stage.reRevokeHistroyData();
        if (hisData?.data) {
          let jsonData = JSON.parse(hisData?.data)
          if (jsonData) {
            let tempData = { "currentDdInstance": ddInstance, "currentStage": ddInstance.stage }
            tempData[ddInstance.stage.id] = ddInstance.stage
            let layers = [];
            jsonData.layers.forEach(layer => {
              let model = DDeiLayer.loadFromJSON(layer, tempData);
              layers.push(model);
            })
            ddInstance.stage.idIdx = jsonData.idIdx;
            ddInstance.stage.layers = layers
            ddInstance.stage.initRender();
            //渲染图形
            ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
            ddInstance?.bus?.executeAll();
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            editor?.editorViewer?.forceRefreshBottomMenu();
            editor?.editorViewer?.forcePropertyView();
            editor?.editorViewer?.forceRefreshOpenFilesView();
          }
        }

      }
    }
  }

}


export default DDeiKeyActionReRevoke
