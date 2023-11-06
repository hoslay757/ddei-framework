import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiUtil from "@/components/framework/js/util";
import { Matrix3, Vector3 } from 'three';
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
              editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
              editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt, true);
              editor.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt, true);
            }
            inputEle.style.display = "none";
            inputEle.style.left = "0px";
            inputEle.style.top = "0px";
            inputEle.style.transform = "";
            inputEle.value = "";
            editor.bus?.executeAll();
            editor.changeState(DDeiEditorState.DESIGNING);
          }
        }
        let rotate = model.getAbsRotate()
        let stageRatio = ddInstance.stage.getStageRatio();
        let pos = new Vector3(fillArea.x * stageRatio, fillArea.y * stageRatio, 1)
        if (rotate != 0) {
          let pv1Pos = model.currentPointVectors[0];
          let modelAbsPos = model.getAbsPosition()
          let dx = (fillArea.x - modelAbsPos.x) * stageRatio
          let dy = (fillArea.y - modelAbsPos.y) * stageRatio
          pos.x = pv1Pos.x + dx
          pos.y = pv1Pos.y + dy
          let pvc = new Vector3(model.centerPointVector.x + dx, model.centerPointVector.y + dy, 1);
          let angle = (rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
          //计算input的正确打开位置，由节点0
          let move1Matrix = new Matrix3(
            1, 0, -pvc.x,
            0, 1, -pvc.y,
            0, 0, 1);
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          let move2Matrix = new Matrix3(
            1, 0, pvc.x,
            0, 1, pvc.y,
            0, 0, 1);
          let m1 = new Matrix3().premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix);
          pos.applyMatrix3(m1)
        }

        inputEle.value = model.text ? model.text : ''
        inputEle.style.fontSize = (model.render.getCachedValue("font.size") * stageRatio) + "px"
        inputEle.style.color = DDeiUtil.getColor(model.render.getCachedValue("font.color"))
        inputEle.style.width = (fillArea.width - 1) * stageRatio + "px";
        inputEle.style.height = (fillArea.height - 1) * stageRatio + "px";
        inputEle.style.left = canvasPos.left + pos.x + 1 + "px";
        inputEle.style.top = canvasPos.top + pos.y + 1 + "px";
        inputEle.style.transform = "rotate(" + rotate + "deg)";
        inputEle.style.backgroundColor = "red"
        inputEle.style.display = "block";
        inputEle.focus()

        inputEle.selectionStart = 0 // 选中开始位置
        inputEle.selectionEnd = inputEle.value.length // 获取输入框里的长度。
        //修改编辑器状态为快捷编辑中
        editor.changeState(DDeiEditorState.QUICK_EDITING);
      }
    }
  }

}


export default DDeiKeyActionStartQuickEdit
