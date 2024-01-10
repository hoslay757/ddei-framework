import { MODEL_CLS, DDeiConfig } from '../config'
import DDeiAbstractShape from './shape'
import { Matrix3, Vector3 } from 'three';
import DDeiUtil from '../util';
import { debounce } from "lodash";
import DDeiLineLink from './linelink';
import DDeiLayer from './layer';
import DDeiEnumBusCommandType from '../enums/bus-command-type';
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
    this.sp = props.sp;
    this.ep = props.ep;

    //透明度
    this.opacity = props.opacity
    //圆角
    this.round = props.round

    this.spvs = props.spvs ? props.spvs : [];

    this.freeze = props.freeze ? props.freeze : 0;

    this.fill = props.fill

    this.linkModels = props.linkModels ? props.linkModels : new Map();

    this.updateLooseCanvasSync = debounce(this.updateLooseCanvasSync, 30)
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}, initPVS: boolean = true): DDeiLine {
    let model = new DDeiLine(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;
    //初始化composes
    if (json?.composes?.length > 0) {
      let composes = []
      json?.composes.forEach(composeJSON => {
        let def = DDeiUtil.getControlDefine(composeJSON)
        let composeModel: DDeiAbstractShape = MODEL_CLS[def.type].loadFromJSON(
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

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json: object, tempData: object = {}, initPVS: boolean = true): DDeiLine {
    let model = new DDeiLine(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //初始化composes
    if (json?.composes?.length > 0) {
      let composes = []
      json?.composes.forEach(composeJSON => {
        let def = DDeiUtil.getControlDefine(composeJSON)
        let composeModel: DDeiAbstractShape = MODEL_CLS[def.type].initByJSON(
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



  /**
   * 计算线段交叉点，用于绘制错线效果
   * 该方法在所有线段的calPoints方法执行完后执行，修改已计算好的节点
   */
  static calLineCrossSync(layer: DDeiLayer): Promise {
    return new Promise((resolve, reject) => {
      if (!layer.stage.render.refreshJumpLine) {
        let lines = layer.getModelsByBaseType("DDeiLine");
        DDeiLine.calLineCross(layer);
        lines.forEach(line => {
          line.updateLooseCanvas();
        })
        layer.stage.render.refreshJumpLine = true
      }

      resolve()
    });
  }

  static calLineCross(layer: DDeiLayer): void {
    if (!layer) {
      return;
    }
    let lines = layer.getModelsByBaseType("DDeiLine");
    //遍历，生成线的交错点
    lines.forEach(line => {
      line.clps = {}
    })

    let wl = 12 * layer.stage?.getStageRatio();
    let len = lines.length
    let rectMap = new Map();
    let corssLinePoints = []
    for (let i = 0; i < len - 1; i++) {
      let l1 = lines[i];
      if (l1.type == 3) {
        continue;
      }
      let jumpLine = DDeiModelArrtibuteValue.getAttrValueByState(l1, "jumpline", true);
      //采用全局跳线
      if (jumpLine == 0 || !jumpLine) {
        jumpLine = DDeiModelArrtibuteValue.getAttrValueByState(layer.stage, "global.jumpline", true);
      }
      if (jumpLine == 1) {
        if (!rectMap.has(l1.id)) {
          rectMap.set(l1.id, DDeiAbstractShape.getOutRectByPV([l1]))
        }
        let l1Rect = rectMap.get(l1.id);
        for (let j = i + 1; j < len; j++) {
          let l2 = lines[j];
          if (l2.type == 3) {
            continue;
          }

          if (l1 != l2) {
            if (!rectMap.has(l2.id)) {
              rectMap.set(l2.id, DDeiAbstractShape.getOutRectByPV([l2]))
            }
            let l2Rect = rectMap.get(l2.id);
            if (DDeiUtil.isRectCorss(l1Rect, l2Rect)) {
              for (let pi = 0; pi < l1.pvs.length - 1; pi++) {
                let p1 = l1.pvs[pi];
                let p2 = l1.pvs[pi + 1];
                for (let pj = 0; pj < l2.pvs.length - 1; pj++) {
                  let p3 = l2.pvs[pj];
                  let p4 = l2.pvs[pj + 1];
                  //判定线穿越
                  let crossPoint = DDeiUtil.getLineCorssPoint(p1, p2, p3, p4);
                  if (crossPoint != null) {
                    //计算单位移动量
                    let pRotate = DDeiUtil.getLineAngle(p1.x, p1.y, p2.x, p2.y)
                    let pAngle = (pRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
                    let pVectorUnit = new Vector3(1, 0, 1)
                    let pRotateMatrix = new Matrix3(
                      Math.cos(pAngle), Math.sin(pAngle), 0,
                      -Math.sin(pAngle), Math.cos(pAngle), 0,
                      0, 0, 1);
                    pVectorUnit.applyMatrix3(pRotateMatrix)
                    let sdist = DDeiUtil.getPointDistance(p1.x, p1.y, crossPoint.x, crossPoint.y)
                    let edist = DDeiUtil.getPointDistance(p2.x, p2.y, crossPoint.x, crossPoint.y)
                    let s1dist = DDeiUtil.getPointDistance(p3.x, p3.y, crossPoint.x, crossPoint.y)
                    let e1dist = DDeiUtil.getPointDistance(p4.x, p4.y, crossPoint.x, crossPoint.y)
                    if (sdist > wl && edist > wl && s1dist > wl && e1dist > wl) {
                      corssLinePoints.push({ line: l1, index: pi, cp: crossPoint, unit: pVectorUnit, r: pRotate, dist: sdist })
                    }
                  }
                }
              }
            }
          }
        }
      }


      corssLinePoints.forEach(clp => {
        if (!clp.line.clps[clp.index]) {
          clp.line.clps[clp.index] = []
        }
        //排序并插入，按从小到达顺序排列
        let dist = clp.dist;
        let has = false
        for (let di = 0; di < clp.line.clps[clp.index].length; di++) {
          if (dist <= clp.line.clps[clp.index][di]?.dist) {
            clp.line.clps[clp.index].splice(di, 0, clp)
            has = true;
            break;
          }
        }
        if (!has) {
          clp.line.clps[clp.index].push(clp)
        }
      })
      layer.stage?.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
      layer.stage?.ddInstance.bus.executeAll()
    }

  }

  static {
    DDeiLine.calLineCrossSync = debounce(DDeiLine.calLineCrossSync, 50)
  }



  //类名，用于反射和动态加载
  static ClsName: string = "DDeiLine";
  // ============================ 属性 ===============================
  //线段宽度
  weight: number;
  //线段颜色
  color: string;

  //填充
  fill: object;
  /**
   * 线上的文本或者其他图形，图形的中点相对于线上某个点的坐标，持有一个增量
   * 暂时只考虑：开始节点、结束节点，或者最中间的节点
   */
  linkModels: Map<string, DDeiLineLink>;

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
  //开始和结束节点
  sp: object;
  ep: object;
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

  //交错点，用于在绘制线段时截断线段，并生成条线效果，不序列化
  clps: object = {};
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
    //通过定义初始化ovs
    if (!(this.ovs?.length > 0)) {
      //通过采样计算pvs,可能存在多组pvs
      let defineOvs = DDeiUtil.getControlDefine(this)?.define?.ovs;
      if (defineOvs?.length > 0) {
        //全局缩放因子
        let stageRatio = this.getStageRatio();
        let ovs = []
        defineOvs.forEach(ovd => {
          let ov = new Vector3(ovd.x * stageRatio, ovd.y * stageRatio, ovd.z || ovd.z == 0 ? ovd.z : 1)
          let ovi = new Vector3(ovd.ix * stageRatio, ovd.iy * stageRatio, ovd.iz || ovd.iz == 0 ? ovd.iz : 1)
          ov.ovi = ovi
          ovs.push(ov)
        });
        this.ovs = ovs
      }
    }

    this.initHPV();
    //计算旋转
    this.calRotate();

    this.startPoint = this.pvs[0]
    this.endPoint = this.pvs[this.pvs.length - 1]

    //根据开始节点和结束节点的关系，自动计算中间节点路径的坐标
    this.calPoints();
    this.calLoosePVS();
    //联动更新链接控件
    this.refreshLinkModels()
    //处理composes
    this.composes?.forEach(compose => {
      compose.initPVS()
    });

  }

  /**
   * 初始化链接模型
   */
  initLinkModels() {
    //加载子模型
    let linkModels: Map<string, DDeiLineLink> = new Map<string, DDeiLineLink>();
    for (let key in this.linkModels) {
      let item = this.linkModels[key];
      if (item?.dmid) {
        let dm = this.stage.getModelById(item.dmid)
        item.dm = dm
        item.line = this;
        let lm = new DDeiLineLink(item);

        linkModels.set(key, lm)
      }
    }
    this.linkModels = linkModels
  }

  /**
   * 刷新链接模型
   */
  refreshLinkModels() {
    //加载子模型
    if (this.linkModels?.has) {
      this.linkModels.forEach(lm => {
        if (lm.dm) {
          //同步坐标关系
          let oldCPVX = lm.dm.cpv.x;
          let oldCPVY = lm.dm.cpv.y;
          let point = null;
          if (lm.type == 1) {
            point = this.startPoint;
          } else if (lm.type == 2) {
            point = this.endPoint;
          } else if (lm.type == 3) {
            //奇数，取正中间
            let pi = Math.floor(this.pvs.length / 2)
            if (this.pvs.length % 3 == 0) {
              point = this.pvs[pi];
            }
            //偶数，取两边的中间点
            else {
              point = {
                x: (this.pvs[pi - 1].x + this.pvs[pi].x) / 2,
                y: (this.pvs[pi - 1].y + this.pvs[pi].y) / 2
              }
            }
          }
          let newCPVX = point.x + lm.dx;
          let newCPVY = point.y + lm.dy;
          let moveMatrix = new Matrix3(
            1, 0, newCPVX - oldCPVX,
            0, 1, newCPVY - oldCPVY,
            0, 0, 1
          )
          lm.dm.transVectors(moveMatrix)
          lm.dm.updateLinkModels();
        }
      })
    }
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
    DDeiLine.calLineCrossSync(this.layer);
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
   * 设置直线的坐标，会根据约束关系来调整位置
   */
  setLineType1PointPosition(pointType, ex, ey) {
    //直线
    //开始点
    let sx = this.pvs[0].x
    let sy = this.pvs[0].y
    let endX = this.pvs[this.pvs.length - 1].x
    let endY = this.pvs[this.pvs.length - 1].y
    if (pointType == 0) {
      sx = ex
      sy = ey
    }
    //结束点
    else if (pointType == 1) {
      endX = ex
      endY = ey
    }
    let constraint = DDeiUtil.getControlDefine(this)?.define?.constraint;
    //调用方向约束
    if (constraint?.type[1]?.angles?.length > 0) {
      //获取开始节点与结束节点的角度
      let lineAngle = DDeiUtil.getLineAngle(sx, sy, endX, endY)
      //判断是不是在角度区间内，如果不是则定位到最近的开始或结束角度
      let angle = this.rotate ? this.rotate : 0
      let inArea = false;
      let minAngle = lineAngle
      let minAngleABS = Infinity
      for (let i = 0; i < constraint.type[1].angles.length; i++) {
        let angleArea = constraint.type[1].angles[i]
        if (angleArea[0] + angle <= lineAngle && angleArea[1] + angle >= lineAngle) {
          inArea = true;
          break;
        }
        if (Math.abs(angleArea[0] + angle - lineAngle) < minAngleABS) {
          minAngleABS = Math.abs(angleArea[0] + angle - lineAngle)
          minAngle = angleArea[0] + angle
        }
        if (Math.abs(angleArea[1] + angle - lineAngle) < minAngleABS) {
          minAngleABS = Math.abs(angleArea[1] + angle - lineAngle)
          minAngle = angleArea[1] + angle
        }
      }
      if (pointType == 0) {

        let sdx = this.pvs[this.pvs.length - 1].x - this.pvs[0].x
        let sdy = this.pvs[this.pvs.length - 1].y - this.pvs[0].y

        let zeroEndPoints = [new Vector3(sdx, sdy, 1)]
        let endPoint = DDeiUtil.zeroToPoints(zeroEndPoints, new Vector3(sx, sy), minAngle - lineAngle)[0]
        if (isNaN(endPoint.y)) {
          debugger
        }
        endX = endPoint.x
        endY = endPoint.y
      } else if (!inArea && pointType == 1) {
        let zeroEndPoints = DDeiUtil.pointsToZero([new Vector3(endX, endY, 1)], new Vector3(sx, sy), 0)
        let endPoint = DDeiUtil.zeroToPoints(zeroEndPoints, new Vector3(sx, sy), minAngle - lineAngle)[0]
        endX = endPoint.x
        endY = endPoint.y
      }
    }

    this.pvs[0].x = sx
    this.pvs[0].y = sy
    this.pvs[this.pvs.length - 1].x = endX
    this.pvs[this.pvs.length - 1].y = endY

  }

  /**
   * 基于当前向量计算宽松判定向量
   */
  calLoosePVS(): void {
    //构造N个点，包围直线或曲线范围
    this.loosePVS = this.pvs
    //创建临时canvas绘制线段到临时canvas上，通过临时线段判断canvas的状态
    this.updateLooseCanvasSync();
  }


  updateLooseCanvasSync(): Promise {
    return new Promise((resolve, reject) => {
      this.updateLooseCanvas()
      resolve()
    });
  }

  updateLooseCanvas(): void {

    if (!this.isShadowControl && this.render) {
      //转换为图片
      if (!this.looseCanvas) {
        this.looseCanvas = document.createElement('canvas');
        this.looseCanvas.setAttribute("style", "-moz-transform-origin:left top;");
        document.body.appendChild(this.looseCanvas)
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
      this.render.drawLine({ color: "red", weight: weight, dash: [], rat1: 1, fill: { color: "red" } }, ctx)
    }
  }

  /**
   * 变换向量
   */
  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean }): void {
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
    this.hpv[0].applyMatrix3(matrix)
    this.hpv[1].applyMatrix3(matrix)
    this.calRotate()
    this.calLoosePVS();
    this.composes?.forEach(compose => {
      compose.transVectors(matrix, params)
    });
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
    let layer = this.layer;
    let distLinks = this.stage?.getDistModelLinks(this.id);
    distLinks?.forEach(dl => {
      //删除源点
      if (dl?.sm && dl?.smpath) {
        eval("delete dl.sm." + dl.smpath)
      }
      this.stage?.removeLink(dl);
    })
    super.destroyed();
    //移除自身所有附属控件
    this.linkModels?.forEach(lm => {
      if (lm.dm) {
        lm.dm.pModel.removeModel(lm.dm)
      }
    })
    this.linkModels?.clear()
    this.linkModels = null;

    DDeiLine.calLineCrossSync(layer);
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
    for (let i = 0; i < source.composes?.length; i++) {
      let scop = source.composes[i]
      let tcop = this.composes[i]
      tcop.syncVectors(scop, clonePV)
    }
  }


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
  }




}


export default DDeiLine
