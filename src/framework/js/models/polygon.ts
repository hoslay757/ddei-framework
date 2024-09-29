import DDeiAbstractShape from './shape'
import DDeiUtil from '../util';
import { Matrix3, Vector3 } from 'three';
import DDeiConfig from '../config';
import DDeiModelArrtibuteValue from './attribute/attribute-value'
import { cloneDeep } from 'lodash';
/**
 * polygon由3个以上点构成的图形
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiPolygon extends DDeiAbstractShape {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
    
    //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
    this.border = props.border ? props.border : null;
    //填充，包含了选中/未选中，填充的颜色等配置
    this.fill = props.fill ? props.fill : null;
    //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
    this.font = props.font ? props.font : null;
    //文本内容
    this.text = props.text ? props.text : "";
    //图片base64
    this.imgBase64 = props.imgBase64 ? props.imgBase64 : "";

    //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
    this.textStyle = props.textStyle ? props.textStyle : null;

    if (props.textArea) {
      this.textArea = [];
      props.textArea.forEach(pvd => {
        let pv = new Vector3()
        for (let i in pvd) {
          pv[i] = pvd[i]
        }
        pv.z = (pvd.z || pvd.z === 0) ? pvd.z : 1
        this.textArea.push(pv);
      });
    }
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json: object, tempData: object = {}, initPVS: boolean = true): DDeiPolygon {
    let model = new DDeiPolygon(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    let ddInstance = model.stage?.ddInstance;
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;

    //初始化composes
    if (json?.composes?.length > 0) {
      let composes = []
      json?.composes.forEach(composeJSON => {
        let def = DDeiUtil.getControlDefine(composeJSON)
        let composeModel: DDeiAbstractShape = ddInstance.controlModelClasses[def.type].loadFromJSON(
          composeJSON,
          tempData,
          false
        );
        composeModel.pModel = model
        composes.push(composeModel)
      });
      model.composes = composes
    }
    //基于初始化的宽度、高度，构建向量
    if (initPVS) {
      model.initPVS();
    }
    model.initRender();
    return model;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json: object, tempData: object = {}, initPVS: boolean = true): DDeiPolygon {
    let model = new DDeiPolygon(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    let ddInstance = model.stage?.ddInstance;
    //初始化composes
    if (json?.composes?.length > 0) {
      let composes = []
      json?.composes.forEach(composeJSON => {
        let def = DDeiUtil.getControlDefine(composeJSON)
        let composeModel: DDeiAbstractShape = ddInstance.controlModelClasses[def.type].initByJSON(
          composeJSON,
          tempData,
          false
        );
        composeModel.pModel = model
        composes.push(composeModel)
      });
      model.composes = composes
    }
    //基于初始化的宽度、高度，构建向量
    if (initPVS) {
      model.initPVS();
    }
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiPolygon";
  // ============================ 属性 ===============================
  //边框，包含了选中/未选中，4个边框的大小，颜色，样式等配置
  border: any;
  //填充，包含了选中/未选中，填充的颜色等配置
  fill: any;
  //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
  font: any;
  //图片base64
  imgBase64: string;
  //文本内容
  text: string;
  //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
  textStyle: any;
  //文本区域
  textArea: object[];
  // 本模型的唯一名称
  modelType: string = 'DDeiPolygon';
  // 本模型的基础图形
  baseModelType: string = 'DDeiPolygon';

  // ============================ 方法 ===============================

  /**
   * 初始化渲染器
   */
  initRender(): void {

    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
    //加载所有模型的渲染器
    this.composes?.forEach(compose => {
      compose.initRender()
    });

    delete this.__destroyed
  }

  //覆写hpv
  initHPV(): void {

  }

  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean }): void {
    if (this.poly == 2) {
    } else {
      this.textArea.forEach(pv => {
        pv.applyMatrix3(matrix)
      });
      this.hpv.forEach(pv => {
        pv.applyMatrix3(matrix)
      });

    }
    super.transVectors(matrix, params)
  }

  /**
  * 同步向量
  * @param source 源模型
  * @param cloneVP 是否克隆向量，默认false
  */
  syncVectors(source: DDeiAbstractShape, clonePV: boolean = false): void {
    if (this.poly == 2) {

    } else {
      if (clonePV) {
        this.textArea = cloneDeep(source.textArea)
        this.hpv = cloneDeep(source.hpv)
      } else {
        this.textArea = source.textArea
        this.hpv = source.hpv
      }
    }
    super.syncVectors(source, clonePV)
  }



  /**
   * 返回某个点，相对于该图形的角度
   */
  getPointAngle(point): number {
    let bpv = DDeiUtil.pointsToZero([this.bpv], this.cpv, this.rotate)[0]
    let scaleX = Math.abs(bpv.x / 100)
    let scaleY = Math.abs(bpv.y / 100)

    let zeroPoint = DDeiUtil.pointsToZero([new Vector3(point.x, point.y, 1)], this.cpv, this.rotate)[0];
    zeroPoint.x /= scaleX
    zeroPoint.y /= scaleY

    let lineAngle = parseFloat(DDeiUtil.getLineAngle(0, 0, zeroPoint.x, zeroPoint.y).toFixed(4))
    //上
    if (lineAngle < -45 && lineAngle > -135) {
      // return DDeiUtil.getLineAngle(0, 0, 0, -2)
      return -90
    }
    //右
    else if (lineAngle > -45 && lineAngle < 45) {
      // return DDeiUtil.getLineAngle(0, 0, 2, 0)
      return 0
    }
    //下
    else if (lineAngle > 45 && lineAngle < 135) {
      // return DDeiUtil.getLineAngle(0, 0, 0, 2)
      return 90
    }
    else {
      //特殊的4个角度的特殊值，特殊值的可左可右，后续程序利用这几个值来进行判断和计算
      switch (lineAngle) {
        case -45: return 1002;
        case 45: return 1003;
        case -135: return 1001;
        case 135: return 1004;
      }
      // return DDeiUtil.getLineAngle(0, 0, -2, 0)
      //左
      return 180
    }
  }


  toJSON(): Object {
    let json = super.toJSON()
    //标尺单位
    let ruleDisplay
    let ruleInit
    if (this.stage.ruler?.display || this.stage.ruler?.display == 0 || this.stage.ruler?.display == false) {
      ruleDisplay = this.stage.ruler.display;
    } else if (this.stage.ddInstance.ruler != null && this.stage.ddInstance.ruler != undefined) {
      if (typeof (this.stage.ddInstance.ruler) == 'boolean') {
        ruleDisplay = this.stage.ddInstance.ruler ? 1 : 0;
      } else {
        ruleInit = this.stage.ddInstance.ruler
        ruleDisplay = ruleInit.display;
      }
    } else {
      ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "ruler.display", true);
    }
    let unit = DDeiModelArrtibuteValue.getAttrValueByState(this.stage, "ruler.unit", true, ruleInit);

    //处理点坐标变换
    if (ruleDisplay) {
      if (this.cpv) {
        json.cpv = cloneDeep(this.cpv);
        let cpv = DDeiUtil.toRulerCoord({ x: this.cpv.x, y: this.cpv.y }, this.stage, unit)
        json.cpv.x = cpv.x
        json.cpv.y = cpv.y
      }
      if (this.hpv) {
        json.hpv = cloneDeep(this.hpv);
        for (let i = 0; i < this.hpv.length; i++) {
          let hpv = DDeiUtil.toRulerCoord({ x: this.hpv[i].x, y: this.hpv[i].y }, this.stage, unit)
          json.hpv[i].x = hpv.x
          json.hpv[i].y = hpv.y
        }
      }
      if (this.bpv) {
        json.bpv = cloneDeep(this.bpv);
        let bpv = DDeiUtil.toRulerCoord({ x: this.bpv.x, y: this.bpv.y }, this.stage, unit)
        json.bpv.x = bpv.x
        json.bpv.y = bpv.y
      }
      if (this.exPvs) {
        json.exPvs = cloneDeep(this.exPvs);
        for (let i in this.exPvs) {
          let pv = DDeiUtil.toRulerCoord({ x: this.exPvs[i].x, y: this.exPvs[i].y }, this.stage, unit)
          json.exPvs[i].x = pv.x
          json.exPvs[i].y = pv.y
        }
      }
    }
    
    return json;
  }



}


export {DDeiPolygon}
export default DDeiPolygon
