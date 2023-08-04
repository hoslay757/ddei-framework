import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';

/**
 * selector选择器，用来选择界面上的控件，选择器不是一个实体控件,不会被序列化
 * 选择器有两种状态一种是选择中（默认default)，一种是选择后selected
 * 选择中状态时，随鼠标的拖选而放大缩小
 * 选择后状态时，为所有选中图形的外接矩形
 * 选择器主体上是一个矩形，因此可以继承自Rectangle
 */
class DDeiSelector extends DDeiRectangle {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiSelector {
    let shape = new DDeiSelector(json);
    return shape;
  }
  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiSelector';
  // 本模型的基础图形
  baseModelType: string = 'DDeiSelector';

  // ============================ 方法 ===============================
  /**
   * 获取当前选择器包含的模型
   * @returns 
   */
  getIncludedModels(): Map<string, DDeiAbstractShape> {
    //选中选择器区域内控件
    let selectBounds = this.getBounds();
    let models = new Map();
    for (let i in this.layer?.models) {
      //实际区域减小一定百分比，宽松选择
      let curModel = this.layer?.models[i];
      if (curModel.id != this.id) {
        let x = curModel.x + curModel.width * 0.1;
        let y = curModel.y + curModel.height * 0.1;
        let x1 = curModel.x + curModel.width * 0.9;
        let y1 = curModel.y + curModel.height * 0.9;
        //如果控件在选择区域内，选中控件
        if (selectBounds.x <= x && selectBounds.y < y
          && selectBounds.x1 >= x1 && selectBounds.y1 >= y1) {
          models.set(curModel.id, curModel);
        }
      }
    }
    return models;
  }
}


export default DDeiSelector
