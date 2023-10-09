import DDeiConfig from '../config';
import DDei from '../ddei';
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';
import _, { cloneDeep } from 'lodash'
import { Matrix3, Vector3 } from 'three';
import DDeiSelector from './selector';
import DDeiTable from './table';

/**
 * 表格的选择器，用来选择界面上的控件，选择器不是一个实体控件,不会被序列化
 * 选择器有两种状态一种是选择中（默认default)，一种是选择后selected
 * 选择中状态时，随鼠标的拖选而放大缩小
 * 选择后状态时，为所有选中图形的外接矩形
 * 选择器主体上是一个矩形，因此可以继承自Rectangle
 */
class DDeiTableSelector extends DDeiSelector {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
    this.table = props.table;
  }

  // ============================ 方法 ===============================

  /**
  * 根据已选择的表格单元格，更新自身的大小以及位置
  */
  updatedBounds(): void {
    if (this.table.state == DDeiEnumControlState.DEFAULT) {
      this.setBounds(0, 0, 0, 0)
    } else {
      //设置选中区域
      let minMax = this.table.getMinMaxRowAndCol(this.table.getSelectedCells());
      if (minMax) {
        let rect = this.table.getCellPositionRect(minMax.minRow, minMax.minCol, minMax.maxRow, minMax.maxCol);
        let tableAbsPos = this.table.getAbsPosition();

        this.setBounds(tableAbsPos.x + rect.x, tableAbsPos.y + rect.y, rect.width, rect.height)
      } else {
        this.setBounds(0, 0, 0, 0)
      }
    }
  }
  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiTableSelector {
    let shape = new DDeiTableSelector(json);
    return shape;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableSelector";
  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiTableSelector';
  // 本模型的基础图形
  baseModelType: string = 'DDeiSelector';

  //当前选择器所在的表格
  table: DDeiTable;
  // ============================ 方法 ===============================
}


export default DDeiTableSelector
