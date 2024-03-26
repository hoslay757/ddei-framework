import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditor from "../editor";
import DDeiEditorEnumBusCommandType from "../enums/editor-command-type";
import DDeiEditorState from "../enums/editor-state";
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
  async action(evt: Event, ddInstance: DDei, editor: DDeiEditor): void {
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
        let jsonLinksStr = '['
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
          //如果控件为线段，则复制linkModels
          if (model.baseModelType == "DDeiLine") {
            let distModelLinks = ddInstance.stage?.getDistModelLinks(model.id)
            //如果被复制的控件也在linkmodels里面，则需要复制linkModel信息
            distModelLinks?.forEach(link => {
              if (selectedControls?.has(link?.sm?.id)) {
                jsonLinksStr += JSON.stringify(link) + ","
              }
            })
            //需要进一步复制其linkModels
            model.linkModels?.forEach(lineLM => {
              if (lineLM.dm) {
                if (!selectedControls.has(lineLM.dm.id)) {
                  //添加到复制的model中
                  let json = lineLM.dm.toJSON();
                  jsonStr += JSON.stringify(json) + ","
                }
              }
            });
          }
        })
        if (jsonStr.length > 1) {

          jsonStr = jsonStr.substring(0, jsonStr.length - 1)
          jsonStr += ']'
          ddInstance.stage.copyMode = this.mode
          jsonStr = '{"mode":"' + this.mode + '","data":' + jsonStr
          if (jsonLinksStr.length > 1) {
            jsonLinksStr = jsonLinksStr.substring(0, jsonLinksStr.length - 1)
            jsonLinksStr += ']'
            jsonStr += " , \"links\":" + jsonLinksStr
          }
          jsonStr += "}"

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

            let cbData = navigator.clipboard;
            cbData.write(writeDatas).then(function () {
              editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
                parts: ["topmenu"],
              });
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
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

}


export default DDeiKeyActionCopy
