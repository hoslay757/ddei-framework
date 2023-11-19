import DDeiConfig from '../config'
import DDeiAbstractShape from './shape'
import { Matrix3, Vector3 } from 'three';
import { clone, cloneDeep } from 'lodash'
import DDeiUtil from '../util';
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

    this.initHPV();
    //计算旋转
    this.calRotate();


    this.calLoosePVS();
  }

  /**
   * 设置当前最新的hpv
   */
  initHPV(): void {
    if (!this.hpv || this.hpv.length < 2) {
      this.hpv[0] = new Vector3(this.cpv.x, this.cpv.y, 1)
      this.hpv[1] = new Vector3(this.cpv.x + 100, this.cpv.y, 1)
    }
  }

  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    //构造N个点，包围直线或曲线范围
    this.loosePVS = this.pvs
    //创建临时canvas绘制线段到临时canvas上，通过临时线段判断canvas的状态
    this.updateLooseCanvas();
  }

  updateLooseCanvas(): Promise {
    return new Promise((resolve, reject) => {
      //转换为图片
      if (!this.looseCanvas) {
        this.looseCanvas = document.createElement('canvas');
        this.looseCanvas.setAttribute("style", "-moz-transform-origin:left top;");
      }
      let canvas = this.looseCanvas

      let pvs = this.pvs;
      let outRect = DDeiAbstractShape.pvsToOutRect(pvs);

      this.loosePVS = Object.freeze([
        new Vector3(outRect.x, outRect.y, 1),
        new Vector3(outRect.x1, outRect.y, 1),
        new Vector3(outRect.x1, outRect.y1, 1),
        new Vector3(outRect.x, outRect.y1, 1)
      ])
      canvas.setAttribute("width", outRect.width)
      canvas.setAttribute("height", outRect.height)


      //获得 2d 上下文对象
      let ctx = canvas.getContext('2d');
      ctx.save();
      ctx.fillStyle = DDeiUtil.getColor("white");
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.translate(- outRect.x, -outRect.y)
      let rat1 = 1
      let type = this.type;
      ctx.strokeStyle = DDeiUtil.getColor("red");
      let weight = 10
      if (this.weight) {
        weight = this.weight + 5
      }
      ctx.lineWidth = weight
      ctx.beginPath()
      switch (type) {
        case 1: {
          //直线
          ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
          ctx.lineTo(pvs[pvs.length - 1].x * rat1, pvs[pvs.length - 1].y * rat1)
          ctx.stroke();
        } break;
        case 2: {
          //折线
          ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
          for (let i = 1; i < pvs.length; i++) {
            ctx.lineTo(pvs[i].x * rat1, pvs[i].y * rat1)
          }
          ctx.stroke();
        } break;
        case 3: {
          //曲线
          ctx.moveTo(pvs[0].x * rat1, pvs[0].y * rat1)
          ctx.bezierCurveTo(pvs[1].x * rat1, pvs[1].y * rat1, pvs[2].x * rat1, pvs[2].y * rat1, pvs[3].x * rat1, pvs[3].y * rat1);
          ctx.stroke();
        } break;
      }
      ctx.closePath()
      ctx.restore();
      resolve()
    });
  }

  /**
 * 变换向量
 */
  transVectors(matrix: Matrix3): void {
    this.cpv.applyMatrix3(matrix);
    this.pvs.forEach(pv => {
      pv.applyMatrix3(matrix)
    });
    this.hpv[0].applyMatrix3(matrix)
    this.hpv[1].applyMatrix3(matrix)
    this.calRotate()
    this.calLoosePVS();
  }

  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x
   * @param y
   * @param loose 宽松判定,默认false
   * @returns 是否在区域内
   */
  isInAreaLoose(x: number | undefined = undefined, y: number | undefined = undefined, loose: boolean = false): boolean {
    if (super.isInAreaLoose(x, y, loose)) {
      let ctx = this.looseCanvas.getContext("2d");
      let outRect = DDeiAbstractShape.pvsToOutRect(this.pvs);
      let cx = x - outRect.x
      let cy = y - outRect.y
      let cdata = ctx.getImageData(cx, cy, 1, 1).data;
      if (cdata && cdata[0] == 255 && cdata[1] != 255 && cdata[2] != 255) {
        return true;
      }
    }
    return false;
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
