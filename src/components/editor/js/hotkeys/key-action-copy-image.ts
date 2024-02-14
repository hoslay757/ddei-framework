import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiUtil from "@/components/framework/js/util";
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
      let rat1 = DDeiUtil.getPixelRatio(ctx);
      ddInstance.render.tempCanvas = canvas;
      //所选择区域的最大范围
      let outRect = DDeiAbstractShape.getOutRectByPV(models);
      let lineOffset = models[0].render.getCachedValue("border.width");
      let addWidth = 0;
      if (lineOffset) {
        addWidth = lineOffset * 2 * rat1
        if (models.length > 1) {
          addWidth = lineOffset * 2
        }
      }

      canvas.setAttribute("width", outRect.width * rat1 + addWidth)
      canvas.setAttribute("height", outRect.height * rat1 + addWidth)
      canvas.style.width = outRect.width * rat1 + addWidth + 'px';
      canvas.style.height = outRect.height * rat1 + addWidth + 'px';
      ctx.translate(-outRect.x * rat1 + lineOffset / 2, -outRect.y * rat1 + lineOffset / 2)

      models.forEach(item => {
        item.render.drawShape();
      })

      canvas.toBlob(blob => {
        let cbData = navigator.clipboard;
        //得到blob对象
        let writeDatas = [new ClipboardItem({ "image/png": Promise.resolve(blob) })]
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
      }, 'image/png', 1)
    } catch (e) {
      DDeiConfig.ALLOW_CLIPBOARD = false
    }

  }

}


export default DDeiKeyActionCopyImage
