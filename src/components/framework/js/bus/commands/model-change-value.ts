import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiUtil from '../../util';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
/**
 * 设置属性值的总线Command
 * 图形类action一般在普通action之后执行
 */
class DDeiBusCommandModelChangeValue extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 具体行为,设置属性值
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    if (stage && data?.mids?.length > 0 && data?.paths?.length > 0) {
      //模型Id
      let mids = data.mids;
      //属性
      let paths = data.paths;
      //值
      let value = data.value;
      //属性定义
      let attrDefine = data.attrDefine;
      if (data?.paths?.indexOf('layout') != -1) {

      } else {
        mids.forEach(modelId => {
          if (modelId) {
            //从bus中获取实际控件
            let model = stage?.getModelById(modelId);
            if (model) {
              //表格是修改里面的选中单元格
              if (model.baseModelType == 'DDeiTable') {
                if (attrDefine.modelCode == 'DDeiTable') {
                  //根据code以及mapping设置属性值
                  DDeiUtil.setAttrValueByPath(model, paths, value)
                } else {
                  let cells = model.getSelectedCells();

                  cells.forEach(cell => {

                    paths.forEach(path => {
                      //如果是border的相关属性，则同步修改后面的单元格，以确保边框显示正常
                      if (path.indexOf("border.bottom") != -1) {
                        //根据code以及mapping设置属性值
                        DDeiUtil.setAttrValueByPath(cell, [path], value)
                        if (cell.row < model.rows.length - 1) {
                          DDeiUtil.setAttrValueByPath(model.rows[cell.row + 1][cell.col], [path.replace("bottom", "top")], value)
                        }
                      } else if (path.indexOf("border.right") != -1) {
                        //根据code以及mapping设置属性值
                        DDeiUtil.setAttrValueByPath(cell, [path], value)
                        if (cell.col < model.cols.length - 1) {
                          DDeiUtil.setAttrValueByPath(model.cols[cell.col + 1][cell.row], [path.replace("right", "left")], value)
                        }
                      } else {
                        //根据code以及mapping设置属性值
                        DDeiUtil.setAttrValueByPath(cell, [path], value)
                      }
                    });


                  });
                }

              } else {
                //根据code以及mapping设置属性值
                DDeiUtil.setAttrValueByPath(model, paths, value)
              }
            }
          }
        });
      }
      return true;
    }
    return false;
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    //如果修改的是layout属性，则同步修改layoutmanager，并重新计算布局
    if (data?.paths?.indexOf('layout') != -1) {
      //更新选择器
      bus?.insert(DDeiEnumBusCommandType.ChangeLayout, data, evt);
    }
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandModelChangeValue({ code: DDeiEnumBusCommandType.ModelChangeValue, name: "", desc: "" })
  }

}


export default DDeiBusCommandModelChangeValue
