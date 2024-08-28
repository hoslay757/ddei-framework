import DDeiEditorEnumBusCommandType from '@ddei-core/editor/js/enums/editor-command-type';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import { cloneDeep } from 'lodash';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import DDeiEnumOperateType from '../../enums/operate-type';
import DDeiEditorUtil from '@ddei-core/editor/js/editor-util';
import type DDeiAbstractShape from '../../models/shape';
import DDeiUtil from '../../util';
/**
 * 改变Stage已选控件的总线Command
 */
class DDeiBusCommandStageChangeSelectModels extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Command无需校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    if (bus.ddInstance.disabled) {
      return false;
    }
    return true;
  }

  /**
   * 具体行为，设置当前控件的选中状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage;
    let editor = bus.invoker
    if (stage) {
      //获取当前选中控件
      //当前激活的图层
      let optContainer = stage.render.currentOperateContainer;
      if (!optContainer) {
        optContainer = stage.layers[stage.layerIndex]
      }
      let selectedModels = optContainer.getSelectedModels();
      let oldSelectModels = stage.selectedModels
      stage.changeSelecetdModels(selectedModels);
      let hasChange = false;
      let newSelectModels = stage.selectedModels
      if (oldSelectModels?.size !== newSelectModels?.size) {
        hasChange = true;
      }
      if (!hasChange) {
        for (let key of oldSelectModels?.keys()) {
          if (oldSelectModels?.get(key) !== newSelectModels?.get(key)) {
            hasChange = false;
            break;
          }
        }
      }
      // if (hasChange) {
      
      //获取当前模型的属性定义
      if (selectedModels?.size > 0) {
        let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
        let firstModel: DDeiAbstractShape = models[0];
        let firstControlDefine = cloneDeep(
          editor.controls.get(firstModel?.modelCode)
        );
        if (firstControlDefine) {
          //如果同时有多个组件被选中，则以第一个组件为基准，对属性定义进行过滤，属性值相同则采用相同值，属性值不同采用空值
          let removeKeys = [];
          for (let i = 0; i < models.length; i++) {
            let curModel: DDeiAbstractShape = models[i];
            let curDefine = editor.controls.get(curModel.modelCode);

            firstControlDefine.attrDefineMap.forEach(
              (firstAttrDefine, attrKey) => {
                //key不存在
                if (!curDefine.attrDefineMap.has(attrKey)) {
                  removeKeys.push(attrKey);
                  firstAttrDefine.model = curModel;
                }
                //隐藏
                else if (!firstAttrDefine.visiable) {
                  removeKeys.push(attrKey);
                  firstAttrDefine.model = curModel;
                }
                //key存在，进一步比较值
                else {
                  //当前属性的定义
                  let curAttrDefine = curDefine.attrDefineMap.get(attrKey);
                  //记录属性值
                  if (i == 0) {
                    firstAttrDefine.value = DDeiUtil.getDataByPathList(
                      firstModel,
                      curAttrDefine.code,
                      curAttrDefine.mapping
                    );
                    firstAttrDefine.model = firstModel;
                  }
                  //根据属性定义，从model获取值
                  let curAttrValue = DDeiUtil.getDataByPathList(
                    curModel,
                    curAttrDefine.code,
                    curAttrDefine.mapping
                  );
                  if (firstAttrDefine.value != curAttrValue) {
                    //记录备选值
                    firstAttrDefine.diffValues.push(curAttrValue);
                  }
                }
              }
            );
          }
          //清除不同的属性
          this.deleteAttrDefineByKeys(firstControlDefine, removeKeys);
          
          if (firstControlDefine.groups?.length > 0) {
            editor.currentControlDefine = firstControlDefine;
          } else {
            editor.currentControlDefine = null;
          }
        }
      }else{
        editor.currentControlDefine = null;
      }
      
      
      DDeiEditorUtil.invokeCallbackFunc("EVENT_CONTROL_SELECT_AFTER", DDeiEnumOperateType.SELECT, { models: Array.from(selectedModels.values()) },bus.ddInstance,evt)
      // }
      return true;
    }
  }

  /**
   * 后置行为，分发，修改当前editor的状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
      parts: ["topmenu"],
    });

    return true;
  }


  /**
   * 移除属性定义中的属性
   * @param firstControlDefine
   * @param removeKeys
   */
  private deleteAttrDefineByKeys(firstControlDefine: object, removeKeys: string[]) {
    //移除属性
    removeKeys.forEach((item) => {
      firstControlDefine.attrDefineMap.delete(item);
      firstControlDefine.groups?.forEach(group => {
        this.deleteGroupAttrsByKey(group, item);
      });

    });
  }

  private deleteGroupAttrsByKey(pData: object, key: string): void {
    let rmglist = [];
    pData.subGroups.forEach((group) => {
      let rmlist = [];
      for (let gci = 0; gci < group.children.length; gci++) {
        if (group.children[gci].code == key) {
          rmlist.push(group.children[gci]);
        }
      }
      rmlist.forEach((rm) => {
        let index = group.children.indexOf(rm);
        if (index > -1) {
          group.children.splice(index, 1);
        }
      });
      //如果group被清空，则删除group
      if (group.children.length == 0) {
        rmglist.push(group);
      }
    });
    rmglist.forEach((rmg) => {
      let index = pData.subGroups.indexOf(rmg);
      if (index > -1) {
        pData.subGroups.splice(index, 1);
      }
    });
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandStageChangeSelectModels({ code: DDeiEnumBusCommandType.StageChangeSelectModels, name: "", desc: "" })
  }
  

}

export { DDeiBusCommandStageChangeSelectModels }
export default DDeiBusCommandStageChangeSelectModels
