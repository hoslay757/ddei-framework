import DDeiEnumStoreType from "../enums/store-type";

/**
 * ddei的保存存储抽象类，不同的存储都需要继承这个类
 */
abstract class DDeiStore {






  /**
    * 写入
    * key 键
    * data 数据
    * fn 回调
    */
  save(key: string, data: object, fn: Function): void;

  /**
    * 加载
    * key 键
    * fn 回调
    * return 数据
    */
  load(key: string, fn: Function): object;

  /**
    * 删除
    * key 键
    * fn 回调
    */
  del(key: string, fn: Function): void;

  /**
    * find，返回k、v组成的数据
    */
  find(searchKey: string): Map<string, object>;

}

export { DDeiStore }
export default DDeiStore
