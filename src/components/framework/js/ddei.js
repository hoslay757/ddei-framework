/**
 * DDei图形框架的基础类，通过此类对图形框架进行初始化
 * DDei静态资源维护公共变量与实例池
 * DDei实例与一个容器（如：div）绑定，同一个页面上可以允许存在多个实例
 * DDei实例作为页面上打开操作的临时实例，一般只在页面存续期间有效，不会被序列化
 */
import DDeiConfig from './config.js'
import DDeiStage from './models/stage'
import DDeiLayer from './models/layer'
import DDeiShape from './models/shape'

const global = window

const DDei = function (props) {
  this.id = props.id
  // 承载的容器id
  this.containerid = props.containerid
  // 关联的舞台对象，实例的canvas只会绘制当前的stage
  this.stage = null
  //当前模型的类型
  this.modelType = "DDei"
}

// ============================ 类方法 Start ============================
/**
 * 初始化渲染器
 */
DDei.prototype.initRender = function () {

  //绑定并初始化渲染器
  DDeiConfig.bindRender(this);
  this.render.init();
  //加载场景渲染器
  this.stage.initRender();
}

// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================
/**
 * DDei实例池
 */
DDei.INSTANCE_POOL = {};

/**
 * 给予container构建一个DDei实例
 * 每一个DDei至少包含1个文件
 * @param {id} id 文件id
 * @param {containerid} containerid 容器id
 * @param {stagejson} stagejson 内容JSON,如果没有则会创建一个
 */
DDei.newInstance = function (id, containerid, stagejson) {
  if (id && containerid) {
    if (!DDei.INSTANCE_POOL[id]) {
      //初始化DDei对象
      let ddInstance = new DDei({ id: id, containerid: containerid });
      //初始化DDeiStage对象，如果存在stagejson则加载，不存在则初始化
      if (stagejson) {
        ddInstance.stage = DDeiStage.loadFromJSON(stagejson);
      } else {
        ddInstance.stage = DDeiStage.initByJSON({ id: "stage_1" });
      }
      ddInstance.stage.ddInstance = ddInstance;
      //将DDei对象装入全局缓存
      DDei.INSTANCE_POOL[id] = ddInstance;
      //初始化渲染器
      ddInstance.initRender();
      //通过当前装载的stage更新图形
      ddInstance.render.drawShape();
      return ddInstance;
    } else {
      throw new Error('实例池中已存在ID相同的实例，初始化失败')
    }
  }
}

// ============================ 静态函数 End ============================

global.DDei = DDei

export default DDei