import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiLayer from "@/components/framework/js/models/layer";
import DDeiUtil from "@/components/framework/js/util";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiRectangle from "@/components/framework/js/models/rectangle";
import { MODEL_CLS, RENDER_CLS } from "@/components/framework/js/config";
import DDeiAbstractShape from "@/components/framework/js/models/shape";

/**
 * 键行为:粘贴
 * 粘贴剪切板内容
 */
class DDeiKeyActionPaste extends DDeiKeyAction {



  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      //当前激活的图层
      let cbData = navigator.clipboard;
      cbData.read().then((items) => {
        let type = null;
        //优先级html>图片/文本
        items[0].types.forEach(t => {
          if (!type) {
            type = t;
          } else if (t = 'text/html') {
            type = t;
          }
        });
        //三种粘贴类型，文本、图片、HTML
        items[0].getType(type).then(itemData => {
          //剪切板中是文本
          if (type == 'text/plain') {
            (new Response(itemData)).text().then(dataText => {
              this.textPaste(evt, ddInstance.stage, dataText);
            });
          }
          //剪切板中是图片
          else if (type == 'image/png') {
            this.imagePaste(evt, ddInstance.stage, itemData);
          }
          //剪切板中是HTML
          else if (type == 'text/html') {
            (new Response(itemData)).text().then(dataText => {
              this.htmlPaste(evt, ddInstance.stage, dataText);
            });
          }


        });

      });
    }
  }


  /**
   * 粘贴图片
   */
  imagePaste(evt: Event, stage: DDeiStage, blobData: object) {

    //将二进制转换为图片
    let reader = new FileReader();
    reader.readAsDataURL(blobData);
    reader.onload = function (e) {
      let image = new Image();
      image.src = e.target.result
      image.onload = function () {

        let imgBase64 = e.target.result
        //当前激活的图层
        let layer = stage.layers[stage.layerIndex];
        //获取当前的鼠标落点
        let offsetX = DDeiUtil.offsetX;
        let offsetY = DDeiUtil.offsetY;
        //当前选中控件是否为1且有表格，且选中表格的单元格，则作为表格单元格的内容粘贴
        let createControl = true;
        if (stage.selectedModels?.size == 1) {
          let table = Array.from(stage.selectedModels.values())[0]
          if (table.baseModelType == 'DDeiTable') {
            //TODO 粘贴到表格单元格
            let cells = table.getSelectedCells();
            if (cells.length > 0) {
              cells.forEach(cell => {

              })
              createControl = false
            }
          }
        } else if (stage.selectedModels?.size > 1) {
          let isSimpleControl = true
          stage.selectedModels?.forEach(item => {
            if (isSimpleControl && (item.baseModelType == 'DDeiTable' || item.baseModelType == 'DDeiContainer')) {
              isSimpleControl = false;
            }
          })
          //TODO 如果都是简单控件，则允许粘贴
          if (isSimpleControl) {
            createControl = false;
            stage.selectedModels?.forEach(item => {

            })
          }

        }



        //如果没有粘贴到表格在最外层容器的鼠标位置，创建rectangle控件
        if (createControl) {
          stage.idIdx++

          //根据control的定义，初始化临时控件，并推送至上层Editor
          stage.idIdx++

          //获取文本高度宽度
          let dataJson = {
            id: "rectangle_" + stage.idIdx,
            modelCode: "100002",
            x: offsetX - image.width / 2,
            y: offsetY - image.height / 2,
            width: image.width,
            height: image.height,
            border: { top: { disabled: true }, bottom: { disabled: true }, left: { disabled: true }, right: { disabled: true } },
            fill: { disable: true }
          };
          let model: DDeiAbstractShape = DDeiRectangle.initByJSON(dataJson);
          model.imgBase64 = imgBase64
          stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, models: [model] }, evt);
          stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
          stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [model], value: DDeiEnumControlState.SELECTED }, evt);
        }
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        stage.ddInstance.bus?.executeAll();
      }

    }
  }

  /**
   * 粘贴文本
   */
  textPaste(evt: Event, stage: DDeiStage, textData: string) {
    //当前激活的图层
    let layer = stage.layers[stage.layerIndex];
    //获取当前的鼠标落点
    let offsetX = DDeiUtil.offsetX;
    let offsetY = DDeiUtil.offsetY;
    //当前选中控件是否为1且有表格，且选中表格的单元格，则作为表格单元格的内容粘贴
    let createControl = true;
    if (stage.selectedModels?.size == 1) {
      let table = Array.from(stage.selectedModels.values())[0]
      if (table.baseModelType == 'DDeiTable') {
        //粘贴到表格单元格
        let cells = table.getSelectedCells();
        if (cells.length > 0) {
          cells.forEach(cell => {
            cell.text = textData
          })
          createControl = false
        }
      }
    } else if (stage.selectedModels?.size > 1) {
      let isSimpleControl = true
      stage.selectedModels?.forEach(item => {
        if (isSimpleControl && (item.baseModelType == 'DDeiTable' || item.baseModelType == 'DDeiContainer')) {
          isSimpleControl = false;
        }
      })
      //如果都是简单控件，则允许粘贴
      if (isSimpleControl) {
        createControl = false;
        stage.selectedModels?.forEach(item => {
          item.text = textData
        })
      }

    }



    //如果没有粘贴到表格在最外层容器的鼠标位置，创建rectangle控件
    if (createControl) {
      stage.idIdx++

      //根据control的定义，初始化临时控件，并推送至上层Editor
      let searchPaths = [
        "font.size",
        "font.family",
        "width",
        "height",
      ];
      stage.idIdx++

      let configAtrs = DDeiUtil.getAttrValueByConfig(
        { modelCode: "100002" },
        searchPaths
      );
      //获取文本高度宽度
      let size = DDeiUtil.measureTextSize(stage.ddInstance, textData, configAtrs.get('font.family').data, configAtrs.get('font.size').data)
      let dataJson = {
        id: "rectangle_" + stage.idIdx,
        modelCode: "100002",
        x: offsetX - size.width / 2,
        y: offsetY - size.height / 2,
        text: textData,
        width: size.width,
        height: size.height,
        border: { top: { disabled: true }, bottom: { disabled: true }, left: { disabled: true }, right: { disabled: true } },
        fill: { disable: true }
      };
      let model: DDeiAbstractShape = DDeiRectangle.initByJSON(dataJson);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, models: [model] }, evt);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
      stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [model], value: DDeiEnumControlState.SELECTED }, evt);
    }
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
    stage.ddInstance.bus?.executeAll();

  }


  /**
  * 粘贴HTML
  */
  htmlPaste(evt: Event, stage: DDeiStage, textData: string) {
    //当前激活的图层
    let layer = stage.layers[stage.layerIndex];
    //获取当前的鼠标落点
    let offsetX = DDeiUtil.offsetX;
    let offsetY = DDeiUtil.offsetY;
    //识别粘贴的内容来自于外部还是内部
    let ddeiJson = null;

    let searchText = '<meta source="ddei">';
    if (textData.indexOf(searchText) != -1) {
      let startIndex = textData.indexOf(searchText) + searchText.length;
      let endIndex = textData.indexOf('<meta source="ddeiend">')
      let ddeiJsonStr = textData.substring(startIndex, endIndex);
      ddeiJson = JSON.parse(ddeiJsonStr);
    }


    //当前选中控件是否为1且有表格，且选中表格的单元格，则作为表格单元格的内容粘贴
    let createControl = true;
    if (stage.selectedModels?.size == 1) {
      let table = Array.from(stage.selectedModels.values())[0]
      if (table.baseModelType == 'DDeiTable') {
        //粘贴到表格单元格
        if (table.curRow != -1 && table.curCol != -1) {
          //TODO 粘贴到表格
        }
      }
    }


    //如果没有粘贴到表格在最外层容器的鼠标位置，反序列化控件，重新设置ID，其他信息保留
    if (createControl) {

      //内部复制
      if (ddeiJson) {
        let jsonArray = ddeiJson
        if (!Array.isArray(ddeiJson)) {
          jsonArray = [ddeiJson]
        }
        let copyModels = []
        jsonArray.forEach(json => {
          let copyModel = MODEL_CLS[json.modelType].loadFromJSON(json, { currentDdInstance: stage.ddInstance, currentStage: stage, currentLayer: layer, currentContainer: layer });
          copyModels.push(copyModel);
        });
        //重新计算坐标，基于粘贴的中心点
        let outRect = DDeiAbstractShape.getOutRect(copyModels);
        let outRectCenterX = outRect.x + outRect.width / 2;
        let outRectCenterY = outRect.y + outRect.height / 2;
        copyModels.forEach(item => {
          stage.idIdx++
          let newId = ""
          if (item.id.indexOf("_") != -1) {
            newId = item.id.substring(0, item.id.indexOf("_")) + "_" + stage.idIdx;
          } else {
            newId = item.id + "_cp_" + stage.idIdx;
          }
          item.id = newId
          let dx = outRectCenterX - item.x;
          let dy = outRectCenterY - item.y;
          item.x = offsetX - dx;
          item.y = offsetY - dy;
          layer.addModel(item)
        })

        stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, models: copyModels }, evt);
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
        stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: copyModels, value: DDeiEnumControlState.SELECTED }, evt);
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
        stage.ddInstance.bus?.executeAll();
      }
      //外部复制
      else {

      }

    }
  }
}

export default DDeiKeyActionPaste
