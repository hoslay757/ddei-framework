import DDeiConfig from "../../config";
import DDei from "../../ddei";
import DDeiEnumControlState from "../../enums/control-state";
import DDeiUtil from "../../util";
import DDeiAbstractShape from "../shape";
import DDeiAbstractArrtibuteDefine from "./attribute-define";

/**
 * 属性值，包含了属性定义、当前值
 * 属性值在初始化时装载，序列化时直接序列化为普通json
 */
class DDeiModelArrtibuteValue {
  // ============================ 构造函数 ============================
  // ============================ 静态方法 ============================
  /**
   * 根据模型的当前状态，获取属性值
   * 如果采用缺省值，则当前状态没有值时，会自动去获取外部缺省属性的值
   * TODO 未来考虑一个模型多个状态叠加
   * @param model 模型
   * @param attrPath 属性路径，第一级为属性名称，略过中间的状态层级，如，定义：border.selected.width,写作：border.width
   * @param useDefault  是否采用缺省值，默认false不采用
   * @param initValue 初始化值
   * @returns 模型的值对象
   */
  static getAttrValueByState(model: DDeiAbstractShape, attrPath: string, useDefault: boolean = false,initValue:object|null = null): object | null {
    let returnValue: object | null = null;
    if (model && attrPath) {
      //切分想要获取的属性层级
      let relPath = attrPath.split('.');
      //属性code
      let attrCode = relPath[0];
      //属性详情路径code
      let detailCode = relPath.slice(1);
      //当前模型状态
      let stateCode = model.state?.toString();
      //如果当前状态就是default，则不需要状态路径
      if (model.state == DDeiEnumControlState.DEFAULT || !stateCode) {
        stateCode = "";
      }
      //是否复写，复写后将不会读取后续优先级更低的数据
      let overwrite = false
      //当前状态下是否实例复写
      if (model[attrCode]) {
        //实例的复写属性
        let modelAttr = model[attrCode];
        if (modelAttr) {
          //如果有状态，则增加状态层级
          let path = detailCode;
          if (stateCode) {
            path = [stateCode].concat(detailCode);
          }
          try {
            let returnJSON = DDeiUtil.getDataByPath(modelAttr, path);
            if (returnJSON.overwrite && returnJSON.overwrite == true) {
              overwrite = true;
            }
            returnValue = returnJSON.data;
          } catch (e) {
            // console.warn("获取属性值【" + model.id + "(" + model.state + "):" + attrPath + "】失败,PATH:" + attrPath, e);
          }
          //如果开启了default则尝试获取default的值
          if (!overwrite && (returnValue == null || returnValue == undefined) && useDefault && stateCode.length > 0) {
            path = detailCode;
            try {
              let returnJSON = DDeiUtil.getDataByPath(modelAttr, path);
              if (returnJSON.overwrite && returnJSON.overwrite == true) {
                overwrite = true;
              }
              returnValue = returnJSON.data;
            } catch (e) {
              // console.warn("获取属性值【" + model.id + "(" + model.state + "):" + attrPath + "】失败,PATH:" + attrPath, e);
            }
          }
        }
      }

      //初始化值获取
      if (!overwrite && (returnValue == null || returnValue == undefined) && initValue && typeof(initValue) == 'object') {
        //基于模型的modelCode，反向寻找所指向的定义中的属性
        try {
          //如果有状态，则增加状态层级
          let path = detailCode;
          if (stateCode) {
            path = [stateCode].concat(detailCode);
          }
          let returnJSON = DDeiUtil.getDataByPath(initValue, path);
          if (returnJSON.overwrite && returnJSON.overwrite == true) {
            overwrite = true;
          }
          returnValue = returnJSON.data;
        } catch (e) {
        }
      }

      //控件默认值获取判断
      if (!overwrite && (returnValue == null || returnValue == undefined)) {
        //基于模型的modelCode，反向寻找所指向的定义中的属性
        if (model.modelType != 'DDeiSelector' && DDeiUtil.getAttrValueByConfig) {
          if (stateCode != "") {
            //重新拼接路径,加上状态
            let attrCode = relPath[0];
            let searchPath = attrCode + "." + stateCode + attrPath.substring(attrPath.indexOf('.'));
            let configAtrs = DDeiUtil.getAttrValueByConfig(model, searchPath);
            if (configAtrs && configAtrs.size > 0) {
              let returnJSON = Array.from(configAtrs.values())[0];
              if (returnJSON.overwrite && returnJSON.overwrite == true) {
                overwrite = true;
              }
              returnValue = returnJSON.data;
            }
          }
          if ((returnValue == null || returnValue == undefined)) {
            let configAtrs = DDeiUtil.getAttrValueByConfig(model, attrPath);
            if (configAtrs && configAtrs.size > 0) {
              let returnJSON = Array.from(configAtrs.values())[0];
              if (returnJSON.overwrite && returnJSON.overwrite == true) {
                overwrite = true;
              }
              returnValue = returnJSON.data;
            }
          }
        }
      }

      //系统默认值获取判断
      if (!overwrite && (returnValue == null || returnValue == undefined)) {
        //基于模型的modelType，反向寻找所指向的系统属性
        let sysData = DDeiConfig.getSysDefaultData(model);
        if (sysData && sysData[attrCode]) {
          //如果有状态，则增加状态层级
          let path = detailCode;
          if (stateCode) {
            path = [stateCode].concat(detailCode);
          }
          try {
            let returnJSON = DDeiUtil.getDataByPath(sysData[attrCode], path);
            if (returnJSON.overwrite && returnJSON.overwrite == true) {
              overwrite = true;
            }
            returnValue = returnJSON.data;
          } catch (e) {
            // console.warn("获取系统属性值【" + model.id + "(" + model.state + "):" + attrPath + "】失败,PATH:" + attrPath, e);
          }
          //如果开启了default则尝试获取default的值
          if (!overwrite && (returnValue == null || returnValue == undefined) && useDefault && stateCode.length > 0) {
            path = detailCode;
            try {
              let returnJSON = DDeiUtil.getDataByPath(sysData[attrCode], path);
              if (returnJSON.overwrite && returnJSON.overwrite == true) {
                overwrite = true;
              }
              returnValue = returnJSON.data;
            } catch (e) {
              // console.warn("获取系统属性值【" + model.id + "(" + model.state + "):" + attrPath + "】失败,PATH:" + attrPath, e);
            }
          }
        }
      }
    }
    return returnValue;
  }

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
}



export { DDeiModelArrtibuteValue }
export default DDeiModelArrtibuteValue
