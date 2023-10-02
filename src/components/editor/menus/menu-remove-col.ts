/**
 * 删除列菜单
 */
class MenuInsertCol {
  /**
   * 执行的方法
   */
  static action(model: object, evt: Event): void {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      let table: DDeiTable = model;
      //获取当前单元格
      let cell = model.tempDragCell;
      let col = cell.col;
      if (col < 0) {
        col = 0;
      } else if (col > table.cols.length - 1) {
        col = table.cols.length - 1;
      }
      table.removeCol(col);
    }
  }

  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      if (model?.cols?.length > 1) {
        return true
      }
    }
    return false;
  }

}

export default MenuInsertCol;
