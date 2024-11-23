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
    let stage = bus.ddInstance.stage;
    if (stage && (data?.mids?.length > 0 || data?.models?.length > 0) && data?.paths?.length > 0) {
      //属性定义
      let attrDefine = data.attrDefine;
      if (attrDefine?.readonly) {
        return false;
      }
    }
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
    if (stage && (data?.mids?.length > 0 || data?.models?.length > 0) && data?.paths?.length > 0) {
      //模型Id
      let mids = data.mids;
      //模型
      let models = data.models;
      //属性
      let paths = data.paths;
      //值
      let value = data.value;
      //属性定义
      let attrDefine = data.attrDefine;


      if (data?.paths?.indexOf('layout') != -1) {

      } else {
        if (mids?.length > 0) {
          models = []
          mids.forEach(modelId => {
            if (modelId) {
              if (modelId == 'DDeiStage') {
                models.push(stage);
              } else if (modelId == 'DDeiLayer') {
                models.push(stage?.layers[stage?.layerIndex]);
              } else {
                //从bus中获取实际控件
                let model = stage?.getModelById(modelId);
                if (model) {
                  models.push(model);
                }
              }
            }
          });
        }
        if (models?.length > 0) {
          models.forEach(model => {
            if (model) {
              //表格是修改里面的选中单元格
              if (model.baseModelType == 'DDeiTable') {
                if (attrDefine?.modelCode == 'DDeiTable') {
                  //根据code以及mapping设置属性值
                  DDeiUtil.setAttrValueByPath(model, paths, value)
                } else {
                  let cells = model.getSelectedCells();

                  cells.forEach(cell => {
                    paths.forEach(path => {
                      //根据code以及mapping设置属性值
                      DDeiUtil.setAttrValueByPath(cell, [path], value)
                      cell.render?.setCachedValue(path, value)
                    });


                  });
                }

              } else if (model.baseModelType == 'DDeiLine') {
                //重新计算错线
                model.clps = []
                model.stage.render.refreshJumpLine = false
                //根据code以及mapping设置属性值
                DDeiUtil.setAttrValueByPath(model, paths, value)
                model.render?.setCachedValue(paths, value)
              } else {
                //根据code以及mapping设置属性值
                DDeiUtil.setAttrValueByPath(model, paths, value)
                model.render?.setCachedValue(paths, value)
              }
  
              //检查配置上是否有属性联动
              let modelDefine = DDeiUtil.getControlDefine(model);
              //如果存在配置，则直接采用配置，如果不存在配置则读取文本区域
              if (modelDefine?.define?.sample?.depProps) {
                let depProps = modelDefine.define.sample.depProps;
                //判断是修改的哪个属性
                
                for (let type in depProps){
                  let property = depProps[type]
                  let rmdms = []
                  let hasTypeModel = false
                  let modelPropValue = model[property];
                  model.linkModels?.forEach(lm => {
                    if (lm.type == type && lm.dm) {
                      hasTypeModel = true
                      if (modelPropValue){
                        DDeiUtil.setAttrValueByPath(lm.dm, "text", modelPropValue)
                        lm.dm.render?.setCachedValue("text", modelPropValue)
                        lm.dm.render?.enableRefreshShape()
                      }else{
                        rmdms.push(lm)
                      }
                    }
                  });
                  
                  if (hasTypeModel){
                    //删除图形
                    rmdms.forEach(lm => {
                      model.removeLinkModel(lm.dm.id, true, false)
                    })
                  }
                  //创建控件并设置值
                  else if (modelPropValue){
                    
                    bus.insert(DDeiEnumBusCommandType.CreateDepLinkModel, { model: model, text: modelPropValue },null,0);
                  }
                  
                  

                }
                model.refreshLinkModels()
              }
              
              if(model.depModel){
                //检查配置上是否有属性联动
                let modelDefine = DDeiUtil.getControlDefine(model.depModel);
                //如果存在配置，则直接采用配置，如果不存在配置则读取文本区域
                if (modelDefine?.define?.sample?.depProps) {
                  let depProps = modelDefine.define.sample.depProps;
                  let depLinkModel = model.depModel.linkModels?.get(model.id)
                  let property = depProps[depLinkModel.type]
                  if (property && depLinkModel){
                    DDeiUtil.setAttrValueByPath(model.depModel, property, model.text)
                    model.depModel.render?.setCachedValue(property, model.text)
                    model.depModel.render?.enableRefreshShape()
                  }
                }
              
              }
              model.render?.enableRefreshShape()
            }
          });
          bus.executeAll();
          DDeiUtil.invokeCallbackFunc("EVENT_CONTENT_CHANGE_AFTER", "CHANGE", null, bus.ddInstance)
        }

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
    } else {
      bus.push(DDeiEnumBusCommandType.NodifyChange);
      bus.insert(DDeiEnumBusCommandType.AddHistroy);
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

export { DDeiBusCommandModelChangeValue }
export default DDeiBusCommandModelChangeValue
