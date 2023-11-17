import DDeiConfig from '../config'
import DDeiAbstractShape from './shape'
import { Matrix3, Vector3 } from 'three';
import { clone, cloneDeep } from 'lodash'
/**
 * line（连线）
 * 主要样式属性：颜色、宽度、开始和结束节点样式、虚线、字体、文本样式
 * 主要属性：文本、图片、点、连线类型、开始和结束节点类型
 */
class DDeiLine extends DDeiAbstractShape {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
    //线段颜色
    this.color = props.color;
    //线段宽度
    this.weight = props.weight;
    //开始和结束节点的样式
    this.estyle = props.estyle;
    this.sstyle = props.sstyle;
    //虚线属性
    this.dash = props.dash;
    //虚线属性
    this.points = props.points;
    //连线类型
    this.type = props.type ? props.type : 1;
    //开始和结束节点的类型
    this.etype = props.etype ? props.etype : 0;
    this.stype = props.stype ? props.stype : 0;
    //文本内容
    this.text = props.text ? props.text : "";
    //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
    this.font = props.font ? props.font : null;
    //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
    this.textStyle = props.textStyle ? props.textStyle : null;
    //透明度
    this.opacity = props.opacity
    //圆角
    this.round = props.round
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): DDeiLine {
    let model = new DDeiLine(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiLine {
    let model = new DDeiLine(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    return model;
  }



  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLine";
  // ============================ 属性 ===============================
  //线段宽度
  weight: number;
  //线段颜色
  color: string;
  //字体，包含了选中/未选中，字体的名称，大小，颜色等配置
  font: any;
  //文本内容
  text: string;
  //文本样式（除字体外），包含了横纵对齐、文字方向、镂空、换行、缩小字体填充等文本相关内容
  textStyle: any;
  // 本模型的唯一名称
  modelType: string = 'DDeiLine';
  // 本模型的基础图形
  baseModelType: string = 'DDeiLine';

  //开始和结束节点的样式
  estyle: any;
  sstyle: any;
  //虚线
  dash: number;
  //线类型
  type: number;
  //开始和结束节点的类型
  etype: number;
  stype: number;
  //透明度
  opacity: number;
  //圆角
  round: number;

  // ============================ 方法 ===============================


  /**
   * 初始化向量，默认开始在0，0的位置
   */
  initPVS() {
    if (!this.cpv) {
      this.cpv = new Vector3(0, 0, 1)
    }
    if (!this.pvs || this.pvs.length < 2) {
      this.pvs = []
      this.pvs[0] = new Vector3(0, 0, 1)
      //全局缩放因子
      let stageRatio = this.getStageRatio();
      let w = 100 * stageRatio
      this.pvs[1] = new Vector3(w, 0, 1)
      this.pvs[2] = new Vector3(w, w, 1)
      this.pvs[3] = new Vector3(w * 2, w, 1)
      this.pvs[4] = new Vector3(w * 2, w * 2, 1)
      this.pvs[5] = new Vector3(w * 3, w * 2, 1)
    }
    this.initHPV();
    //计算旋转
    this.calRotate();
    this.calLoosePVS();
  }

  /**
   * 设置当前最新的hpv
   */
  initHPV(): void {
    this.hpv[0] = this.cpv
    this.hpv[1] = new Vector3(this.cpv.x + 100, this.cpv.y, 1)
  }

  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    //构造N个点，包围直线或曲线范围
    this.loosePVS = this.pvs

  }

  /**
 * 变换向量
 */
  transVectors(matrix: Matrix3): void {
    this.cpv.applyMatrix3(matrix);
    this.pvs.forEach(pv => {
      pv.applyMatrix3(matrix)
    });
    this.hpv[1].applyMatrix3(matrix)
    this.calRotate()
    this.calLoosePVS();
  }


  /**
   * 初始化渲染器
   */
  initRender(): void {

    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
  }




}


export default DDeiLine
