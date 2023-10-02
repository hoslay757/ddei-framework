/**
 * 合并单元格菜单
 */
class MenuInsertCol {
  /**
   * 执行的方法
   */
  static action(model: object, evt: Event): void {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      let table: DDeiTable = model;
      //执行合并单元格
      table.mergeSelectedCells();
    }
  }

  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      //判断是否满足合并单元格条件
      let table = model;
      //如果出现连续的单元格则允许合并，循环选中最大和最小区域，如果都选中，则返回true
      let selectedCells = table.getSelectedCells();
      if (selectedCells.length >= 2) {
        let minMaxColRow = table.getMinMaxRowAndCol(selectedCells);
        return table.isAllSelected(minMaxColRow.minRow, minMaxColRow.minCol, minMaxColRow.maxRow, minMaxColRow.maxCol);
      }
    }
    return false;
  }

}

export default MenuInsertCol;
