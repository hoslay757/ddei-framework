import DDeiConfig from '../config'
import DDeiStage from './stage'
import DDeiLayer from './layer'
import DDeiEnumControlState from '../enums/control-state'
import DDeiUtil from '../util'
import { Matrix3, Vector3 } from 'three';
import { cloneDeep, isNumber } from 'lodash'
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
    this.sample = props.sample ? cloneDeep(props.sample) : null
    this.ruleEvals = []
    if (props.cpv) {
      this.cpv = new Vector3(props.cpv.x, props.cpv.y, props.cpv.z || props.cpv.z == 0 ? props.cpv.z : 1);
    }
    if (props.pvs) {
      this.pvs = [];
      props.pvs.forEach(pv => {
        this.pvs.push(new Vector3(pv.x, pv.y, pv.z || pv.z == 0 ? pv.z : 1));
      });
    }
    this.hpv = []
    if (props.hpv) {
      props.hpv.forEach(pv => {
        this.hpv.push(new Vector3(pv.x, pv.y, pv.z || pv.z == 0 ? pv.z : 1));
      });
    }

    this.exPvs = {}
    if (props.exPvs) {
      for (let i in props.exPvs) {
        let pv = props.exPvs[i];
        let v = new Vector3(pv.x, pv.y, pv.z || pv.z == 0 ? pv.z : 1)
        v.id = pv.id
        this.exPvs[pv.id] = v;
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
  // 旋转,0/null 不旋转，默认0
  rotate: number | null;

  //中心点向量
  cpv: Vector3;

  //隐藏平行线点，形成一条平行于x轴的直线，用于在旋转后，通过其与坐标轴的夹角求真实的旋转角度
  hpv: Vector3[];

  //周围点向量
  pvs: Vector3;

  //额外扩展向量，如：与连线关联的向量
  exPvs: object;

  //唯一表示码，运行时临时生成
  unicode: string;

  //格式化信息
  fmt: object | null;

  //坐标描述方式，null/1为直角坐标，2为极坐标，默认直角坐标
  poly: number | null;

  //极坐标下的采样策略
  sample: object | null;
  //特殊文本样式
  sptStyle: object;
  // ============================ 方法 ============================

  /**
   * 初始化向量，基于width和height构建向量，默认中心点在0，0的位置
   */
  initPVS() {
    if (!this.cpv) {
      this.cpv = new Vector3(0, 0, 1)
    }
    //如果是极坐标，则用极坐标的方式来计算pvs、hpv等信息，否则采用pvs的方式
    if (this.poly == 2) {
      //极坐标系中，采用基于原点的100向量表示水平
      if (!(this.hpv?.length > 0)) {
        this.hpv = [new Vector3(0, 0, 1), new Vector3(100, 0, 1), new Vector3(this.width, this.height, 1)]
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
  }

  /**
   * 执行采样计算pvs
   */
  executeSample() {
    //通过采样计算pvs,可能存在多组pvs
    let defineSample = DDeiUtil.getControlDefine(this)?.define?.sample;
    if (defineSample?.rules?.length > 0 && this.sample) {
      //采样结果
      let sampliesResult = []
      //采样次数
      let loop = this.sample.loop;
      //单次采样角度
      let pn = 360 / loop;
      //初始角度
      let angle = this.sample.angle;
      this.sample.rules = []
      //执行采样
      for (let i = 0; i < loop; i++) {
        let sita = angle + i * pn
        for (let j = 0; j < defineSample.rules?.length; j++) {
          if (this.ruleEvals && !this.ruleEvals[j]) {
            eval("this.ruleEvals[j] = function" + defineSample.rules[j])
          }
          let spFn = this.ruleEvals[j]
          if (!sampliesResult[j]) {
            sampliesResult[j] = []
          }
          let spResult = sampliesResult[j]
          spFn(i, j, sita, this.sample, spResult, this)
        }
      }
      //对返回的数据进行处理和拆分
      let pvs = []
      let textArea = []
      for (let i = 0; i < sampliesResult.length; i++) {
        if (sampliesResult[i].length > 0 && sampliesResult[i][0].type != 10) {
          sampliesResult[i].forEach(pvd => {
            let pv = new Vector3()
            for (let i in pvd) {
              pv[i] = pvd[i]
            }
            pv.z = (pvd.z || pvd.z === 0) ? pvd.z : 1
            pvs.push(pv)
          })
        } else if (sampliesResult[i].length > 0 && sampliesResult[i][0].type == 10) {
          sampliesResult[i].forEach(pvd => {
            let pv = new Vector3()
            for (let i in pvd) {
              pv[i] = pvd[i]
            }
            pv.z = (pvd.z || pvd.z === 0) ? pvd.z : 1
            textArea.push(pv)
          })
        }
      }
      //根据旋转和缩放参照点，构建旋转和缩放矩阵，对矩阵进行旋转
      let m1 = new Matrix3();

      let hpv = DDeiUtil.pointsToZero(this.hpv, this.cpv, this.rotate)
      let scaleX = (hpv[2].x / 100).toFixed(2);
      let scaleY = (hpv[2].y / 100).toFixed(2);
      let scaleMatrix = new Matrix3(
        scaleX, 0, 0,
        0, scaleY, 0,
        0, 0, 1);
      m1.premultiply(scaleMatrix)

      if (this.rotate) {
        let angle = parseFloat((-this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4));
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
      textArea.forEach(pv => {
        pv.applyMatrix3(m1)
      });

      this.pvs = pvs
      this.textArea = textArea
    }
  }


  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3): void {
    this.cpv.applyMatrix3(matrix);
    if (this.poly == 2) {
      this.hpv.forEach(pv => {
        pv.applyMatrix3(matrix);
      })
      this.initHPV();
      this.calRotate()
      this.calLoosePVS();
      this.executeSample();
    } else {
      this.pvs.forEach(pv => {
        pv.applyMatrix3(matrix)
      });
      for (let i in this.exPvs) {
        let pv = this.exPvs[i];
        pv.applyMatrix3(matrix)
      };
      this.initHPV();
      this.calRotate()
      this.calLoosePVS();
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
   * 清空特殊文本样式
   */
  clearSptStyle() {
    this.sptStyle = {}
  }


  /**
   * 设置当前最新的hpv
   */
  initHPV(): void {
    this.hpv[0] = this.pvs[0]
    this.hpv[1] = this.pvs[1]
  }

  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    let stageRatio = this.stage?.getStageRatio();
    //复制当前向量
    this.loosePVS = cloneDeep(this.pvs)

    let move1Matrix = new Matrix3(
      1, 0, -this.cpv.x,
      0, 1, -this.cpv.y,
      0, 0, 1);
    this.loosePVS.forEach(fpv => {
      fpv.applyMatrix3(move1Matrix)
    });
    //获取旋转角度
    if (this.rotate && this.rotate != 0) {
      let angle = (this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
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
    let scaleMatrix = new Matrix3(
      1 + Math.min(0.1, 20 / this.width), 0, 0,
      0, 1 + Math.min(0.1, 20 / this.height), 0,
      0, 0, 1);
    m1.premultiply(scaleMatrix)
    //旋转并位移回去
    if (this.rotate && this.rotate != 0) {
      let angle = -(this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
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
   * 同步向量
   * @param source 源模型
   * @param cloneVP 是否克隆向量，默认false
   */
  syncVectors(source: DDeiAbstractShape, clonePV: boolean = false): void {
    if (this.poly == 2) {
      if (clonePV) {
        this.cpv = cloneDeep(source.cpv)
        this.exPvs = cloneDeep(source.exPvs)
      } else {
        this.cpv = source.cpv
        this.exPvs = source.exPvs
      }
      this.executeSample();
    } else {
      if (clonePV) {
        this.pvs = cloneDeep(source.pvs)
        this.cpv = cloneDeep(source.cpv)
        this.exPvs = cloneDeep(source.exPvs)
      } else {
        this.pvs = source.pvs
        this.cpv = source.cpv
        this.exPvs = source.exPvs
      }
    }
    this.initHPV()
    this.calRotate();
    this.calLoosePVS();
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
        let angle = (this.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
        //计算input的正确打开位置，由节点0
        let rotateMatrix = new Matrix3(
          Math.cos(angle), Math.sin(angle), 0,
          -Math.sin(angle), Math.cos(angle), 0,
          0, 0, 1);
        m1.premultiply(rotateMatrix);
      }
      if (rotate) {
        //还原到未旋转状态
        let angle = -(rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
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
  updateLinkModels(): void {
    //如果存在关联控件，同步修改关联控件坐标
    let links = this.stage.getSourceModelLinks(this.id);
    if (links?.length > 0) {
      //同步调整链接控件的数据

      links.forEach(link => {
        let dpv = link.getDistPV();
        if (dpv) {
          let spv = link.getSourcePV();
          dpv.x = spv.x
          dpv.y = spv.y
          dpv.z = spv.z
          link.dm.initPVS()
        }
      })
    }
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
        link.dm.pModel.removeModel(link.dm)
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

    this.render = null
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
   * 得到点在图形某条线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @param index 线开始点向量的下标
   * @returns 投影点的坐标
   */
  getProjPointOnLine(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: -5, out: 15 }, direct: number = 1, index: number): { x: number, y: number } | null {
    let x0 = point.x;
    let y0 = point.y;
    //判断鼠标是否在某个控件的范围内
    if (this.pvs?.length > index) {
      let st, en;
      //点到直线的距离
      let plLength = Infinity;
      if (index == this.pvs.length - 1) {
        st = index;
        en = 0;
      } else {
        st = index;
        en = index + 1;
      }
      let x1 = this.pvs[st].x;
      let y1 = this.pvs[st].y;
      let x2 = this.pvs[en].x;
      let y2 = this.pvs[en].y;
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
    let points = []
    for (let i = 0; i < this.pvs.length; i++) {
      let s = i
      let e = i + 1
      if (i == this.pvs.length - 1) {
        e = 0
      }
      points.push(new Vector3((this.pvs[s].x + this.pvs[e].x) / 2, (this.pvs[s].y + this.pvs[e].y) / 2, 1))
    }
    return points;
  }

  /**
   * 得到点在图形连接线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @returns 投影点的坐标
   */
  getProjPoint(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: -5, out: 15 }, direct: number = 1): { x: number, y: number } | null {
    let x0 = point.x;
    let y0 = point.y;
    //判断鼠标是否在某个控件的范围内
    if (this.pvs?.length > 0) {
      let st, en;
      for (let j = 0; j < this.pvs.length; j++) {
        //点到直线的距离
        let plLength = Infinity;
        if (j == this.pvs.length - 1) {
          st = j;
          en = 0;
        } else {
          st = j;
          en = j + 1;
        }
        let x1 = this.pvs[st].x;
        let y1 = this.pvs[st].y;
        let x2 = this.pvs[en].x;
        let y2 = this.pvs[en].y;
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
            //返回投影点
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
    let pvs = this.pvs;
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
    return true;
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
   * 设置控件坐标
   * @param x 
   * @param y 
   */
  setPosition(x: number, y: number) {
    console.warn("改成向量")
    this.setModelChanged()
  }

  /**
   * 设置大小
   * @param w
   * @param h
   */
  setSize(w: number, h: number) {

    console.warn("改成向量")
    this.setModelChanged()
  }

  /**
   * 设置控件坐标以及位置
   * @param x 
   * @param y 
   */
  setBounds(x: number, y: number, w: number, h: number) {
    this.setPosition(x, y)
    this.setSize(w, h)
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
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    let skipFields = DDeiConfig.SERI_FIELDS[this.modelType]?.SKIP;
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS[this.baseModelType]?.SKIP;
    }
    if (!(skipFields?.length > 0)) {
      skipFields = DDeiConfig.SERI_FIELDS["AbstractShape"]?.SKIP;
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
            this[i].forEach(element => {
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
            });
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
            this[i].forEach(element => {
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
            });
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
        }
      }
    }
    return json;
  }

  // ============================ 静态方法 ============================




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
   * 获取一组图形模型的宽高
   * @param models
   */
  static getModelsPosition(...models): object {
    models = models.filter(item => !!item)
    if (!models.length) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }
    let x = Infinity
    let y = Infinity
    let width = 0
    let height = 0
    models.forEach(item => {
      x = Math.min(+item.x, x)
      y = Math.min(+item.y, y)
    })
    models.forEach(item => {
      width = Math.max(Math.floor(+item.x + +item.width - x), width)
      height = Math.max(Math.floor(+item.y + +item.height - y), height)
    })
    return { x, y, width, height, x1: x + width, y1: y + height }
  }


  /**
   * 判断一组模型的旋转值是否相等
   * @param models
   */
  static isSameRotate(models: Array<DDeiAbstractShape>): boolean {
    if (!models || models.length < 1) {
      return true;
    }
    let upValues = models[0].rotate
    if (!upValues) {
      upValues = 0;
    }
    for (let i = 1; i < models.length; i++) {
      let r = models[i].rotate;
      if (!r) {
        r = 0
      }
      if (upValues != r) {
        return false;
      }
    }
    return true;
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
      //按圆心进行旋转rotate度，得到绘制出来的点位
      points = points.concat(item.pvs)
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
    let x: number = Infinity, y: number = Infinity, x1: number = 0, y1: number = 0;
    //找到最大、最小的x和y
    points.forEach(p => {
      x = Math.min(Math.floor(p.x), x)
      x1 = Math.max(Math.floor(p.x), x1)
      y = Math.min(Math.floor(p.y), y)
      y1 = Math.max(Math.floor(p.y), y1)
    })
    return {
      x: x, y: y, width: x1 - x, height: y1 - y, x1: x1, y1: y1
    }
  }





  /**
   * 获取某个容器下选中区域的所有控件,如果控件已被选中，且是一个容器，则继续向下直到最底层
   * @param area 选中区域
   * @returns 
   */
  static findBottomModelsByArea(container, x = undefined, y = undefined, loose: boolean = false): DDeiAbstractShape[] | null {
    let controls = [];
    if (container) {
      for (let mg = container.midList.length - 1; mg >= 0; mg--) {
        let item = container.models.get(container.midList[mg]);

        //如果射线相交，则视为选中
        if (item.isInAreaLoose(x, y, loose)) {
          //如果当前控件状态为选中，且是容器，则往下寻找控件，否则返回当前控件
          if (item.state == DDeiEnumControlState.SELECTED && item.baseModelType == "DDeiContainer") {
            let subControls = DDeiAbstractShape.findBottomModelsByArea(item, x, y, loose);
            if (subControls && subControls.length > 0) {
              controls = controls.concat(subControls);
            } else {
              controls.push(item);
            }
          } else if (item.state == DDeiEnumControlState.SELECTED && item.baseModelType == "DDeiTable") {
            //判断表格当前的单元格是否是选中的单元格，如果是则分发事件
            let currentCell = item.getAccuContainerByPos(x, y);
            if (currentCell?.state == DDeiEnumControlState.SELECTED) {
              let subControls = DDeiAbstractShape.findBottomModelsByArea(currentCell, x, y, loose);
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
        } else {
          anumber = 2000 + (a.zIndex ? b.zIndex : 0)
        }
        if (b.baseModelType == 'DDeiLine') {
          bnumber = 1000 + (b.zIndex ? b.zIndex : 0)
        } else {
          bnumber = 2000 + (b.zIndex ? b.zIndex : 0)
        }
        if (a.state == DDeiEnumControlState.SELECTED) {
          anumber += 10000
        }
        if (b.state == DDeiEnumControlState.SELECTED) {
          bnumber += 10000
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
