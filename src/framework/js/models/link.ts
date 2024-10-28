import { Vector3 } from 'three';
import DDeiUtil from '../util';
import DDeiAbstractShape from './shape';
import DDeiStage from './stage';
/**
 * link是一个内置对象，用于保存图形和图形的关系
 */
class DDeiLink {
  constructor(props: object) {
    for (let i in props) {
      if (typeof props[i] != 'object' && props[i]) {
        this[i] = props[i]
      }
    }
    this.group = props.group
    this.sm = props.sm
    this.dm = props.dm
    this.stage = props.stage
    this.smpath = props.smpath
    this.dmpath = props.dmpath
    this.disabled = props.disabled
    
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
  //是否为失效，失效后会保留，但是不产生作用
  disabled:boolean = false;


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
    for(let i in this){
      if (typeof this[i] != 'object' && this[i]){
        json[i] = this[i]
      }
    }
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

export {DDeiLink}
export default DDeiLink
