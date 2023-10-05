/**
 * 取消合并单元格菜单
 */
class MenuInsertCol {
  /**
   * 执行的方法
   */
  static action(model: object, evt: Event): void {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      let table: DDeiTable = model;
      //执行取消合并单元格
      table.cancelSelectedMergeCells();
    }
  }

  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      let table = model;
      let selectedCells = table.getSelectedCells();
      //判断当前选中的单元格是否具备取消合并单元格的条件，如果具备条件，则返回true
      if (selectedCells.length == 1 && (selectedCells[0].mergeRowNum > 1 || selectedCells[0].mergeColNum > 1)) {
        return true;
      }
    }
    return false;
  }

}

export default MenuInsertCol;
