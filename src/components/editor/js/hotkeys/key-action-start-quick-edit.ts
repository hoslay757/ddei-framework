import DDei from "@/components/framework/js/ddei";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiUtil from "@/components/framework/js/util";
import { styles } from "../../configs/controls/circle";
import DDeiEditor from "../editor";
import DDeiEditorState from "../enums/editor-state";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:开启快捷编辑
 * 开启快捷编辑
 */
class DDeiKeyActionStartQuickEdit extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //获取当前编辑控件
    if (ddInstance.stage?.selectedModels?.size == 1) {
      let model = Array.from(ddInstance.stage?.selectedModels.values())[0]
      let editor = DDeiEditor.ACTIVE_INSTANCE;

      editor.quickEditorModel = model;
      if (model?.render) {
        if (model.baseModelType == 'DDeiTable') {
          let selectCells = model.getSelectedCells();
          if (selectCells?.length == 1) {
            model = selectCells[0];
            editor.quickEditorModel = model;
          } else {
            editor.quickEditorModel = null;
            return;
          }
        }

        //获取控件所占区域
        let fillArea = model.render.getFillArea();
        let canvasPos = DDeiUtil.getDomAbsPosition(ddInstance.render.canvas);
        //创建大文本框
        let inputId = editor.id + "_quickeditor";
        let inputEle = document.getElementById(inputId);
        if (!inputEle) {
          inputEle = document.createElement("textarea")
          inputEle.setAttribute("id", inputId)
          inputEle.setAttribute("style", "border:none;resize:none;padding:0;z-index:9999;position:absolute;left:0;top:0;display:none;outline:none;");
          document.body.appendChild(inputEle);
          editor.quickEditorInput = inputEle;
          inputEle.onblur = function () {
            //设置属性值
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            if (editor.quickEditorModel) {
              editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { models: [editor.quickEditorModel], paths: ["text"], value: inputEle.value }, evt, true);
              editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt, true);
              editor.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt, true);
            }
            inputEle.style.display = "none";
            inputEle.style.left = "0px";
            inputEle.style.top = "0px";
            inputEle.value = "";
            editor.bus?.executeAll();
            editor.changeState(DDeiEditorState.DESIGNING);
          }
        }
        inputEle.value = model.text ? model.text : ''
        inputEle.style.fontSize = model.render.getCachedValue("font.size") + "px"
        inputEle.style.color = DDeiUtil.getColor(model.render.getCachedValue("font.color"))
        inputEle.style.width = fillArea.width - 1 + "px";
        inputEle.style.height = fillArea.height - 1 + "px";
        inputEle.style.left = canvasPos.left + fillArea.x + 1 + "px";
        inputEle.style.top = canvasPos.top + fillArea.y + 1 + "px";
        inputEle.style.display = "block";
        inputEle.focus()

        inputEle.selectionStart = 0 // 选中开始位置
        inputEle.selectionEnd = inputEle.value.length // 获取输入框里的长度。
        //修改编辑器状态为控件创建中
        editor.changeState(DDeiEditorState.QUICK_EDITING);
      }
    }
  }

}


export default DDeiKeyActionStartQuickEdit
