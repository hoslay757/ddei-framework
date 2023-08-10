import DDeiCanvasRender from "./views/canvas/ddei-render"
import DDeiStageCanvasRender from "./views/canvas/stage-render"
import DDeiLayerCanvasRender from "./views/canvas/layer-render"
import DDeiRectangleCanvasRender from "./views/canvas/rectangle-render"
import DDeiCircleCanvasRender from "./views/canvas/circle-render"
import DDeiSelectorCanvasRender from "./views/canvas/selector-render"
import DDeiEnumKeyActionInst from "./enums/key-action-inst"
import DDeiDiamondCanvasRender from "./views/canvas/diamond-render"
import DDei from "./ddei"
import DDeiRectContainerCanvasRender from "./views/canvas/rect-container-render"
/**
 * DDei的配置文件
 * 提供了全局参数与缺省值的设置
 * 提供了全局的一些重要函数
 */
class DDeiConfig {
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

  // 键盘对齐,开启后允许通过上下左右来改变控件位置,每次改变位置的大小为GLOBAL_HELP_LINE_WEIGHT
  static GLOBAL_KEYBOARD_ALIGN_ENABLE: boolean = true;

  // 快捷键-键行为映射配置
  static HOT_KEY_MAPPING: object[] = [
    //全选,ctrl 0/null 不按下，1必须按下，2可选按下
    { ctrl: 1, keys: "65", action: DDeiEnumKeyActionInst.AllSelect },
    //取消全选,500毫秒内，连续按两下esc键
    { keys: "27", times: 2, interval: 500, action: DDeiEnumKeyActionInst.CancelSelect },
    //删除
    { keys: "8", action: DDeiEnumKeyActionInst.RemoveModels },
    //F2
    { keys: "113", action: DDeiEnumKeyActionInst.StartQuickEdit },
    //上
    { ctrl: 2, keys: "38", action: DDeiEnumKeyActionInst.UpMoveModels },
    //下
    { ctrl: 2, keys: "40", action: DDeiEnumKeyActionInst.DownMoveModels },
    //左
    { ctrl: 2, keys: "37", action: DDeiEnumKeyActionInst.LeftMoveModels },
    //右
    { ctrl: 2, keys: "39", action: DDeiEnumKeyActionInst.RightMoveModels },
    //回车
    { keys: "13", action: DDeiEnumKeyActionInst.EnterQuickEdit },
    //取消
    { keys: "27", action: DDeiEnumKeyActionInst.CancelQuickEdit },
  ];

  // 边框的相关缺省样式属性
  static BORDER: object = {
    default: { width: 0, color: null, dash: null, round: 0 },
    selected: { width: 1, color: "black", dash: null, round: 0 }
  };


  // 选择器的相关缺省样式属性
  static SELECTOR: object = {
    //选择器边框
    BORDER: {
      default: { width: 1.5, color: "rgb(1,127,255)", dash: [10, 10], round: 0 },
      selected: { width: 1.5, color: "rgb(1,127,255)", dash: [10, 10], round: 0 }
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
    default: { family: "STSong-Light", color: "#000000", size: "16" },
    selected: { family: "STSong-Light", color: "#000000", size: "16" }
  };

  // 图层的相关缺省样式属性
  static LAYER: object = {
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
  };

  // 矩形的相关缺省样式属性
  static RECTANGLE: object = {
    // 默认矩形边框
    BORDER: {
      top: {
        default: { width: 1, color: "black", dash: [3, 1], round: 0, disabled: false },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      right: {
        default: { width: 1, color: "blue", dash: null, round: 0 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      bottom: {
        default: { width: 1, color: "green", dash: null, round: 0, opacity: 1 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      left: {
        default: { width: 1, color: "yellow", dash: null, round: 0, opacity: 1 },
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
      default: {
        //字体
        family: "STSong-Light",
        //颜色
        color: "white",
        //大小
        size: 16
      },
      selected: { family: "STSong-Light", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    TEXTSTYLE: {
      default: {
        //水平对齐，1，2，3左中右，默认1
        align: 1,
        //垂直对齐，1，2，3上中下，默认2
        valign: 2,
        //自动换行，0/null不换行，1换行，默认0
        feed: 1,
        //缩小字体填充，0/null不缩小，1缩小，默认0
        autoScaleFill: 1,
        //镂空，0/null不镂空，1镂空，默认0
        hollow: 0
      },
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
    BORDER: {
      default: { width: 1, color: "black", dash: [3, 1], round: 0, disabled: false, opacity: 1 },
      selected: { width: 1, color: "black", dash: null, round: 0, opacity: 1 }
    },
    // 默认矩形填充
    FILL: {
      default: { color: "red", opacity: 0.5 },
      selected: { color: "white" }
    },
    // 默认矩形字体
    FONT: {
      default: {
        //字体
        family: "STSong-Light",
        //颜色
        color: "white",
        //大小
        size: 16
      },
      selected: { family: "STSong-Light", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    TEXTSTYLE: {
      default: {
        //水平对齐，1，2，3左中右，默认1
        align: 2,
        //垂直对齐，1，2，3上中下，默认2
        valign: 2,
        //自动换行，0/null不换行，1换行，默认0
        feed: 1,
        //缩小字体填充，0/null不缩小，1缩小，默认0
        autoScaleFill: 1,
        //镂空，0/null不镂空，1镂空，默认0
        hollow: 0
      },
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
    BORDER: {
      top: {
        default: { width: 1, color: "black", dash: [3, 1], round: 0, disabled: false },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      right: {
        default: { width: 1, color: "blue", dash: null, round: 0 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      bottom: {
        default: { width: 1, color: "green", dash: null, round: 0, opacity: 1 },
        selected: { width: 1, color: "black", dash: null, round: 0 }
      },
      left: {
        default: { width: 1, color: "yellow", dash: null, round: 0, opacity: 1 },
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
      default: {
        //字体
        family: "STSong-Light",
        //颜色
        color: "white",
        //大小
        size: 16
      },
      selected: { family: "STSong-Light", color: "#000000", size: 16 }
    },
    // 默认矩形文本样式
    TEXTSTYLE: {
      default: {
        //水平对齐，1，2，3左中右，默认1
        align: 1,
        //垂直对齐，1，2，3上中下，默认2
        valign: 2,
        //自动换行，0/null不换行，1换行，默认0
        feed: 1,
        //缩小字体填充，0/null不缩小，1缩小，默认0
        autoScaleFill: 1,
        //镂空，0/null不镂空，1镂空，默认0
        hollow: 0
      },
      selected: {
        align: 1,
        valign: 2,
        feed: 0,
        autoScaleFill: 0,
        hollow: 0
      }
    }
  };

  //用于存储当前浏览器下单位空格字体的大小
  static SPACE_WIDTH_MAP: any = {};

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


  // /**
  // * 绑定事件监听器
  // * @param  model  模型
  // */
  // static bindEventListener(model: any): void {
  //   if (this.RENDER_TYPE == "CANVAS") {
  //     if (model.modelType == "DDei") {
  //       model.eventListener = new DDeiCanvasEventListener({ model: model });
  //     } else if (model.modelType == "DDeiStage") {
  //       model.eventListener = new DDeiStageCanvasEventListener({ model: model });
  //     } else if (model.modelType == "DDeiLayer") {
  //       model.eventListener = new DDeiLayerCanvasEventListener({ model: model });
  //     } else if (model.modelType == "DDeiRectangle") {
  //       model.eventListener = new DDeiRectangleCanvasEventListener({ model: model });
  //     } else if (model.modelType == "DDeiCircle") {
  //       model.eventListener = new DDeiCircleCanvasEventListener({ model: model });
  //     }
  //     model.eventListener.init();
  //   } else if (this.RENDER_TYPE == "SVG") {
  //     //TODO 
  //   }
  // }
}

export default DDeiConfig