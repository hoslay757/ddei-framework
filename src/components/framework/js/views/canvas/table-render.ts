import DDeiConfig from '../../config';
import DDei from '../../ddei';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumControlState from '../../enums/control-state';
import DDeiTable from '../../models/table';
import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';
import DDeiAbstractShapeRender from './shape-render-base';

/**
 * 表格控件的渲染器
 */
class DDeiTableCanvasRender extends DDeiRectangleCanvasRender {

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableCanvasRender {
    return new DDeiTableCanvasRender(props)
  }


  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCanvasRender";
  // ============================== 方法 ===============================

  /**
   * 绘制图形
   */
  drawShape(): void {

    let canvas = this.ddRender.canvas;
    let ctx = canvas.getContext('2d');
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();


    super.drawShape();
    //保存状态
    ctx.save();
    //设置旋转，以确保子图形元素都被旋转
    this.doRotate(ctx, ratPos);


    //获取全局缩放比例
    let ratio = this.ddRender.ratio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
    //剪切当前区域
    ctx.rect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
    ctx.clip();

    this.drawCells();
    this.model.selector.render.drawShape();
    ctx.restore();
  }

  /**
   * 绘制单元格
   */
  drawCells(): void {
    //更新所有单元格     
    for (let i = 0; i < this.model.rows.length; i++) {
      let rowObj = this.model.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.render.drawShape();
      }
    }
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      let table = this.model;
      let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
      let isShift = DDei.KEY_DOWN_STATE.get("shift");
      for (let i = 0; i < table.rows.length; i++) {
        let rowObj = table.rows[i]
        let stop = false;
        for (let j = 0; j < rowObj.length; j++) {
          let currentCell: DDeiTableCell = rowObj[j];
          if (currentCell.isInAreaLoose(e.offsetX, e.offsetY, 10)) {
            let isOk = false;
            if (e.button == 2) {
              table.curRow = currentCell.row;
              table.curCol = currentCell.col;
            } else {
              //按下shift选中区域
              if (isShift) {
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
                if (!isCtrl) {
                  //清空所有选中的单元格
                  table.clearSelectionCells();
                }
                if (currentCell.row == 0 && currentCell.isBorderOn(1, e.offsetX, e.offsetY, 4, 10)) {
                  let col = currentCell.col;
                  for (let i = 0; i < table.rows.length; i++) {
                    table.rows[i][col].selectCell()
                  }
                  isOk = true;
                } else if (currentCell.col == 0 && currentCell.isBorderOn(4, e.offsetX, e.offsetY, 4, 10)) {
                  let row = currentCell.row;
                  for (let i = 0; i < table.cols.length; i++) {
                    table.cols[i][row].selectCell()
                  }
                  isOk = true;
                } else {
                  if (currentCell.isInAreaLoose(e.offsetX, e.offsetY, 0) || (currentCell.row == table.rows.length - 1 && currentCell.isBorderOn(3, e.offsetX, e.offsetY, 0, 10)) || (currentCell.col == table.cols.length - 1 && currentCell.isBorderOn(2, e.offsetX, e.offsetY, 0, 10))) {
                    if (!isCtrl) {
                      //选中当前单元格
                      currentCell.selectCell();
                    } else {
                      //选中当前单元格
                      currentCell.selectOrCancelCell();
                    }
                    isOk = true;
                  }

                }
              }
              //如果存在临时拖拽类型，则将临时拖拽转换为正式拖拽
              console.log(table.tempDragType)
              if (table.tempDragType) {
                if (!isCtrl) {
                  table.dragChanging = true;
                  table.dragCell = table.tempDragCell;
                  if (table.dragCell != null && table.dragCell.isMergeCell()) {
                    table.dragCell = table.rows[table.dragCell.row + table.dragCell.mergeRowNum - 1][table.dragCell.col + table.dragCell.mergeColNum - 1];
                  }
                  table.dragType = table.tempDragType;
                  if (table.dragType == 'row-top') {
                    if (table.curRow > 0) {
                      table.curRow--;
                      table.dragCell = table.rows[table.curRow][table.curCol];
                      table.dragType = "row"
                    } else {
                      table.dragType = "table-size-top";
                    }
                  } else if (table.dragType == 'row-bottom') {
                    if (table.curRow < table.rows.length - 1) {
                      table.dragType = "row"
                    } else {
                      table.dragType = "table-size-bottom";
                    }
                  } else if (table.dragType == 'col-left') {
                    if (table.curCol > 0) {
                      table.curCol--;
                      table.dragCell = table.rows[table.curRow][table.curCol];
                      table.dragType = "col"
                    } else {
                      table.dragType = "table-size-left";
                    }
                  } else if (table.dragType == 'col-right') {
                    if (table.curCol < table.cols.length - 1) {
                      table.dragType = "col"
                    } else {
                      table.dragType = "table-size-right";
                    }
                  }
                }
              } else {
                table.dragChanging = false;
                table.dragCell = null;
                table.dragType = null;
              }

            }
            if (isOk) {
              currentCell.render.mouseDown(e);
              stop = true;
              break;
            }
          }
        }
        if (stop) {
          break;
        }

      }
      if (e.button == 2) {
        table.dragChanging = false;
        table.specilDrag = false;
        table.tempDragCell = null;
        table.tempDragType = null;
        table.tempUpCel = null;
        table.dragCell = null;
        table.dragType = null;
      }
    }
  }
  /**
   * 绘制图形
   */
  mouseUp(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

      let table = this.model;
      if (table.dragChanging) {
        table.dragChanging = false;
        table.specilDrag = false;
        table.tempDragCell = null;
        table.tempDragType = null;
        table.tempUpCel = null;
        table.dragCell = null;
        table.dragType = null;
      } else {
        for (let i = 0; i < table.rows.length; i++) {
          let rowObj = table.rows[i]
          for (let j = 0; j < rowObj.length; j++) {
            let cellObj = rowObj[j];
            if (cellObj.isInAreaLoose(e.offsetX, e.offsetY, 0)) {
              cellObj.render.mouseUp(e);
              if (this.stage.ddInstance.eventCancel) {
                return;
              }
            }
          }
        }
      }
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      super.mouseMove(e);
      let table: DDeiTable = this.model;
      if (table.dragChanging) {
        table.setState(DDeiEnumControlState.SELECTED)
        //拖动列
        if (table.dragType == "col") {
          table.dragCol(e.offsetX, e.offsetY);
        }
        //拖动行
        else if (table.dragType == "row") {
          table.dragRow(e.offsetX, e.offsetY);
        }
        //拖动单元格
        else if (table.dragType == "cell") {
          table.dragAndSelectedCell(e.offsetX, e.offsetY);
        }
        //从最右边拖拽表格大小
        else if (table.dragType == "table-size-right") {
          table.changeTableSizeToRight(e.offsetX, e.offsetY);
        }
        //从最左边拖拽表格大小
        else if (table.dragType == "table-size-left") {
          table.changeTableSizeToLeft(e.offsetX, e.offsetY);
        }
        //从最下边拖拽表格大小
        else if (table.dragType == "table-size-bottom") {
          table.changeTableSizeToBottom(e.offsetX, e.offsetY);
        }
        //从最上边拖拽表格大小
        else if (table.dragType == "table-size-top") {
          table.changeTableSizeToTop(e.offsetX, e.offsetY);
        }
      } else {
        for (let i = 0; i < table.rows.length; i++) {
          let rowObj = table.rows[i]
          for (let j = 0; j < rowObj.length; j++) {
            let cellObj = rowObj[j];
            if (cellObj.isInAreaLoose(e.offsetX, e.offsetY, 10)) {
              let isDrag = false;
              //上边线
              if (cellObj.isBorderOn(1, e.offsetX, e.offsetY)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
                table.tempDragType = "row-top";
                isDrag = true
              }
              //上边线靠外部
              else if (cellObj.row == 0 && cellObj.isBorderOn(1, e.offsetX, e.offsetY, 4, 10)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 's-resize' }, e);
                isDrag = true;
              }
              //右边线
              else if ((cellObj.col == table.cols.length - 2 && cellObj.isBorderOn(2, e.offsetX, e.offsetY, -3, -1)) || (cellObj.col != table.cols.length - 2 && cellObj.isBorderOn(2, e.offsetX, e.offsetY))) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
                table.tempDragType = "col-right";
                isDrag = true;
              }//下边线
              else if ((cellObj.row == table.rows.length - 2 && cellObj.isBorderOn(3, e.offsetX, e.offsetY, -3, -1)) || (cellObj.row != table.rows.length - 2 && cellObj.isBorderOn(3, e.offsetX, e.offsetY))) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
                table.tempDragType = "row-bottom";
                isDrag = true;
              }//左边线
              else if (cellObj.isBorderOn(4, e.offsetX, e.offsetY)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
                table.tempDragType = "col-left";
                isDrag = true;
              }
              //左边线靠外部
              else if (cellObj.col == 0 && cellObj.isBorderOn(4, e.offsetX, e.offsetY, 4, 10)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'e-resize' }, e);
                isDrag = true;
              }
              //单元格中间部分
              else if (cellObj.isInAreaLoose(e.offsetX, e.offsetY, 0)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'all-scroll' }, e);
                table.tempDragType = "cell";
                isDrag = true;
              }
              if (isDrag) {
                table.tempDragCell = cellObj
                cellObj.render.mouseMove(e);
                return;
              }
            }
          }
        }
      }

    }
  }
}

export default DDeiTableCanvasRender