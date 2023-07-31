/**
 * DDei图形框架的渲染器类，用于渲染图形框架
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
import DDeiConfig from '../../config.js'
import DDeiUtil from '../../util.js'

const global = window

const DDeiCanvasRender = function (props) {
  this.model = props.model;
}

// ============================ 类方法 Start ============================

/**
 * 初始化
 */
DDeiCanvasRender.prototype.init = function () {
  //在容器上创建画布，画布用来渲染图形
  this.container = document.getElementById(this.model.containerid);
  if (this.container) {
    if (this.container.children.length > 0) {
      throw new Error("容器" + this.containerid + "已拥有元素，不能创建画布");
    } else {
      //创建容器
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("id", this.model.id + "_canvas");
      //获得 2d 上下文对象
      var ctx = this.canvas.getContext('2d');
      //获取缩放比例
      let ratio = DDeiUtil.getPixelRatio(ctx);
      this.canvas.setAttribute("style", "zoom:" + (1 / ratio));
      this.canvas.setAttribute("width", this.container.clientWidth * ratio);
      this.canvas.setAttribute("height", this.container.clientHeight * ratio);
      this.ratio = ratio;
      this.container.appendChild(this.canvas);
    }
  } else {
    throw new Error("容器" + this.model.containerid + "不存在");
  }
}

/**
 * 绘制图形
 */
DDeiCanvasRender.prototype.drawShape = function () {

  if (this.model.stage) {
    this.model.stage.render.drawShape();
  } else {
    throw new Error("当前实例未加载舞台模型，无法渲染图形");
  }
}


// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// ============================ 静态函数 End ============================

global.DDeiRender = DDeiCanvasRender

export default DDeiCanvasRender