import DDeiCanvasRender from "./views/canvas/ddei-render"
import DDeiStageCanvasRender from "./views/canvas/stage-render"
import DDeiLayerCanvasRender from "./views/canvas/layer-render"
import DDeiRectangleCanvasRender from "./views/canvas/rectangle-render"
import DDeiCircleCanvasRender from "./views/canvas/circle-render"
import DDeiSelectorCanvasRender from "./views/canvas/selector-render"
import DDeiEnumKeyActionInst from "../../editor/js/enums/key-action-inst"
import DDeiDiamondCanvasRender from "./views/canvas/diamond-render"
import DDei from "./ddei"
import DDeiRectContainerCanvasRender from "./views/canvas/rect-container-render"
import DDeiAbstractShape from "./models/shape"
import loadCommands from "./config/command"
/**
 * DDei的配置文件
 * 提供了全局参数与缺省值的设置
 * 提供了全局的一些重要函数
 */
class DDeiConfig {
  static {
    //加载配置
    loadCommands();
  }

  //单个角度的旋转单位
  static ROTATE_UNIT = Math.PI / 180;
  // ============================ 静态变量 ============================
  //当前采用的渲染器类型，暂时只支持canvas
  static RENDER_TYPE: string = "CANVAS";

  // 是否打开辅助线功能
  static GLOBAL_HELP_LINE_ENABLE: boolean = true;
  // 是否打开辅助对齐线
  static GLOBAL_HELP_LINE_ALIGN_ENABLE: boolean = true;
  // 缺省辅助线颜色
  static GLOBAL_HELP_LINE_COLOR: string = 'grey';
  // 缺省辅助对齐线颜色
  static GLOBAL_HELP_LINE_ALIGN_COLOR = 'red';
  // 缺省辅助线宽度
  static GLOBAL_HELP_LINE_WEIGHT: number = 10;

  //不需要序列化的字段
  static SERI_FIELDS: object = {
    "DDei": { "TOJSON": ["stage"], "SKIP": ["bus", "render"] },
    "DDeiStage": { "TOJSON": ["layers"], "SKIP": ["ddInstance", "selectedModels", "render"] },
    "DDeiLayer": { "TOJSON": ["models"], "SKIP": ["ddInstance", "stage", "render"] },
    "DDeiContainer": { "TOJSON": ["models"], "SKIP": ["ddInstance", "stage", "layer", "pModel", "render"] },
    "AbstractShape": { "SKIP": ["ddInstance", "stage", "layer", "pModel", "render"] },
  }

  // 边框的相关缺省样式属性
  static BORDER: object = {
    default: { width: 0, color: null, dash: null, round: 0 },
    selected: { width: 1, color: "black", dash: null, round: 0 }
  };


  // 选择器的相关缺省样式属性
  static SELECTOR: object = {
    //选择器边框
    border: {
      width: 1, color: "rgb(1,127,255)", dash: [5, 3], round: 0,
      selected: { width: 1, color: "rgb(1,127,255)", dash: [5, 3], round: 0 }
    },

    //操作区域的填充样式，根据选中和未选中状态可以有所变化
    OPERATE_ICON: {
      weight: 8,
      FILL: {
        default: "white",
        pass: "rgb(198,230,255)"
      }
    },

    //间隔宽度，根据选中单个控件、选中多个控件，间隔宽度可以有所变化
    PADDING_WEIGHT: {
      default: { single: 0, multiple: 0 },
      selected: { single: 0, multiple: 10 }
    }
  };


  // 填充的相关缺省样式属性
  static FILL: object = {
    default: { color: null }, selected: { color: "white" }
  };

  // 字体的相关缺省样式属性
  static FONT: object = {
    default: { family: "Microsoft YaHei", color: "#000000", size: "16" },
    selected: { family: "Microsoft YaHei", color: "#000000", size: "16" }
  };

  // 图层的相关缺省样式属性
  static LAYER: object = {
    //背景的类型，0无背景，1纯色，2图片，3田字
    type: 0,
    //背景色
    bgcolor: "grey",
    //透明度，0完全透明~1完全不透明
    opacity: 0.5
  };

  // 背景图层的相关缺省样式属性
  static BACKGROUND_LAYER: object = {
    //背景的类型，0无背景，1纯色，2图片，3田字
    type: 3,
    //背景色
    bgcolor: "white",
    //透明度，0完全透明~1完全不透明
    opacity: 1
  };

  // 矩形的相关缺省样式属性
  static RECTANGLE: object = {
    // 默认矩形边框
    border: {
      top: {
        width: 1, color: "black", dash: null, round: 0, disabled: false
      },
      right: {
        width: 1, color: "black", dash: null, round: 0
      },
      bottom: {
        width: 1, color: "black", dash: null, round: 0, opacity: 1
      },
      left: {
        width: 1, color: "black", dash: null, round: 0, opacity: 1
      },
      selected: {
        top: {
          width: 1, color: "black", dash: null, round: 0
        },
        right: {
          width: 1, color: "black", dash: null, round: 0
        },
        bottom: {
          width: 1, color: "black", dash: null, round: 0
        },
        left: {
          width: 1, color: "black", dash: null, round: 0
        }
      }
    },
    // 默认矩形填充
    fill: {
      color: "red", opacity: 1,
      selected: { color: "white" }
    },
    // 默认矩形填充
    image: {
      opacity: 1
    },
    // 默认矩形字体
    font: {
      //字体
      family: "Microsoft YaHei",
      //颜色
      color: "white",
      //大小
      size: 16,
      selected: { family: "Microsoft YaHei", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    textStyle: {
      //水平对齐，1，2，3左中右，默认1
      align: 1,
      //垂直对齐，1，2，3上中下，默认2
      valign: 2,
      //自动换行，0/null不换行，1换行，默认0
      feed: 1,
      //缩小字体填充，0/null不缩小，1缩小，默认0
      autoScaleFill: 1,
      //镂空，0/null不镂空，1镂空，默认0
      hollow: 0,
      selected: {
        align: 1,
        valign: 2,
        feed: 0,
        autoScaleFill: 0,
        hollow: 0
      }
    }
  };

  // 圆型的相关缺省样式属性
  static CIRCLE: object = {
    // 默认矩形边框
    border: {
      width: 1, color: "black", dash: null, round: 0, disabled: false, opacity: 1,
      selected: { width: 1, color: "black", dash: null, round: 0, opacity: 1 }
    },
    // 默认矩形填充
    fill: {
      color: "white", opacity: 1,
      selected: { color: "white" }
    },
    // 默认矩形字体
    font: {
      //字体
      family: "Microsoft YaHei",
      //颜色
      color: "white",
      //大小
      size: 16,
      selected: { family: "Microsoft YaHei", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    textStyle: {
      //水平对齐，1，2，3左中右，默认1
      align: 2,
      //垂直对齐，1，2，3上中下，默认2
      valign: 2,
      //自动换行，0/null不换行，1换行，默认0
      feed: 1,
      //缩小字体填充，0/null不缩小，1缩小，默认0
      autoScaleFill: 1,
      //镂空，0/null不镂空，1镂空，默认0
      hollow: 0,
      selected: {
        align: 2,
        valign: 2,
        feed: 0,
        autoScaleFill: 0,
        hollow: 0
      }
    }
  };

  // 菱形的相关缺省样式属性
  static DIAMOND: object = {
    border: {
      top: {
        width: 1, color: "black", dash: null, round: 0, disabled: false
      },
      right: {
        width: 1, color: "black", dash: null, round: 0
      },
      bottom: {
        width: 1, color: "black", dash: null, round: 0, opacity: 1
      },
      left: {
        width: 1, color: "black", dash: null, round: 0, opacity: 1
      },
      selected: {
        top: {
          width: 1, color: "black", dash: null, round: 0
        },
        right: {
          width: 1, color: "black", dash: null, round: 0
        },
        bottom: {
          width: 1, color: "black", dash: null, round: 0
        },
        left: {
          width: 1, color: "black", dash: null, round: 0
        }
      }
    },
    // 默认矩形填充
    fill: {
      color: "red", opacity: 1,
      selected: { color: "white" }
    },
    // 默认矩形字体
    font: {
      //字体
      family: "Microsoft YaHei",
      //颜色
      color: "white",
      //大小
      size: 16,
      selected: { family: "Microsoft YaHei", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    textStyle: {
      //水平对齐，1，2，3左中右，默认1
      align: 1,
      //垂直对齐，1，2，3上中下，默认2
      valign: 2,
      //自动换行，0/null不换行，1换行，默认0
      feed: 1,
      //缩小字体填充，0/null不缩小，1缩小，默认0
      autoScaleFill: 1,
      //镂空，0/null不镂空，1镂空，默认0
      hollow: 0,
      selected: {
        align: 1,
        valign: 2,
        feed: 0,
        autoScaleFill: 0,
        hollow: 0
      }
    }
  };


  // 容器的相关缺省样式属性
  static CONTAINER: object = {
    // 默认矩形边框
    border: {
      top: {
        width: 1, color: "black", dash: null, round: 0
      },
      right: {
        width: 1, color: "black", dash: null, round: 0
      },
      bottom: {
        width: 1, color: "black", dash: null, round: 0
      },
      left: {
        width: 1, color: "black", dash: null, round: 0
      },
      selected: {
        top: {
          width: 1, color: "black", dash: null, round: 0
        },
        right: {
          width: 1, color: "black", dash: null, round: 0
        },
        bottom: {
          width: 1, color: "black", dash: null, round: 0
        },
        left: {
          width: 1, color: "black", dash: null, round: 0
        }
      }
    },
    // 默认填充
    fill: {
      color: "#787878", opacity: 0,
      selected: { color: "#23AE78", opacity: 0 }
    }
  };

  //用于存储当前浏览器下单位空格字体的大小
  static SPACE_WIDTH_MAP: any = {};


  /**
   * 获取系统缺省属性
   * @param model 模型
   */
  static getSysDefaultData(model: DDeiAbstractShape): object | null {
    if (model.modelType == "DDeiLayer") {
      if (model.type == 99) {
        return DDeiConfig.BACKGROUND_LAYER;
      } else {
        return DDeiConfig.LAYER;
      }
    } else if (model.modelType == "DDeiRectangle") {
      return DDeiConfig.RECTANGLE;
    } else if (model.modelType == "DDeiCircle") {
      return DDeiConfig.CIRCLE;
    } else if (model.modelType == "DDeiDiamond") {
      return DDeiConfig.DIAMOND;
    } else if (model.modelType == "DDeiSelector") {
      return DDeiConfig.SELECTOR;
    } else if (model.modelType == "DDeiRectContainer") {
      return DDeiConfig.CONTAINER;
    }
    return null;
  }
  /**
  * 根据配置文件的配置，将模型与渲染器绑定
  * @param  model  模型
  */
  static bindRender(model: any): void {
    if (this.RENDER_TYPE == "CANVAS") {
      if (model.modelType == "DDei") {
        model.render = new DDeiCanvasRender({ model: model });
      } else if (model.modelType == "DDeiStage") {
        model.render = new DDeiStageCanvasRender({ model: model });
      } else if (model.modelType == "DDeiLayer") {
        model.render = new DDeiLayerCanvasRender({ model: model });
      } else if (model.modelType == "DDeiRectangle") {
        model.render = new DDeiRectangleCanvasRender({ model: model });
      } else if (model.modelType == "DDeiCircle") {
        model.render = new DDeiCircleCanvasRender({ model: model });
      } else if (model.modelType == "DDeiDiamond") {
        model.render = new DDeiDiamondCanvasRender({ model: model });
      } else if (model.modelType == "DDeiSelector") {
        model.render = new DDeiSelectorCanvasRender({ model: model });
      } else if (model.modelType == "DDeiRectContainer") {
        model.render = new DDeiRectContainerCanvasRender({ model: model });
      }
    } else if (this.RENDER_TYPE == "SVG") {
      //TODO 
    }
  }



}

export default DDeiConfig