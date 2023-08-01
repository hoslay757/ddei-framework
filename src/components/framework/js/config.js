import DDeiCanvasRender from "./renders/canvas/ddei-render"
import DDeiStageCanvasRender from "./renders/canvas/stage-render"
import DDeiLayerCanvasRender from "./renders/canvas/layer-render"
import DDeiShapeCanvasRender from "./renders/canvas/shape-render"
import DDeiRectangleCanvasRender from "./renders/canvas/rectangle-render"


export default {
  //当前采用的渲染器类型，暂时只支持canvas
  RENDER_TYPE: "CANVAS",

  // 边框的相关缺省样式属性
  BORDER: {
    default: { width: 0, color: null, dash: null, round: 0 },
    selected: { width: 1, color: "black", dash: null, round: 0 }
  },

  // 填充的相关缺省样式属性
  FILL: {
    default: { color: null }, selected: { color: "white" }
  },

  // 字体的相关缺省样式属性
  FONT: {
    default: { family: "STSong-Light", color: "#000000", size: "16" },
    selected: { family: "STSong-Light", color: "#000000", size: "16" }
  },

  // 图层的相关缺省样式属性
  LAYER: {
    //普通图层
    NORMAL: {
      //背景的类型，0无背景，1纯色，2图片，3田字
      type: 1,
      //背景色
      bgcolor: "grey",
      //透明度，0完全透明~1完全不透明
      opacity: 0.5
    },
    //背景图层
    BACKGROUND: {
      //背景的类型，0无背景，1纯色，2图片，3田字
      type: 3,
      //背景色
      bgcolor: "white",
      //透明度，0完全透明~1完全不透明
      opacity: 1
    }
  },

  // 矩形的相关缺省样式属性
  RECTANGLE: {
    // 默认矩形边框
    BORDER: {
      top: {
        default: { width: 2, color: "black", dash: [3, 1], round: 0, disabled: true },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      right: {
        default: { width: 2, color: "blue", dash: null, round: 0 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      bottom: {
        default: { width: 4, color: "green", dash: null, round: 0, opacity: 1 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      left: {
        default: { width: 4, color: "yellow", dash: null, round: 0, opacity: 1 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      }
    },
    // 默认矩形填充
    FILL: {
      default: { color: "red", opacity: 0.5 },
      selected: { color: "white" }
    },
    // 默认矩形字体
    FONT: {
      default: { family: "STSong-Light", color: "#000000", size: 16 },
      selected: { family: "STSong-Light", color: "#000000", size: 16 }
    },
  },

  /**
  * 根据配置文件的配置，将模型与渲染器绑定
  * @param  model  模型
  */
  bindRender: function (model) {
    if (this.RENDER_TYPE == "CANVAS") {
      if (model.modelType == "DDei") {
        model.render = new DDeiCanvasRender({ model: model });
      } else if (model.modelType == "DDeiStage") {
        model.render = new DDeiStageCanvasRender({ model: model });
      } else if (model.modelType == "DDeiLayer") {
        model.render = new DDeiLayerCanvasRender({ model: model });
      } else if (model.modelType == "DDeiShape") {
        model.render = new DDeiShapeCanvasRender({ model: model });
      } else if (model.modelType == "DDeiRectangle") {

        model.render = new DDeiRectangleCanvasRender({ model: model });
      }
    } else if (this.RENDER_TYPE == "SVG") {
      //TODO 
    }
  }
}
