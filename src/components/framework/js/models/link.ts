import { Vector3 } from 'three';
import DDeiAbstractShape from './shape';
/**
 * link是一个内置对象，用于保存图形和图形的关系
 */
class DDeiLink {

  //分组
  group: string = "";
  //源向量的点向量，引用
  spv: Vector3;
  //目标向量的点向量，引用
  dpv: Vector3;
  //源模型，引用
  sm: DDeiAbstractShape;
  //目标模型，引用
  dm: DDeiAbstractShape;

}

export default DDeiLink
