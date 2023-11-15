import DDei from "@/components/framework/js/ddei";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiUtil from "@/components/framework/js/util";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiRectangle from "@/components/framework/js/models/rectangle";
import { MODEL_CLS } from "@/components/framework/js/config";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiTable from "@/components/framework/js/models/table";
import { Matrix3, Vector3 } from 'three';
import DDeiEnumOperateType from "@/components/framework/js/enums/operate-type";
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
        let hasChange = false;
        if (stage.selectedModels?.size == 1) {
          let table = Array.from(stage.selectedModels.values())[0]
          if (table.baseModelType == 'DDeiTable') {
            //粘贴到表格单元格
            let cells = table.getSelectedCells();
            if (cells.length > 0) {
              cells.forEach(cell => {
                cell.setImgBase64(imgBase64);
              })
              hasChange = true;
              createControl = false
            }
          } else {
            table.setImgBase64(imgBase64);
            hasChange = true;
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
            hasChange = true;
          }


        }



        //如果没有粘贴到表格在最外层容器的鼠标位置，创建rectangle控件
        if (createControl) {
          that.createNewImage(image, imgBase64, offsetX, offsetY, stage, layer, evt)
          hasChange = true;
        }
        if (hasChange) {
          stage.ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
          stage.ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
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
    let hasChange = false;
    if (stage.selectedModels?.size == 1) {
      let table = Array.from(stage.selectedModels.values())[0]
      if (table.baseModelType == 'DDeiTable') {
        //粘贴到表格单元格
        let cells = table.getSelectedCells();
        if (cells.length > 0) {
          cells.forEach(cell => {
            cell.text = textData
          })
          hasChange = true
          createControl = false
        }
      } else if (table.baseModelType != 'DDeiContainer') {
        table.text = textData
        hasChange = true
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
        hasChange = true;
      }

    }



    //如果没有粘贴到表格在最外层容器的鼠标位置，创建rectangle控件
    if (createControl) {
      stage.idIdx++
      hasChange = true;
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
      let stageRatio = stage.getStageRatio()
      //获取文本高度宽度
      let size = DDeiUtil.measureTextSize(stage.ddInstance, textData, configAtrs.get('font.family').data, configAtrs.get('font.size').data * stageRatio)

      let dataJson = {
        id: "rectangle_" + stage.idIdx,
        modelCode: "100002",
        text: textData,
        width: size.width,
        height: size.height,
        border: { top: { disabled: true }, bottom: { disabled: true }, left: { disabled: true }, right: { disabled: true } },
        fill: { disable: true }
      };
      let model: DDeiAbstractShape = DDeiRectangle.initByJSON(dataJson);
      model.cpv.x += offsetX
      model.cpv.y += offsetY
      model.pvs.forEach(pv => {
        pv.x += offsetX
        pv.y += offsetY
      });
      model.calLoosePVS()
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: layer, models: [model] }, evt);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
      stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [model], value: DDeiEnumControlState.SELECTED }, evt);
    }
    if (hasChange) {
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
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
    let hasChange = false;
    if (ddeiJson) {
      //对内部复制的对象进行反序列化处理
      let mode = ddeiJson.mode
      let jsonArray = ddeiJson.data
      if (!Array.isArray(jsonArray)) {
        jsonArray = [jsonArray]
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
              this.createControl(jsonArray, offsetX, offsetY, stage, cell, mode, evt)
            })
            hasChange = true;
            createControl = false
          }
        }
        //添加到容器
        else if (model.baseModelType == 'DDeiContainer') {
          this.createControl(jsonArray, offsetX, offsetY, stage, model, mode, evt)
          createControl = false
          hasChange = true;
        }
      }
      //如果没有粘贴到表格在最外层容器的鼠标位置，反序列化控件，重新设置ID，其他信息保留
      if (createControl) {
        this.createControl(jsonArray, offsetX, offsetY, stage, layer, mode, evt)
        hasChange = true;
      }
      if (hasChange) {
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
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
          //复制表格内容到表格
          this.copyTableToTableCell(model, tableJson);
          createControl = false
          hasChange = true;
        }
        //添加表格到容器
        else if (model.baseModelType == 'DDeiContainer') {
          this.createTable(tableJson, offsetX, offsetY, stage, model, evt)
          createControl = false
          hasChange = true;
        }
      }
      //如果没有粘贴到表格在最外层容器的鼠标位置，反序列化控件，重新设置ID，其他信息保留
      if (createControl) {
        this.createTable(tableJson, offsetX, offsetY, stage, layer, evt)
        hasChange = true;
      }
      if (hasChange) {
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
      }
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      stage.ddInstance.bus?.executeAll();
    }
  }

  /**
   * 复制表格内容到另外一个表格的单元格中
   * @param table 表格
   * @param tableJson 表格单元格
   */
  copyTableToTableCell(table: DDeiTable, tableJson: object): void {
    //取得当前表格的当前选中单元格
    let distCells = table.getSelectedCells();
    //校验目标区域和当前源区域是否能够满足粘贴条件
    if (distCells && distCells.length > 0 && tableJson) {
      let sourceTable = tableJson;
      let distTable = table;
      let sourceMinMaxRow = { minRow: 0, minCol: 0, maxRow: sourceTable.rows.length - 1, maxCol: sourceTable.rows[0].length - 1 }
      //校验1:目标是否为一个连续的选中区域
      let distMinMaxRow = distTable.getMinMaxRowAndCol(distCells);
      let distAreaAllSelected = distTable.isAllSelected(distMinMaxRow.minRow, distMinMaxRow.minCol, distMinMaxRow.maxRow, distMinMaxRow.maxCol);

      if (!distAreaAllSelected) {
        console.log("表格粘贴目标不是一个有效的连续区域");
        return;
      }
      //计算粘贴后的区域大小
      let rowNum = 1;
      let colNum = 1;
      let sourceRowNum = sourceMinMaxRow.maxRow - sourceMinMaxRow.minRow + 1;
      let distRowNum = distMinMaxRow.maxRow - distMinMaxRow.minRow + 1;
      let sourceColNum = sourceMinMaxRow.maxCol - sourceMinMaxRow.minCol + 1;
      let distColNum = distMinMaxRow.maxCol - distMinMaxRow.minCol + 1;
      //如果目标区域的行数/列数=1，则粘贴后的目标行数=源行数/列数=源列数，如果不是，则取得能够整除的区域
      if (distRowNum == sourceRowNum) {
        rowNum = sourceRowNum;
      } else if (distRowNum > sourceRowNum) {
        rowNum = distRowNum - (distRowNum % sourceRowNum);
      } else if (distRowNum < sourceRowNum) {
        rowNum = sourceRowNum;
      }
      if (distColNum == sourceColNum) {
        colNum = sourceColNum;
      } else if (distColNum > sourceColNum) {
        colNum = distColNum - (distColNum % sourceColNum);
      } else if (distColNum < sourceColNum) {
        colNum = sourceColNum;
      }

      //校验2：粘贴区域内存在合并单元格
      if (distTable.hasMergeCell(distMinMaxRow.minRow, distMinMaxRow.minCol, distMinMaxRow.minRow + rowNum - 1, distMinMaxRow.minCol + colNum - 1)) {
        console.log("表格粘贴区域存在合并单元格");
        return;
      }

      //校验3：粘贴后超出表格所在最大区域
      if (distTable.rows.length <= distMinMaxRow.minRow + rowNum - 1 || distTable.cols.length <= distMinMaxRow.minCol + colNum - 1) {
        console.log("表格粘贴区域超出表格所在最大区域");
        return;
      }
      //执行复制
      let mergeCells = [];
      for (let i = 0; i < rowNum && distMinMaxRow.minRow + i < distTable.rows.length; i++) {
        let offsetI = i % sourceRowNum;
        for (let j = 0; j < colNum && distMinMaxRow.minCol + j < distTable.cols.length; j++) {
          //获取要复制的单元格
          let offsetJ = j % sourceColNum;
          let sourceCell = sourceTable.rows[sourceMinMaxRow.minRow + offsetI][sourceMinMaxRow.minCol + offsetJ];
          //取得目标单元格
          let targetCell = distTable.rows[distMinMaxRow.minRow + i][distMinMaxRow.minCol + j];
          //文本
          targetCell.text = sourceCell.text;
          //样式
          targetCell.textStyle = sourceCell.textStyle;
          targetCell.font = sourceCell.font
          targetCell.border = sourceCell.border;
          //记录合并单元格
          if (sourceCell.mergeRowNum > 1 || sourceCell.mergeColNum > 1) {
            targetCell.mergeRowNum = sourceCell.mergeRowNum;
            targetCell.mergeColNum = sourceCell.mergeColNum;
            mergeCells[mergeCells.length] = targetCell;
          }
          targetCell.render?.renderCacheData?.clear();
        }
      }
      //执行合并单元格
      for (let i = 0; i < mergeCells.length; i++) {
        let mc = mergeCells[i];
        //合并单元格
        let cells = distTable.getCellsByRect(mc.row, mc.col, mc.row + mc.mergeRowNum - 1, mc.col + mc.mergeColNum - 1);
        distTable.mergeCells(cells);
      }
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
      //合并区域的定义
      let mergeAreas = []
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
          let cellJson = { modelCode: '100302', row: i, col: j, text: cellEle.innerText, domRow: i, domCol: j }
          rowJson.push(cellJson)


          if (cellEle.rowSpan > 1) {
            cellJson.mergeRowNum = parseInt(cellEle.rowSpan)
          }
          if (cellEle.colSpan > 1) {
            cellJson.mergeColNum = parseInt(cellEle.colSpan)
          }

          //记录合并单元格区域
          if (cellJson.mergeRowNum > 1 || cellJson.mergeColNum > 1) {
            if (!cellJson.mergeRowNum) {
              cellJson.mergeRowNum = 1;
            }
            if (!cellJson.mergeColNum) {
              cellJson.mergeColNum = 1;
            }
            mergeAreas.push(cellJson);
          }

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
      //处理合并单元格区域
      mergeAreas.forEach(mergeCell => {
        //向右下方扩展表格区域
        for (let i = 1; i <= mergeCell.mergeRowNum; i++) {
          for (let j = 1; j <= mergeCell.mergeColNum; j++) {
            //自身单元格不用扩展
            if (!(i == 1 && j == 1)) {
              tableJson.rows[mergeCell.row + i - 1].splice(mergeCell.col + j - 1, 0, { width: 0, height: 0, modelCode: '100302', mCell: mergeCell });
              //重新设置关系
              for (let k = 0; k < tableJson.rows.length; k++) {
                let rowObj = tableJson.rows[k];
                for (let l = 0; l < rowObj.length; l++) {
                  rowObj[l].row = k;
                  rowObj[l].col = l;
                }
              }
            }
          }
        }
      });

      //计算每一行列的大小以及合并单元格的大小
      for (let k = 0; k < tableJson.rows.length; k++) {
        let rowObj = tableJson.rows[k];
        for (let l = 0; l < rowObj.length; l++) {
          if ((rowObj[l].domRow || rowObj[l].domRow == 0)
            && (!rowObj[l].mergeRowNum || rowObj[l].mergeRowNum <= 1) && (!rowObj[l].mergeColNum <= 1 || rowObj[l].mergeColNum <= 1)) {
            let rowHeight = null;
            let domRowEle = tableEle.rows[rowObj[l].domRow];
            let domCellEle = tableEle.rows[rowObj[l].domRow].cells[rowObj[l].domCol];
            if (!rowSize["" + k]) {
              if (domRowEle.style.height) {
                rowHeight = parseFloat(domRowEle.style.height);
              } else {
                rowHeight = parseFloat(domRowEle.getAttribute("height"));
              }
              if (!isNaN(rowHeight)) {
                rowSize["" + k] = rowHeight;
              }
            }
            let colWidth = null;
            if (!colSize["" + l]) {
              if (domCellEle.style.width) {
                colWidth = parseFloat(domCellEle.style.width);
              } else {
                colWidth = parseFloat(domCellEle.getAttribute("width"));
              }
              if (!isNaN(colWidth)) {
                colSize["" + l] = colWidth;
              }
            }
          }
        }
      }
      //补全行列大小
      for (let k = 0; k < tableJson.rows.length; k++) {
        //可能存在合并单元格，
        if (!rowSize[k]) {
          //寻找非合并单元格，填充大小，如果找不到则用合并单元格大小的平均数
          let mCell = null;
          let rowObj = tableJson.rows[k];
          for (let l = 0; l < rowObj.length; l++) {
            if (rowObj[l].domRow || rowObj[l].domRow == 0) {
              let domCellEle = tableEle.rows[rowObj[l].domRow].cells[rowObj[l].domCol];
              if (rowObj[l].mergeRowNum > 1 || rowObj[l].mergeColNum > 1) {
                mCell = rowObj[l];
              } else if (!mCell && rowObj[l].mCell) {
                mCell = rowObj[l].mCell;
              } else if (!rowObj[l].mCell) {
                let rowHeight = 0;
                if (domCellEle.style.height) {
                  rowHeight = parseFloat(domCellEle.style.height);
                } else {
                  rowHeight = parseFloat(domCellEle.getAttribute("height"));
                }
                if (!isNaN(rowHeight)) {
                  rowSize["" + k] = rowHeight;
                }
                break;
              }
            }
          }
          if (!rowSize[k] && mCell) {
            let domCellEle = tableEle.rows[mCell.domRow].cells[mCell.domCol];
            let rowHeight = 0;
            if (domCellEle.style.height) {
              rowHeight = parseFloat(domCellEle.style.height);
            } else {
              rowHeight = parseFloat(domCellEle.getAttribute("height"));
            }
            if (!isNaN(rowHeight)) {
              rowSize[k] = rowHeight / mCell.mergeRowNum
            }
          }
        }
      }
      for (let l = 0; l < tableJson.rows[0].length; l++) {
        //可能存在合并单元格，
        if (!colSize[l]) {
          //寻找非合并单元格，填充大小，如果找不到则用合并单元格大小的平均数
          let mCell = null;

          for (let k = 0; k < tableJson.rows.length; k++) {
            if (tableJson.rows[k][l].domRow || tableJson.rows[k][l].domRow == 0) {
              let domCellEle = tableEle.rows[tableJson.rows[k][l].domRow].cells[tableJson.rows[k][l].domCol];
              if (tableJson.rows[k][l].mergeRowNum > 1 || tableJson.rows[k][l].mergeColNum > 1) {
                mCell = tableJson.rows[k][l];
              } else if (!mCell && tableJson.rows[k][l].mCell) {
                mCell = tableJson.rows[k][l].mCell;
              } else if (!tableJson.rows[k][l].mCell) {
                let colWidth = 0;
                if (domCellEle.style.width) {
                  colWidth = parseFloat(domCellEle.style.width);
                } else {
                  colWidth = parseFloat(domCellEle.getAttribute("width"));
                }
                if (!isNaN(colWidth)) {
                  colSize["" + l] = colWidth;
                }
                break;
              }
            }
          }
          if (!colSize[l] && mCell) {
            let domCellEle = tableEle.rows[mCell.domRow].cells[mCell.domCol];
            let colWidth = 0;
            if (domCellEle.style.width) {
              colWidth = parseFloat(domCellEle.style.width);
            } else {
              colWidth = parseFloat(domCellEle.getAttribute("width"));
            }
            if (!isNaN(colWidth)) {
              colSize[l] = colWidth / mCell.mergeColNum
            }
          }
        }
      }
      //写入单元格大小
      for (let k = 0; k < tableJson.rows.length; k++) {
        let rowObj = tableJson.rows[k];
        for (let l = 0; l < rowObj.length; l++) {
          if (k == 0) {
            if (isNaN(colSize["" + l])) {
              colSize["" + l] = 40
            }
            tableWidth += colSize["" + l];
          }
          if (l == 0) {
            if (isNaN(rowSize["" + k])) {
              rowSize["" + k] = 20
            }
            tableHeight += rowSize["" + k];
          }

          //如果是合并单元格
          if (rowObj[l].mergeRowNum > 1 || rowObj[l].mergeColNum > 1) {
            //计算高度和宽度
            let mHeight = 0
            let mWidth = 0
            for (let ki = 1; ki <= rowObj[l].mergeRowNum; ki++) {
              if (isNaN(rowSize["" + (k + ki - 1)])) {
                rowSize["" + (k + ki - 1)] = 20
              }
              mHeight += rowSize["" + (k + ki - 1)];
            }
            for (let ki = 1; ki <= rowObj[l].mergeColNum; ki++) {
              if (isNaN(colSize["" + (l + ki - 1)])) {
                colSize["" + (l + ki - 1)] = 40
              }
              mWidth += colSize["" + (l + ki - 1)];
            }
            rowObj[l].height = mHeight;
            rowObj[l].width = mWidth;
            rowObj[l].originWidth = colSize["" + l];
            rowObj[l].originHeight = rowSize["" + k];
            delete rowObj[l].domRow
            delete rowObj[l].domCol
          }
          //如果不是合并单元格但是属于合并单元格区域，则属于被合并单元格
          else if (rowObj[l].mCell) {
            rowObj[l].originWidth = colSize["" + l];
            rowObj[l].originHeight = rowSize["" + k];
            delete rowObj[l].mCell
            delete rowObj[l].domRow
            delete rowObj[l].domCol
          }
          //普通单元格
          else {
            rowObj[l].width = colSize["" + l];
            rowObj[l].height = rowSize["" + k];
            delete rowObj[l].domRow
            delete rowObj[l].domCol
          }
        }
      }
      tableJson.height = tableHeight
      tableJson.width = tableWidth
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
  createControl(jsonArray: [], x: number, y: number, stage: DDeiStage, container: object, mode: string, evt: Event): void {
    //当前激活的图层
    let layer = stage.layers[stage.layerIndex];
    let models: DDeiAbstractShape[] = []
    jsonArray.forEach(json => {
      if (mode == 'copy') {
        let copyModel = MODEL_CLS[json.modelType].loadFromJSON(json, { currentDdInstance: stage.ddInstance, currentStage: stage, currentLayer: layer, currentContainer: container });

        models.push(copyModel);

      } else if (mode == 'cut') {
        let model = stage.getModelById(json.id);
        models.push(model);
      }
    });
    //加载事件的配置
    let createBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_CREATE_BEFORE",
      stage.ddInstance
    );
    let dragBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_DRAG_BEFORE",
      stage.ddInstance
    );
    //选中前
    if ((mode == 'copy' &&
      (!createBefore ||
        createBefore(DDeiEnumOperateType.CREATE, models, stage.ddInstance))) ||
      (mode == 'cut' &&
        (!dragBefore ||
          dragBefore(DDeiEnumOperateType.DRAG, models, stage.ddInstance)))
    ) {
      //重新计算坐标，基于粘贴的中心点
      let outRect = DDeiAbstractShape.getOutRectByPV(models);

      outRect = { x: outRect.x + outRect.width / 2, y: outRect.y + outRect.height / 2 }
      models.forEach(item => {
        if (mode == 'copy') {
          this.changeModelId(stage, item)
        }
        let cpx = item.cpv.x;
        let cpy = item.cpv.y;
        let dx = outRect.x - cpx;
        let dy = outRect.y - cpy;
        let moveMatrix = new Matrix3(
          1, 0, x - dx - cpx,
          0, 1, y - dy - cpy,
          0, 0, 1
        )
        item.transVectors(moveMatrix)
      })

      stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, models: models }, evt);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
      stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: models, value: DDeiEnumControlState.SELECTED }, evt);
      if (mode == 'copy') {
        stage.ddInstance.bus.push(DDeiEnumBusCommandType.NodifyControlCreated, {
          models: models,
        });
      } else if (mode == 'cut') {
        let dragAfter = DDeiUtil.getConfigValue(
          "EVENT_CONTROL_DRAG_AFTER",
          stage.ddInstance
        );
        if (dragAfter) {
          dragAfter(DDeiEnumOperateType.DRAG, models, stage.ddInstance, evt)
        }
      }
    }
  }

  /**
   * 修改模型ID
   * @param stage 舞台
   * @param item 控件
   * @return 新的ID
   */
  changeModelId(stage: DDeiStage, item: DDeiAbstractShape): string {
    stage.idIdx++
    let newId = ""
    if (item.id.indexOf("_") != -1) {
      newId = item.id.substring(0, item.id.lastIndexOf("_")) + "_" + stage.idIdx;
    } else {
      newId = item.id + "_cp_" + stage.idIdx;
    }
    item.id = newId
    let accuContainer = item.getAccuContainer()
    if (accuContainer?.baseModelType == 'DDeiContainer') {
      let midList: string = []
      let models: Map<string, DDeiAbstractShape> = new Map<string, DDeiAbstractShape>();
      accuContainer.midList.forEach(mid => {
        let model = accuContainer.models.get(mid);
        let modelNewId = this.changeModelId(stage, model)
        models.set(modelNewId, model)
        midList.push(modelNewId)
      })
      accuContainer.models = models
      accuContainer.midList = midList
    } else if (accuContainer?.baseModelType == 'DDeiTable') {
      for (let i = 0; i < accuContainer.rows; i++) {
        let rowObj = accuContainer.rows[i];
        for (let j = 0; j < rowObj.length; j++) {
          let accuContainer = rowObj[j].getAccuContainer()
          let midList: string[] = []
          let models: Map<string, DDeiAbstractShape> = new Map<string, DDeiAbstractShape>();
          accuContainer.midList.forEach(mid => {
            let model = accuContainer.models.get(mid);
            let modelNewId = this.changeModelId(stage, model)
            models.set(modelNewId, model)
            midList.push(modelNewId)
          })
          accuContainer.models = models
          accuContainer.midList = midList
        }
      }
    }
    return newId;
  }

  //创建新的图片控件
  createNewImage(image: Image, imgBase64: string, x: number, y: number, stage: DDeiStage, container: object, evt: Event): void {
    stage.idIdx++
    let rat1 = stage.ddInstance.render.ratio;
    let stageRatio = stage.getStageRatio()
    let dataJson = {
      id: "img_" + stage.idIdx,
      modelCode: "100002",
      width: image.width * stageRatio / rat1,
      height: image.height * stageRatio / rat1,
      border: { top: { disabled: true }, bottom: { disabled: true }, left: { disabled: true }, right: { disabled: true } },
      fill: { disable: true }
    };

    let model: DDeiAbstractShape = DDeiRectangle.initByJSON(dataJson);
    model.cpv.x += x
    model.cpv.y += y
    model.pvs.forEach(pv => {
      pv.x += x
      pv.y += y
    });
    model.setImgBase64(imgBase64);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.ModelChangeContainer, { newContainer: container, models: [model] }, evt);
    stage.ddInstance.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels, null, evt);
    stage.ddInstance.bus?.push(DDeiEnumBusCommandType.ModelChangeSelect, { models: [model], value: DDeiEnumControlState.SELECTED }, evt);
  }
}

export default DDeiKeyActionPaste
