import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";

/**
 * 删除行菜单
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
      if (table.curRow != undefined && table.curCol != undefined && table.curRow != -1 && table.curCol != -1) {
        let cell = table.rows[table.curRow][table.curCol];
        let row = cell.row;
        if (row < 0) {
          row = 0;
        } else if (row > table.rows.length - 1) {
          row = table.rows.length - 1;
        }
        table.removeRow(row);
        model.stage.ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);
        model.stage.ddInstance.bus.executeAll();
      }
    }
  }

  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    //当前控件为表格控件，TODO 或者布局方式为表格的容器控件
    if (model?.baseModelType == 'DDeiTable') {
      if (model?.rows?.length > 1) {
        return true
      }
    }
    return false;
  }

}

export default MenuInsertCol;