import DDeiConfig from "../config";
import DDeiStore from "./store";

/**
 * ddei的本地存储保存类，将内容写入本地
 */
class DDeiStoreLocal extends DDeiStore {

  static db = null;

  static {
    // 打开数据库,不存在则创建
    let request = indexedDB.open("ddei", 1);
    // 创建成功的回调函数
    request.onsuccess = function (e) {
      // 通过e拿到数据库对象
      DDeiStoreLocal.db = e.target.result;
      console.log("数据库打开成功");
    }
    // 数据库升级事件(第一次创建数据库或者版本升级时触发)
    // 不能手动触发，需要触发时更改版本号或是新建数据库
    // 对数据库结构或表的创建修改都应该在该事件中完成,indexedDB不允许数据库中的对象仓库在同一版本中发生变化
    request.onupgradeneeded = function (e) {
      console.log("新建数据库或数据库升级");
      // 将新的数据库对象赋值给db
      DDeiStoreLocal.db = e.target.result;
      // 判断是否已经存值该表（对象仓库）
      // 每个数据库包含若干个对象仓库(表)，对象仓库里存储的是js对象
      if (!DDeiStoreLocal.db.objectStoreNames.contains("nextval")) {
        // 设置主键
        // 主键用来建立默认的索引,必须是唯一的
        let item = {
          keyPath: "id",//主键
          autoIncrement: true//是否自增
        };

        let nextval = DDeiStoreLocal.db.createObjectStore("nextval", item);
        // 创建索引，为了加速数据的检索，为不同的属性建立索引，只有加了索引的属性才能进行查询
        // 必须在upgradeneeded里完成,在indexedDB数据库中,只能对被索引的属性值进行检索
        // 参数:索引名称\索引所在的属性\配置对象(说明改属性是否包含重复的值)
        nextval.createIndex("name", "name", { unique: true });
        nextval.createIndex("value", "value", { unique: false });
      }

      if (!DDeiStoreLocal.db.objectStoreNames.contains("temporary")) {
        // 设置主键
        // 主键用来建立默认的索引,必须是唯一的
        let item = {
          keyPath: "id",//主键
          autoIncrement: false//是否自增
        };

        let temporary = DDeiStoreLocal.db.createObjectStore("temporary", item);
        // 创建索引，为了加速数据的检索，为不同的属性建立索引，只有加了索引的属性才能进行查询
        // 必须在upgradeneeded里完成,在indexedDB数据库中,只能对被索引的属性值进行检索
        // 参数:索引名称\索引所在的属性\配置对象(说明改属性是否包含重复的值)
        temporary.createIndex("name", "name", { unique: true });
        temporary.createIndex("path", "path", { unique: false });
        temporary.createIndex("time", "time", { unique: false });
        temporary.createIndex("serino", "serino", { unique: false });
        temporary.createIndex("data", "data", { unique: false });
      }
      if (!DDeiStoreLocal.db.objectStoreNames.contains("folder")) {
        // 设置主键
        let item = {
          keyPath: "id",//主键
          autoIncrement: false//是否自增
        };
        let folder = DDeiStoreLocal.db.createObjectStore("folder", item);
        folder.createIndex("name", "name", { unique: false });
        folder.createIndex("path", "path", { unique: false });
        folder.createIndex("parentId", "parentId", { unique: false });
      }
      if (!DDeiStoreLocal.db.objectStoreNames.contains("file")) {
        // 设置主键
        let item = {
          keyPath: "id",//主键
          autoIncrement: false//是否自增
        };
        let file = DDeiStoreLocal.db.createObjectStore("file", item);
        file.createIndex("name", "name", { unique: false });
        file.createIndex("parenId", "parentId", { unique: false });
        file.createIndex("path", "path", { unique: false });
        file.createIndex("data", "data", { unique: false });
      }
    }
    // 创建失败的回调函数
    request.onerror = function (e) {
      console.log("打开失败", e);
    }

  }

  /**
    * 获取并更新主键ID
    * key 键
    */
  getNextId(key: string) {
    return new Promise((resolve, reject) => {
      let returnValue = 1;
      // 开启一个事务
      let tx = DDeiStoreLocal.db.transaction('nextval', "readwrite");
      // 获取对象仓库
      let nextval = tx.objectStore("nextval");
      let new_key = nextval.index("name")

      const request = new_key.get(key);
      // 写入数据的事件监听
      request.onsuccess = function (event) {
        if (request.result) {
          returnValue = request.result.value + 1;
          request.result.value = returnValue;
          nextval.put(request.result);

        } else {
          nextval.add({ name: key, value: 1 });
        }
        resolve(returnValue);
      };

      request.onerror = function (event) {
        reject(event);
      }
    });

  }




  /**
    * 写入
    * key 键
    * data 数据
    */
  save(key: string, data: object): Promise {
    //没有传入键或没有找到数据，则新增

    if (!key) {
      return new Promise((resolve, reject) => {
        this.getNextId("file").then((newId) => {
          let id = newId;
          //插入数据
          data.id = id;
          let storeData = JSON.stringify(data);
          let rowData = {
            id: id,
            name: data.name,
            path: data.path,
            parentId: 0,
            data: storeData
          };
          // 开启一个事务
          let tx = DDeiStoreLocal.db.transaction('file', "readwrite");
          let store = tx.objectStore("file");
          // 执行数据操作(根据主键更新记录)
          let addReq = store.add(rowData);
          addReq.onsuccess = function () {
            if (addReq.result) {
              resolve(addReq.result);
            }
          }
          addReq.onerror = function () {
            console.log("新增失败");
          }
        });
      });

    }
    //否则进行修改
    else {
      return new Promise((resolve, reject) => {
        this.load(key).then((rowData) => {
          //存在数据，执行修改
          if (rowData) {
            //插入数据
            let storeData = JSON.stringify(data);
            rowData.name = data.name
            rowData.path = data.path
            rowData.parentId = 0
            rowData.data = storeData
            // 开启一个事务
            let tx = DDeiStoreLocal.db.transaction('file', "readwrite");
            let store = tx.objectStore("file");
            // 执行数据操作(根据主键更新记录)
            let modReq = store.put(rowData);
            modReq.onsuccess = function () {
              if (modReq.result) {
                resolve(modReq.result);
              }
            }
            modReq.onerror = function () {
              console.log("新增失败");
            }
          }
          //不存在数据，执行新增
          else {
            this.getNextId("file").then((newId) => {
              let id = newId;
              //插入数据
              data.id = id;
              let storeData = JSON.stringify(data);
              let rowData = {
                id: id,
                name: data.name,
                path: data.path,
                parentId: 0,
                data: storeData
              };
              // 开启一个事务
              let tx = DDeiStoreLocal.db.transaction('file', "readwrite");
              let store = tx.objectStore("file");
              // 执行数据操作(根据主键更新记录)
              let addReq = store.add(rowData);
              addReq.onsuccess = function () {
                if (addReq.result) {

                  resolve(addReq.result);
                }
              }
              addReq.onerror = function () {
                console.log("新增失败");
              }
            });
          }
        });
      });
    }



  }




  /**
    * 加载
    * key 键
    * return 数据
    */
  load(key: string): Promise {
    return new Promise((resolve, reject) => {
      // 开启一个事务
      let tx = DDeiStoreLocal.db.transaction('file', "readonly");
      // 获取对象仓库
      let fileStore = tx.objectStore("file");
      const request = fileStore.get(key);
      // 写入数据的事件监听
      request.onsuccess = function (event) {
        if (request.result) {
          resolve(request.result);
        }
      };
      request.onerror = function (event) {
        reject(event);
      }
    });
  }

  /**
    * 删除
    * key 键
    * fn 回调
    */
  del(key: string): Promise {
    return new Promise((resolve, reject) => {
      // 开启一个事务
      let tx = DDeiStoreLocal.db.transaction('file', "readonly");
      // 获取对象仓库
      let fileStore = tx.objectStore("file");
      const request = fileStore.deletes(key);
      // 写入数据的事件监听
      request.onsuccess = function (event) {
        if (request.result) {
          resolve(request.result);
        }
      };
      request.onerror = function (event) {
        reject(event);
      }
    });
  }

  /**
    * find，返回数据
    */
  find(searchKey: string): Promise {
    return new Promise((resolve, reject) => {
      let list = [];
      let bol = true;
      let nameArr = searchKey.split("");
      if (DDeiStoreLocal.db != null) {
        let request = DDeiStoreLocal.db.transaction("file", "readwrite")
          .objectStore("file")
          .index("name")
          .openCursor();
        request.onsuccess = e => {
          if (request.result) {
            let cursor = request.result;
            if (!cursor) {
              resolve(list);
            } else {
              bol = nameArr.every(value => {
                return cursor.key.indexOf(value) > -1;
              });
              if (bol) {
                list.push({ id: cursor.value.id, name: cursor.value.name, parentId: cursor.value.parentId, path: cursor.value.path });
              }
              let c = cursor.continue();
            }

          } else {
            resolve(list);
          }
        };

        request.onerror = e => {
          resolve(list)
        }

      }
    });
  }

}

export default DDeiStoreLocal
