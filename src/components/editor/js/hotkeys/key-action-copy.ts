import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditor from "../editor";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:复制
 * 复制当前的已选控件
 */
class DDeiKeyActionCopy extends DDeiKeyAction {

  constructor(props: object) {
    super(props)
    this.mode = props.mode
  }

  //模式：copy和cut
  mode: string;

  // ============================ 方法 ===============================
  async action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let selectedControls = ddInstance.stage.selectedModels;
      //存在选中控件
      if (selectedControls?.size > 0) {
        //生成控件HTML
        let copyHtml = '<html><head>';
        copyHtml += '<meta source="ddei">'
        let jsonStr = '['
        let innerHTML = ''
        selectedControls?.forEach((model, key) => {
          if (selectedControls?.size == 1) {
            if (model.baseModelType == "DDeiTable") {
              if (model.curRow == -1 && model.curCol == -1) {
                let json = model.toJSON();
                jsonStr += JSON.stringify(json) + ","
              }
              let html = model.render.getHTML();
              if (html) {
                innerHTML += html
              }
            } else {
              let json = model.toJSON();
              jsonStr += JSON.stringify(json) + ","
            }
          } else {
            let json = model.toJSON();
            jsonStr += JSON.stringify(json) + ","
          }
        })
        if (jsonStr.length > 1) {
          jsonStr = jsonStr.substring(0, jsonStr.length - 1)
          jsonStr += ']'
          ddInstance.stage.copyMode = this.mode
          jsonStr = '{"mode":"' + this.mode + '","data":' + jsonStr + '}'
        } else {
          jsonStr = "";
        }
        copyHtml += jsonStr + '<meta source="ddeiend">'
        copyHtml += '</head><body>' + innerHTML + '</body></html>'
        let blob = new Blob([copyHtml], {
          type: 'text/html'
        })

        //如果不支持剪切板，则采用window对象存储，此时不允许外部复制粘贴
        if (DDeiConfig.ALLOW_CLIPBOARD || DDeiConfig.ALLOW_CLIPBOARD == undefined) {
          try {
            let writeDatas = []
            writeDatas.push(new ClipboardItem({ "text/html": blob }));
            // //获取图片
            // let imgData = await this.copyToImage(ddInstance, Array.from(selectedControls?.values()));
            // writeDatas.push(imgData);

            let cbData = navigator.clipboard;
            cbData.write(writeDatas).then(function () {
              console.log("复制成功");
            }, function (e) {
              console.error("复制失败" + e);
            });
          } catch (e) {
            DDeiConfig.ALLOW_CLIPBOARD = false
          }
        }

        if (!DDeiConfig.ALLOW_CLIPBOARD) {
          window.DDEI_CLIPBOARD = blob
        }
      }
    }
  }

  async copyToImage(ddInstance, models): ClipboardItem {
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
    const blob = await new Promise(resolve => canvas.toBlob(resolve));

    return new ClipboardItem({ "image/png": Promise.resolve(blob) })

  }

}


export default DDeiKeyActionCopy
