import DDeiConfig from '../../config';
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

      for (let i = 0; i < table.rows.length; i++) {
        let rowObj = table.rows[i]
        let stop = false;
        for (let j = 0; j < rowObj.length; j++) {
          let cellObj = rowObj[j];
          if (cellObj.isInAreaLoose(e.offsetX, e.offsetY, 0)) {
            cellObj.render.mouseDown(e);
            if (this.stage.ddInstance.eventCancel) {
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
        //拖动整个表格
        else if (table.dragType == "table") {
          if (this.layer.shadowControls.length == 0) {
            let md = DDeiUtil.getShadowControl(this.stageRender.currentOperateShape);
            this.layer.shadowControls.push(md);
            this.stageRender.currentOperateShape = md;
          }
          let pushData = { x: e.offsetX, y: e.offsetY, dx: this.stageRender.dragObj.dx, dy: this.stageRender.dragObj.dy, models: this.layer.shadowControls };
          //修改所有选中控件坐标
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangePosition, pushData, e);
          //修改辅助线
          this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, { models: this.layer.shadowControls }, e);
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
        //从左上角拖动大小
        else if (table.dragType == "table-size-left-top") {
          table.changeTableSizeToLeft(e.offsetX, e.offsetY);
          table.changeTableSizeToTop(e.offsetX, e.offsetY);

        }
        //从左下角拖动大小
        else if (table.dragType == "table-size-left-bottom") {
          table.changeTableSizeToLeft(e.offsetX, e.offsetY);
          table.changeTableSizeToBottom(e.offsetX, e.offsetY);

        }//从右上角拖动大小
        else if (table.dragType == "table-size-right-top") {
          table.changeTableSizeToRight(e.offsetX, e.offsetY);
          table.changeTableSizeToTop(e.offsetX, e.offsetY);

        }
        //从右下角拖动大小
        else if (table.dragType == "table-size-right-bottom") {
          table.changeTableSizeToRight(e.offsetX, e.offsetY);
          table.changeTableSizeToBottom(e.offsetX, e.offsetY);

        }

      } else {
        for (let i = 0; i < table.rows.length; i++) {
          let rowObj = table.rows[i]
          for (let j = 0; j < rowObj.length; j++) {
            let cellObj = rowObj[j];
            if (cellObj.isInAreaLoose(e.offsetX, e.offsetY, 0)) {
              cellObj.render.mouseMove(e);
              if (this.stage.ddInstance.eventCancel) {
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