import DDei from '../../ddei';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumControlState from '../../enums/control-state';
import DDeiTable from '../../models/table';
import DDeiUtil from '../../util';
import DDeiRectangleCanvasRender from './rectangle-render';
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
   * 获取html
   */
  getHTML(): string {
    let selectedCells = this.model.getSelectedCells();
    if (selectedCells?.length > 0) {
      let html = '';
      html += '<table'
      html += ' width="' + this.model.width + '"'
      html += ' height="' + this.model.width + '"'
      html += '>'

      let minMax = this.model.getMinMaxRowAndCol(selectedCells);
      //选中区域内所哟段元格
      for (let x = minMax.minRow; x <= minMax.maxRow; x++) {

        html += '<tr'
        if (this.model.rows[x][0].isMergedCell()) {
          html += ' height="' + this.model.rows[x][0].originHeight + '"'
        } else {
          html += ' height="' + this.model.rows[x][0].height + '"'
        }
        html += '>'
        for (let y = minMax.minCol; y <= minMax.maxCol; y++) {
          //选中所有单元格
          html += this.model.rows[x][y].render.getHTML();
        }
        html += '</tr>'
      }
      html += '</table>'
      return html;
    } else {
      return null;
    }
  }
  /**
   * 绘制图形
   */
  drawShape(): void {
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    //转换为缩放后的坐标
    let ratPos = this.getBorderRatPos();

    super.drawShape();
    //保存状态
    ctx.save();
    //设置旋转，以确保子图形元素都被旋转
    this.doRotate(ctx, ratPos);


    //获取全局缩放比例
    let stageRatio = this.model.getStageRatio()
    let ratio = this.ddRender.ratio * stageRatio;
    //计算填充的原始区域
    let fillAreaE = this.getFillArea();
    //转换为缩放后的坐标
    ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
    //剪切当前区域
    let lineOffset = 1 * ratio / 2;
    ctx.rect(ratPos.x + lineOffset, ratPos.y + lineOffset, ratPos.width, ratPos.height);
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
    let mergeCells = [];
    for (let i = 0; i < this.model.rows.length; i++) {
      let rowObj = this.model.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        if (cellObj.isMergeCell()) {
          mergeCells.push(cellObj)
        } else if (!cellObj.isMergedCell()) {
          cellObj.render.drawShape();
        }
      }
    }
    mergeCells.forEach(item => {
      item.render.drawShape()
    })
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
      let currentCell: DDeiTableCell = table.tempDragCell;
      if (e.button == 2) {
        table.curRow = currentCell.row;
        table.curCol = currentCell.col;
        table.dragChanging = false;
        table.specilDrag = false;
        table.tempDragCell = null;
        table.tempDragType = null;
        table.tempUpCel = null;
        table.dragCell = null;
        table.dragType = null;
      } else if (table.tempDragType) {
        table.dragType = table.tempDragType
        table.dragChanging = true;
        table.dragCell = table.tempDragCell;
        //选中整列
        if (table.dragType == "table-select-col") {
          //清空所有选中的单元格
          table.clearSelectionCells();
          //找到当前行
          for (let col = 0; col < table.cols.length; col++) {
            let colObj = table.cols[col];
            if (colObj[0].isBorderOn(1, e.offsetX, e.offsetY, 1, 5)) {
              colObj.forEach(item => {
                item.selectCell()
              });
              break;
            }
          }
        }
        //选中整行
        else if (table.dragType == "table-select-row") {
          //清空所有选中的单元格
          table.clearSelectionCells();
          //找到当前行
          for (let row = 0; row < table.rows.length; row++) {
            let rowObj = table.rows[row];
            if (rowObj[0].isBorderOn(4, e.offsetX, e.offsetY, 1, 5)) {
              rowObj.forEach(item => {
                item.selectCell()
              });
              break;
            }
          }
        }
        //选中单元格
        else if (table.dragType == "cell") {
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
              //选中当前单元格
              currentCell.selectCell();
            } else {
              //选中当前单元格
              currentCell.selectOrCancelCell();
            }
            currentCell.render.mouseDown(e)
          }
        }
        if (!isCtrl) {
          if (table.dragType == 'row-top') {
            if (table.dragCell.row > 0) {
              table.dragCell = table.rows[table.dragCell.row - 1][table.dragCell.col];
              table.dragType = "row"
            }
          } else if (table.dragType == 'row-bottom') {
            if (table.dragCell.isMergeCell()) {
              table.dragCell = table.rows[table.dragCell.row + table.dragCell.mergeRowNum - 1][table.dragCell.col];
            }
            if (table.dragCell.row < table.rows.length - 1) {
              table.dragType = "row"
            }
          } else if (table.dragType == 'col-left') {
            if (table.dragCell.col > 0) {
              table.dragCell = table.rows[table.dragCell.row][table.dragCell.col - 1];
              table.dragType = "col"
            }
          } else if (table.dragType == 'col-right') {
            if (table.dragCell.isMergeCell()) {
              table.dragCell = table.rows[table.dragCell.row][table.dragCell.col + table.dragCell.mergeColNum - 1];
            }
            if (table.dragCell.col < table.cols.length - 1) {
              table.dragType = "col"
            }
          }
        }
      } else {
        table.dragChanging = false;
        table.dragCell = null;
        table.dragType = null;
      }
    }
  }


  controlDragEnd(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {
      let table = this.model;
      table.dragChanging = false;
      table.specilDrag = false;
      table.tempDragCell = null;
      table.tempDragType = null;
      table.tempUpCel = null;
      table.dragCell = null;
      table.dragType = null;
    }
  }
  /**
   * 绘制图形
   */
  mouseUp(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

      let table = this.model;
      if (table.dragChanging) {
        if (table.dragType == "cell") {

          table.dragCell?.render?.mouseUp(e);
        }
        table.dragChanging = false;
        table.specilDrag = false;
        // table.tempDragCell = null;
        // table.tempDragType = null;
        table.tempUpCel = null;
        table.dragCell = null;
        table.dragType = null;
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
        //判断是否在表格的四个边附近
        //表格上边拖拽大小区域
        if (table.isBorderOn(1, e.offsetX, e.offsetY, 6, 10) || table.isBorderOn(1, e.offsetX, e.offsetY, -3, 0)) {
          table.tempDragType = "table-size-top";
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
        }
        //表格上边线选中整列区域
        else if (table.isBorderOn(1, e.offsetX, e.offsetY, 1, 5)) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 's-resize' }, e);
          table.tempDragType = "table-select-col";
        }
        //表格右边线
        else if (table.isBorderOn(2, e.offsetX, e.offsetY, -5, 10)) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
          table.tempDragType = "table-size-right";
        }
        //表格下边线
        else if (table.isBorderOn(3, e.offsetX, e.offsetY, -5, 10)) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
          table.tempDragType = "table-size-bottom";
        }
        //表格左边拖拽大小区域
        else if (table.isBorderOn(4, e.offsetX, e.offsetY, 6, 10) || table.isBorderOn(4, e.offsetX, e.offsetY, -3, 0)) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
          table.tempDragType = "table-size-left";
        }
        //表格左边线选中整行区域
        else if (table.isBorderOn(4, e.offsetX, e.offsetY, 1, 5)) {
          this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'e-resize' }, e);
          table.tempDragType = "table-select-row";
        }
        else {
          for (let i = 0; i < table.rows.length; i++) {
            let rowObj = table.rows[i]
            for (let j = 0; j < rowObj.length; j++) {
              let cellObj = rowObj[j];
              let isDrag = false;
              if (cellObj.width <= 0 || cellObj.height <= 0) {
                continue;
              }
              //上边线
              if (cellObj.isBorderOn(1, e.offsetX, e.offsetY, -3, 0)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
                table.tempDragType = "row-top";
                isDrag = true
              }
              //右边线
              else if (cellObj.isBorderOn(2, e.offsetX, e.offsetY, -3, 0)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
                table.tempDragType = "col-right";
                isDrag = true;
              }//下边线
              else if (cellObj.isBorderOn(3, e.offsetX, e.offsetY, -3, 0)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ns-resize' }, e);
                table.tempDragType = "row-bottom";
                isDrag = true;
              }//左边线
              else if (cellObj.isBorderOn(4, e.offsetX, e.offsetY, -3, 0)) {
                this.stage.ddInstance.bus.push(DDeiEnumBusCommandType.ChangeCursor, { cursor: 'ew-resize' }, e);
                table.tempDragType = "col-left";
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