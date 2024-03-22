import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'
import DDeiUtil from '../util'
import { Matrix3, Vector3 } from 'three';
import { cloneDeep, clone, isNumber } from 'lodash'
import type DDei from '../ddei'
import DDeiEnumOperateState from '../enums/operate-state'
/**
 * 抽象的图形类，定义了大多数图形都有的属性和方法
 */
abstract class DDeiAbstractShape {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    //宽度与高度，会换算为点向量，参与运算
    this.width = props.width ? props.width : 0
    this.height = props.height ? props.height : 0
    this.zIndex = props.zIndex ? props.zIndex : null
    this.rotate = props.rotate ? props.rotate : null
    this.modelCode = props.modelCode ? props.modelCode : null
    this.unicode = props.unicode ? props.unicode : DDeiUtil.getUniqueCode()
    this.fmt = props.fmt
    this.sptStyle = props.sptStyle ? props.sptStyle : {}
    this.poly = props.poly;
    this.composes = props.composes
    this.cIndex = props.cIndex ? props.cIndex : null
    this.ruleEvals = []
    this.initCPV = props.initCPV ? props.initCPV : null
    if (props.cpv) {
      this.cpv = new Vector3(props.cpv.x, props.cpv.y, props.cpv.z || props.cpv.z == 0 ? props.cpv.z : 1);
    }
    if (props.pvs) {
      this.pvs = [];
      props.pvs.forEach(pvd => {
        let pv = new Vector3()
        for (let i in pvd) {
          pv[i] = pvd[i]
        }
        pv.z = (pvd.z || pvd.z === 0) ? pvd.z : 1
        this.pvs.push(pv);
      });
    }
    this.hpv = []
    if (props.hpv) {
      props.hpv.forEach(pv => {
        this.hpv.push(new Vector3(pv.x, pv.y, pv.z || pv.z == 0 ? pv.z : 1));
      });
    }

    //控制点
    this.ovs = []
    if (props.ovs) {
      props.ovs.forEach(pvd => {
        let pv = new Vector3(pvd.x, pvd.y, pvd.z || pvd.z == 0 ? pvd.z : 1)
        let ovi = new Vector3(pvd.ovi.x, pvd.ovi.y, pvd.ovi.z || pvd.ovi.z == 0 ? pvd.ovi.z : 1)
        if (pvd.index || pvd.index == 0) {
          pv.index = pvd.index
        }
        if (pvd.rate || pvd.rate == 0) {
          pv.rate = pvd.rate
        }
        if (pvd.sita || pvd.sita == 0) {
          pv.sita = pvd.sita
        }
        pv.ovi = ovi
        this.ovs.push(pv);
      });
    }


    if (props.bpv) {
      this.bpv = new Vector3(props.bpv.x, props.bpv.y, props.bpv.z || props.bpv.z == 0 ? props.bpv.z : 1);
    }

    this.exPvs = {}
    if (props.exPvs) {
      for (let i in props.exPvs) {
        let pvd = props.exPvs[i];
        let pv = new Vector3(pvd.x, pvd.y, pvd.z || pvd.z == 0 ? pvd.z : 1)
        pv.id = pvd.id
        if (pvd.index || pvd.index == 0) {
          pv.index = pvd.index
        }
        if (pvd.rate || pvd.rate == 0) {
          pv.rate = pvd.rate
        }
        if (pvd.sita || pvd.sita == 0) {
          pv.sita = pvd.sita
        }
        this.exPvs[pvd.id] = pv;
      }
    }



  }


  // ============================ 属性 ===============================
  id: string;
  //宽度与高度，会换算为点向量，参与运算
  width: number;
  height: number;
  // 本模型的编码,用来却分modelType相同，但业务含义不同的模型
  modelCode: string;
  // 本模型的唯一名称
  modelType: string = 'AbstractShape';
  // 本模型的基础图形
  baseModelType: string = 'AbstractShape';
  // 当前控件的状态
  state: DDeiEnumControlState = DDeiEnumControlState.DEFAULT;
  // 当前模型所在的layer
  layer: DDeiLayer | null;
  // 当前模型所在的父模型
  pModel: any = null;
  // 当前模型所在的stage
  stage: DDeiStage | null;
  // 当前图形在当前图层的层次
  zIndex: number | null;
  // 当前图形在组合控件中的层次
  cIndex: number | null;
  // 旋转,0/null 不旋转，默认0
  rotate: number | null;

  //中心点向量
  cpv: object;

  //隐藏平行线点，形成一条平行于x轴的直线，用于在旋转后，通过其与坐标轴的夹角求真实的旋转角度
  hpv: object[];

  //周围点向量
  pvs: object;

  //额外扩展向量，如：与连线关联的向量
  exPvs: object;

  //操作点，用于在图形上操作和控制的特殊点位，一般用于改变图形的内部结构，操作点体现为黄色的菱形点
  //序列化的ovs用于记录当前点的位置，sample中的ovs用于定义
  ovs: object[];

  //唯一表示码，运行时临时生成
  unicode: string;

  //格式化信息
  fmt: object | null;

  //坐标描述方式，null/1为直角坐标，2为极坐标，默认直角坐标
  poly: number | null;

  /**
   * 极坐标下的采样策略，采样策略返回的点上会附带绘图的控制属性
   * 返回值：
   *    type:1直线/2弧线/3不画线直接跳转,4圆或椭圆,5曲线 ,默认1
   *    r:半径
   *    rad：当前点位的弧度
   *    x:点坐标
   *    y:点坐标
   *    begin: 开启一个路径 
   *    end：关闭一个路径
   *    oppoint:1为操作点只判定点，2为操作点，判定点以及中间，3为操作点，判定圆心
   *    clip:1生成剪切区域
   *    stroke：1连线
   *    fill：1填充
   *    select：1用于生成区域
   *    align:1 用于辅助对齐
   *    text:1文本
   *        
   */
  //sample: object | null;

  /**
   * 组合控件的信息
   */
  composes: DDeiAbstractShape[] | null;

  //特殊文本样式
  sptStyle: object;

  // ============================ 方法 ============================

  /**
   * 初始化向量，基于width和height构建向量，默认中心点在0，0的位置
   */
  initPVS() {
    if (!this.cpv) {
      if (this.initCPV) {
        //全局缩放因子
        let stageRatio = this.getStageRatio();
        this.cpv = new Vector3(this.initCPV.x * stageRatio, this.initCPV.y * stageRatio, 1)
        delete this.initCPV
      } else {
        this.cpv = new Vector3(0, 0, 1)
      }
    }


    //通过定义初始化ovs
    if (!(this.ovs?.length > 0)) {
      //通过采样计算pvs,可能存在多组pvs
      let defineOvs = DDeiUtil.getControlDefine(this)?.define?.ovs;
      if (defineOvs?.length > 0) {
        //全局缩放因子
        let stageRatio = this.getStageRatio();
        let ovs = []
        defineOvs.forEach(ovd => {
          //如果类型为3，则根据初始的角度、r计算初始位置
          let scaleX = this.width / 100
          let scaleY = this.height / 100
          if (ovd.constraint.type == 3) {
            let rad = -ovd.isita * DDeiConfig.ROTATE_UNIT
            let x = ovd.constraint.r * Math.cos(rad)
            let y = ovd.constraint.r * Math.sin(rad)
            let ov = new Vector3(x * scaleX * stageRatio, y * scaleY * stageRatio, ovd.z || ovd.z == 0 ? ovd.z : 1)
            let ovi = new Vector3(0, 0, ovd.z || ovd.z == 0 ? ovd.z : 1)
            ov.ovi = ovi
            ovs.push(ov)
          } else {
            let ov = new Vector3(ovd.x * scaleX * stageRatio, ovd.y * scaleY * stageRatio, ovd.z || ovd.z == 0 ? ovd.z : 1)
            let ovi = new Vector3(ovd.ix * scaleX * stageRatio, ovd.iy * scaleY * stageRatio, ovd.iz || ovd.iz == 0 ? ovd.iz : 1)
            ov.ovi = ovi
            ovs.push(ov)
          }
        });
        this.ovs = ovs
      }
    }
    //如果是极坐标，则用极坐标的方式来计算pvs、hpv等信息，否则采用pvs的方式
    if (this.poly == 2) {
      //极坐标系中，采用基于原点的100向量表示水平
      if (!(this.hpv?.length > 0)) {
        this.hpv = [new Vector3(0, 0, 1), new Vector3(100, 0, 1)]
      }
      //用于计算缩放大小比率的点PV，以100为参考
      if (!this.bpv) {
        //全局缩放因子
        let stageRatio = this.getStageRatio();
        this.bpv = new Vector3(this.cpv.x + this.width * stageRatio, this.cpv.y + this.height * stageRatio, 1)
      }

      this.executeSample();
    } else {
      if (!this.pvs || this.pvs.length == 0) {
        //全局缩放因子
        let stageRatio = this.getStageRatio();
        this.pvs = [];
        this.pvs[0] = new Vector3(-this.width * stageRatio / 2, -this.height * stageRatio / 2, 1)
        this.pvs[1] = new Vector3(this.width * stageRatio / 2, -this.height * stageRatio / 2, 1)
        this.pvs[2] = new Vector3(this.width * stageRatio / 2, this.height * stageRatio / 2, 1)
        this.pvs[3] = new Vector3(-this.width * stageRatio / 2, this.height * stageRatio / 2, 1)
      }
      this.initHPV();
    }

    //计算宽松判定矩阵
    this.calRotate();
    this.calLoosePVS();
    this.composes?.forEach(compose => {
      compose.initPVS()
    });
    if (!this.isShadowControl) {
      this.updateExPvs();
    }

  }

  /**
  * 根据坐标获取特殊操作点
  * @param x 
  * @param y 
  * @returns 操作点
  */
  getOvPointByPos(x: number = 0, y: number = 0): object {
    if (x && y && this.ovs?.length > 0) {
      for (let i = 0; i < this.ovs?.length; i++) {
        let point = this.ovs[i]
        if (Math.abs(x - point.x) <= 8 && Math.abs(y - point.y) <= 8) {
          return point;
        }
      }
    }
    return null;
  }

  /**
   * 执行采样计算pvs
   */
  executeSample() {
    //通过采样计算pvs,可能存在多组pvs
    let defineSample = DDeiUtil.getControlDefine(this)?.define?.sample;
    let stageRatio = this.getStageRatio()
    if (defineSample?.rules?.length > 0) {
      ///计算ovs未旋转量，传入采样函数进行计算
      let originOVS = []
      if (this.ovs?.length > 0) {
        originOVS = cloneDeep(this.ovs);
        //逆向旋转，然后缩放至基准大小，再进行比较
        let bpv = DDeiUtil.pointsToZero([this.bpv], this.cpv, this.rotate)[0]
        let scaleX = Math.abs(DDeiUtil.preciseDiv(bpv.x, 100))
        let scaleY = Math.abs(DDeiUtil.preciseDiv(bpv.y, 100))
        let m1 = new Matrix3()
        let move1Matrix = new Matrix3(
          1, 0, -this.cpv.x,
          0, 1, -this.cpv.y,
          0, 0, 1);
        m1.premultiply(move1Matrix)
        let rotate = 0
        if (this.rotate) {
          rotate = this.rotate
          let angle = DDeiUtil.preciseTimes(rotate, DDeiConfig.ROTATE_UNIT)
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          m1.premultiply(rotateMatrix)
        }
        let scaleMatrix = new Matrix3(
          1 / scaleX, 0, 0,
          0, 1 / scaleY, 0,
          0, 0, 1);
        m1.premultiply(scaleMatrix)
        let move2Matrix = new Matrix3(
          1, 0, this.cpv.x,
          0, 1, this.cpv.y,
          0, 0, 1);
        m1.premultiply(move2Matrix)

        originOVS.forEach(ov => {
          //计算ov到圆心的角度
          ov.sita = parseFloat(DDeiUtil.getLineAngle(this.cpv.x, this.cpv.y, ov.x, ov.y).toFixed(2)) - rotate;
          ov.applyMatrix3(m1)
          ov.ovi.applyMatrix3(m1)
        })

      }


      //计算当前缩放比率
      let rotate = this.rotate
      if (!rotate) {
        rotate = 0
      }
      let bpv = DDeiUtil.pointsToZero([this.bpv], this.cpv, rotate)[0]
      let scaleX = Math.abs(bpv.x / 100)
      let scaleY = Math.abs(bpv.y / 100)
      //添加scale变量以便在内部使用
      this.scale = { x: scaleX, y: scaleY, stageRatio: stageRatio }

      //采样结果
      let sampliesResult = []
      //采样次数
      let loop = defineSample.loop;
      //单次采样角度
      let pn = 360 / loop;
      //初始角度
      let angle = defineSample.angle;
      //执行采样
      for (let i = 0; i < loop; i++) {
        defineSample.sita = angle + i * pn
        defineSample.rad = defineSample.sita * DDeiConfig.ROTATE_UNIT

        defineSample.cos = parseFloat(Math.cos(defineSample.rad).toFixed(4))
        defineSample.sin = parseFloat(Math.sin(defineSample.rad).toFixed(4))
        defineSample.x = defineSample.r * defineSample.cos
        defineSample.y = defineSample.r * defineSample.sin
        for (let j = 0; j < defineSample.rules?.length; j++) {
          if (this.ruleEvals && !this.ruleEvals[j]) {
            eval("this.ruleEvals[j] = function" + defineSample.rules[j])
          }
          let spFn = this.ruleEvals[j]
          if (!sampliesResult[j]) {
            sampliesResult[j] = []
          }
          let spResult = sampliesResult[j]
          spFn(i, defineSample, spResult, this, originOVS)
        }
      }
      //删除scale变量
      delete this.scale
      //对返回的数据进行处理和拆分
      let pvs = []
      let apvs = []
      let textArea = []
      let operatePVS = []
      let opps = []



      for (let i = 0; i < sampliesResult.length; i++) {
        if (sampliesResult[i].length > 0) {
          sampliesResult[i].forEach(pvd => {
            let pv = new Vector3()
            pv.group = i
            //如果有dx和dy属性，则需要通过旋转和缩放对齐进行调整值
            if (pvd.dx || pvd.dx == 0 || pvd.dy || pvd.dy == 0) {
              if (!pvd.dx) {
                pvd.dx = 0
              }
              if (!pvd.dy) {
                pvd.dy = 0
              }
              let dp = DDeiUtil.getRotatedPoint({ x: pvd.dx * scaleX / stageRatio, y: pvd.dy * scaleY / stageRatio, z: 1 }, rotate)

              pvd.dx = dp.x
              pvd.dy = dp.y
            }

            for (let i in pvd) {
              pv[i] = pvd[i]
            }
            pv.z = (pvd.z || pvd.z === 0) ? pvd.z : 1

            pvs.push(pv)
            if (pvd.select) {
              operatePVS.push(pv)
            }
            if (pvd.oppoint) {
              opps.push(pv)
            }
            if (pvd.align) {
              apvs.push(pv)
            }
            if (pvd.text) {
              textArea.push(pv)
            }
          })
        }
      }
      //根据旋转和缩放参照点，构建旋转和缩放矩阵，对矩阵进行旋转
      let m1 = new Matrix3();


      let scaleMatrix = new Matrix3(
        scaleX, 0, 0,
        0, scaleY, 0,
        0, 0, 1);
      m1.premultiply(scaleMatrix)

      if (this.rotate) {
        let angle = -DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix)
      }


      let moveMatrix = new Matrix3(
        1, 0, this.cpv.x,
        0, 1, this.cpv.y,
        0, 0, 1);
      m1.premultiply(moveMatrix)
      pvs.forEach(pv => {
        pv.applyMatrix3(m1)
      });
      this.pvs = pvs

      this.operatePVS = operatePVS;

      this.textArea = textArea

      this.opps = opps;

      this.apvs = apvs
    }
  }

  getOperatePVS(compose: boolean = false) {
    let pvs = this.operatePVS ? this.operatePVS : this.pvs
    let returnPVS = []
    if (pvs) {
      pvs.forEach(pv => {
        returnPVS.push(pv)
      });
    }
    if (compose && this.composes?.length > 0) {
      this.composes.forEach(comp => {
        let ps = comp.getOperatePVS(compose);
        if (ps) {
          ps.forEach(pv => {
            returnPVS.push(pv)
          });
        }
      });
    }
    return returnPVS;
  }

  getAPVS() {
    let arr = [this.cpv]
    if (this.apvs?.length > 0) {
      arr = arr.concat(this.apvs)
    }
    return arr;
  }

  /**
   * 同步向量
   * @param source 源模型
   * @param cloneVP 是否克隆向量，默认false
   */
  syncVectors(source: DDeiAbstractShape, clonePV: boolean = false): void {
    if (this.poly == 2) {
      if (clonePV) {
        this.cpv = cloneDeep(source.cpv)
        this.exPvs = cloneDeep(source.exPvs)
        this.bpv = cloneDeep(source.bpv)
        this.ovs = cloneDeep(source.ovs)

      } else {
        this.cpv = source.cpv
        this.exPvs = source.exPvs
        this.bpv = source.bpv
        this.ovs = source.ovs
      }

      this.executeSample();

    } else {
      if (clonePV) {
        this.pvs = cloneDeep(source.pvs)
        this.cpv = cloneDeep(source.cpv)
        this.exPvs = cloneDeep(source.exPvs)
        this.ovs = cloneDeep(source.ovs)
      } else {
        this.pvs = source.pvs
        this.cpv = source.cpv
        this.exPvs = source.exPvs
        this.ovs = source.ovs
      }
    }
    this.initHPV()
    this.calRotate();
    this.calLoosePVS();
    for (let i = 0; i < source.composes?.length; i++) {
      let scop = source.composes[i]
      let tcop = this.composes[i]
      tcop.syncVectors(scop, clonePV)
    }
    this.render?.enableRefreshShape()
  }

  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3, params: { skipSample: boolean, ignoreBPV: boolean, ignoreOVS: boolean, ignoreHPV: boolean, ignoreComposes: boolean }): void {

    this.cpv.applyMatrix3(matrix);
    if (this.poly == 2) {
      //重新计算
      if (!params?.skipSample) {
        if (!params?.ignoreHPV) {
          this.hpv.forEach(pv => {
            pv.applyMatrix3(matrix);
          })
        }
        for (let i in this.exPvs) {
          let pv = this.exPvs[i];
          pv.applyMatrix3(matrix)
        };
        if (!params?.ignoreBPV) {
          this.bpv.applyMatrix3(matrix);
        }
        if (!params?.ignoreOVS) {
          this.ovs?.forEach(pv => {
            pv.applyMatrix3(matrix);
            if (pv.ovi) {
              pv.ovi.applyMatrix3(matrix);
            }
          })
        }

        this.initHPV();
        this.calRotate()
        this.executeSample();
        this.calLoosePVS();
      } else {
        if (!params?.ignoreHPV) {
          this.hpv.forEach(pv => {
            pv.applyMatrix3(matrix);
          })
        }
        for (let i in this.exPvs) {
          let pv = this.exPvs[i];
          pv.applyMatrix3(matrix)
        };
        this.pvs.forEach(pv => {
          pv.applyMatrix3(matrix)
        });
        if (!params?.ignoreBPV) {
          this.bpv.applyMatrix3(matrix);
        }
        if (!params?.ignoreOVS) {
          this.ovs?.forEach(pv => {
            pv.applyMatrix3(matrix);
            if (pv.ovi) {
              pv.ovi.applyMatrix3(matrix);
            }
          })
        }
      }
    } else {
      this.pvs.forEach(pv => {
        pv.applyMatrix3(matrix)
      });
      for (let i in this.exPvs) {
        let pv = this.exPvs[i];
        pv.applyMatrix3(matrix)
      };
      this.ovs?.forEach(pv => {
        pv.applyMatrix3(matrix);
        if (pv.ovi) {
          pv.ovi.applyMatrix3(matrix);
        }
      })
      this.initHPV();
      this.calRotate()
      this.calLoosePVS();
    }
    if (!params?.ignoreComposes) {
      this.composes?.forEach(compose => {
        compose.transVectors(matrix)
      });
    }
  }


  /**
   * 设置特殊文本样式
   * @param sIdx 开始文本坐标
   * @param eIdx 结束文本坐标
   */
  setSptStyle(sIdx: number, eIdx: number, paths: string[] | string, value: any, emptyDelete: boolean = true) {
    //设置每一个字符的样式
    let attrPaths = []
    if (typeof (paths) == 'string') {
      attrPaths = paths.split(",");
    } else {
      attrPaths = paths;
    }

    if (attrPaths?.length > 0 && sIdx > -1 && eIdx > -1 && sIdx <= eIdx) {
      for (let k = sIdx; k < eIdx; k++) {
        for (let i = 0; i < attrPaths.length; i++) {
          if ((value === null || value === undefined || (isNumber(value) && isNaN(value))) && emptyDelete) {
            try {
              eval("delete this.sptStyle[" + k + "]." + attrPaths[i])
            } catch (e) { }
            if (this.sptStyle[k]?.textStyle && JSON.stringify(this.sptStyle[k].textStyle) == "{}") {
              delete this.sptStyle[k].textStyle
            }
            if (this.sptStyle[k]?.font && JSON.stringify(this.sptStyle[k].font) == "{}") {
              delete this.sptStyle[k].font
            }
            if (this.sptStyle[k] && JSON.stringify(this.sptStyle[k]) == "{}") {
              delete this.sptStyle[k]
            }
          } else {
            DDeiUtil.setAttrValueByPath(this, ["sptStyle." + k + "." + attrPaths[i]], value)
          }
        }
      }
    }
  }

  /**
   * 获取特殊文本样式，返回同样的样式
   * @param sIdx 开始文本坐标
   * @param eIdx 结束文本坐标
   */
  getSptStyle(sIdx: number, eIdx: number, paths: string[] | string) {
    //设置每一个字符的样式
    let attrPaths = []
    if (typeof (paths) == 'string') {
      attrPaths = paths.split(",");
    } else {
      attrPaths = paths;
    }

    if (attrPaths?.length > 0 && sIdx > -1 && eIdx > -1 && sIdx <= eIdx) {
      let first = true;
      let firstValue = undefined;
      for (; sIdx < eIdx; sIdx++) {
        for (let i = 0; i < attrPaths.length; i++) {
          let v = DDeiUtil.getDataByPathList(this, "sptStyle." + sIdx + "." + attrPaths[i]);
          if (first) {
            firstValue = v == null || v == undefined ? undefined : v;
            first = false;
          } else if (v != undefined && firstValue != v) {
            return undefined
          }
        }
      }
      return firstValue;
    }
    return undefined;
  }

  /**
   * 获取特殊文本样式，返回所有的样式
   * @param sIdx 开始文本坐标
   * @param eIdx 结束文本坐标
   */
  getSptAllStyles(sIdx: number, eIdx: number) {
    let returnArray = []
    if (sIdx > -1 && eIdx > -1 && sIdx <= eIdx) {
      for (; sIdx < eIdx; sIdx++) {
        let v = DDeiUtil.getDataByPathList(this, "sptStyle." + sIdx);
        returnArray.push(v)
      }
    }
    return returnArray;
  }

  /**
   * 清空特殊文本样式
   */
  clearSptStyle() {
    this.sptStyle = {}
  }


  /**
   * 设置当前最新的hpv
   */
  initHPV(): void {
    this.hpv[0] = clone(this.pvs[0])
    this.hpv[1] = clone(this.pvs[1])
  }

  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    let stageRatio = this.stage?.getStageRatio();
    //复制当前向量
    this.loosePVS = this.operatePVS?.length > 2 ? cloneDeep(this.operatePVS) : cloneDeep(this.pvs)

    let move1Matrix = new Matrix3(
      1, 0, -this.cpv.x,
      0, 1, -this.cpv.y,
      0, 0, 1);
    this.loosePVS.forEach(fpv => {
      fpv.applyMatrix3(move1Matrix)
    });
    //获取旋转角度
    if (this.rotate && this.rotate != 0) {
      let angle = DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      this.loosePVS.forEach(fpv => {
        fpv.applyMatrix3(rotateMatrix)
      });
    }
    let outRect = DDeiAbstractShape.pvsToOutRect(this.loosePVS);
    if (this.loosePVS.length < 4) {
      this.loosePVS = DDeiAbstractShape.outRectToPV(outRect)
    }
    //计算宽、高信息，该值为不考虑缩放的大小
    this.x = outRect.x / stageRatio
    this.y = outRect.y / stageRatio
    this.width = outRect.width / stageRatio
    this.height = outRect.height / stageRatio
    //记录缩放后的大小以及坐标
    this.essBounds = outRect;

    let m1 = new Matrix3()
    //通过缩放矩阵，进行缩放
    let scX = 1, scY = 1

    if (this.width * stageRatio <= 30) {
      scX = 1 + (10 / this.width * stageRatio)
    } else {
      scX = 1 + Math.min(0.1 / stageRatio, 20 / this.width)
    }
    if (this.height * stageRatio <= 30) {
      scY = 1 + (10 / this.height * stageRatio)
    } else {
      scY = 1 + Math.min(0.1 / stageRatio, 20 / this.height)
    }
    let scaleMatrix = new Matrix3(
      scX, 0, 0,
      0, scY, 0,
      0, 0, 1);
    m1.premultiply(scaleMatrix)
    //旋转并位移回去
    if (this.rotate && this.rotate != 0) {
      let angle = -DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      m1.premultiply(rotateMatrix)
    }
    let move2Matrix = new Matrix3(
      1, 0, this.cpv.x,
      0, 1, this.cpv.y,
      0, 0, 1);
    m1.premultiply(move2Matrix)
    this.loosePVS.forEach(fpv => {
      fpv.applyMatrix3(m1)
    });
    this.x += this.cpv.x / stageRatio
    this.y += this.cpv.y / stageRatio
    // 记录缩放后的大小以及坐标
    this.essBounds.x += this.cpv.x
    this.essBounds.y += this.cpv.y


  }



  /**
   * 设置旋转角度
   */
  setRotate(rotate: number = 0): void {

    if (this.rotate != rotate) {
      //求得线向量与直角坐标系的夹角
      let m1 = new Matrix3();
      //归0
      let toZeroMatrix = new Matrix3(
        1, 0, -this.cpv.x,
        0, 1, -this.cpv.y,
        0, 0, 1);
      m1.premultiply(toZeroMatrix);

      if (this.rotate) {
        //还原到未旋转状态
        let angle = DDeiUtil.preciseTimes(this.rotate, DDeiConfig.ROTATE_UNIT)
        //计算input的正确打开位置，由节点0
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix);
      }
      if (rotate) {
        //还原到未旋转状态
        let angle = -DDeiUtil.preciseTimes(rotate, DDeiConfig.ROTATE_UNIT)
        //计算input的正确打开位置，由节点0
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix);
      }

      //还原
      let restoreMatrix = new Matrix3(
        1, 0, this.cpv.x,
        0, 1, this.cpv.y,
        0, 0, 1);
      m1.premultiply(restoreMatrix);

      //执行旋转
      this.transVectors(m1)

      this.rotate = rotate;
    }
  }

  /**
   * 计算旋转角度，基于隐藏点与坐标系的夹角
   */
  calRotate(): void {
    //求得线向量与直角坐标系的夹角
    let lineV = new Vector3(this.hpv[1].x, this.hpv[1].y, 1);
    let toZeroMatrix = new Matrix3(
      1, 0, -this.hpv[0].x,
      0, 1, -this.hpv[0].y,
      0, 0, 1);
    //归到原点，求夹角
    lineV.applyMatrix3(toZeroMatrix)
    let angle = (new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0)) * 180 / Math.PI).toFixed(4);
    if (lineV.x >= 0 && lineV.y >= 0) {
    } else if (lineV.x <= 0 && lineV.y >= 0) {
    } else if (lineV.x <= 0 && lineV.y <= 0) {
      angle = -angle
    } else if (lineV.x >= 0 && lineV.y <= 0) {
      angle = -angle
    }
    this.rotate = parseFloat(angle);
  }

  /**
   * 设置当前图片base64
   * @param base64 
   */
  setImgBase64(base64): void {
    this.imgBase64 = base64;
    if (this.render) {
      this.render.imgObj = null;
      this.render.initImage();
    }

  }

  /**
   * 更新关联图形
   */
  updateLinkModels(ignoreModelIds: string[]): void {
    //如果存在关联控件，同步修改关联控件坐标
    let links = this.stage.getSourceModelLinks(this.id);
    //同步调整链接控件的数据
    let removeLinks = []
    links?.forEach(link => {
      if (!ignoreModelIds || ignoreModelIds?.indexOf(link.dm?.id) == -1) {
        let dpv = link.getDistPV();
        if (dpv) {
          let spv = link.getSourcePV();
          if (spv) {
            dpv.x = spv.x
            dpv.y = spv.y
            dpv.z = spv.z

            link.dm.refreshLinePoints()
            link.dm.updateOVS()
            let pvs = link.dm.pvs
            link.dm.setLineType1PointPosition(0, pvs[0].x, pvs[0].y)
            if (link.dm.pModel?.modelType != 'DDeiLayer') {
              link.dm.pModel?.changeParentsBounds()
            }
          } else {
            //删除无效的links
            removeLinks.push(link)
          }
        }
      }
    })
    if (removeLinks.length > 0) {

      this.stage.removeLink(removeLinks)
    }

  }
  /**
   * 单独修改向量导致两点关系发生变化后同步调整exPvs点的位置
   */
  updateExPvs() {
    for (let i in this.exPvs) {
      let ov = this.exPvs[i];
      //如果是初始状态或者pvs发生了变化，则根据现有坐标，投射最近的路径，找到index
      let x, y
      let pathPvs = this.opps;
      let st, en
      if (!(ov.index || ov.index == 0) || pathPvs.length <= ov.index) {
        let proPoints = DDeiAbstractShape.getProjPointDists(pathPvs, ov.x, ov.y, false, 1);
        let index = proPoints[0].index
        ov.index = index
        x = proPoints[0].x
        y = proPoints[0].y
        //计算当前path的角度（方向）angle和投射后点的比例rate
        if (index == pathPvs.length - 1) {
          st = index;
          en = 0;
        } else {
          st = index;
          en = index + 1;
        }
        let pointDistance = DDeiUtil.getPointDistance(pathPvs[st].x, pathPvs[st].y, ov.x, ov.y)
        let distance = DDeiUtil.getPointDistance(pathPvs[st].x, pathPvs[st].y, pathPvs[en].x, pathPvs[en].y)
        let rate = pointDistance / distance
        ov.rate = rate > 1 ? rate : rate
      } else {
        let index = ov.index
        //计算当前path的角度（方向）angle和投射后点的比例rate
        if (index == pathPvs.length - 1) {
          st = index;
          en = 0;
        } else {
          st = index;
          en = index + 1;
        }
        x = pathPvs[st].x + (ov.rate * (pathPvs[en].x - pathPvs[st].x))
        y = pathPvs[st].y + (ov.rate * (pathPvs[en].y - pathPvs[st].y))
      }
      let sita = parseFloat(DDeiUtil.getLineAngle(pathPvs[st].x, pathPvs[st].y, pathPvs[en].x, pathPvs[en].y).toFixed(4))
      ov.x = x
      ov.y = y
      ov.sita = sita
    }
    //更新关联图形
    this.updateLinkModels();
  }



  /**
   * 更改图形后同步调整OVS点的位置
   */
  updateOVS(): void {
    if (this.ovs?.length > 0) {
      let defineOvs = DDeiUtil.getControlDefine(this)?.define?.ovs;
      for (let i = 0; i < this.ovs.length; i++) {
        let ov = this.ovs[i]
        let ovd = defineOvs[i]
        //依附于Path，则根据比例和index更新位置
        switch (ovd.constraint.type) {
          case 0:
            {
              let dx = ov.x - ov.ovi.x
              let dy = ov.y - ov.ovi.y
              let m1 = new Matrix3(
                1, 0, this.cpv.x + dx - ov.x,
                0, 1, this.cpv.y + dy - ov.y,
                0, 0, 1,
              );
              ov.x = this.cpv.x + dx
              ov.y = this.cpv.y + dy
              ov.ovi.x = ov.x - dx
              ov.ovi.y = ov.y - dy
              this.updateOVSLink(ov, ovd, m1)
              break;
            };
          case 1: {
            //构建验证路径
            let pathPvs = []
            let pvsStr = ovd.constraint.pvs;
            if (pvsStr?.length > 0) {
              pvsStr.forEach(pvsS => {
                //联动的点
                let pvsData = DDeiUtil.getDataByPathList(this, pvsS)
                if (Array.isArray(pvsData)) {
                  pvsData.forEach(pvsD => {
                    pathPvs.push(pvsD)
                  })
                } else {
                  pathPvs.push(pvsData)
                }

              })
            }
            if (pathPvs.length > 1) {
              //如果是初始状态或者pvs发生了变化，则根据现有坐标，投射最近的路径，找到index
              let x, y, st, en
              if (!(ov.index || ov.index == 0) || pathPvs.length <= ov.index) {
                let proPoints = DDeiAbstractShape.getProjPointDists(pathPvs, ov.x, ov.y, false, 1);
                let index = proPoints[0].index
                ov.index = index
                x = proPoints[0].x
                y = proPoints[0].y
                //计算当前path的角度（方向）angle和投射后点的比例rate
                if (index == pathPvs.length - 1) {
                  st = index;
                  en = 0;
                } else {
                  st = index;
                  en = index + 1;
                }
                //计算当前path的角度（方向）angle和投射后点的比例rate
                let pointDistance = DDeiUtil.getPointDistance(pathPvs[st].x, pathPvs[st].y, ov.x, ov.y)
                let distance = DDeiUtil.getPointDistance(pathPvs[st].x, pathPvs[st].y, pathPvs[en].x, pathPvs[en].y)
                let rate = pointDistance / distance
                ov.rate = rate > 1 ? rate : rate
              } else {
                let index = ov.index
                //计算当前path的角度（方向）angle和投射后点的比例rate
                if (index == pathPvs.length - 1) {
                  st = index;
                  en = 0;
                } else {
                  st = index;
                  en = index + 1;
                }

                x = pathPvs[st].x + (ov.rate * (pathPvs[en].x - pathPvs[st].x))
                y = pathPvs[st].y + (ov.rate * (pathPvs[en].y - pathPvs[st].y))
              }
              let sita = parseFloat(DDeiUtil.getLineAngle(pathPvs[st].x, pathPvs[st].y, pathPvs[en].x, pathPvs[en].y).toFixed(4))


              let m1 = new Matrix3()
              let dx = x - ov.x, dy = y - ov.y
              let deltaMoveMatrix = new Matrix3(
                1, 0, dx,
                0, 1, dy,
                0, 0, 1,
              );
              m1.premultiply(deltaMoveMatrix)
              let ovSita = ov.sita
              if (!ovSita) {
                ovSita = 0
              }
              if (sita != ovSita) {
                //计算input的正确打开位置，由节点0
                let move1Matrix = new Matrix3(
                  1, 0, -x,
                  0, 1, -y,
                  0, 0, 1);
                let angle = (-(sita - ovSita) * DDeiConfig.ROTATE_UNIT).toFixed(4);
                let rotateMatrix = new Matrix3(
                  Math.cos(angle), Math.sin(angle), 0,
                  -Math.sin(angle), Math.cos(angle), 0,
                  0, 0, 1);
                let move2Matrix = new Matrix3(
                  1, 0, x,
                  0, 1, y,
                  0, 0, 1);
                m1.premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix)
              }
              ov.x = x
              ov.y = y
              ov.sita = sita
              this.updateOVSLink(ov, ovd, m1)
            }
            break;
          }
        }
      }
    }
  }

  updateOVSLink(point, pointDefine, matrix): void {
    //遍历links
    if (pointDefine?.links) {
      //根据点联动配置，执行不同的策略
      pointDefine.links.forEach(link => {
        switch (link.type) {
          //类型1 施加矩阵
          case 1: {
            let pvsStr = link.pvs;
            if (pvsStr?.length > 0) {
              pvsStr.forEach(pvsS => {
                //联动的点
                let pvsData = DDeiUtil.getDataByPathList(this, pvsS)
                if (pvsData) {
                  if (Array.isArray(pvsData)) {
                    pvsData.forEach(pvsD => {
                      pvsD.applyMatrix3(matrix)
                    })
                  } else {
                    if (pvsData.transVectors) {
                      pvsData.transVectors(matrix)
                    } else {
                      pvsData.applyMatrix3(matrix)
                    }
                  }
                }
              });

            }
            break;
          }
          //类型99 执行脚本，适合处理逻辑比较复杂的关系
          case 99: {
            if (!link.evalScript && link.script) {
              eval("link.evalScript = function" + link.script)
            }
            if (link.evalScript) {
              link.evalScript(this, point, pointDefine, link)
            }
            break;
          }
        }

      });
    }
  }



  /**
   * 获取实际的内部容器控件
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainer(): DDeiAbstractShape {
    return null;
  }

  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainerByPos(x: number, y: number): DDeiAbstractShape {
    return null;
  }



  /**
    * 判断是否在某个边线上
    * @param direct 1，2，3，4 上、右、下、左
    */
  isBorderOn(direct: number, x: number, y: number, inWeight: number = -3, outWeight: number = 3): boolean {
    let projPoint = this.getProjPointOnLine({ x: x, y: y }
      , { in: inWeight, out: outWeight }, 1, direct - 1)
    if (projPoint) {
      return true;
    } else {
      return false;
    }
  }


  /**
   * 获取中心点操作点
   */
  getCenterOpPoints(): [] {
    if (this.opps?.length > 0) {
      return cloneDeep(this.opps)
    }
    return []
  }


  /**
   * 得到点在图形某条线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @param index 线开始点向量的下标
   * @returns 投影点的坐标
   */
  getProjPointOnLine(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: 0, out: 15 }, direct: number = 1, index: number): { x: number, y: number } | null {
    let x0 = point.x;
    let y0 = point.y;
    //判断鼠标是否在某个控件的范围内
    if (this.opps?.length > index) {
      let st, en;
      //点到直线的距离
      let plLength = Infinity;
      if (index == this.opps.length - 1) {
        st = index;
        en = 0;
      } else {
        st = index;
        en = index + 1;
      }
      let x1 = this.opps[st].x;
      let y1 = this.opps[st].y;
      let x2 = this.opps[en].x;
      let y2 = this.opps[en].y;
      //获取控件所有向量
      if (x1 == x2 && y1 == y2) {
        plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
      } else {
        //根据向量外积计算面积
        let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
        //计算直线上两点之间的距离
        let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        plLength = s / d
      }
      let flag = false;
      //plLength > 0时，方向向外,满足内外部条件
      if (direct == 1) {
        if (plLength >= distance.in && plLength <= distance.out) {
          flag = true;
        }
      } else if (direct == 2) {
        if (plLength <= distance.in && plLength >= distance.out) {
          flag = true;
        }
      }
      //进一步判断：1.点的投影是否在线段中间，2.点的投影的坐标位置
      if (flag) {
        //A.求得线向量与直角坐标系的夹角
        let lineV = new Vector3(x2, y2, 1);
        let pointV = new Vector3(x0, y0, 1);
        let toZeroMatrix = new Matrix3(
          1, 0, -x1,
          0, 1, -y1,
          0, 0, 1);
        //归到原点，求夹角
        lineV.applyMatrix3(toZeroMatrix)
        pointV.applyMatrix3(toZeroMatrix)
        let lineAngle = (new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0)) * 180 / Math.PI).toFixed(4);
        //判断移动后的线属于第几象限
        //B.构建旋转矩阵。旋转linvV和pointV
        let angle = 0;
        if (lineV.x >= 0 && lineV.y >= 0) {
          angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x <= 0 && lineV.y >= 0) {
          angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x <= 0 && lineV.y <= 0) {
          angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x >= 0 && lineV.y <= 0) {
          angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        }
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        lineV.applyMatrix3(rotateMatrix);
        pointV.applyMatrix3(rotateMatrix);

        //C.判断两个向量的关系，pointV.x必须大于0，且小于lineV.x
        if (pointV.x >= 0 && pointV.x <= lineV.x) {
          //D.投影点=（pointV.x,0)，通过旋转+位移到达目标点
          let v1 = new Vector3(pointV.x, 0, 1);
          angle = -angle;
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          v1.applyMatrix3(rotateMatrix);
          let removeMatrix = new Matrix3(
            1, 0, x1,
            0, 1, y1,
            0, 0, 1);
          v1.applyMatrix3(removeMatrix);
          //返回投影点
          return v1;
        }
      }

    }
    return null;
  }

  /**
   * 得到点在图形连接线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @param pointType 用于判定的点类别，1操作点，2范围点，缺省操作点
   * @returns 投影点的坐标
   */
  getProjPoint(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: 0, out: 15 }, direct: number = 1, pointType: number = 1): { x: number, y: number, plLength: number } | null {
    let x0 = point.x;
    let y0 = point.y;
    //判断鼠标是否在某个控件的范围内
    let opPVS = []
    if (pointType == 1) {
      if (this.opps?.length) {
        this.opps.forEach(opvs => {
          if (opvs.oppoint == 2) {
            opPVS.push(opvs);
          }
        });
      }
    } else {
      opPVS = this.getOperatePVS()
    }

    if (opPVS?.length > 0) {
      let st, en;
      for (let j = 0; j < opPVS.length; j++) {
        //点到直线的距离
        let plLength = Infinity;
        if (j == opPVS.length - 1) {
          st = j;
          en = 0;
        } else {
          st = j;
          en = j + 1;
        }
        let x1 = opPVS[st].x;
        let y1 = opPVS[st].y;
        let x2 = opPVS[en].x;
        let y2 = opPVS[en].y;
        //获取控件所有向量
        if (x1 == x2 && y1 == y2) {
          plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
        } else {
          //根据向量外积计算面积
          let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
          //计算直线上两点之间的距离
          let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          plLength = s / d
        }
        let flag = false;
        //plLength > 0时，方向向外,满足内外部条件
        if (direct == 1) {
          if (plLength >= distance.in && plLength <= distance.out) {
            flag = true;
          }
        } else if (direct == 2) {
          if (plLength <= distance.in && plLength >= distance.out) {
            flag = true;
          }
        }
        //进一步判断：1.点的投影是否在线段中间，2.点的投影的坐标位置
        if (flag) {
          //A.求得线向量与直角坐标系的夹角
          let lineV = new Vector3(x2, y2, 1);
          let pointV = new Vector3(x0, y0, 1);
          let toZeroMatrix = new Matrix3(
            1, 0, -x1,
            0, 1, -y1,
            0, 0, 1);
          //归到原点，求夹角
          lineV.applyMatrix3(toZeroMatrix)
          pointV.applyMatrix3(toZeroMatrix)
          let angle = new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0))
          let lineAngle = angle / DDeiConfig.ROTATE_UNIT
          //判断移动后的线属于第几象限
          if (lineV.x >= 0 && lineV.y >= 0) {
          } else if (lineV.x <= 0 && lineV.y >= 0) {
          } else if (lineV.x <= 0 && lineV.y <= 0) {
            angle = -angle
          } else if (lineV.x >= 0 && lineV.y <= 0) {
            angle = -angle
          }
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          lineV.applyMatrix3(rotateMatrix);
          pointV.applyMatrix3(rotateMatrix);

          //C.判断两个向量的关系，pointV.x必须大于0，且小于lineV.x
          if (pointV.x >= 0 && pointV.x <= lineV.x) {
            let isMiddle = false;
            if (Math.abs(lineV.x / 2 - pointV.x) <= 5) {
              pointV.x = lineV.x / 2
              isMiddle = true;
            }
            //D.投影点=（pointV.x,0)，通过旋转+位移到达目标点
            let v1 = new Vector3(pointV.x, 0, 1);
            angle = -angle;
            let rotateMatrix = new Matrix3(
              Math.cos(angle), Math.sin(angle), 0,
              -Math.sin(angle), Math.cos(angle), 0,
              0, 0, 1);
            v1.applyMatrix3(rotateMatrix);
            let removeMatrix = new Matrix3(
              1, 0, x1,
              0, 1, y1,
              0, 0, 1);
            v1.applyMatrix3(removeMatrix);
            v1.isMiddle = isMiddle

            //计算距离和角度，然后返回
            v1.sita = lineAngle
            let rate = Math.abs(pointV.x / lineV.x)
            v1.rate = rate > 1 ? 1 : rate
            v1.index = st
            v1.plLength = plLength
            return v1;
          }
        }
      }
    }
    return null;
  }

  /**
   * 返回计算后的坐标、大小
   */
  getBounds(): object {
    return { x: this.x, y: this.y, width: this.width, height: this.height, x1: this.x + this.width, y1: this.y + this.height }
  }

  /**
   * 获取画布缩放比率
   */
  getStageRatio(): number {
    if (this.stage) {
      let stageRatio = parseFloat(this.stage.ratio) ? parseFloat(this.stage.ratio) : 1.0
      if (!stageRatio || isNaN(stageRatio)) {
        stageRatio = DDeiConfig.STAGE_RATIO
      }
      return stageRatio
    } else {
      return 1.0
    }
  }

  /**
   * 修改自身状态
   */
  setState(state: DDeiEnumControlState) {
    if (this.state != state) {
      this.state = state
      this.render?.renderCacheData.clear();
    }
  }




  /**
   * 根据点的数量判断图形是否在一个区域内
   * @param x
   * @param y
   * @param x1
   * @param y1
   * @param pointNumber 在区域内点的数量，达到这个数量则看作在区域内，默认1
   * @returns 是否在区域内
   */
  isInRect(x: number, y: number, x1: number, y1: number, pointNumber: number = 1): boolean {
    if (x === undefined || y === undefined || x1 === undefined || y1 === undefined) {
      return false
    }
    let pvs = this.operatePVS?.length > 2 ? this.operatePVS : this.pvs;
    let len = pvs.length;
    let pn = 0
    let modelLines = []

    for (let i = 0; i < len; i++) {
      let ps = pvs[i]
      if (ps.x >= x && ps.y >= y && ps.x <= x1 && ps.y <= y1) {
        pn++
      }
      if (pn >= pointNumber) {
        return true;
      }
      if (i == len - 1) {
        modelLines.push({ x1: pvs[i].x, y1: pvs[i].y, x2: pvs[0].x, y2: pvs[0].y })
      } else {
        modelLines.push({ x1: pvs[i].x, y1: pvs[i].y, x2: pvs[i + 1].x, y2: pvs[i + 1].y })
      }
    }
    //执行执行线段相交判断
    let rectLines = [
      { x1: x, y1: y, x2: x1, y2: y },
      { x1: x1, y1: y, x2: x1, y2: y1 },
      { x1: x1, y1: y1, x2: x, y2: y1 },
      { x1: x, y1: y1, x2: x, y2: y }
    ]
    len = modelLines.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < 4; j++) {
        if (DDeiUtil.isLineCross(modelLines[i], rectLines[j])) {
          pn++;
          if (pn >= pointNumber) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
  * 判断某个线段是否与当前图形相交
  */
  isLineCross(line: { x1: number, y1: number, x2: number, y2: number }): boolean {
    for (let i = 0; i < this.pvs.length; i++) {
      let s = i
      let e = i + 1
      if (i == this.pvs.length - 1) {
        e = 0
      }
      if (DDeiUtil.isLineCross(line, { x1: this.pvs[s].x, y1: this.pvs[s].y, x2: this.pvs[e].x, y2: this.pvs[e].y })) {
        return true;
      }
    }
    return false
  }

  /**
   * 判断图形是否在一个文本编辑的区域内
   * @param x
   * @param y
   * @returns 是否在区域内
   */
  isInTextArea(x: number | undefined = undefined, y: number | undefined = undefined): boolean {
    if (x === undefined || y === undefined) {
      return false
    }
    if (this.textArea?.length > 0) {
      return DDeiAbstractShape.isInsidePolygon(
        this.textArea, { x: x, y: y });
    }
    return false;
  }

  /**
   * 判断图形是否在一个区域内，采用宽松的判定模式，允许传入一个大小值
   * @param x
   * @param y
   * @param loose 宽松判定,默认false
   * @returns 是否在区域内
   */
  isInAreaLoose(x: number | undefined = undefined, y: number | undefined = undefined, loose: boolean = false): boolean {
    if (x === undefined || y === undefined) {
      return false
    }
    let ps = null;
    if (loose && this.loosePVS?.length > 0) {
      ps = this.loosePVS;
    }
    else if (this.pvs?.length > 0) {
      ps = this.pvs;
    }
    if (ps?.length > 0) {
      return DDeiAbstractShape.isInsidePolygon(
        ps, { x: x, y: y });
    }
    return false;
  }



  /**
   * 获取当前图形的除layer的所有父节点对象
   */
  getParents(): DDeiAbstractShape[] {
    let pModel = this.pModel;
    let returnControls = [];
    while (pModel?.baseModelType != "DDeiLayer") {
      returnControls.push(pModel);
      pModel = pModel.pModel;
    }
    return returnControls;
  }



  /**
   * 获取控件坐标
   */
  getPosition() {
    return { x: this.x, y: this.y }
  }

  /**
     * 设置当前模型为被修改状态
     */
  setModelChanged(): void {
    this.layer?.setModelChanged();
  }

  /**
   * 判断当前模型是否已被修改
   */
  isModelChanged(): boolean {
    return this.layer?.isModelChanged();
  }
  /**
   * 移除自身的方法
   */
  destroyed() {
    //找到以自己为source的链接
    let sourceLinks = this.stage?.getSourceModelLinks(this.id);
    //删除链接
    sourceLinks?.forEach(link => {
      if (link.dm) {
        link.dm.pModel.removeModel(link.dm, true)
      }
      this.stage?.removeLink(link);
    })

    let lines = this.stage?.getModelsByBaseType("DDeiLine");
    //删除线链接
    lines?.forEach(line => {
      if (line.linkModels?.has(this.id)) {
        line.linkModels.delete(this.id)
      }
    })

    if (this.render?.tempCanvas) {
      this.render.tempCanvas.remove()
      delete this.render.tempCanvas
    }

    this.render = null
  }
  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    let skipFields = DDeiConfig.SERI_FIELDS[this.modelType]?.SKIP;
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.SKIP;
    }
    if (!(skipFields?.length > 0)) {
      if (this.poly == 2) {
        skipFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.SKIP2;
      } else {
        skipFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.SKIP;
      }
    }

    let toJSONFields = DDeiConfig.SERI_FIELDS[this.modelType]?.TOJSON;
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.TOJSON;
    }
    if (!(toJSONFields?.length > 0)) {
      toJSONFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.TOJSON;
    }
    for (let i in this) {
      if ((!skipFields || skipFields?.indexOf(i) == -1)) {
        if (toJSONFields && toJSONFields.indexOf(i) != -1 && this[i]) {
          if (Array.isArray(this[i])) {
            let array = [];
            for (let xi = 0; xi < this[i].length; xi++) {
              let element = this[i][xi]
              if (Array.isArray(element)) {
                let subArray = [];
                element.forEach(subEle => {

                  if (subEle?.toJSON) {
                    subArray.push(subEle.toJSON());
                  } else {
                    subArray.push(subEle);
                  }
                })
                array.push(subArray);
              } else if (element?.toJSON) {
                array.push(element.toJSON());
              } else {
                array.push(element);
              }
            }
            if (array.length > 0) {
              json[i] = array;
            }
          } else if (this[i]?.set && this[i]?.has) {
            let map = {};
            this[i].forEach((element, key) => {
              if (element?.toJSON) {
                map[key] = element.toJSON();
              } else {
                map[key] = element;
              }
            });
            if (JSON.stringify(map) != "{}") {
              json[i] = map;
            }
          } else if (this[i]?.toJSON) {
            json[i] = this[i].toJSON();
          } else if (this[i] || this[i] == 0) {
            json[i] = this[i];
          }
        } else {
          if (Array.isArray(this[i])) {
            let array = [];
            for (let xi = 0; xi < this[i].length; xi++) {
              let element = this[i][xi];
              if (Array.isArray(element)) {
                let subArray = [];
                element.forEach(subEle => {

                  if (subEle?.toJSON) {
                    subArray.push(subEle.toJSON());
                  } else {
                    subArray.push(subEle);
                  }
                })
                array.push(subArray);
              } else if (element?.toJSON) {
                array.push(element.toJSON());
              } else if (element?.isVector3) {
                let dt = clone(element);
                delete dt.z
                array.push(dt);
              } else {
                array.push(element);
              }
            }
            if (array.length > 0) {
              json[i] = array;
            }
          } else if (this[i]?.set && this[i]?.has) {
            let map = {};
            this[i].forEach((element, key) => {
              if (element?.toJSON) {
                map[key] = element.toJSON();
              } else {
                map[key] = element;
              }
            });
            if (JSON.stringify(map) != "{}") {
              json[i] = map;
            }
          } else if (this[i]?.toJSON) {
            json[i] = this[i].toJSON();
          } else if (this[i] || this[i] == 0) {
            if (i == 'rotate' && this[i] == 0) {

            } else if ((i == 'text' || i == 'imgBase64') && this[i] == "") {

            } else if (this[i].isVector3) {
              json[i] = clone(this[i]);
              delete json[i].z
            } else {
              json[i] = this[i];
            }
          }
        }
      }
    }

    return json;
  }

  // ============================ 静态方法 ============================


  /**
   * 移动控件位置
   * @param models 
   * @param dx 
   * @param dy 
   */
  static moveModels(models: DDeiAbstractShape[], dx: number = 0, dy: number = 0, ignoreModelIds: string[]) {
    if ((dx != 0 || dy != 0) && models?.length > 0) {
      let moveMatrix = new Matrix3(
        1, 0, dx,
        0, 1, dy,
        0, 0, 1);
      models.forEach(m => {
        m.transVectors(moveMatrix)
        m.updateLinkModels(ignoreModelIds)
      })
    }
  }

  /**
   * 以矩形的大小变化为参照物，修改模型的大小
   */
  static changeModelBoundByRect(models: DDeiAbstractShape[], rectObj: object, data: { deltaX: number, deltaY: number, deltaWidth: number, deltaHeight: number }) {
    if (!(models?.length > 0)) {
      return;
    }
    let deltaX = data.deltaX ? data.deltaX : 0;
    let deltaY = data.deltaY ? data.deltaY : 0;
    let deltaWidth = data.deltaWidth ? data.deltaWidth : 0;
    let deltaHeight = data.deltaHeight ? data.deltaHeight : 0;
    let selector = rectObj

    //获取全局缩放比例
    let stageRatio = models[0].getStageRatio()


    //获取间距设定
    let paddingWeight = 0;
    if (selector.modelType) {
      let paddingWeightInfo = selector.paddingWeight?.selected ? selector.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
      if (models.length > 1) {
        paddingWeight = paddingWeightInfo.multiple;
      } else {
        paddingWeight = paddingWeightInfo.single;
      }
    }
    selector.width -= 2 * paddingWeight
    selector.height -= 2 * paddingWeight


    //计算平移和缩放矩阵
    let selectCPVXDelta = deltaX == 0 ? deltaWidth / 2 : deltaX / 2
    let selectCPVYDelta = deltaY == 0 ? deltaHeight / 2 : deltaY / 2
    let scaleWRate = 1 + deltaWidth / selector.width / stageRatio
    let scaleHRate = 1 + deltaHeight / selector.height / stageRatio

    let itemMoveMatrix = new Matrix3(
      1, 0, -selector.cpv.x,
      0, 1, -selector.cpv.y,
      0, 0, 1);
    let scaleMatrix = new Matrix3(
      scaleWRate, 0, 0,
      0, scaleHRate, 0,
      0, 0, 1);
    let itemMove1Matrix = new Matrix3(
      1, 0, selector.cpv.x + selectCPVXDelta,
      0, 1, selector.cpv.y + selectCPVYDelta,
      0, 0, 1);

    models.forEach(item => {
      //此item的矩阵
      let m2 = new Matrix3()

      m2.premultiply(itemMoveMatrix)
      if (item.rotate) {
        let angle = item.rotate * DDeiConfig.ROTATE_UNIT
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m2.premultiply(rotateMatrix)
      }

      m2.premultiply(scaleMatrix)

      if (item.rotate) {
        let angle = -item.rotate * DDeiConfig.ROTATE_UNIT
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m2.premultiply(rotateMatrix)
      }

      m2.premultiply(itemMove1Matrix)


      item.transVectors(m2)



      item.initPVS()

      item.render?.enableRefreshShape()

    })
  }


  /**
   * 通过射线法判断点是否在图形内部
   * @param pps 多边形顶点 
   * @param point 测试点
   * @returns
   */
  static isInsidePolygon(polygon: object[], point: { x: number, y: number }): boolean {
    let x = point.x, y = point.y;
    let inside = false;
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i].x, yi = polygon[i].y;
      var xj = polygon[j].x, yj = polygon[j].y;
      var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }


  /**
  * 基于向量点获取一组图形模型的宽高
  * @param models
  */
  static getOutRectByPV(models: Array<DDeiAbstractShape>): object {
    models = models.filter(item => !!item)
    if (!models.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    //按照rotate对图形进行旋转，求的旋转后的四个点坐标
    //遍历所有点，求得最大、最小的x、y
    let points: object[] = [];
    models.forEach(item => {
      let pvs = item.operatePVS ? item.operatePVS : item.pvs;
      //按圆心进行旋转rotate度，得到绘制出来的点位
      points = points.concat(pvs)
    })

    return DDeiAbstractShape.pvsToOutRect(points);
  }


  /**
  * 获取最靠外部的一组向量
  * @param models
  */
  static getOutPV(models: Array<DDeiAbstractShape>): object {
    let o = DDeiAbstractShape.getOutRectByPV(models);
    return DDeiAbstractShape.outRectToPV(o)


  }

  /**
   * 返回外接矩形的点集合
   */
  static outRectToPV(o: object): object[] {
    return [
      new Vector3(o.x, o.y, 1),
      new Vector3(o.x1, o.y, 1),
      new Vector3(o.x1, o.y1, 1),
      new Vector3(o.x, o.y1, 1)
    ]
  }


  /**
   * 返回点集合的外接矩形
   */
  static pvsToOutRect(points: object[]): object {
    let x: number = Infinity, y: number = Infinity, x1: number = -Infinity, y1: number = -Infinity;
    //找到最大、最小的x和y
    points.forEach(p => {
      x = Math.min(p.x, x)
      x1 = Math.max(p.x, x1)
      y = Math.min(p.y, y)
      y1 = Math.max(p.y, y1)
    })
    return {
      x: x, y: y, width: x1 - x, height: y1 - y, x1: x1, y1: y1
    }
  }


  /**
   * 获取某个控件下的最底层componse控件，如果没有则返回控件本身
   */
  static findBottomComponseByArea(control: DDeiAbstractShape, x = undefined, y = undefined): DDeiAbstractShape | null {
    let componses = [];
    if (control) {
      control.composes?.forEach(item => {
        //如果射线相交，则视为选中
        if (item.isInAreaLoose(x, y, true)) {
          //如果当前控件状态为选中，且是容器，则往下寻找控件，否则返回当前控件
          let subComponse = DDeiAbstractShape.findBottomComponseByArea(item, x, y);
          if (subComponse) {
            componses.push(subComponse);
          } else {
            componses.push(item);
          }
        }
      })
      //对控件进行排序，按照zIndex > 添加顺序
      if (componses.length > 0) {
        componses.sort(function (a, b) {
          if ((a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
            return a.cIndex - b.cIndex
          } else if ((a.cIndex || a.cIndex == 0) && !(b.cIndex || b.cIndex == 0)) {
            return 1
          } else if (!(a.cIndex || a.cIndex == 0) && (b.cIndex || b.cIndex == 0)) {
            return -1
          } else {
            return 0
          }
        });
        return componses[0];
      }
      else {
        return control
      }

    }
  }


  /**
   * 得到点在某个路径组合上的投射点
   * @param opPVS 构成路径的点
   * @param x0,y0 测试点
   * @param isClose 是否闭合
   * @param sort 是否排序后返回（按照投射距离的绝对值）
   * @returns 每一条路径上的投影点的坐标
   */
  static getProjPointDists(opPVS: [], x0: number, y0: number,
    isClose: boolean = false, sort: number = 0): [{ index: number, dist: number, x: number, y: number }] | null {
    if (opPVS?.length > 0) {
      let st, en;
      let returnData = []
      for (let j = 0; j < opPVS.length; j++) {
        //点到直线的距离
        let plLength = Infinity;
        if (j == opPVS.length - 1) {
          if (isClose) {
            st = j;
            en = 0;
          } else {
            continue;
          }
        } else {
          st = j;
          en = j + 1;
        }
        let x1 = opPVS[st].x;
        let y1 = opPVS[st].y;
        let x2 = opPVS[en].x;
        let y2 = opPVS[en].y;
        //获取控件所有向量
        if (x1 == x2 && y1 == y2) {
          plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
        } else {
          //根据向量外积计算面积
          let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
          //计算直线上两点之间的距离
          let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          plLength = s / d
        }
        //计算投射点的坐标

        //A.求得线向量与直角坐标系的夹角
        let lineV = new Vector3(x2, y2, 1);
        let pointV = new Vector3(x0, y0, 1);
        let toZeroMatrix = new Matrix3(
          1, 0, -x1,
          0, 1, -y1,
          0, 0, 1);
        //归到原点，求夹角
        lineV.applyMatrix3(toZeroMatrix)
        pointV.applyMatrix3(toZeroMatrix)
        let lineAngle = (new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0)) * 180 / Math.PI).toFixed(4);
        //判断移动后的线属于第几象限
        //B.构建旋转矩阵。旋转linvV和pointV
        let angle = 0;
        if (lineV.x >= 0 && lineV.y >= 0) {
          angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x <= 0 && lineV.y >= 0) {
          angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x <= 0 && lineV.y <= 0) {
          angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        } else if (lineV.x >= 0 && lineV.y <= 0) {
          angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
        }
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        lineV.applyMatrix3(rotateMatrix);
        pointV.applyMatrix3(rotateMatrix);

        //C.判断两个向量的关系，pointV.x必须大于0，且小于lineV.x
        if (pointV.x < 0) {
          pointV.x = 0
        } else if (pointV.x > lineV.x) {
          pointV.x = lineV.x
        }
        //D.投影点=（pointV.x,0)，通过旋转+位移到达目标点
        let v1 = new Vector3(pointV.x, 0, 1);
        angle = -angle;
        let rotateMatrix1 = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        v1.applyMatrix3(rotateMatrix1);
        let removeMatrix = new Matrix3(
          1, 0, x1,
          0, 1, y1,
          0, 0, 1);
        v1.applyMatrix3(removeMatrix);
        //返回投影点
        returnData.push({ index: st, dist: plLength, x: v1.x, y: v1.y })

      }
      //升序
      if (sort == 1) {
        returnData.sort((a, b) => {
          return Math.abs(a.dist) - Math.abs(b.dist)
        })
      }
      //降序
      else if (sort == 2) {
        returnData.sort((a, b) => {
          return Math.abs(b.dist) - Math.abs(a.dist)
        })
      }
      return returnData;
    }
    return null;
  }


  /**
   * 获取某个容器下选中区域的所有控件,如果控件已被选中，且是一个容器，则继续向下直到最底层
   * @param container 容器
   * @param x  X坐标
   * @param y  Y坐标
   * @param loose 启用宽松判定
   * @param deep 启动深度判定
   * @returns 
   */
  static findBottomModelsByArea(container, x = undefined, y = undefined, loose: boolean = false, deep: boolean = false): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      for (let mg = container.midList.length - 1; mg >= 0; mg--) {
        let item = container.models.get(container.midList[mg]);

        //如果射线相交，则视为选中
        if (item.isInAreaLoose(x, y, loose)) {
          //如果当前控件状态为选中，且是容器，则往下寻找控件，否则返回当前控件
          if ((item.state == DDeiEnumControlState.SELECTED || deep) && item.baseModelType == "DDeiContainer") {
            let subControls = DDeiAbstractShape.findBottomModelsByArea(item, x, y, loose, deep);
            if (subControls && subControls.length > 0) {
              controls = controls.concat(subControls);
            } else {
              controls.push(item);
            }
          } else if ((item.state == DDeiEnumControlState.SELECTED || deep) && item.baseModelType == "DDeiTable") {
            //判断表格当前的单元格是否是选中的单元格，如果是则分发事件
            let currentCell = item.getAccuContainerByPos(x, y);
            if (currentCell?.state == DDeiEnumControlState.SELECTED) {
              let subControls = DDeiAbstractShape.findBottomModelsByArea(currentCell, x, y, loose, deep);
              if (subControls && subControls.length > 0) {
                controls = controls.concat(subControls);
              } else {
                controls.push(item);
              }
            } else {
              controls.push(item);
            }

          } else {
            controls.push(item);
          }
        }
      }
    }
    //对控件进行排序，按照zIndex > 添加顺序
    if (controls.length > 1) {

      controls.sort(function (a, b) {
        let anumber = -1
        let bnumber = -1

        if (a.baseModelType == 'DDeiLine') {
          anumber = 1000 + (a.zIndex ? b.zIndex : 0)
        } else if (a.id.startsWith("lsm_")) {
          anumber = 2100 + (a.zIndex ? b.zIndex : 0)
        } else {
          anumber = 1000 + (a.zIndex ? b.zIndex : 0)
        }
        if (b.baseModelType == 'DDeiLine') {
          bnumber = 1000 + (b.zIndex ? b.zIndex : 0)
        } else if (b.id.startsWith("lsm_")) {
          bnumber = 2100 + (b.zIndex ? b.zIndex : 0)
        } else {
          bnumber = 1000 + (b.zIndex ? b.zIndex : 0)
        }
        //2024-03-10 去掉选中的优先
        // if (a.state == DDeiEnumControlState.SELECTED) {
        //   anumber += 10000
        // }
        // if (b.state == DDeiEnumControlState.SELECTED) {
        //   bnumber += 10000
        // }
        //如果是compose的容器，则优先级最低
        if (a.baseModelType == 'DDeiContainer' && a.layout == 'compose') {
          anumber -= 5000
        }
        if (b.baseModelType == 'DDeiContainer' && b.layout == 'compose') {
          bnumber -= 5000
        }


        return bnumber - anumber; //降序排序

      });
    }

    return controls;
  }


  /**
   * 获取某个容器下选中区域的最底层容器
   * @param area 选中区域
   * @returns 
   */
  static findBottomContainersByArea(container, x = undefined, y = undefined): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      for (let mg = container.midList.length - 1; mg >= 0; mg--) {
        let item = container.models.get(container.midList[mg]);
        //如果射线相交，则视为选中
        if (DDeiAbstractShape.isInsidePolygon(item.pvs, { x: x, y: y })) {
          //获取真实的容器控件
          let accuContainer = item.getAccuContainerByPos(x, y);
          if (accuContainer) {
            let subControls = DDeiAbstractShape.findBottomContainersByArea(accuContainer, x, y);
            if (subControls && subControls.length > 0) {
              controls = controls.concat(subControls);
            } else {
              controls.push(accuContainer);
            }
          }
        }
      }
    }
    return controls;
  }


}


export default DDeiAbstractShape
