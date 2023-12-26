import DDeiConfig from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiAbstractShape from '../../models/shape';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiLayoutManagerFactory from '../../layout/layout-manager-factory';
import { has } from 'lodash';
import DDeiUtil from '../../util';
/**
 * 改变特殊操作点位置的总线Command
 */
class DDeiBusCommandOVSChangePosition extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage
    let stageRender = stage?.render
    let x = data?.x ? data.x : 0;
    let y = data?.y ? data.y : 0;
    if ((x || y) && stageRender.dragObj) {
      let dragObj = stageRender.dragObj;
      //获取操作的模型、点，点上有当前点的信息
      let model = dragObj.model;
      let opPoint = dragObj.opPoint;
      let modelPointIdx = model.ovs.indexOf(opPoint);
      //获取点的定义，点的定义上有限制条件，控制范围等信息
      let ovsDefine = DDeiUtil.getControlDefine(model)?.define?.ovs;
      let point = null;
      if (ovsDefine?.length > modelPointIdx) {
        point = ovsDefine[modelPointIdx]
      }
      if (point) {
        //根据坐标生成移动矩阵，根据约束限制移动矩阵
        let dx = x - opPoint.x, dy = y - opPoint.y
        if (point.constraint) {
          switch (point.constraint.type) {
            //在一条路径上移动
            case 1: {
              //构建验证路径
              let pathPvs = []
              let pvsStr = point.constraint.pvs;
              if (pvsStr?.length > 0) {
                pvsStr.forEach(pvsS => {
                  //联动的点
                  let pvsData = DDeiUtil.getDataByPathList(model, pvsS)
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
                //将点投射到路径上
                let proPoints = DDeiAbstractShape.getProjPointDists(pathPvs, x, y, false, 1);
                if (proPoints?.length > 0) {
                  dx = proPoints[0].x - opPoint.x
                  dy = proPoints[0].y - opPoint.y
                } else {
                  dx = 0
                  dy = 0
                }
              }
              break;
            }
            //在一个矩形范围内移动,需要考虑旋转后的情况
            case 2: {
              //计算旋转、缩放后的控制点大小，而非直接使用定义时的数据
              let rotate = model.rotate
              if (!rotate) {
                rotate = 0
              }
              //旋转矩阵
              let angle = (-rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
              let moveMatrix = new Matrix3(
                1, 0, model.cpv.x,
                0, 1, model.cpv.y,
                0, 0, 1);
              let rotateMatrix = new Matrix3(
                Math.cos(angle), Math.sin(angle), 0,
                -Math.sin(angle), Math.cos(angle), 0,
                0, 0, 1);
              let bpv = DDeiUtil.pointsToZero([model.bpv], model.cpv, rotate)[0]
              let scaleX = Math.abs(bpv.x / 100)
              let scaleY = Math.abs(bpv.y / 100)
              //缩放矩阵
              let scaleMatrix = new Matrix3(
                scaleX, 0, 0,
                0, scaleY, 0,
                0, 0, 1);
              //计算旋转后的可移动范围，得到一个多边形，判断是否在多边形内部
              let pv1 = new Vector3(point.constraint.x0, point.constraint.y0, 1)
              let pv2 = new Vector3(point.constraint.x1, point.constraint.y1, 1)
              let outPVS = DDeiAbstractShape.outRectToPV(DDeiAbstractShape.pvsToOutRect([pv1, pv2]));
              let m1 = new Matrix3().premultiply(scaleMatrix).premultiply(rotateMatrix).premultiply(moveMatrix)
              outPVS.forEach(pv => {
                pv.applyMatrix3(m1)
              })
              if (!DDeiAbstractShape.isInsidePolygon(outPVS, { x: x, y: y })) {
                //设置坐标为最接近的位置
                //将点投射到路径上
                let proPoints = DDeiAbstractShape.getProjPointDists(outPVS, x, y, false, 1);
                if (proPoints?.length > 0) {
                  dx = proPoints[0].x - opPoint.x
                  dy = proPoints[0].y - opPoint.y
                } else {
                  dx = 0
                  dy = 0
                }
              }
              break;
            }
            //在一个圆心半径内移动
            case 3: {
              break;
            }
            //沿着一条线移动
            case 4: {
              break;
            }
          }
        }
        let moveMatrix = new Matrix3(
          1, 0, dx,
          0, 1, dy,
          0, 0, 1,
        );
        opPoint.applyMatrix3(moveMatrix)
        //遍历links
        if (point?.links) {
          //根据点联动配置，执行不同的策略
          point.links.forEach(link => {
            switch (link.type) {
              case 1: {
                let pvsStr = link.pvs;
                if (pvsStr?.length > 0) {
                  pvsStr.forEach(pvsS => {
                    //联动的点
                    let pvsData = DDeiUtil.getDataByPathList(model, pvsS)
                    if (pvsData) {
                      if (Array.isArray(pvsData)) {
                        pvsData.forEach(pvsD => {
                          pvsD.applyMatrix3(moveMatrix)
                        })
                      } else {
                        if (pvsData.transVectors) {
                          pvsData.transVectors(moveMatrix)
                        } else {
                          pvsData.applyMatrix3(moveMatrix)
                        }
                      }
                    }
                  });

                }

              } break;
            }
          });
        }
        //触发重新采样，重新计算exPVS的坐标，exPVS是间接得到，因此需要特殊计算
        //TODO EXPVS应该记录其类别，以确保重新计算时可以还原
        model.initPVS()
        for (let i in model.exPvs) {
          let pv = model.exPvs[i];
          pv.applyMatrix3(moveMatrix)
        };
        model.updateLinkModels();

        return true;
      }
    }
    return false;
  }

  /**
   * 后置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {
    bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds, data, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandOVSChangePosition({ code: DDeiEnumBusCommandType.OVSChangePosition, name: "", desc: "" })
  }
}


export default DDeiBusCommandOVSChangePosition
