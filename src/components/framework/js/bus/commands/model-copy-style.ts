import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { cloneDeep } from 'lodash'
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiTable from '../../models/table';
/**
 * 拷贝样式的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandModelCopyStyle extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 具体行为,设置属性值
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    if (stage && (data?.models?.length > 0) && data?.brushData) {

      //模型
      let models = data.models;

      if (models?.length > 0) {

        models.forEach(model => {
          if (model) {
            let hasChange = false;
            //表格是修改里面的选中单元格
            if (model.baseModelType == 'DDeiTable') {
              //判断复制源的类型，如果有且仅有一个元素，并且是一维数组，则来源为普通控件
              if (Array.isArray(data.brushData) && !Array.isArray(data.brushData[0]) && data.brushData.length == 1) {
                let cells = model.getSelectedCells();
                cells.forEach(cell => {
                  // //根据code以及mapping设置属性值
                  this.cloneStyle(cell, data.brushData[0])
                  cell.render?.renderCacheData.clear();
                  hasChange = true;
                });
              }
              //判断复制源的类型，如果有是一个二唯数，则当作表格处理
              else if (Array.isArray(data.brushData) && Array.isArray(data.brushData[0])) {
                this.copyTableStyleToTableCell(model, data.brushData)
                hasChange = true;
              }
            } else {
              if (Array.isArray(data.brushData) && !Array.isArray(data.brushData[0]) && data.brushData.length == 1) {
                this.cloneStyle(model, data.brushData[0])
                hasChange = true;
              } else if (Array.isArray(data.brushData) && Array.isArray(data.brushData[0])) {
                this.cloneStyle(model, data.brushData[0][0])
                hasChange = true;
              }

            }
            if (hasChange) {
              bus.insert(DDeiEnumBusCommandType.AddHistroy, null, evt);
            }
          }
        });
      }

      return true;
    }
    return false;
  }

  /**
   * 复制表格样式到另外一个表格的单元格中
   * @param table 表格
   * @param tableJson 单元格样式
   */
  copyTableStyleToTableCell(table: DDeiTable, tableJson: object): void {
    //取得当前表格的当前选中单元格
    let distCells = table.getSelectedCells();
    //校验目标区域和当前源区域是否能够满足粘贴条件
    if (distCells && distCells.length > 0 && tableJson) {
      let sourceTable = tableJson;
      let distTable = table;
      let sourceMinMaxRow = { minRow: 0, minCol: 0, maxRow: sourceTable.length - 1, maxCol: sourceTable[0].length - 1 }
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
        console.log("表格复制样式区域存在合并单元格");
        return;
      }

      //校验3：粘贴后超出表格所在最大区域
      if (distTable.rows.length <= distMinMaxRow.minRow + rowNum - 1 || distTable.cols.length <= distMinMaxRow.minCol + colNum - 1) {
        console.log("表格复制样式区域超出表格所在最大区域");
        return;
      }
      //执行复制
      for (let i = 0; i < rowNum && distMinMaxRow.minRow + i < distTable.rows.length; i++) {
        let offsetI = i % sourceRowNum;
        for (let j = 0; j < colNum && distMinMaxRow.minCol + j < distTable.cols.length; j++) {
          //获取要复制的单元格
          let offsetJ = j % sourceColNum;
          let sourceCell = sourceTable[sourceMinMaxRow.minRow + offsetI][sourceMinMaxRow.minCol + offsetJ];
          //取得目标单元格
          let targetCell = distTable.rows[distMinMaxRow.minRow + i][distMinMaxRow.minCol + j];
          this.cloneStyle(targetCell, sourceCell)
        }
      }
    }
  }

  /**
   * 复制控件样式
   * @param model 
   * @param sourceModel 
   */
  cloneStyle(model, sourceModel) {
    if (sourceModel.font) {
      model.font = cloneDeep(sourceModel.font);
    }
    if (sourceModel.textStyle) {
      model.textStyle = cloneDeep(sourceModel.textStyle);
    }
    if (sourceModel.fill) {
      model.fill = cloneDeep(sourceModel.fill);
    }
    if (sourceModel.border) {
      model.border = cloneDeep(sourceModel.border);
    }
    model.render?.renderCacheData.clear();
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelCopyStyle({ code: DDeiEnumBusCommandType.CopyStyle, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelCopyStyle
