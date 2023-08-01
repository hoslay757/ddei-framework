/**
 * DDeiRectangle的渲染器类，用于渲染矩形
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
import DDeiConfig from '../../config.js'
import DDeiUtil from '../../util.js'

const global = window

const DDeiRectangleCanvasRender = function (props) {
  this.model = props.model;
}

// ============================ 类方法 Start ============================
/**
 * 初始化
 */
DDeiRectangleCanvasRender.prototype.init = function () {
  this.ddRender = this.model.stage.ddInstance.render
}

/**
 * 创建图形
 */
DDeiRectangleCanvasRender.prototype.drawShape = function () {
  //绘制边框
  this.drawBorder();

  //绘制填充
  this.drawFill();

  //绘制文本
  this.drawText();

}

/**
 * 绘制边框
 */
DDeiRectangleCanvasRender.prototype.drawBorder = function () {
  //获得 2d 上下文对象
  let canvas = this.ddRender.canvas;
  let ctx = canvas.getContext('2d');
  //获取全局缩放比例
  let ratio = this.ddRender.ratio;
  //转换为缩放后的坐标
  let ratPos = DDeiUtil.getRatioPosition(this.model, ratio);

  //1,2,3,4 上，右，下，左
  for (let i = 1; i <= 4; i++) {
    //如果被选中，使用选中的边框，否则使用缺省边框
    //TODO 样式最小替换颗粒度，需要前后保持一致
    let borderInfo = null;
    if (i == 1) {
      if (this.model.selected) {
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.selected ? this.model.border.top.selected : DDeiConfig.RECTANGLE.BORDER.top.selected;
      } else {
        borderInfo = this.model.border && this.model.border.top && this.model.border.top.default ? this.model.border.top.default : DDeiConfig.RECTANGLE.BORDER.top.default;
      }
    } else if (i == 2) {
      if (this.model.selected) {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.selected ? this.model.border.right.selected : DDeiConfig.RECTANGLE.BORDER.right.selected;
      } else {
        borderInfo = this.model.border && this.model.border.right && this.model.border.right.default ? this.model.border.right.default : DDeiConfig.RECTANGLE.BORDER.right.default;
      }
    } else if (i == 3) {
      if (this.model.selected) {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.selected ? this.model.border.bottom.selected : DDeiConfig.RECTANGLE.BORDER.bottom.selected;
      } else {
        borderInfo = this.model.border && this.model.border.bottom && this.model.border.bottom.default ? this.model.border.bottom.default : DDeiConfig.RECTANGLE.BORDER.bottom.default;
      }
    } else if (i == 4) {
      if (this.model.selected) {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.selected ? this.model.border.left.selected : DDeiConfig.RECTANGLE.BORDER.left.selected;
      } else {
        borderInfo = this.model.border && this.model.border.left && this.model.border.left.default ? this.model.border.left.default : DDeiConfig.RECTANGLE.BORDER.left.default;
      }
    }

    //绘制四个方向的边框
    //如果边框未被disabled，则绘制边框
    if (!borderInfo.disabled && borderInfo.color && (!borderInfo.opacity || borderInfo.opacity > 0) && borderInfo.width > 0) {
      //保存状态
      ctx.save();
      //偏移量，因为线是中线对齐，实际坐标应该加上偏移量
      let lineOffset = borderInfo.width * ratio / 2;
      ctx.lineWidth = borderInfo.width * ratio;
      ctx.beginPath();
      //线段、虚线样式
      if (borderInfo.dash) {
        ctx.setLineDash(borderInfo.dash);
      }
      //透明度
      if (borderInfo.opacity) {
        ctx.globalAlpha = borderInfo.opacity
      }
      //颜色
      ctx.strokeStyle = DDeiUtil.getColor(borderInfo.color);
      if (i == 1) {
        ctx.moveTo(ratPos.x, ratPos.y + lineOffset);
        ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + lineOffset);
      } else if (i == 2) {
        ctx.moveTo(ratPos.x + ratPos.width - lineOffset, ratPos.y);
        ctx.lineTo(ratPos.x + ratPos.width - lineOffset, ratPos.y + ratPos.height);
      } else if (i == 3) {
        ctx.moveTo(ratPos.x, ratPos.y + ratPos.height - lineOffset);
        ctx.lineTo(ratPos.x + ratPos.width, ratPos.y + ratPos.height - lineOffset);
      } else if (i == 4) {
        ctx.moveTo(ratPos.x + lineOffset, ratPos.y);
        ctx.lineTo(ratPos.x + lineOffset, ratPos.y + ratPos.height);
      }
      ctx.stroke();
      //恢复状态
      ctx.restore();
    }

  }
}





/**
 * 绘制填充
 */
DDeiRectangleCanvasRender.prototype.drawFill = function () {
  //获得 2d 上下文对象
  let canvas = this.ddRender.canvas;
  let ctx = canvas.getContext('2d');
  //获取全局缩放比例
  let ratio = this.ddRender.ratio;
  //计算填充的原始区域
  let fillAreaE = this.getFillArea();
  //转换为缩放后的坐标
  let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
  //缩放填充区域
  //保存状态
  ctx.save();

  //如果被选中，使用选中的颜色填充,没被选中，则使用默认颜色填充
  let fillInfo = null;
  if (this.model.selected) {
    fillInfo = this.model.fill && this.model.fill.selected ? this.model.fill.selected : DDeiConfig.RECTANGLE.FILL.selected
  } else {
    fillInfo = this.model.fill && this.model.fill.default ? this.model.fill.default : DDeiConfig.RECTANGLE.FILL.default
  }
  //如果拥有填充色，则使用填充色
  if (fillInfo && fillInfo.color) {
    ctx.fillStyle = DDeiUtil.getColor(fillInfo.color);
    //透明度
    if (fillInfo.opacity) {
      ctx.globalAlpha = fillInfo.opacity
    }
    //填充矩形
    ctx.fillRect(ratPos.x, ratPos.y, ratPos.width, ratPos.height);
  }

  //恢复状态
  ctx.restore();

}

/**
 * 绘制文本
 */
DDeiRectangleCanvasRender.prototype.drawText = function () {
  //获得 2d 上下文对象
  let canvas = this.ddRender.canvas;
  let ctx = canvas.getContext('2d');
  //获取全局缩放比例
  let ratio = this.ddRender.ratio;
  //计算填充的原始区域
  let fillAreaE = this.getFillArea();
  //转换为缩放后的坐标
  let ratPos = DDeiUtil.getRatioPosition(fillAreaE, ratio);
  //保存状态
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(this.model.text, ratPos.x, ratPos.y)


  //恢复状态
  ctx.restore();

}


/**
 * 私有函数，计算除边框外的填充区域，用于填充颜色和字体
 */
DDeiRectangleCanvasRender.prototype.getFillArea = function () {
  //获取边框区域，实际填充区域=坐标-边框区域
  let topBorder, bottomBorder, leftBorder, rightBorder;
  if (this.model.selected) {
    topBorder = this.model.border && this.model.border.top && this.model.border.top.selected ? this.model.border.top.selected : DDeiConfig.RECTANGLE.BORDER.top.selected;
    rightBorder = this.model.border && this.model.border.right && this.model.border.right.selected ? this.model.border.right.selected : DDeiConfig.RECTANGLE.BORDER.right.selected;
    bottomBorder = this.model.border && this.model.border.bottom && this.model.border.bottom.selected ? this.model.border.bottom.selected : DDeiConfig.RECTANGLE.BORDER.bottom.selected;
    leftBorder = this.model.border && this.model.border.left && this.model.border.left.selected ? this.model.border.left.selected : DDeiConfig.RECTANGLE.BORDER.left.selected;
  } else {
    topBorder = this.model.border && this.model.border.top && this.model.border.top.default ? this.model.border.top.default : DDeiConfig.RECTANGLE.BORDER.top.default;
    rightBorder = this.model.border && this.model.border.right && this.model.border.right.default ? this.model.border.right.default : DDeiConfig.RECTANGLE.BORDER.right.default;
    bottomBorder = this.model.border && this.model.border.bottom && this.model.border.bottom.default ? this.model.border.bottom.default : DDeiConfig.RECTANGLE.BORDER.bottom.default;
    leftBorder = this.model.border && this.model.border.left && this.model.border.left.default ? this.model.border.left.default : DDeiConfig.RECTANGLE.BORDER.left.default;
  }
  //计算填充的原始区域
  let leftWidth = 0;
  if (!leftBorder.disabled && leftBorder.color && (!leftBorder.opacity || leftBorder.opacity > 0) && leftBorder.width > 0) {
    leftWidth = leftBorder.width;
  }
  let rightWidth = 0;
  if (!rightBorder.disabled && rightBorder.color && (!rightBorder.opacity || rightBorder.opacity > 0) > 0 && rightBorder.width > 0) {
    rightWidth = rightBorder.width;
  }
  let topWidth = 0;
  if (!topBorder.disabled && topBorder.color && (!topBorder.opacity || topBorder.opacity > 0) > 0 && topBorder.width > 0) {
    topWidth = topBorder.width;
  }
  let bottomWidth = 0;
  if (!bottomBorder.disabled && bottomBorder.color && (!bottomBorder.opacity || bottomBorder.opacity > 0) > 0 && bottomBorder.width > 0) {
    bottomWidth = bottomBorder.width;
  }
  let fillAreaE = {
    x: this.model.x + leftWidth,
    y: this.model.y + topWidth,
    width: this.model.width - leftWidth - rightWidth,
    height: this.model.height - topWidth - bottomWidth
  }
  return fillAreaE;
}


// ============================ 类方法 End ============================

// ============================ 静态函数 Start ============================

// ============================ 静态函数 End ============================

global.DDeiRectangleCanvasRender = DDeiRectangleCanvasRender

export default DDeiRectangleCanvasRender