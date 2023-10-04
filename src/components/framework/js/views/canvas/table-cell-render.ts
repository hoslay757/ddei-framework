import DDeiConfig from '../../config.js'
import DDei from '../../ddei.js';
import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiModelArrtibuteValue from '../../models/attribute/attribute-value.js';
import DDeiLayer from '../../models/layer.js';
import DDeiRectangle from '../../models/rectangle.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js'
import DDeiCanvasRender from './ddei-render.js';
import DDeiLayerCanvasRender from './layer-render.js';
import DDeiAbstractShapeRender from './shape-render-base.js';
import DDeiStageCanvasRender from './stage-render.js';
import { cloneDeep } from 'lodash'
import DDeiRectangleCanvasRender from './rectangle-render.js';
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiTable from '../../models/table.js';
import DDeiTableCell from '../../models/table-cell.js';

/**
 * 表格单元格的渲染器
 */
class DDeiTableCellCanvasRender extends DDeiRectangleCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }
  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableCellCanvasRender {
    return new DDeiTableCellCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCellCanvasRender";
  // ============================== 方法 ===============================
  /**
   * 判断是否在某个边线上
   * @param direct 1，2，3，4 上、右、下、左
   */
  isBorderOn(direct: number, x: number, y: number): boolean {
    let projPoint = this.model.getProjPointOnLine({ x: x, y: y }
      , { in: -5, out: 5 }, 1, direct - 1)
    if (projPoint) {
      return true;
    } else {
      return false;
    }
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
      let isShift = DDei.KEY_DOWN_STATE.get("shift");
      // 取得整个表格
      let table: DDeiTable = this.model.table;
      let currentCell: DDeiTableCell = this.model;
      if (e.button == 2) {
        table.curRow = currentCell.row;
        table.curCol = currentCell.col;
      } else {
        // 按下ctrl就是多选，不按下就是单选,表格的多选，选的是里面的单元格
        if (isCtrl) {
          //处理整行选中
          if (table.tempDragType == 'table-row-select') {
            let row = currentCell.row;
            for (let i = 0; i < table.cols.length; i++) {
              table.cols[i][row].selectCell()
            }
          }
          //处理整列选中
          else if (table.tempDragType == 'table-col-select') {
            let col = currentCell.col;
            for (let i = 0; i < table.rows.length; i++) {
              table.rows[i][col].selectCell()
            }
          } else {
            currentCell.selectOrCancelCell();
          }
        }
        //按下shift选中区域
        else if (isShift) {

          //有已选单元格的情况下，选中区域，否则只选中当前单元格
          if (table.curRow != -1 && table.curCol != -1) {
            let minMax = table.getMinMaxRowAndCol([currentCell, table.rows[table.curRow][table.curCol]]);
            //选中区域内所哟段元格
            for (let x = minMax.minRow; x <= minMax.maxRow; x++) {
              for (let y = minMax.minCol; y <= minMax.maxCol; y++) {
                //选中所有单元格
                table.rows[x][y].selectCell()
              }
            }
            table.curRow = currentCell.row;
            table.curCol = currentCell.col;
          } else {
            currentCell.selectOrCancelCell();
          }
        } else {
          //清空所有选中的单元格
          table.clearSelectionCells();
          //处理整行选中
          if (table.tempDragType == 'table-row-select') {
            let row = currentCell.row;
            for (let i = 0; i < table.cols.length; i++) {
              table.cols[i][row].selectCell();
            }
          }
          //处理整列选中
          else if (table.tempDragType == 'table-col-select') {
            let col = currentCell.col;
            for (let i = 0; i < table.rows.length; i++) {
              table.rows[i][col].selectCell();
            }
          } else {
            //选中当前单元格
            currentCell.selectCell();
          }
        }



        //如果存在临时拖拽类型，则将临时拖拽转换为正式拖拽
        if (table.tempDragType) {
          table.dragChanging = true;
          table.dragCell = table.tempDragCell;
          if (table.dragCell != null && table.dragCell.isMergeCell()) {
            table.dragCell = table.rows[table.dragCell.row + table.dragCell.mergeRowNum - 1][table.dragCell.col + table.dragCell.mergeColNum - 1];
          }
          table.dragType = table.tempDragType;
          if (table.dragType == 'cell' && isCtrl) {
            table.dragType = 'table';
          }
        } else {
          table.dragChanging = false;
          table.dragCell = null;
          table.dragType = null;
        }
      }
      this.stage.ddInstance.eventCancel = true;
    }
  }

  mouseUp(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      // 取得整个表格
      let table: DDeiTable = this.model.table;
      if (table.dragChanging) {
        //拖动列
        if (table.dragType == "col") {
          table.dragCol(e);
        }
        //从最右边拖拽表格大小
        else if (table.dragType == "table-size-right") {
          table.changeTableSizeToRight(e);

        }
        //从最左边拖拽表格大小
        else if (table.dragType == "table-size-left") {
          table.changeTableSizeToLeft(e);
        }
        //拖动行
        else if (table.dragType == "row") {
          table.dragRow(e);

        }//从最下边拖拽表格大小
        else if (table.dragType == "table-size-bottom") {
          table.changeTableSizeToBottom(e);

        }
        //从最上边拖拽表格大小
        else if (table.dragType == "table-size-top") {
          table.changeTableSizeToTop(e);

        }
        //从左上角拖动大小
        else if (table.dragType == "table-size-left-top") {
          table.changeTableSizeToLeft(e);
          table.changeTableSizeToTop(e);

        }
        //从左下角拖动大小
        else if (table.dragType == "table-size-left-bottom") {
          table.changeTableSizeToLeft(e);
          table.changeTableSizeToBottom(e);

        }//从右上角拖动大小
        else if (table.dragType == "table-size-right-top") {
          table.changeTableSizeToRight(e);
          table.changeTableSizeToTop(e);

        }
        //从右下角拖动大小
        else if (table.dragType == "table-size-right-bottom") {
          table.changeTableSizeToRight(e);
          table.changeTableSizeToBottom(e);

        }
        //拖动单元格
        else if (table.dragType == "cell") {
          table.dragAndSelectedCell(e);
        }
      }
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      let table = this.model.table;
      //上边线
      if (this.isBorderOn(1, evt.offsetX, evt.offsetY)) {
        this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, evt);
        table.tempDragType = "row";
      }
      //右边线
      else if (this.isBorderOn(2, evt.offsetX, evt.offsetY)) {
        this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, evt);
        table.tempDragType = "col";
      }//下边线
      else if (this.isBorderOn(3, evt.offsetX, evt.offsetY)) {
        this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, evt);
        table.tempDragType = "row";
      }//左边线
      else if (this.isBorderOn(4, evt.offsetX, evt.offsetY)) {
        this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, evt);
        table.tempDragType = "col";
      }
      //单元格中间部分
      else {
        this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'all-scroll' }, evt);
        table.tempDragType = "cell";
      }
      this.stage.ddInstance.eventCancel = true;
      table.tempDragCell = this.model
    }
  }
}

export default DDeiTableCellCanvasRender