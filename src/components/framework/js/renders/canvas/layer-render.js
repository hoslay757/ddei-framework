/**
 * DDeiLayer的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
import DDeiConfig from '../../config.js'
import DDeiUtil from '../../util.js'

const global = window

const DDeiLayerCanvasRender = function (props) {
  this.model = props.model;
}

// ============================ 类方法 Start ============================
/**
 * 初始化
 */
DDeiLayerCanvasRender.prototype.init = function () {
  this.ddRender = this.model.stage.ddInstance.render
}

/**
 * 绘制图形
 */
DDeiLayerCanvasRender.prototype.drawShape = function () {
  //绘制背景
  this.drawBackground();

  //绘制子元素
  this.drawChildrenShapes();
}

/**
 * 绘制背景
 */
DDeiLayerCanvasRender.prototype.drawBackground = function () {
  //获得 2d 上下文对象
  let canvas = this.ddRender.canvas;
  let ctx = canvas.getContext('2d');
  //获取全局缩放比例
  let ratio = this.ddRender.ratio;
  //保存状态
  ctx.save();


  //根据背景的设置绘制图层
  //绘制背景图层
  let bgInfo = null;
  if (this.model.type == 99) {
    bgInfo = this.model.background ? this.model.background : DDeiConfig.LAYER.BACKGROUND;
  } else {
    bgInfo = this.model.background ? this.model.background : DDeiConfig.LAYER.NORMAL;
  }
  //绘制无背景
  if (!bgInfo || !bgInfo.type || bgInfo.type == 0) {
  }
  // 绘制纯色背景
  else if (bgInfo.type == 1) {
    ctx.fillStyle = bgInfo.bgcolor
    //透明度
    if (bgInfo.opacity) {
      ctx.globalAlpha = bgInfo.opacity
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  //TODO 绘制图片背景类型
  else if (bgInfo.type == 2) {

  }
  //绘制田字背景
  else if (bgInfo.type == 3) {
    ctx.fillStyle = bgInfo.bgcolor
    //透明度
    if (bgInfo.opacity) {
      ctx.globalAlpha = bgInfo.opacity
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.lineWidth = 1 * ratio;
    let r20 = ratio * 20;
    let r40 = ratio * 40;
    for (let x = 0; x <= canvas.width; x = x + r20) {
      ctx.beginPath();
      if (x % r40 == 0) {
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgb(220,220,220)";
      } else {
        ctx.setLineDash([3, 1]);
        ctx.strokeStyle = "rgb(240,240,240)";
      }
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y = y + r20) {
      ctx.beginPath();
      if (y % r40 == 0) {
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgb(220,220,220)";
      } else {
        ctx.setLineDash([3, 1]);
        ctx.strokeStyle = "rgb(240,240,240)";
      }
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

  }

  //恢复状态
  ctx.restore();
}


/**
 * 绘制子元素
 */
DDeiLayerCanvasRender.prototype.drawChildrenShapes = function () {
  if (this.model.models) {
    //遍历子元素，绘制子元素
    for (let i in this.model.models) {
      this.model.models[i].render.drawShape();
    }
  }

}

// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// ============================ 静态函数 End ============================

global.DDeiLayerCanvasRender = DDeiLayerCanvasRender

export default DDeiLayerCanvasRender