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
import table from "../../configs/controls/table";
import DDeiTable from "@/components/framework/js/models/table";

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
    let that = this;
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
            //粘贴到表格单元格
            let cells = table.getSelectedCells();
            if (cells.length > 0) {
              cells.forEach(cell => {
                cell.setImgBase64(imgBase64);
              })
              createControl = false
            }
          } else {
            table.setImgBase64(imgBase64);
            createControl = false
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
              item.setImgBase64(imgBase64);
            })
          }

        }



        //如果没有粘贴到表格在最外层容器的鼠标位置，创建rectangle控件
        if (createControl) {
          that.createNewImage(image, imgBase64, offsetX, offsetY, stage, layer, evt)
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
      } else if (table.baseModelType != 'DDeiContainer') {
        table.text = textData
        createControl = false
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
    try {
      let searchText = '<meta source="ddei">';
      if (textData.indexOf(searchText) != -1) {
        let startIndex = textData.indexOf(searchText) + searchText.length;
        let endIndex = textData.indexOf('<meta source="ddeiend">')
        let ddeiJsonStr = textData.substring(startIndex, endIndex);
        if (ddeiJsonStr) {
          ddeiJson = JSON.parse(ddeiJsonStr);
        }
      }
    } catch (e) { }

    //内部复制
    if (ddeiJson) {
      //对内部复制的对象进行反序列化处理
      let jsonArray = ddeiJson
      if (!Array.isArray(ddeiJson)) {
        jsonArray = [ddeiJson]
      }
      //当前选中控件是否为1且有表格，且选中表格的单元格，则作为表格单元格的内容粘贴
      let createControl = true;
      if (stage.selectedModels?.size == 1) {
        let model = Array.from(stage.selectedModels.values())[0]
        if (model.baseModelType == 'DDeiTable') {
          //添加控件到表格单元格
          let cells = model.getSelectedCells();
          if (cells.length > 0) {
            cells.forEach(cell => {
              this.createControl(jsonArray, offsetX, offsetY, stage, cell, evt)
            })
            createControl = false
          }
        }
        //添加到容器
        else if (model.baseModelType == 'DDeiContainer') {
          this.createControl(jsonArray, offsetX, offsetY, stage, model, evt)
          createControl = false
        }
      }
      //如果没有粘贴到表格在最外层容器的鼠标位置，反序列化控件，重新设置ID，其他信息保留
      if (createControl) {
        this.createControl(jsonArray, offsetX, offsetY, stage, layer, evt)
      }
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      stage.ddInstance.bus?.executeAll();
    }
    //外部复制
    else {
      //只考虑从excel粘贴的情况，识别为一个table
      let tableJson = this.parseDomToJson(textData);
      let createControl = true;
      if (stage.selectedModels?.size == 1) {
        let model = Array.from(stage.selectedModels.values())[0]
        if (model.baseModelType == 'DDeiTable') {
          //TODO 复制表格内容到表格
          createControl = false
        }
        //添加表格到容器
        else if (model.baseModelType == 'DDeiContainer') {
          this.createTable(tableJson, offsetX, offsetY, stage, model, evt)
          createControl = false
        }
      }
      //如果没有粘贴到表格在最外层容器的鼠标位置，反序列化控件，重新设置ID，其他信息保留
      if (createControl) {
        this.createTable(tableJson, offsetX, offsetY, stage, layer, evt)
      }
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      stage.ddInstance.bus?.executeAll();
    }
  }

  /**
   * 解析dom文本到json
   * @param textData 文本
   * @returns json
   */
  parseDomToJson(textData): string {
    let tableJson = { rows: [], modelCode: "100301" }
    let parser = new DOMParser();
    let doc = parser.parseFromString(textData, "text/html");
    //解析table，获取基本的行列定义
    if (doc) {
      let tableEle = doc.body.children[0];
      let tableHeight = 0;
      tableJson.id = 'copytable'
      let tableWidth = 0;
      //解析行列
      let eleRows = tableEle.rows;
      let mergeApendCells = []
      let colSize = {}
      let rowSize = {}
      for (let i = 0; i < eleRows.length; i++) {
        let eleCells = eleRows[i].cells;

        if (!tableJson.rows[i]) {
          tableJson.rows[i] = []
        }
        let rowJson = tableJson.rows[i]
        for (let j = 0; j < eleCells.length; j++) {
          let cellEle = eleCells[j]
          //获取样式以及合并单元格信息
          //合并单元格信息
          let cellJson = null;
          if (mergeApendCells.indexOf(i + "-" + j) == -1) {
            cellJson = { modelCode: '100302', row: i, col: j, text: cellEle.innerHTML }
            rowJson.push(cellJson)
          } else {
            cellJson = rowJson[j]
          }

          if (cellEle.rowSpan > 1) {
            cellJson.mergeRowNum = parseInt(cellEle.rowSpan)
          }
          if (cellEle.colSpan > 1) {
            cellJson.mergeColNum = parseInt(cellEle.colSpan)
          }
          //当出现合并单元格时，创建空的格子区域
          if (cellJson.mergeRowNum > 1 || cellJson.mergeColNum > 1) {
            for (let mi = 0; mi < cellJson.mergeRowNum; mi++) {
              for (let mj = 0; mj < cellJson.mergeColNum; mj++) {
                if (!(mi == 0 && mj == 0)) {
                  if (!tableJson.rows[i + mi]) {
                    tableJson.rows[i + mi] = []
                  }
                  let curAppendRow = tableJson.rows[i + mi]
                  //补列
                  if (!curAppendRow[j]) {
                    for (let bj = 0; bj < j; bj++) {
                      curAppendRow[bj] = { row: i + mi, col: bj, width: 0, height: 0 }
                      mergeApendCells.push(curAppendRow[bj].row + "-" + curAppendRow[bj].col)
                    }

                  }
                  //创建区域的行列
                  let appendCellJson = { row: i + mi, col: j + mj, width: 0, height: 0 }
                  curAppendRow.push(appendCellJson)
                }
              }
            }
          }

          let rowHeight = null;
          if (rowSize["" + i]) {
            rowHeight = rowSize["" + i]
          } else {
            rowHeight = parseFloat(eleRows[i].getAttribute("height"));
            tableHeight += rowHeight
            if (rowHeight != NaN) {
              rowSize["" + i] = rowHeight;
            }
          }
          let colWidth = null;
          if (colSize["" + j]) {
            colWidth = colSize["" + j]
          } else {
            colWidth = parseFloat(cellEle.getAttribute("width"));
            tableWidth += colWidth;
            if (colWidth != NaN) {
              colSize["" + j] = colWidth;
            }
          }
          cellJson.width = colWidth
          cellJson.height = rowHeight
          //字体样式信息
          cellJson.font = {}
          if (cellEle.style.fontSize) {
            cellJson.font.size = parseFloat(cellEle.style.fontSize)
          }
          if (cellEle.style.color) {
            cellJson.font.color = DDeiUtil.getColor(cellEle.style.color)
          }
          if (cellEle.style.fontFamily) {
            cellJson.font.family = cellEle.style.fontFamily
          }
          cellJson.border = {}
          cellJson.border.top = {}
          cellJson.border.bottom = {}
          cellJson.border.left = {}
          cellJson.border.right = {}
          if (cellEle.style.borderTopColor) {
            cellJson.border.top.color = cellEle.style.borderTopColor
            if (cellJson.border.top.color == 'initial') {
              delete cellJson.border.top.color
            }
          }
          if (cellEle.style.borderTopWidth) {
            cellJson.border.top.width = parseFloat(cellEle.style.borderTopWidth)
            if (isNaN(cellJson.border.top.width) || cellJson.border.top.width == 'initial') {
              delete cellJson.border.top.width
            }
          }
          if (cellEle.style.borderTopStyle) {
            cellJson.border.top.style = cellEle.style.borderTopStyle
          }



          if (cellEle.style.borderBottomColor) {
            cellJson.border.bottom.color = cellEle.style.borderBottomColor
            if (cellJson.border.bottom.color == 'initial') {
              delete cellJson.border.bottom.color;
            }
          }
          if (cellEle.style.borderBottomWidth) {
            cellJson.border.bottom.width = parseFloat(cellEle.style.borderBottomWidth)
            if (isNaN(cellJson.border.bottom.width) || cellJson.border.bottom.width == 'initial') {
              delete cellJson.border.bottom.width
            }
          }
          if (cellEle.style.borderBottomStyle) {
            cellJson.border.bottom.style = cellEle.style.borderBottomStyle
          }


          if (cellEle.style.borderLeftColor) {
            cellJson.border.left.color = cellEle.style.borderLeftColor
            if (cellJson.border.left.color == 'initial') {
              delete cellJson.border.left.color
            }
          }
          if (cellEle.style.borderLeftWidth) {
            cellJson.border.left.width = parseFloat(cellEle.style.borderLeftWidth)
            if (isNaN(cellJson.border.left.width) || cellJson.border.left.width == 'initial') {
              delete cellJson.border.left.width
            }
          }
          if (cellEle.style.borderLeftStyle) {
            cellJson.border.left.style = cellEle.style.borderLeftStyle
          }

          if (cellEle.style.borderRightColor) {
            cellJson.border.right.color = cellEle.style.borderRightColor
            if (cellJson.border.right.color == 'initial') {
              delete cellJson.border.right.color
            }
          }
          if (cellEle.style.borderRightWidth) {
            cellJson.border.right.width = parseFloat(cellEle.style.borderRightWidth)
            if (isNaN(cellJson.border.right.width) || cellJson.border.right.width == 'initial') {
              delete cellJson.border.right.width
            }
          }
          if (cellEle.style.borderRightStyle) {
            cellJson.border.right.style = cellEle.style.borderRightStyle
          }

          //填充信息
          cellJson.fill = {};
          if (cellEle.style.backgroundColor) {
            cellJson.fill.color = cellEle.style.backgroundColor
          }
          //对齐
          cellJson.textStyle = {}
          if (cellEle.style.textAlign) {
            if (cellEle.style.textAlign == "left") {
              cellJson.textStyle.align = 1
            } else if (cellEle.style.textAlign == "center") {
              cellJson.textStyle.align = 2
            } else if (cellEle.style.textAlign == "right") {
              cellJson.textStyle.align = 3
            }
          }
          if (cellEle.style.verticalAlign) {
            if (cellEle.style.verticalAlign == "top") {
              cellJson.textStyle.valign = 1
            } else if (cellEle.style.verticalAlign == "middle") {
              cellJson.textStyle.valign = 2
            } else if (cellEle.style.verticalAlign == "bottom") {
              cellJson.textStyle.valign = 3
            }
          }
          if (cellEle.style.textDecoration == "underline") {
            cellJson.textStyle.underline = "1"
          }
          if (cellEle.style.textDecoration == "line-through") {
            cellJson.textStyle.deleteline = "1"
          }
          if (cellEle.style.whiteSpace == "nowrap") {
            cellJson.textStyle.feed = "0"
          } else {
            cellJson.textStyle.feed = "1"
          }

          if (cellEle.style.fontStyle == "italic") {
            cellJson.textStyle.italic = "1"
          }
          if (cellEle.style.fontWeight) {
            if (cellEle.style.fontWeight == 'bold') {
              cellJson.textStyle.bold = "1"
            }
            else if (parseInt(cellEle.style.fontWeight) > 400)
              cellJson.textStyle.bold = "1"
          }
        }
      }
      tableJson.height = tableHeight
      tableJson.width = tableWidth;
      console.log(tableJson)
      return tableJson
    }


  }

  //创建新的表格
  createTable(tableJson: object, x: number, y: number, stage: DDeiStage, container: object, evt: Event): void {
    //当前激活的图层
    let layer = stage.layers[stage.layerIndex];
    let tableModel = DDeiTable.loadFromJSON(tableJson, { currentDdInstance: stage.ddInstance, currentStage: stage, currentLayer: layer, currentContainer: container });
    stage.idIdx++
    let newId = "table_" + stage.idIdx;
    tableModel.id = newId
    tableModel.x = x - tableModel.width / 2;
    tableModel.y = y - tableModel.height / 2;
    tableModel.resetCellData();
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, models: [tableModel] }, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [tableModel], value: DDeiEnumControlState.SELECTED }, evt);
  }


  //创建新的控件
  createControl(jsonArray: [], x: number, y: number, stage: DDeiStage, container: object, evt: Event): void {
    //当前激活的图层
    let layer = stage.layers[stage.layerIndex];
    let models: DDeiAbstractShape[] = []
    jsonArray.forEach(json => {
      let copyModel = MODEL_CLS[json.modelType].loadFromJSON(json, { currentDdInstance: stage.ddInstance, currentStage: stage, currentLayer: layer, currentContainer: container });
      models.push(copyModel);
    });
    //重新计算坐标，基于粘贴的中心点
    let outRect = DDeiAbstractShape.getOutRect(models);
    outRect = { x: outRect.x + outRect.width / 2, y: outRect.y + outRect.height / 2 }
    models.forEach(item => {
      stage.idIdx++
      let newId = ""
      if (item.id.indexOf("_") != -1) {
        newId = item.id.substring(0, item.id.indexOf("_")) + "_" + stage.idIdx;
      } else {
        newId = item.id + "_cp_" + stage.idIdx;
      }
      item.id = newId
      let dx = outRect.x - item.x;
      let dy = outRect.y - item.y;
      item.x = x - dx;
      item.y = y - dy;
    })
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, models: models }, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: models, value: DDeiEnumControlState.SELECTED }, evt);
  }

  //创建新的图片控件
  createNewImage(image: Image, imgBase64: string, x: number, y: number, stage: DDeiStage, container: object, evt: Event): void {
    stage.idIdx++
    let dataJson = {
      id: "img_" + stage.idIdx,
      modelCode: "100002",
      x: x - image.width / 2,
      y: y - image.height / 2,
      width: image.width,
      height: image.height,
      border: { top: { disabled: true }, bottom: { disabled: true }, left: { disabled: true }, right: { disabled: true } },
      fill: { disable: true }
    };
    let model: DDeiAbstractShape = DDeiRectangle.initByJSON(dataJson);
    model.setImgBase64(imgBase64);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, models: [model] }, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
    stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [model], value: DDeiEnumControlState.SELECTED }, evt);
  }
}

export default DDeiKeyActionPaste
