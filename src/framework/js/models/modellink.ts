import type DDeiAbstractShape from './shape';
/**
 * linelink是一个内置对象，用于保存线段和依附于线段图形的关系
 */
class DDeiModelLink {
  constructor(props: object) {
    this.depModel = props.depModel
    this.type = props.type
    this.dm = props.dm
    this.dx = props.dx ? props.dx : 0
    this.dy = props.dy ? props.dy : 0
  }

  //依附model对象,不会序列化
  depModel: DDeiAbstractShape;
  //依附点类别，1开始点（线），2结束（线），3中间（线）,5.中心点（外接矩形）,6-9.上右下左对齐点（外接矩形）
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

export {DDeiModelLink}
export default DDeiModelLink
