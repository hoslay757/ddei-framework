import { MODEL_CLS } from '../../config';
import DDeiEnumBusCommandType from '../../enums/bus-command-type';
import DDeiEnumOperateState from '../../enums/operate-state';
import DDeiBus from '../bus';
import DDeiBusCommand from '../bus-command';
import { Matrix3, Vector3 } from 'three';
import DDeiUtil from '../../util';
import DDeiAbstractShape from '../../models/shape';
import { min } from 'lodash';
/**
 * 修改线点坐标的总线Command
 */
class DDeiBusCommandChangeLinePoint extends DDeiBusCommand {
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
    return true;
  }

  /**
   * 具体行为，重绘所有图形
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let stage = bus.ddInstance.stage
    let stageRender = stage?.render
    let ex = data?.ex ? data.ex : 0;
    let ey = data?.ey ? data.ey : 0;
    if (stageRender?.dragObj && (ex || ey)) {
      let lineModel = stageRender.dragObj.model
      let passIndex = stageRender.dragObj.passIndex;
      let opvsIndex = stageRender.dragObj.opvsIndex;
      let opvs = stageRender.dragObj.opvs;
      let pvs = lineModel.pvs;
      let create = stageRender.dragObj.create
      //取得线段定义中的约束
      switch (lineModel.type) {
        case 1: {
          //直线
          //开始点
          if (passIndex == 1 && opvsIndex == 0) {
            lineModel.setLineType1PointPosition(0, ex, ey)
          }
          //结束点
          else if (passIndex == 1 && opvsIndex == opvs.length - 1) {
            lineModel.setLineType1PointPosition(1, ex, ey)
          }
        } break;
        case 2: {
          //开始点
          if (passIndex == 1 && opvsIndex == 0) {
            if (pvs.length > 2) {
              let otherP = pvs[1]
              //TODO 旋转的情况下，需要把旋转归0判断，x相等
              if (Math.abs(pvs[0].x - otherP.x) <= 1) {
                otherP.x = ex
              } else {
                otherP.y = ey
              }
            }
            pvs[0].x = ex
            pvs[0].y = ey

          }
          //结束点
          else if (passIndex == 1 && opvsIndex == opvs.length - 1) {
            if (create) {
              pvs[pvs.length - 1].x = ex;
              pvs[pvs.length - 1].y = ey;
            } else {
              if (pvs.length > 2) {
                let otherP = pvs[pvs.length - 2]
                //TODO 旋转的情况下，需要把旋转归0判断，x相等
                if (Math.abs(pvs[pvs.length - 1].x - otherP.x) <= 1) {
                  otherP.x = ex
                } else {
                  otherP.y = ey
                }
              }
              pvs[pvs.length - 1].x = ex
              pvs[pvs.length - 1].y = ey

            }
          } else if (passIndex == 2) {
            //相邻的两个点的坐标处理
            let cIndex = parseInt(opvsIndex / 2)
            let cp = pvs[cIndex]
            let bp = pvs[cIndex - 1]
            let ap = pvs[cIndex + 1]
            //TODO 旋转的情况下，需要把旋转归0判断，x相等
            if (Math.abs(cp.x - bp.x) <= 1) {
              bp.x = ex
              bp.x = ex
              lineModel.spvs[cIndex] = { x: ex, y: 0 }
            } else {
              bp.y = ey
              bp.y = ey
              lineModel.spvs[cIndex] = { x: 0, y: ey }
            }
            //TODO 旋转的情况下，需要把旋转归0判断，x相等
            if (Math.abs(cp.x - ap.x) <= 1) {
              ap.x = ex
              ap.x = ex
              lineModel.spvs[cIndex + 1] = { x: ex, y: 0 }
            } else {
              ap.y = ey
              ap.y = ey
              lineModel.spvs[cIndex + 1] = { x: 0, y: ey }
            }

            cp.x = ex;
            cp.y = ey;
          } else if (passIndex == 3) {
            //相邻的两个点的坐标处理
            let sIndex = parseInt(opvsIndex / 2)
            let sp = pvs[sIndex]
            let ep = pvs[sIndex + 1]
            //TODO 旋转的情况下，需要把旋转归0判断，x相等
            if (Math.abs(sp.x - ep.x) <= 1) {
              sp.x = ex
              ep.x = ex
              lineModel.spvs[sIndex + 1] = { x: ex, y: 0 }
            } else {
              sp.y = ey
              ep.y = ey
              lineModel.spvs[sIndex + 1] = { x: 0, y: ey }
            }
          }
        } break;
        case 3: {
          //曲线
          //开始点
          if (passIndex == 1) {
            if (opvsIndex == 0) {
              pvs[0].x = ex
              pvs[0].y = ey
            }
            //结束点
            else {
              pvs[pvs.length - 1].x = ex
              pvs[pvs.length - 1].y = ey
            }
            //解冻
            lineModel.freeze = 0;
          }
          //控制点
          else if (passIndex == 4) {
            let lineIndex = parseInt(opvsIndex / 3);
            let oitype = opvsIndex % 2
            let i0 = lineIndex * 3;
            let i1 = i0 + 1;
            let i2 = i0 + 2
            let i3 = i0 + 3
            if (opvs.length > 4) {
              //中间的连接点
              if (opvsIndex % 3 == 0) {
                oitype = 2
              } else {
                oitype = (opvsIndex % 3) % 2
              }
            }

            //前面的点
            if (oitype == 1) {

              pvs[i1].x = -(pvs[i0].x * DDeiUtil.p331t3 + DDeiUtil.p33t21t3 * pvs[i2].x + DDeiUtil.p33t3 * pvs[i3].x - ex) / DDeiUtil.p331t2t3
              pvs[i1].y = -(pvs[i0].y * DDeiUtil.p331t3 + DDeiUtil.p33t21t3 * pvs[i2].y + DDeiUtil.p33t3 * pvs[i3].y - ey) / DDeiUtil.p331t2t3
              lineModel.spvs[i1] = true

            }
            //中间的连接点
            else if (oitype == 2) {
              let dx = ex - pvs[opvsIndex].x
              let dy = ey - pvs[opvsIndex].y
              pvs[opvsIndex].x = ex
              pvs[opvsIndex].y = ey
              pvs[opvsIndex - 1].x += dx
              pvs[opvsIndex - 1].y += dy
              pvs[opvsIndex + 1].x += dx
              pvs[opvsIndex + 1].y += dy
            }
            //后面的点
            else {

              pvs[i2].x = -(pvs[i0].x * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].x + DDeiUtil.p66t3 * pvs[i3].x - ex) / DDeiUtil.p66t21t3
              pvs[i2].y = -(pvs[i0].y * DDeiUtil.p661t3 + DDeiUtil.p661t2t3 * pvs[i1].y + DDeiUtil.p66t3 * pvs[i3].y - ey) / DDeiUtil.p66t21t3

              lineModel.spvs[i2] = true
            }
            //冻结
            lineModel.freeze = 1;
          }

        } break;
      }
      lineModel.calPoints();
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
    //改变光标
    bus.ddInstance?.bus?.insert(DDeiEnumBusCommandType.ChangeCursor, { cursor: "crosshair" }, evt);
    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiBusCommandChangeLinePoint({ code: DDeiEnumBusCommandType.ChangeLinePoint, name: "", desc: "" })
  }

}


export default DDeiBusCommandChangeLinePoint
