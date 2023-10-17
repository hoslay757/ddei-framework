import DDei from "@/components/framework/js/ddei";
import DDeiUtil from "@/components/framework/js/util";
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
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let selectedControls = ddInstance.stage.selectedModels;
      //存在选中控件
      if (selectedControls?.size > 0) {
        //生成控件HTML
        let cbData = navigator.clipboard;
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
          jsonStr = '{"mode":"' + this.mode + '","data":' + jsonStr + '}'
        } else {
          jsonStr = "";
        }
        copyHtml += jsonStr + '<meta source="ddeiend">'
        copyHtml += '</head><body>' + innerHTML + '</body></html>'
        let blob = new Blob([copyHtml], {
          type: 'text/html'
        })
        let writeDatas = [new ClipboardItem({ "text/html": blob })]
        cbData.write(writeDatas).then(function () {
          console.log("复制成功");
        }, function (e) {
          console.error("复制失败" + e);
        });
      }
    }
  }

}


export default DDeiKeyActionCopy
