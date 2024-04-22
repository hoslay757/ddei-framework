import { Vector3 } from 'three';
import DDeiUtil from '../util';
import DDeiLine from './line';
import DDeiAbstractShape from './shape';
/**
 * linelink是一个内置对象，用于保存线段和依附于线段图形的关系
 */
class DDeiLineLink {
  constructor(props: object) {
    this.line = props.line
    this.type = props.type
    this.dm = props.dm
    this.dx = props.dx ? props.dx : 0
    this.dy = props.dy ? props.dy : 0
  }

  //父line对象，不序列化
  line: DDeiLine;
  //依附点类别，1开始，2结束，3中间
  type: number;
  //目标模型，引用
  dm: DDeiAbstractShape;
  //目标模型相对于点的增量
  dx: number;
  //目标模型相对于点的增量
  dy: number;

  /**
   * 将模型转换为JSON
   */
  toJSON(): Object {
    let json: Object = new Object();
    if (this.type) {
      json.type = this.type
    }
    //目标模型的引用
    if (this.dm) {
      json.dmid = this.dm.id
    }
    if (this.dx) {
      json.dx = this.dx
    }
    if (this.dy) {
      json.dy = this.dy
    }
    return json;
  }

}

export {DDeiLineLink}
export default DDeiLineLink
