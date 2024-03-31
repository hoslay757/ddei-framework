import DDeiConfig from "@ddei-core/framework/js/config";
import DDei from "@ddei-core/framework/js/ddei";
import DDeiAbstractShape from "@ddei-core/framework/js/models/shape";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiEditor from "../editor";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";
import DDeiEditorState from "../enums/editor-state";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:复制为图片
 * 复制当前的已选控件
 */
class DDeiKeyActionCopyImage extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei, editor: DDeiEditor): void {
    if (DDeiConfig.ALLOW_CLIPBOARD || DDeiConfig.ALLOW_CLIPBOARD == undefined) {

      //修改当前操作控件坐标
      if (ddInstance && ddInstance.stage) {
        //当前激活的图层
        let selectedControls = ddInstance.stage.selectedModels;
        //存在选中控件
        if (selectedControls?.size > 0) {
          let models = Array.from(selectedControls?.values());
          this.copyToImage(editor, ddInstance, models)
        }
      }


    }
  }

  copyToImage(editor, ddInstance, models) {
    try {
      //转换为图片
      let canvas = document.createElement('canvas');
      //获得 2d 上下文对象
      let ctx = canvas.getContext('2d');
      //获取缩放比例
      let oldRat1 = ddInstance.render.ratio

      //如果高清屏，rat一般大于2印此系数为1保持不变，如果非高清则扩大为2倍保持清晰
      let scaleSize = oldRat1 < 2 ? 2 / oldRat1 : 1
      let rat1 = oldRat1 * scaleSize
      let rat2 = oldRat1 / window.remRatio
      ddInstance.render.ratio = rat1
      ddInstance.render.tempCanvas = canvas;
      //所选择区域的最大范围
      let outRect = DDeiAbstractShape.getOutRectByPV(models);
      let lineOffset = models[0].render.getCachedValue("border.width");
      let addWidth = 0;
      if (lineOffset) {
        addWidth = lineOffset * rat1
        if (models.length > 1) {
          addWidth = lineOffset * 2
        }
      }
      let containerDiv = document.getElementById("ddei-cut-img-div")

      canvas.setAttribute("style", "-webkit-font-smoothing:antialiased;-moz-transform-origin:left top;-moz-transform:scale(" + (1 / rat2) + ");display:block;zoom:" + (1 / rat2));
      let cW = outRect.width * oldRat1 + addWidth
      let cH = outRect.height * oldRat1 + addWidth
      canvas.setAttribute("width", cW)
      canvas.setAttribute("height", cH)
      ctx.scale(1 / scaleSize, 1 / scaleSize)
      ctx.translate(-outRect.x * rat1 + addWidth / 2, -outRect.y * rat1 + addWidth / 2)

      containerDiv.appendChild(canvas)
      models.forEach(item => {
        item.render.drawShape();
      })

      ddInstance.render.ratio = oldRat1
      let dataURL = canvas.toDataURL()
      // let img = new Image()
      // img.setAttribute("style", "position:absolute;left:320px;top:300px;")
      // img.src = dataURL
      // img.onload = function () {
      //   document.body.appendChild(img)
      // }
      containerDiv.removeChild(canvas)

      let blob = DDeiUtil.dataURLtoBlob(dataURL)

      // let img1 = new Image()
      // img1.setAttribute("style", "position:absolute;left:420px;top:300px;")
      // img1.src = URL.createObjectURL(blob);
      // img1.onload = function () {
      //   document.body.appendChild(img1)
      // }

      // canvas.toBlob(blob => {
      let cbData = navigator.clipboard;
      //得到blob对象

      let writeDatas = [new ClipboardItem({ [blob.type]: blob })]
      cbData.write(writeDatas).then(function () {

        //清空临时canvas
        ddInstance.render.tempCanvas = null;
        editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
          parts: ["topmenu"],
        });
        editor.bus.executeAll();
        editor.changeState(DDeiEditorState.DESIGNING);
      }, function (e) {
        //清空临时canvas
        ddInstance.render.tempCanvas = null;
      });
      // }, 'image/png', 1)
    } catch (e) {
      console.error(e)
      DDeiConfig.ALLOW_CLIPBOARD = false
    }

  }

}


export default DDeiKeyActionCopyImage