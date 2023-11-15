import DDeiAbstractShape from "./models/shape"
import loadCommands from "./config/command"
import DDeiUtil from "./util"

/**
 * 组件的定义，用于根据名称找到组件类型
 */
const MODEL_CLS = {}

/**
 * 组件渲染器的定义，用于根据名称找到渲染器
 */
const RENDER_CLS = {}


//动态加载控件
const control_ctx = import.meta.glob('./models/*.ts', { eager: true })
for (let i in control_ctx) {
  let cls = control_ctx[i].default;
  MODEL_CLS[cls.ClsName] = cls;
}

//动态加载渲染器
const render_ctx = import.meta.glob('./views/canvas/*.ts', { eager: true });
for (let i in render_ctx) {
  let cls = render_ctx[i].default;
  RENDER_CLS[cls.ClsName] = cls;
}
const render_ctx1 = import.meta.glob('./views/svg/*.ts', { eager: true });
for (let i in render_ctx1) {
  let cls = render_ctx1[i].default;
  RENDER_CLS[cls.ClsName] = cls;
}

const render_ctx2 = import.meta.glob('./views/webgl/*.ts', { eager: true });
for (let i in render_ctx2) {
  let cls = render_ctx2[i].default;
  RENDER_CLS[cls.ClsName] = cls;
}





/**
 * DDei的配置文件
 * 提供了全局参数与缺省值的设置
 * 提供了全局的一些重要函数
 */
class DDeiConfig {


  //保存时的key
  static STORE_KEY: string = "DDEI";

  //单个角度的旋转单位
  static ROTATE_UNIT = Math.PI / 180;
  // ============================ 静态变量 ============================
  //当前采用的渲染器类型，暂时只支持canvas
  static RENDER_TYPE: string = "Canvas";


  //缺省画布大小
  static STAGE_WIDTH: number = 3000;
  static STAGE_HEIGHT: number = 3000;
  //自动扩展画布大小
  static EXT_STAGE_WIDTH: boolean = true;
  static EXT_STAGE_HEIGHT: boolean = true;

  //是否开启全局缩放
  static GLOBAL_ALLOW_STAGE_RATIO = true;
  //缺省缩放比例
  static STAGE_RATIO: number = 1.0;

  // 是否打开辅助线功能
  static GLOBAL_HELP_LINE_ENABLE: boolean = true;
  // 是否打开辅助对齐线
  static GLOBAL_HELP_LINE_ALIGN_ENABLE: boolean = true;

  // 缺省辅助对齐线颜色
  static GLOBAL_HELP_LINE_ALIGN_COLOR = 'red';

  // 缺省吸附效果宽度，小于0时没有吸附效果
  static GLOBAL_ADV_WEIGHT: number = 5;

  //序列化配置
  static SERI_FIELDS: object = {
    "DDei": { "TOJSON": ["stage"], "SKIP": ["bus", "render", "unicode", "editMode"] },
    "DDeiStage": { "TOJSON": ["layers"], "SKIP": ["ddInstance", "selectedModels", "render", "unicode", "histroy", 'histroyIdx'] },
    "DDeiLayer": { "TOJSON": ["models"], "SKIP": ["ddInstance", "stage", "render", "unicode", "opPoints", "dragInPoints", "dragOutPoints", "shadowControls", "layoutManager", "tempDisplay"] },
    "DDeiContainer": { "TOJSON": ["models"], "SKIP": ["ddInstance", "stage", "layer", "pModel", "render", "unicode", "hpv", "loosePVS", "x", "y", "width", "height", "layoutManager"] },
    "AbstractShape": { "SKIP": ["ddInstance", "stage", "layer", "pModel", "state", "render", "unicode", "hpv", "loosePVS", "x", "y", "width", "height"] },
    "DDeiTable": { "TOJSON": ["rows"], "SKIP": ["ddInstance", "stage", "layer", "pModel", "render", "unicode", "hpv", "loosePVS", "x", "y", "width", "height", "cols", "selector", "initColNum", "initRowNum", "tempDragCell", "tempDragType", "curCol", "curRow", "specilDrag", "tempUpCel", "dragChanging", "dragType", "dragCell"] },
    "DDeiTableCell": { "TOJSON": ["models"], "SKIP": ["ddInstance", "stage", "layer", "pModel", "render", "unicode", "hpv", "loosePVS", "x", "y", "width", "height", "layoutManager", "id", "table", "mergedCell"] },
  }

  // 边框的相关缺省样式属性
  static BORDER: object = {
    default: { width: 0, color: null, dash: null, round: 0 },
    selected: { width: 1, color: "black", dash: null, round: 0 }
  };

  // 画布的设置
  static STAGE = {
    //水印
    mark: {
      font: {
        family: "Microsoft YaHei", color: "grey", size: "16"
      }
    }
    //全局背景色
    , NONE_BG_COLOR: "rgb(240,240,240)"
  }

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

  // 选择器的相关缺省样式属性
  static TABLE: object = {
    //选择器边框
    selector: {
      border: {
        width: 2, color: "rgb(31,187,125)", dash: null, round: 0,
        selected: { width: 2, color: "rgb(31,187,125)", dash: null, round: 0 }
      },

      //间隔宽度，根据选中单个控件、选中多个控件，间隔宽度可以有所变化
      PADDING_WEIGHT: {
        default: { single: 0, multiple: 0 },
        selected: { single: 0, multiple: 0 }
      }
    },
    CELL: {
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
    //背景的类型，0无背景，1纯色，2图片
    type: 0,
    //背景色
    bgcolor: "grey",
    //透明度，0完全透明~1完全不透明
    opacity: 0.5
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


  // 定义了在1.0缩放的，单位尺寸设置
  static RULER = {
    'mm': { size: 10, parts: [2, 5] },
    'cm': { size: 1, parts: [2, 5] },
    'm': { size: 0.05, parts: [2, 5] },
    'inch': { size: 1, parts: [8] },
    'px': { size: 50, parts: [5, 10] },
  }

  // 定义了在各种常见纸张的大小以及名称
  static PAPER = {
    "自定义": { width: 210, height: 297, unit: 'mm', desc: '可以自由设置宽高' },
    "Letter": { width: 216, height: 279, unit: 'mm' },
    "Legal": { width: 216, height: 356, unit: 'mm' },
    "A0": { width: 841, height: 1189, unit: 'mm' },
    "A1": { width: 594, height: 841, unit: 'mm' },
    "A2": { width: 420, height: 594, unit: 'mm' },
    "A3": { width: 297, height: 420, unit: 'mm' },
    "A4": { width: 210, height: 297, unit: 'mm', desc: '常用打印纸' },
    "A5": { width: 148, height: 210, unit: 'mm' },
    "A6": { width: 105, height: 148, unit: 'mm' },
    "A7": { width: 74, height: 105, unit: 'mm' },
    "A8": { width: 52, height: 74, unit: 'mm' },
    "A9": { width: 37, height: 52, unit: 'mm' },
    "A10": { width: 26, height: 37, unit: 'mm' },
    "B0": { width: 1000, height: 1414, unit: 'mm' },
    "B1": { width: 700, height: 1000, unit: 'mm' },
    "B2": { width: 500, height: 707, unit: 'mm' },
    "B3": { width: 353, height: 500, unit: 'mm' },
    "B4": { width: 250, height: 353, unit: 'mm' },
    "B5": { width: 176, height: 250, unit: 'mm' },
    "B6": { width: 125, height: 176, unit: 'mm' },
    "B7": { width: 88, height: 125, unit: 'mm' },
    "B8": { width: 62, height: 88, unit: 'mm' },
    "B9": { width: 42, height: 62, unit: 'mm' },
    "B10": { width: 31, height: 44, unit: 'mm' },
    "一寸照片": { width: 2.5, height: 3.6, unit: 'cm' },
    "二寸照片": { width: 3.5, height: 5.3, unit: 'cm' },
    "三寸照片": { width: 5.5, height: 8.4, unit: 'cm' },
    "五寸照片": { width: 3.5, height: 5, unit: 'cm' },
    "六寸照片": { width: 4, height: 6, unit: 'cm' },
    "七寸照片": { width: 5, height: 7, unit: 'cm' },
    "八寸照片": { width: 6, height: 8, unit: 'cm' },
    "十寸照片": { width: 8, height: 10, unit: 'cm' },
    "十二寸照片": { width: 10, height: 12, unit: 'cm' },
    "十四寸照片": { width: 12, height: 14, unit: 'cm' },
    "十六寸照片": { width: 12, height: 16, unit: 'cm' },
    "十八寸照片": { width: 12, height: 18, unit: 'cm' },
    "名片-横版": { width: 90, height: 55, unit: 'mm' },
    "名片-横版-欧式": { width: 85, height: 54, unit: 'mm' },
    "名片-竖版": { width: 54, height: 85, unit: 'mm' },
    "名片-竖版-美式": { width: 50, height: 90, unit: 'mm' },
    "名片-方版-1": { width: 90, height: 90, unit: 'mm' },
    "名片-方版-2": { width: 90, height: 95, unit: 'mm' },
    "海报-1": { width: 420, height: 570, unit: 'mm' },
    "海报-2": { width: 500, height: 700, unit: 'mm' },
    "海报-3": { width: 570, height: 840, unit: 'mm' },
    "海报-4": { width: 600, height: 900, unit: 'mm' },
    "二折页": { width: 285, height: 210, unit: 'mm' },
    "二折页-1": { width: 140, height: 105, unit: 'mm' },
    "二折页-2": { width: 210, height: 95, unit: 'mm' },
    "二折页-3": { width: 210, height: 140, unit: 'mm' },
    "二折页-4": { width: 285, height: 140, unit: 'mm' },
    "全开": { width: 889, height: 1194, paddingLeft: 102, paddingTop: 102, unit: 'mm' },
    "对开": { width: 570, height: 840, paddingLeft: 50, paddingTop: 100, unit: 'mm' },
    "4开": { width: 420, height: 570, paddingLeft: 50, paddingTop: 50, unit: 'mm' },
    "8开": { width: 285, height: 420, paddingLeft: 25, paddingTop: 50, unit: 'mm' },
    "16开": { width: 210, height: 285, paddingLeft: 25, paddingTop: 25, unit: 'mm' },
    "32开": { width: 142, height: 210, paddingLeft: 12, paddingTop: 25, unit: 'mm' },
    "64开": { width: 110, height: 142, paddingLeft: 18, paddingTop: 12, unit: 'mm' }
  }
  static {
    //加载外部配置
    const global_config_ctx = import.meta.glob('@/ddei/config', { eager: true });
    for (let i in global_config_ctx) {
      let configData = global_config_ctx[i].default;
      if (configData) {
        DDeiConfig.applyConfig(configData)
        break;
      }
    }

    //加载配置
    loadCommands();

  }

  /**
   * 应用外部配置文件，覆写配置文件内容
   * @param config 
   */
  static applyConfig(config: Object): void {
    if (config) {
      //普通值、JSON、数组、MAP
      for (let i in config) {
        let outConfigValue = config[i];
        let configValue = DDeiConfig[i];
        if (i != "SERI_FIELDS") {
          //深度遍历属性，然后进行设置
          DDeiConfig[i] = DDeiUtil.copyJSONValue(outConfigValue, configValue);
        }
      }
      if (config.SERI_FIELDS != undefined && config.SERI_FIELDS != null) {
        for (let i in config.SERI_FIELDS) {
          DDeiConfig.SERI_FIELDS.set(i, config.SERI_FIELDS[i])
        }
      }
    }
  }


  //用于存储当前浏览器下单位空格字体的大小
  static SPACE_WIDTH_MAP: any = {};


  /**
   * 获取系统缺省属性
   * @param model 模型
   */
  static getSysDefaultData(model: DDeiAbstractShape): object | null {
    switch (model.modelType) {
      case "DDeiLayer":
        return DDeiConfig.LAYER
      case "DDeiTable":
        return DDeiConfig.TABLE
      case "DDeiTableCell":
        return DDeiConfig.TABLE.CELL
      case "DDeiRectangle":
        return DDeiConfig.RECTANGLE
      case "DDeiCircle":
        return DDeiConfig.CIRCLE
      case "DDeiDiamond":
        return DDeiConfig.DIAMOND
      case "DDeiSelector":
        return DDeiConfig.SELECTOR
      case "DDeiRectContainer":
        return DDeiConfig.CONTAINER
      case "DDeiStage":
        return DDeiConfig.STAGE
      default:
        return null
    }
  }

  /**
   * 加载文件的函数，加载后的文件会进入文件列表，此方法为外部传入的勾子函数，由外部对文件进行加载
   * 必须为一个async函数
   */
  static EVENT_LOAD_FILE: Function;

  /**
   * 保存文件的函数，保存后文件会从dirty状态变为普通状态，此方法为外部传入的勾子函数，由外部对文件进行保存和存储
   * 必须为一个async函数
   */
  static EVENT_SAVE_FILE: Function;

  /**
 * 发布文件的函数，发布后文件从业务上转变为正式文件，此方法为外部传入的勾子函数，由外部对文件状态进行控制
 * 必须为一个async函数
 */
  static EVENT_PUBLISH_FILE: Function;

  /**
   * 返回文件列表，此方法为外部传入的勾子函数
   */
  static EVENT_GOBACK_FILE_LIST: Function;

  /**
   * 控件选择前，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_SELECT_BEFORE: Function;

  /**
   * 控件选择后，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_SELECT_AFTER: Function;

  /**
   * 控件创建前，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_CREATE_BEFORE: Function;

  /**
   * 控件创建后，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_CREATE_AFTER: Function;

  /**
   * 控件拖拽前，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_DRAG_BEFORE: Function;

  /**
   * 控件拖拽后，此方法为外部传入的勾子函数
   */
  static EVENT_CONTROL_DRAG_AFTER: Function;


  /**
  * 根据配置文件的配置，将模型与渲染器绑定
  * @param  model  模型
  */
  static bindRender(model: DDeiAbstractShape): any {
    let clsName = model.modelType + this.RENDER_TYPE + "Render";
    model.render = RENDER_CLS[clsName].newInstance({ model: model })
  }

  static {
    //转换配置为数组
    DDeiConfig.PAPER_DATASOURCE = [{ code: '无', name: '无', desc: '不显示纸张' }]
    for (let i in DDeiConfig.PAPER) {
      let data = DDeiConfig.PAPER[i];
      data.desc = data.desc
      if (!data.desc && data.width && data.height) {
        data.desc = data.width + " ✖️ " + data.height + data.unit
      }
      data.code = i
      data.name = i
      DDeiConfig.PAPER_DATASOURCE.push(data)
    }

  }


}

export default DDeiConfig
export { MODEL_CLS, RENDER_CLS, DDeiConfig }