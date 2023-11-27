import DDeiConfig from '../config'
import DDeiAbstractShape from './shape'
import { Matrix3, Vector3 } from 'three';
import DDeiUtil from '../util';
import { debounce } from "lodash";
import DDeiModelArrtibuteValue from './attribute/attribute-value';
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

    this.spvs = props.spvs ? props.spvs : [];

    this.freeze = props.freeze ? props.freeze : 0;


    this.updateLooseCanvas = debounce(this.updateLooseCanvas, 30)
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
  //开始点
  startPoint: Vector3;
  //结束点
  endPoint: Vector3;
  //特殊修改过的点下标，特殊修改过的点在自动计算坐标时会有所限制
  spvs: [];
  //冻结，冻结后不会自动计算位置以及坐标
  freeze: 0;

  // ============================ 方法 ===============================


  /**
   * 初始化向量，默认开始在0，0的位置
   */
  initPVS() {
    if (!this.cpv && !(this.pvs?.length > 0)) {
      this.cpv = new Vector3(0, 0, 1)
    } else {
      this.cpv = this.pvs[0];
    }

    this.initHPV();
    //计算旋转
    this.calRotate();

    this.startPoint = this.pvs[0]
    this.endPoint = this.pvs[this.pvs.length - 1]

    //根据开始节点和结束节点的关系，自动计算中间节点路径的坐标
    this.calPoints();
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
   * 根据开始节点和结束节点的关系，自动计算中间节点路径的坐标
   */
  calPoints(): void {
    if (this.freeze != 1) {
      switch (this.type) {
        case 1: {
          this.pvs = [this.startPoint, this.endPoint]
        } break;
        case 2: {
          this.calLineType3();
        } break;
        case 3: {
          this.calLineType3();
          //需要拆分的点数量，实际情况为1或者2
          if (this.pvs.length < 4) {

            if (this.pvs.length == 2) {
              let x1 = this.pvs[0].x + (this.pvs[1].x - this.pvs[0].x) * 0.33
              let y1 = this.pvs[0].y + (this.pvs[1].y - this.pvs[0].y) * 0.33
              let x2 = this.pvs[0].x + (this.pvs[1].x - this.pvs[0].x) * 0.66
              let y2 = this.pvs[0].y + (this.pvs[1].y - this.pvs[0].y) * 0.66
              this.pvs = [this.pvs[0], new Vector3(x1, y1, 1), new Vector3(x2, y2, 1), this.pvs[1]]
            } else if (this.pvs.length == 3) {
              let x1 = this.pvs[0].x + (this.pvs[1].x - this.pvs[0].x) * 0.66
              let y1 = this.pvs[0].y + (this.pvs[1].y - this.pvs[0].y) * 0.66
              let x2 = this.pvs[1].x + (this.pvs[2].x - this.pvs[1].x) * 0.33
              let y2 = this.pvs[1].y + (this.pvs[2].y - this.pvs[1].y) * 0.33
              this.pvs = [this.pvs[0], new Vector3(x1, y1, 1), new Vector3(x2, y2, 1), this.pvs[2]]
            }
          } else if (this.pvs.length > 4) {
            let appendPointSize = 3 - (this.pvs.length - 4) % 3

            for (let i = 0; i < appendPointSize; i++) {
              //逆向，寻找最长的一条线
              let maxS = -1;
              let maxlength = 0;
              for (let j = 2; j < this.pvs.length - 1; j++) {
                let p1 = this.pvs[j]
                let p2 = this.pvs[j + 1]
                let l = DDeiUtil.getPointDistance(p1.x, p1.y, p2.x, p2.y)
                if (!maxlength) {
                  maxlength = l
                  maxS = j
                } else if (l > maxlength) {
                  maxlength = l
                  maxS = j
                }
              }
              let s = maxS
              let e = maxS + 1
              let x1 = this.pvs[s].x + (this.pvs[e].x - this.pvs[s].x) * 0.5
              let y1 = this.pvs[s].y + (this.pvs[e].y - this.pvs[s].y) * 0.5
              this.pvs.splice(s + 1, 0, new Vector3(x1, y1, 1))
            }
          }

        } break;
      }
    }

  }

  /**
   * 计算折线连线点
   */
  calLineType3() {
    let pvs = this.pvs;
    //得到开始点在开始图形的方向
    let id = this.id
    if (id.indexOf("_shadow") != -1) {
      id = id.substring(0, id.lastIndexOf("_shadow"))
    }
    let lineLinks = this.stage?.getDistModelLinks(id);
    let startLink = null;
    let endLink = null;
    lineLinks?.forEach(lk => {
      if (lk.dmpath == "startPoint") {
        startLink = lk;
      } else if (lk.dmpath == "endPoint") {
        endLink = lk;
      }
    })
    let sAngle = null;
    let eAngle = null;

    if (startLink?.sm?.getPointAngle) {
      sAngle = startLink.sm.getPointAngle(this.startPoint)
    }
    if (endLink?.sm?.getPointAngle) {
      eAngle = endLink.sm.getPointAngle(this.endPoint)
    }
    if (sAngle == null) {
      sAngle = DDeiUtil.getLineAngle(this.startPoint.x, this.startPoint.y, pvs[1].x, pvs[1].y)
    }
    if (eAngle == null) {
      eAngle = DDeiUtil.getLineAngle(this.endPoint.x, this.endPoint.y, pvs[pvs.length - 2].x, pvs[pvs.length - 2].y)
    }

    //解析movepath，生成点
    let middlePaths = []
    //获取移动路径
    let movePath = DDeiUtil.getMovePath(sAngle, eAngle, this.startPoint, this.endPoint)
    if (movePath) {
      let mPaths = movePath.split(",")
      let cPoint = { x: this.startPoint.x, y: this.startPoint.y }
      let h = Math.abs(this.startPoint.y - this.endPoint.y)
      let w = Math.abs(this.startPoint.x - this.endPoint.x)
      mPaths.forEach(mPath => {
        let mpa = mPath.split(":");
        let opType = mpa[0];
        let opSize = parseFloat(mpa[1]);
        if (opType == 'x') {
          cPoint.x += opSize * w
        } else if (opType == 'y') {
          cPoint.y += opSize * h
        }
        //生成中间点
        middlePaths.push(new Vector3(cPoint.x, cPoint.y, 1))
      });
    }
    //更新中间节点
    this.pvs = [this.startPoint]
    if (middlePaths?.length > 0) {
      middlePaths.forEach(mp => {
        this.pvs.push(mp)
      });
    }
    this.pvs.push(this.endPoint)
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
      if (this.render) {
        //转换为图片
        if (!this.looseCanvas) {
          this.looseCanvas = document.createElement('canvas');
          this.looseCanvas.setAttribute("style", "-moz-transform-origin:left top;");
        }
        let canvas = this.looseCanvas

        let pvs = this.pvs;
        let outRect = DDeiAbstractShape.pvsToOutRect(pvs);
        let weight = 10
        if (this.weight) {
          weight = this.weight + 5
        }
        outRect.x -= weight
        outRect.x1 += weight
        outRect.y -= weight
        outRect.y1 += weight
        outRect.width += 2 * weight
        outRect.height += 2 * weight
        this.loosePVS = Object.freeze([
          new Vector3(outRect.x, outRect.y, 1),
          new Vector3(outRect.x1, outRect.y, 1),
          new Vector3(outRect.x1, outRect.y1, 1),
          new Vector3(outRect.x, outRect.y1, 1)
        ])
        canvas.setAttribute("width", outRect.width)
        canvas.setAttribute("height", outRect.height)
        //获得 2d 上下文对象
        let ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.translate(-outRect.x, -outRect.y)
        this.render.drawLine({ color: "red", weight: weight, rat1: 1 }, ctx)
      }
      resolve()
    });
  }

  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3): void {
    this.pvs.forEach(pv => {
      pv.applyMatrix3(matrix)
    });
    for (let i in this.exPvs) {
      let pv = this.exPvs[i];
      pv.applyMatrix3(matrix)
    };
    this.hpv[0].applyMatrix3(matrix)
    this.hpv[1].applyMatrix3(matrix)
    this.calRotate()
    this.calLoosePVS();
  }

  /**
   * 获取中心点操作点
   */
  getCenterOpPoints(): [] {
    return []
  }

  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x
   * @param y
   * @param loose 宽松判定,默认false
   * @returns 是否在区域内
   */
  isInAreaLoose(x: number | undefined = undefined, y: number | undefined = undefined, loose: boolean = false): boolean {
    if (super.isInAreaLoose(x, y, loose) && this.looseCanvas) {
      let ctx = this.looseCanvas.getContext("2d");
      let outRect = DDeiAbstractShape.pvsToOutRect(this.pvs);
      let weight = 10
      if (this.weight) {
        weight = this.weight + 5
      }

      outRect.x -= weight
      outRect.y -= weight
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
   * 移除自身的方法
   */
  destroyed() {
    let distLinks = this.stage?.getDistModelLinks(this.id);
    distLinks?.forEach(dl => {
      //删除源点
      if (dl?.sm && dl?.smpath) {
        eval("delete dl.sm." + dl.smpath)
      }
      this.stage?.removeLink(dl);
    })
    super.destroyed();
  }

  syncVectors(source: DDeiAbstractShape, clonePV: boolean = false): void {
    super.syncVectors(source, clonePV)
    if (source.freeze != null && source.freeze != undefined) {
      this.freeze = source.freeze;
    }
    this.startPoint = this.pvs[0]
    this.endPoint = this.pvs[this.pvs.length - 1]

    let distLinks = this.stage?.getDistModelLinks(this.id);
    distLinks?.forEach(dl => {
      //判断开始点还是结束点
      let pv = null;
      if (dl.dmpath == "startPoint") {
        pv = this.startPoint;
      } else {
        pv = this.endPoint;
      }
      //删除源点
      if (dl?.sm && dl?.smpath) {
        DDeiUtil.setAttrValueByPath(dl.sm, dl.smpath + ".x", pv.x)
        DDeiUtil.setAttrValueByPath(dl.sm, dl.smpath + ".y", pv.y)
      }
    })
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
