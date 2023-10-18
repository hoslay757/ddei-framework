import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiLayer from "@/components/framework/js/models/layer";
import DDeiEditor from "../editor";
import DDeiActiveType from "../enums/active-type";
import DDeiFile from "../file";
import DDeiFileState from "../enums/file-state";

/**
 * 键行为:撤销
 * 撤销上一步操作
 */
class DDeiKeyActionRevoke extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    if (DDeiEditor.HISTROY_LEVEL == 'file') {
      let editor = DDeiEditor.ACTIVE_INSTANCE;
      if (editor?.files.length > 0 && (editor.currentFileIndex == 0 || editor.currentFileIndex)) {
        let file = editor?.files[editor.currentFileIndex]
        //从历史恢复文件
        if (file?.active == DDeiActiveType.ACTIVE) {
          let hisData = file.revokeHistroyData();
          if (hisData?.data) {
            let jsonData = JSON.parse(hisData?.data)
            if (jsonData) {
              let ddInstance = editor?.ddInstance;
              let hisFile = DDeiFile.loadFromJSON(jsonData, {
                currentDdInstance: ddInstance,
              });

              file.state = DDeiFileState.NONE;
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
                editor?.viewEditor.forceRefreshBottomMenu();
                editor?.viewEditor.forcePropertyView();
              }
            }
          }
        }
      }
    } else if (DDeiEditor.HISTROY_LEVEL == 'stage') {
      //修改当前操作控件坐标
      if (ddInstance && ddInstance.stage) {
        let hisData = ddInstance.stage.revokeHistroyData();
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
            editor?.viewEditor?.forceRefreshBottomMenu();
            editor?.viewEditor?.forcePropertyView();
          }
        }

      }
    }

  }

}


export default DDeiKeyActionRevoke
