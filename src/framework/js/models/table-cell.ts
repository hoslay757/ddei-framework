import DDeiAbstractShape from './shape';
import DDeiRectContainer from './rect-container';
import DDeiTable from './table';
import DDeiEnumControlState from '../enums/control-state';

/**
 * 单元格控件
 * 单元格控件能够承载控件与数据
 * 当承载数据时和普通控件没有区别，当作为容器时允许拥有自己的布局
 * 缺省布局为full
 * 单元格必须依附于表格控件才能存在
 */
class DDeiTableCell extends DDeiRectContainer {

  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
    this.table = props.table
    this.row = props.row
    this.col = props.col
    this.mergeRowNum = props.mergeRowNum;
    this.mergeColNum = props.mergeColNum;
    this.mergedCell = props.mergedCell;
    this.originWidth = props.originWidth;
    this.originHeight = props.originHeight;
  }

  // ============================ 方法 ===============================
  /**
     * 当前单元格是否为合并单元格
     */
  isMergeCell(): boolean {
    return this.mergeRowNum > 1 || this.mergeColNum > 1;
  }

  /**
   * 当前单元格是否为被合并单元格
   */
  isMergedCell(): boolean {
    return this.mergedCell != null;
  }



  /**
   * 设置当前单元格状态为选中
   */
  selectCell(): void {

    //让自身成为选中状态
    this.setState(DDeiEnumControlState.SELECTED)
    //标注表格中当前的单元格
    this.table.curRow = this.row;
    this.table.curCol = this.col;
  }

  /**
   * 选择或者取消选择当前单元格
   */
  selectOrCancelCell(): void {
    if (this.state == DDeiEnumControlState.SELECTED) {
      this.setState(DDeiEnumControlState.DEFAULT);
      this.table.curRow = -1;
      this.table.curCol = -1;
    } else {
      this.selectCell()
    }
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let container = new DDeiTableCell(json);

    container.layer = tempData['currentLayer']
    container.stage = tempData['currentStage']
    container.pModel = tempData['currentContainer']
    if (!container.pModel) {
      container.pModel = container.layer;
    }
    tempData[container.id] = container;
    let ddInstance = container.stage?.ddInstance;
    let models: Map<String, DDeiAbstractShape> = new Map<String, DDeiAbstractShape>();
    for (let key in json.models) {
      tempData['currentContainer'] = container;
      let item = json.models[key];
      let model = ddInstance.controlModelClasses[item.modelType].loadFromJSON(item, tempData);
      models.set(key, model)
      tempData['currentContainer'] = null;
    }

    container.models = models;
    container.initPVS();
    container.initRender();
    return container;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiTableCell {
    let model = new DDeiTableCell(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCell";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiTableCell';
  // 本模型的基础图形
  baseModelType: string = 'DDeiTableCell';

  //单元格所在表格，不会被序列化
  table: DDeiTable;

  //当本单元格为合并单元格启始单元格时，合并行数量
  mergeRowNum: number;
  //当本单元格为合并单元格启始单元格时，合并列数量
  mergeColNum: number;
  //当本单元格为被合并单元格时，指向合并单元格的引用，不会被序列化
  mergedCell: number;
  //原始宽度
  originWidth: number;
  //原始高度
  originHeight: number;
  //当前单元格所在行
  row: number;
  //当前单元格所在列
  col: number;
}

export {DDeiTableCell }
export default DDeiTableCell
