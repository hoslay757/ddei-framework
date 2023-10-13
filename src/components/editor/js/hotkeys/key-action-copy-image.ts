import DDei from "@/components/framework/js/ddei";
import DDeiUtil from "@/components/framework/js/util";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:复制为图片
 * 复制当前的已选控件
 */
class DDeiKeyActionCopyImage extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
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

  copyToImage(ddInstance, models) {
    //转换为图片
    let canvas = document.createElement('canvas');
    //获得 2d 上下文对象
    let ctx = canvas.getContext('2d');
    //获取缩放比例
    let ratio = DDeiUtil.getPixelRatio(ctx);
    ddInstance.render.tempCanvas = canvas;
    //所选择区域的最大范围
    let x1 = Infinity, x2 = 0, y1 = Infinity, y2 = 0;
    models.forEach(item => {
      x1 = Math.min(item.x, x1)
      y1 = Math.min(item.y, y1)
      x2 = Math.max(item.x + item.width, x2)
      y2 = Math.max(item.y + item.height, y2)
    })
    let lineOffset = 1 * ratio / 2;
    let addWidth = lineOffset
    if (models.length > 1) {
      addWidth = lineOffset * 2
    }
    canvas.setAttribute("style", "-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
    canvas.setAttribute("width", Math.abs(x2 - x1) * ratio + addWidth)
    canvas.setAttribute("height", Math.abs(y2 - y1) * ratio + addWidth)
    ctx.translate(-x1 * ratio - lineOffset, -y1 * ratio - lineOffset)
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
    }, 'image/png')
  }

}


export default DDeiKeyActionCopyImage
