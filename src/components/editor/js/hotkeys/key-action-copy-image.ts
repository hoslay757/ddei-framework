import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiUtil from "@/components/framework/js/util";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:复制为图片
 * 复制当前的已选控件
 */
class DDeiKeyActionCopyImage extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    if (DDeiConfig.ALLOW_CLIPBOARD) {
      //修改当前操作控件坐标
      if (ddInstance && ddInstance.stage) {
        //当前激活的图层
        let selectedControls = ddInstance.stage.selectedModels;
        //存在选中控件
        if (selectedControls?.size > 0) {
          let models = Array.from(selectedControls?.values());
          this.copyToImage(ddInstance, models)
        }
      }
    }
  }

  copyToImage(ddInstance, models) {
    //转换为图片
    let canvas = document.createElement('canvas');
    //获得 2d 上下文对象
    let ctx = canvas.getContext('2d');
    //获取缩放比例
    let rat1 = DDeiUtil.getPixelRatio(ctx);
    let stageRatio = ddInstance.stage.getStageRatio()
    ddInstance.render.tempCanvas = canvas;
    //所选择区域的最大范围
    let outRect = DDeiAbstractShape.getOutRectByPV(models);
    let lineOffset = 0//1 * rat1;
    let addWidth = lineOffset
    if (models.length > 1) {
      addWidth = lineOffset * 2
    }

    canvas.setAttribute("width", outRect.width * rat1 + addWidth)
    canvas.setAttribute("height", outRect.height * rat1 + addWidth)
    canvas.style.width = outRect.width * rat1 + addWidth + 'px';
    canvas.style.height = outRect.height * rat1 + addWidth + 'px';
    ctx.translate(-outRect.x * rat1 - lineOffset, -outRect.y * rat1 - lineOffset)

    models.forEach(item => {
      item.render.drawShape();
    })

    canvas.toBlob(blob => {
      let cbData = navigator.clipboard;
      //得到blob对象
      let writeDatas = [new ClipboardItem({ "image/png": Promise.resolve(blob) })]
      cbData.write(writeDatas).then(function () {
        console.log("复制成功");
        //清空临时canvas
        ddInstance.render.tempCanvas = null;
      }, function (e) {
        console.error("复制失败" + e);
        //清空临时canvas
        ddInstance.render.tempCanvas = null;
      });
    }, 'image/png', 1)
  }

}


export default DDeiKeyActionCopyImage
