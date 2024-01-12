export default {
  'id': '100500',
  'name': '多边形',
  'code': 'polygon',
  'desc': '多个3-N边构成的多边形',
  'type': 'DDeiPolygon',
  'icon': 'toolbox-shape-rect',
  /**
   * 定义组件属性
   * 样式属性会影响图形的显示，修改样式属性也会刷新图形
   * 数据属性一般用于业务计算，数据属性一般不会刷新图形，除非数据属性和样式属性产生联动关系
   * 事件属性一般用来作为扩展用
   * 属性采用三层结构：组---子分组---属性，在基础json中先定义而后使用（可以复写）
   * 特殊属性：
   *    code属性编码在统一个组中，code唯一
   *    mapping建立与模型中属性的映射关系，为null时为默认，采用code指向的属性映射；mapping为[]时交由控件编辑器处理值映射
   *    hiddenTitle隐藏标题，为true时不会显示属性标题，默认false不隐藏标题
   *    display控件显示模式，有row（横向排列）和column（纵向排列）两个选项，默认row
   */
  attrs: [
    {
      'code': 'width',
      'name': '宽度',
      'desc': '控件的宽度',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': "150",
    },
    {
      'code': 'height',
      'name': '高度',
      'desc': '控件的高度',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': "150",
    },
    {
      'code': 'borderType',
      'name': '边框类型',
      'desc': '用来快速选择边框的类型，以便于套用相关的样式',
      'controlType': 'border-type',
      'dataSource': [{ 'text': '无线条', 'value': '0' }, { 'text': '实线', 'value': '1' }],
      'dataType': 'string',
      'defaultValue': '1',
      'hiddenTitle': true,
      'display': 'column',
      'exmapping': ['border.disabled'],
    },
    {
      'code': 'borderColor',
      'name': '颜色',
      'desc': '图形的边框显示颜色，在高级设置中，可以分别设置不同方向边框的样式',
      'controlType': 'color',
      'mapping': ["border.color"],
      'dataType': 'string',
      'defaultValue': 'black',
    },
    {
      'code': 'borderOpacity',
      'name': '透明度',
      'desc': '图形的边框的透明度，0完全透明~1完全不透明',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'mapping': ["border.opacity"],
      'dataType': 'float',
      'defaultValue': 1,
      'display': 'column',
    },
    {
      'code': 'borderWidth',
      'name': '粗细',
      'desc': '图形的边框的粗细，0为无边框',
      'controlType': 'range',
      'min': 0,
      'max': 10,
      'step': 0.1,
      'mapping': ["border.width"],
      'dataType': 'integer',
      'defaultValue': 1,
    },
    {
      'code': 'borderDash',
      'name': '虚线',
      'desc': '图形的边框的是否为虚线样式，虚线由长短不一的线段构成',
      'controlType': 'combox',
      'dataSource': [
        { 'img': 'icon-line-00', 'text': '1', 'value': [] },
        { 'img': 'icon-line-00', 'text': '2', 'value': [10, 5] },
        { 'img': 'icon-line-00', 'text': '3', 'value': [5, 5] },
        { 'img': 'icon-line-00', 'text': '4', 'value': [10, 4, 2, 4] },
        { 'img': 'icon-line-00', 'text': '5', 'value': [10, 4, 2, 4, 2, 4] },
        { 'img': 'icon-line-00', 'text': '6', 'value': [10, 4, 10, 4, 2, 4] },
        { 'img': 'icon-line-00', 'text': '7', 'value': [20, 5, 10, 5] },
        { 'img': 'icon-line-00', 'text': '8', 'value': [20, 5, 10, 5, 10, 5] },
        { 'img': 'icon-line-00', 'text': '9', 'value': [3, 3] },
        { 'img': 'icon-line-00', 'text': '10', 'value': [2, 2] },
        { 'img': 'icon-line-00', 'text': '11', 'value': [3, 2, 2, 2] },
        { 'img': 'icon-line-00', 'text': '12', 'value': [3, 2, 2, 2, 2, 2] },
      ],
      'itemStyle': { width: 80, height: 25, col: 2, row: 6, imgWidth: 60, imgHeight: 20, display: "img-text" },
      'mapping': ["border.dash"],
      'dataType': 'integer',
      'defaultValue': [],
      'isArray': true,
    },
    {
      'code': 'borderRound',
      'name': '圆角',
      'desc': '图形的边框的是否为为圆角的弧度',
      'controlType': 'range',
      'mapping': ["border.round"],
      'min': 0,
      'max': 30,
      'step': 1,
      'defaultValue': 0,
      'dataType': 'integer',
    },
    {
      'code': 'fill.type',
      'name': '填充类型',
      'desc': '图形填充的类型快速设置',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '无', 'value': 0 }, { 'text': '纯色', 'value': 1 }, { 'text': '图片', 'value': 2 }],
      'defaultValue': 1,
      'type': 1,
      'orderNo': 2,
      'cascadeDisplay': { 1: { show: ['fill.color', 'fill.opacity'], hidden: ['fill.image'] }, 2: { show: ['fill.image', 'fill.opacity'], hidden: ['fill.color'] }, default: { show: ['fill.color', 'fill.opacity'], hidden: ['fill.image'] }, empty: { hidden: ['fill.color', 'fill.image', 'fill.opacity'] } },
      'hiddenTitle': true,
      'display': 'column',
    },
    {
      'code': 'fill.color',
      'name': '颜色',
      'desc': '图形的填充颜色',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': 'white',
    },
    {
      'code': 'fill.image',
      'name': '图片',
      'desc': '图形的填充图片',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '',
      'type': 1,
    },
    {
      'code': 'fill.opacity',
      'name': '透明度',
      'desc': '图形的填充的透明度，0完全透明~1完全不透明',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'defaultValue': 1,
      'dataType': 'float',
      'display': 'column',
    },


    {
      'code': 'font.family',
      'name': '字体',
      'desc': '文本的字体名称',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': {
        'type': 'config',
        'data': 'FONTS',
        'text': 'ch',
        'value': 'en',
        'bold': 'isSystemDefault',
        'fontFamily': 'en'
      },
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
      'canSearch': true,
      'defaultValue': "Microsoft YaHei",
    },
    {
      'code': 'font.size',
      'name': '大小',
      'desc': '文本的字体大小',
      'max': 50,
      'min': 5,
      'step': 0.5,
      'controlType': 'font-size',
      'dataType': 'float',
      'defaultValue': 14,
    },
    {
      'code': 'font.color',
      'name': '颜色',
      'desc': '文本的颜色',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': "#252525",
    },
    {
      'code': 'fontAlign',
      'name': '对齐',
      'desc': '文本的对齐，采用九宫格式设置',
      'controlType': 'align-type',
      'mapping': [],
      'dataType': 'string',
    },
    {
      'code': 'textStyle.feed',
      'name': '换行',
      'desc': '自动换行',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.scale',
      'name': '缩小字体',
      'desc': '文本的自动缩小字体填充',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.hollow',
      'name': '镂空',
      'desc': '文本的镂空显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.bold',
      'name': '粗体',
      'desc': '文本的加粗显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.italic',
      'name': '斜体',
      'desc': '文本的斜体显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.underline',
      'name': '下划线',
      'desc': '文本的下划线显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.deleteline',
      'name': '删除线',
      'desc': '文本的删除线显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.topline',
      'name': '顶部线',
      'desc': '文本的删除线显示',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
    },
    {
      'code': 'textStyle.bgcolor',
      'name': '文字背景',
      'desc': '文本的背景颜色',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': '',
    },
    {
      'code': 'textStyle.subtype',
      'name': '标注类型',
      'desc': '文本的标注类型',
      'controlType': 'radio',
      'dataType': 'integer',
      'dataSource': [{ 'text': '正常', 'value': 0 }, { 'text': '上标', 'value': 1 }, { 'text': '中标', 'value': 2 }, { 'text': '下标', 'value': 3 }],
      'defaultValue': 0,
    },

    {
      'code': 'textStyle.align',
      'name': '水平对齐',
      'desc': '文本的水平对齐',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 2,
    },
    {
      'code': 'textStyle.valign',
      'name': '垂直对齐',
      'desc': '文本的垂直对齐',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 2,
    },
    {
      'code': 'textStyle.hspace',
      'name': '水平间距',
      'desc': '文本之间的水平间距',
      'controlType': 'range',
      'min': 0,
      'max': 10,
      'step': 0.1,
      'dataType': 'float',
      'defaultValue': 0.5,
    },
    {
      'code': 'textStyle.vspace',
      'name': '垂直间距',
      'desc': '文本之间的垂直间距',
      'controlType': 'range',
      'min': 0,
      'max': 10,
      'step': 0.1,
      'dataType': 'float',
      'defaultValue': 0.5,
    },
    {
      'code': 'borderCreatingOpacity',
      'name': '透明度',
      'desc': '图形的边框的透明度，0完全透明~1完全不透明',
      'controlType': 'text',
      'mapping': ["border.creating.top.opacity", "border.creating.right.opacity", "border.creating.bottom.opacity", "border.creating.left.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
    },
    {
      'code': 'fillCreatingOpacity',
      'name': '透明度',
      'desc': '图形的填充的透明度，0完全透明~1完全不透明',
      'controlType': 'text',
      'mapping': ["fill.creating.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
    },
    {
      'code': 'imageCreatingOpacity',
      'name': '透明度',
      'desc': '图形的填充图片的透明度，0完全透明~1完全不透明',
      'controlType': 'text',
      'mapping': ["fill.creating.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
    },
    {
      'code': 'id',
      'name': 'id',
      'desc': '控件在画布的全局唯一ID',
      'controlType': 'text',
      'dataType': 'string',
      'readonly': true,
    },
    {
      'code': 'code',
      'name': '编码',
      'desc': '控件在业务上的唯一编码，缺省和控件ID一致',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '编码001',
    },
    {
      'code': 'text',
      'name': '文本',
      'desc': '控件的主体显示文本',
      'controlType': 'textarea',
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2], //类别，1图形，2业务，3事件
      'readonly': true,
    },
    {
      'code': 'fmt.type',
      'name': '格式',
      'desc': '文本的显示格式',
      'controlType': 'radio',
      'dataType': 'integer',
      'dataSource': [{ 'text': '文本', 'value': 0 }, { 'text': '数字', 'value': 1 }, { 'text': '金额', 'value': 2 }, { 'text': '时间', 'value': 3 }],
      'defaultValue': 0,
      'type': [1, 2],
      'cascadeDisplay': { 1: { show: ['fmt.nscale', 'fmt.tmark'], hidden: ['fmt.mmark', 'fmt.munit', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] }, 2: { show: ['fmt.nscale', 'fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.mrmb'], hidden: ['fmt.dtype', 'fmt.format'] }, 3: { show: ['fmt.dtype', 'fmt.format'], hidden: ['fmt.mrmb', 'fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale'] }, default: { hidden: ['fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] }, empty: { hidden: ['fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] } },
    },
    {
      'code': 'fmt.nscale',
      'name': '小数位数',
      'desc': '格式化小数位数',
      'controlType': 'range',
      'min': 0,
      'max': 5,
      'dataType': 'integer',
      'defaultValue': 0,
      'type': [1, 2]
    },
    {
      'code': 'fmt.tmark',
      'name': '千分符',
      'desc': '显示逗号千分符',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'type': [1, 2]
    },
    {
      'code': 'fmt.mmark',
      'name': '货币符号',
      'desc': '显示货币符号',
      'controlType': 'combox',
      'dataSource': [{ 'text': '无', 'value': '' }, { 'text': '人民币', 'value': '¥' }, { 'text': '美元', 'value': '$' }, { 'text': '欧元', 'value': '€' }, { 'text': '英镑', 'value': '£' }, { 'text': '日元', 'value': '￥' }, { 'text': '卢布', 'value': '₽' }, { 'text': '法郎', 'value': '€' }],
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2],
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
    },
    {
      'code': 'fmt.munit',
      'name': '货币单位',
      'desc': '显示在后方的货币单位',
      'controlType': 'text',
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2]
    },
    {
      'code': 'fmt.mrmb',
      'name': '人民币大写',
      'desc': '显示为人民币大写',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'type': [1, 2]
    },
    {
      'code': 'fmt.dtype',
      'name': '日期类型',
      'desc': '日期和时间的格式化类型',
      'controlType': 'radio',
      'dataSource': [{ 'text': '日期（2023-01-01）', 'value': 1 }, { 'text': '时间（23:59:59）', 'value': 2 }, { 'text': '日期时间（2023-01-01 23:59:59）', 'value': 3 }, { 'text': '自定义', 'value': 99 }],
      'dataType': 'integer',
      'defaultValue': 1,
      'hiddenTitle': true,
      'display': 'column',
      'cascadeDisplay': { 1: { show: [], hidden: ['fmt.format'] }, 2: { show: [], hidden: ['fmt.format'] }, 3: { show: [], hidden: ['fmt.format'] }, 99: { hidden: [], show: ['fmt.format'] }, default: { hidden: ['fmt.format'] }, empty: { hidden: ['fmt.format'] } },
    },
    {
      'code': 'fmt.format',
      'name': '格式化',
      'desc': '自定义格式化字符串',
      'controlType': 'text',
      'dataType': 'string',
    }

  ],

  /**
   * 定义分组，用于属性编辑
   */
  groups: [
    {
      name: "样式",
      icon: 'icon-config',
      subGroups: [
        {
          name: "填充",
          attrs: ["fill.type", "fill.color", "fill.image", "fill.opacity"]
        },
        {
          name: "线条",
          attrs: ["borderType", "borderColor", "borderOpacity", "borderWidth", "borderDash", "borderRound"]
        },

        {
          name: "文本",
          attrs: ["font.family", "font.size", "font.color", "fontAlign", "textStyle.feed"
            , "textStyle.scale", "textStyle.hollow", "textStyle.bold", "textStyle.italic"
            , "textStyle.underline", "textStyle.deleteline", "textStyle.topline", "textStyle.hspace", "textStyle.vspace"]
        },
      ]
    },
    {
      name: "数据",
      icon: 'icon-data',
      subGroups: [
        {
          name: "基础信息",
          attrs: ["code", "text", "fmt.type", "fmt.nscale", "fmt.tmark", "fmt.mmark", "fmt.munit", "fmt.mrmb", "fmt.dtype", "fmt.format"]
        },

      ]
    },


  ]
}
