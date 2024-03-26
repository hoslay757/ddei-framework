import { Vector3 } from 'three';
import DDeiUtil from '../util';
import DDeiAbstractShape from './shape';
import DDeiStage from './stage';
/**
 * link是一个内置对象，用于保存图形和图形的关系
 */
class DDeiLink {
  constructor(props: object) {
    this.group = props.group
    this.sm = props.sm
    this.dm = props.dm
    this.stage = props.stage
    this.smpath = props.smpath
    this.dmpath = props.dmpath
  }
  //分组
  group: string = "";
  //源模型ID，引用
  sm: DDeiAbstractShape;
  //目标模型ID，引用
  dm: DDeiAbstractShape;
  //源模型路径
  smpath: string;
  //目标模型路径
  dmpath: string;
  //所属画布对象
  stage: DDeiStage;


  /**
   * 得到源向量
   */
  getSourcePV(): Vector3 {
    return DDeiUtil.getDataByPathList(this.sm, this.smpath)
  }

  /**
   * 得到目标向量
   */
  getDistPV(): Vector3 {
    return DDeiUtil.getDataByPathList(this.dm, this.dmpath)
  }

  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    if (this.group) {
      json.group = group
    }
    if (this.sm) {
      json.smid = this.sm.id
    }
    if (this.dm) {
      json.dmid = this.dm.id
    }
    if (this.smpath) {
      json.smpath = this.smpath
    }
    if (this.dmpath) {
      json.dmpath = this.dmpath
    }
    return json;
  }

}

export default DDeiLink
