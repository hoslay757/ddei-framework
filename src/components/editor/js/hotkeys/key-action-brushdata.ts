import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiEditor from "../editor";
import DDeiEditorState from "../enums/editor-state";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";
import DDeiUtil from "@/components/framework/js/util";
import { cloneDeep } from 'lodash'

/**
 * 键行为:记录当前控件的格式
 */
class DDeiKeyActionBrushData extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //记录当前格式信息，修改状态为刷子状态
    if (ddInstance && ddInstance.stage) {
      let stage = ddInstance.stage
      let editor = DDeiEditor.ACTIVE_INSTANCE;
      let models = Array.from(ddInstance.stage.selectedModels?.values());
      stage.brushData = null
      if (models?.length == 1) {
        if (models[0].baseModelType == 'DDeiTable') {
          let table = models[0]
          let selectedCells = table.getSelectedCells();
          let minMaxColRow = table.getMinMaxRowAndCol(selectedCells);
          stage.brushData = []
          for (let i = minMaxColRow.minRow; i <= minMaxColRow.maxRow; i++) {
            let rowObj = table.rows[i];
            let rowData = []

            for (let j = minMaxColRow.minCol; j <= minMaxColRow.maxCol; j++) {
              let cellObj = rowObj[j];
              rowData.push(cellObj);
            }
            stage.brushData.push(rowData);
          }
          if (stage.brushData.length > 0) {
            editor.changeState(DDeiEditorState.DESIGNING)
            editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
            editor.bus.executeAll();
          }
        } else {

          if (editor.state == DDeiEditorState.QUICK_EDITING) {
            let shadowControl = editor.ddInstance.stage.render.editorShadowControl
            if (shadowControl?.render.isEditoring) {
              let editorText = DDeiUtil.getEditorText();
              //开始光标与结束光标
              let curSIdx = -1
              let curEIdx = -1
              if (editorText) {
                curSIdx = editorText.selectionStart
                curEIdx = editorText.selectionEnd
              }
              stage.brushDataText = cloneDeep(shadowControl.getSptAllStyles(curSIdx, curEIdx))
            }


            delete stage.brushData
            editor.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { image: 'cursor-brush' })
            editor.bus?.executeAll();
          } else {
            let model = models[0]
            stage.brushData = [model]
            delete stage.brushDataText
            editor.changeState(DDeiEditorState.DESIGNING)
            editor.bus?.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
            editor.bus?.push(DDeiEnumBusCommandType.ChangeCursor, { image: 'cursor-brush' })
            editor.bus?.executeAll();
          }

        }

      }

    }
  }

}


export default DDeiKeyActionBrushData
