import DDei from "@/components/framework/js/ddei";
import DDeiUtil from "@/components/framework/js/util";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:复制
 * 复制当前的已选控件
 */
class DDeiKeyActionCopy extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let selectedControls = ddInstance.stage.selectedModels;
      //存在选中控件
      if (selectedControls?.size > 0) {
        let cbData = navigator.clipboard;
        //生成控件HTML
        let models = Array.from(selectedControls?.values());
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
        canvas.setAttribute("style", "-moz-transform-origin:left top;-moz-transform:scale(" + (1 / ratio) + ");display:block;zoom:" + (1 / ratio));
        canvas.setAttribute("width", Math.abs(x2 - x1) * ratio + lineOffset)
        canvas.setAttribute("height", Math.abs(y2 - y1) * ratio + lineOffset)
        ctx.translate(-x1 * ratio - lineOffset, -y1 * ratio - lineOffset)
        models.forEach(item => {
          item.render.drawShape();
        })
        canvas.toBlob(blob => {
          //得到blob对象
          let writeData = [new ClipboardItem({ "image/png": Promise.resolve(blob) })];
          cbData.write(writeData).then(function () {
            console.log("复制成功");
            //清空临时canvas
            ddInstance.render.tempCanvas = null;
          }, function () {
            console.error("复制失败");
            //清空临时canvas
            ddInstance.render.tempCanvas = null;
          });
        }, 'image/png')






      }
    }
  }

}


export default DDeiKeyActionCopy
