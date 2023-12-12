export default {
  'id': '100002',
  'name': '长方形',
  'code': 'rectangle',
  'desc': '标准的长方形',
  'type': 'DDeiRectangle',
  'icon': 'toolbox-shape-rect'
}


/**
 * 定义组件的样式属性,样式属性会影响图形的显示，修改样式属性也会刷新图形
 * 样式属性通常从001段ID开始计数
 * 属性采用三层结构：组（styles、datas、events）、子分组（group）、以及属性
 * 特殊属性：
 *    code属性编码在统一个组中，code唯一
 *    mapping建立与模型中属性的映射关系，为null时为默认，采用code指向的属性映射；mapping为[]时交由控件编辑器处理值映射
 *    hiddenTitle隐藏标题，为true时不会显示属性标题，默认false不隐藏标题
 *    display控件显示模式，有row（横向排列）和column（纵向排列）两个选项，默认row
 */
export const styles = {
  'name': '样式',
  'children': [
    {
      'id': '100002001',
      'code': 'width',
      'name': '宽度',
      'desc': '控件的宽度',
      'group': '布局',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': "160",
      'orderNo': 1,
      'visiable': false
    },
    {
      'id': '100002002',
      'code': 'height',
      'name': '高度',
      'desc': '控件的高度',
      'group': '布局',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': "80",
      'orderNo': 2,
      'visiable': false
    },
    {
      'id': '100002003',
      'code': 'borderType',
      'name': '边框类型',
      'desc': '用来快速选择边框的类型，以便于套用相关的样式',
      'group': '边框',
      'controlType': 'border-type',
      'dataSource': [{ 'text': '无线条', 'value': '0' }, { 'text': '实线', 'value': '1' }],
      'dataType': 'string',
      'defaultValue': '1',
      'hiddenTitle': true,
      'display': 'column',
      'exmapping': ['border.top.disabled', 'border.right.disabled', 'border.bottom.disabled', 'border.left.disabled'],
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '100002004',
      'code': 'borderColor',
      'name': '颜色',
      'desc': '图形的边框显示颜色，在高级设置中，可以分别设置不同方向边框的样式',
      'group': '边框',
      'controlType': 'color',
      'mapping': ["border.top.color", "border.right.color", "border.bottom.color", "border.left.color"],
      'dataType': 'string',
      'defaultValue': 'black',
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '100002005',
      'code': 'borderOpacity',
      'name': '透明度',
      'desc': '图形的边框的透明度，0完全透明~1完全不透明',
      'group': '边框',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'mapping': ["border.top.opacity", "border.right.opacity", "border.bottom.opacity", "border.left.opacity"],
      'dataType': 'float',
      'defaultValue': 1,
      'display': 'column',
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '100002006',
      'code': 'borderWidth',
      'name': '粗细',
      'desc': '图形的边框的粗细，0为无边框',
      'group': '边框',
      'controlType': 'range',
      'min': 0,
      'max': 10,
      'step': 0.1,
      'mapping': ["border.top.width", "border.right.width", "border.bottom.width", "border.left.width"],
      'dataType': 'integer',
      'defaultValue': 1,
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '100002007',
      'code': 'borderDash',
      'name': '虚线',
      'desc': '图形的边框的是否为虚线样式，虚线由长短不一的线段构成',
      'group': '边框',
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
      'mapping': ["border.top.dash", "border.right.dash", "border.bottom.dash", "border.left.dash"],
      'dataType': 'integer',
      'defaultValue': [],
      'isArray': true,
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '100002008',
      'code': 'borderRound',
      'name': '圆角',
      'desc': '图形的边框的是否为为圆角的弧度',
      'group': '边框',
      'controlType': 'range',
      'mapping': ["border.top.round", "border.right.round", "border.bottom.round", "border.left.round"],
      'min': 0,
      'max': 30,
      'step': 1,
      'defaultValue': 0,
      'dataType': 'integer',
      'orderNo': 6,
      'visiable': true
    },
    {
      'id': '100002101',
      'code': 'fill.type',
      'name': '填充类型',
      'desc': '图形填充的类型快速设置',
      'group': '填充',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '无', 'value': 0 }, { 'text': '纯色', 'value': 1 }, { 'text': '图片', 'value': 2 }],
      'defaultValue': 1,
      'type': 1,
      'orderNo': 2,
      'cascadeDisplay': { 1: { show: ['fill.color', 'fill.opacity'], hidden: ['fill.image'] }, 2: { show: ['fill.image', 'fill.opacity'], hidden: ['fill.color'] }, default: { show: ['fill.color', 'fill.opacity'], hidden: ['fill.image'] }, empty: { hidden: ['fill.color', 'fill.image', 'fill.opacity'] } },
      'hiddenTitle': true,
      'display': 'column',
      'visiable': true,
    },
    {
      'id': '100002102',
      'code': 'fill.color',
      'name': '颜色',
      'desc': '图形的填充颜色',
      'group': '填充',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': 'white',
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '100002103',
      'code': 'fill.image',
      'name': '图片',
      'desc': '图形的填充图片',
      'group': '填充',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '',
      'type': 1,
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '100002104',
      'code': 'fill.opacity',
      'name': '透明度',
      'desc': '图形的填充的透明度，0完全透明~1完全不透明',
      'group': '填充',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'defaultValue': 1,
      'dataType': 'float',
      'display': 'column',
      'orderNo': 3,
      'visiable': true
    },


    {
      'id': '100002201',
      'code': 'font.family',
      'name': '字体',
      'desc': '文本的字体名称',
      'group': '文本',
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
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '100002202',
      'code': 'font.size',
      'name': '大小',
      'desc': '文本的字体大小',
      'group': '文本',
      'max': 50,
      'min': 5,
      'step': 0.5,
      'controlType': 'font-size',
      'dataType': 'float',
      'defaultValue': 14,
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '100002203',
      'code': 'font.color',
      'name': '颜色',
      'desc': '文本的颜色',
      'group': '文本',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': "#252525",
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '100002204',
      'code': 'fontAlign',
      'name': '对齐',
      'desc': '文本的对齐，采用九宫格式设置',
      'group': '文本',
      'controlType': 'align-type',
      'mapping': [],
      'dataType': 'string',
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '100002205',
      'code': 'textStyle.feed',
      'name': '换行',
      'desc': '自动换行',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 10,
      'visiable': true
    },
    {
      'id': '100002206',
      'code': 'textStyle.autoScaleFill',
      'name': '缩小字体',
      'desc': '文本的自动缩小字体填充',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 11,
      'visiable': true
    },
    {
      'id': '100002207',
      'code': 'textStyle.hollow',
      'name': '镂空',
      'desc': '文本的镂空显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 9,
      'visiable': true
    },
    {
      'id': '100002208',
      'code': 'textStyle.bold',
      'name': '粗体',
      'desc': '文本的加粗显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '100002209',
      'code': 'textStyle.italic',
      'name': '斜体',
      'desc': '文本的斜体显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 6,
      'visiable': true
    },
    {
      'id': '100002210',
      'code': 'textStyle.underline',
      'name': '下划线',
      'desc': '文本的下划线显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 7,
      'visiable': true
    },
    {
      'id': '100002211',
      'code': 'textStyle.deleteline',
      'name': '删除线',
      'desc': '文本的删除线显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 8,
      'visiable': true
    },
    {
      'id': '100002212',
      'code': 'textStyle.topline',
      'name': '顶部线',
      'desc': '文本的删除线显示',
      'group': '文本',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '是', 'value': '1' }, { 'text': '否', 'value': '0' }],
      'defaultValue': '0',
      'orderNo': 8,
      'visiable': true
    },
    {
      'id': '100002213',
      'code': 'textStyle.bgcolor',
      'name': '文字背景',
      'desc': '文本的背景颜色',
      'group': '文本',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': '',
      'orderNo': 9,
      'visiable': true
    },
    {
      'id': '100002214',
      'code': 'textStyle.subtype',
      'name': '标注类型',
      'desc': '文本的标注类型',
      'group': '基础信息',
      'controlType': 'radio',
      'dataType': 'integer',
      'dataSource': [{ 'text': '正常', 'value': 0 }, { 'text': '上标', 'value': 1 }, { 'text': '中标', 'value': 2 }, { 'text': '下标', 'value': 3 }],
      'defaultValue': 0,
      'orderNo': 10,
      'visiable': false,
    },

    {
      'id': '100002303',
      'code': 'textStyle.align',
      'name': '水平对齐',
      'desc': '文本的水平对齐',
      'group': '文本',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 2,
      'visiable': false
    },
    {
      'id': '100002304',
      'code': 'textStyle.valign',
      'name': '垂直对齐',
      'desc': '文本的垂直对齐',
      'group': '文本',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 2,
      'visiable': false
    },
    {
      'id': '100002305',
      'code': 'borderCreatingOpacity',
      'name': '透明度',
      'desc': '图形的边框的透明度，0完全透明~1完全不透明',
      'group': '边框',
      'controlType': 'text',
      'mapping': ["border.creating.top.opacity", "border.creating.right.opacity", "border.creating.bottom.opacity", "border.creating.left.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
      'orderNo': 3,
      'visiable': false
    },
    {
      'id': '100002306',
      'code': 'fillCreatingOpacity',
      'name': '透明度',
      'desc': '图形的填充的透明度，0完全透明~1完全不透明',
      'group': '填充',
      'controlType': 'text',
      'mapping': ["fill.creating.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
      'orderNo': 3,
      'visiable': false
    },
    {
      'id': '100002307',
      'code': 'imageCreatingOpacity',
      'name': '透明度',
      'desc': '图形的填充图片的透明度，0完全透明~1完全不透明',
      'group': '填充',
      'controlType': 'text',
      'mapping': ["fill.creating.opacity"],
      'dataType': 'float',
      'defaultValue': 0.5,
      'display': 'column',
      'orderNo': 3,
      'visiable': false
    }
  ],
  'visiable': false,
  'order': 1
}

/**
 * 定义组件的数据属性，数据属性一般用于业务就算，修改数据属性一般不会刷新图形，除非数据属性和样式属性产生联动关系
 * 数据属性通常占用400段ID，开始计数
 */
export const datas = {
  'name': '数据',
  'children': [
    {
      'id': '100002401',
      'code': 'id',
      'name': 'id',
      'desc': '控件在画布的全局唯一ID',
      'group': '基础信息',
      'controlType': 'text',
      'dataType': 'string',
      'readonly': true,
      'orderNo': 1,
      'visiable': false
    },
    {
      'id': '100002402',
      'code': 'code',
      'name': '编码',
      'desc': '控件在业务上的唯一编码，缺省和控件ID一致',
      'group': '基础信息',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '编码001',
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '100002403',
      'code': 'text',
      'name': '文本',
      'desc': '控件的主体显示文本',
      'group': '基础信息',
      'controlType': 'textarea',
      'defaultValue': '文本',
      'dataType': 'string',
      'type': [1, 2], //类别，1图形，2业务，3事件
      'orderNo': 3,
      'readonly': true,
      'visiable': true,
    },
    {
      'id': '100002404',
      'code': 'fmt.type',
      'name': '格式',
      'desc': '文本的显示格式',
      'group': '基础信息',
      'controlType': 'radio',
      'dataType': 'integer',
      'dataSource': [{ 'text': '文本', 'value': 0 }, { 'text': '数字', 'value': 1 }, { 'text': '金额', 'value': 2 }, { 'text': '时间', 'value': 3 }],
      'defaultValue': 0,
      'type': [1, 2],
      'orderNo': 4,
      'cascadeDisplay': { 1: { show: ['fmt.nscale', 'fmt.tmark'], hidden: ['fmt.mmark', 'fmt.munit', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] }, 2: { show: ['fmt.nscale', 'fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.mrmb'], hidden: ['fmt.dtype', 'fmt.format'] }, 3: { show: ['fmt.dtype', 'fmt.format'], hidden: ['fmt.mrmb', 'fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale'] }, default: { hidden: ['fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] }, empty: { hidden: ['fmt.tmark', 'fmt.mmark', 'fmt.munit', 'fmt.nscale', 'fmt.dtype', 'fmt.format', 'fmt.mrmb'] } },
      'visiable': true,
    },
    {
      'id': '100002405',
      'code': 'fmt.nscale',
      'name': '小数位数',
      'desc': '格式化小数位数',
      'group': '基础信息',
      'controlType': 'range',
      'min': 0,
      'max': 5,
      'dataType': 'integer',
      'defaultValue': 0,
      'type': [1, 2],
      'orderNo': 5,
      'visiable': true,
    },
    {
      'id': '100002406',
      'code': 'fmt.tmark',
      'name': '千分符',
      'desc': '显示逗号千分符',
      'group': '基础信息',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'type': [1, 2],
      'orderNo': 6,
      'visiable': true,
    },
    {
      'id': '100002407',
      'code': 'fmt.mmark',
      'name': '货币符号',
      'desc': '显示货币符号',
      'group': '基础信息',
      'controlType': 'combox',
      'dataSource': [{ 'text': '无', 'value': '' }, { 'text': '人民币', 'value': '¥' }, { 'text': '美元', 'value': '$' }, { 'text': '欧元', 'value': '€' }, { 'text': '英镑', 'value': '£' }, { 'text': '日元', 'value': '￥' }, { 'text': '卢布', 'value': '₽' }, { 'text': '法郎', 'value': '€' }],
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2],
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
      'orderNo': 7,
      'visiable': true,
    },
    {
      'id': '100002408',
      'code': 'fmt.munit',
      'name': '货币单位',
      'desc': '显示在后方的货币单位',
      'group': '基础信息',
      'controlType': 'text',
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2],
      'orderNo': 8,
      'visiable': true,
    },
    {
      'id': '100002409',
      'code': 'fmt.mrmb',
      'name': '人民币大写',
      'desc': '显示为人民币大写',
      'group': '基础信息',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'type': [1, 2],
      'orderNo': 6,
      'visiable': true,
    },
    {
      'id': '100002410',
      'code': 'fmt.dtype',
      'name': '日期类型',
      'desc': '日期和时间的格式化类型',
      'group': '基础信息',
      'controlType': 'radio',
      'dataSource': [{ 'text': '日期（2023-01-01）', 'value': 1 }, { 'text': '时间（23:59:59）', 'value': 2 }, { 'text': '日期时间（2023-01-01 23:59:59）', 'value': 3 }, { 'text': '自定义', 'value': 99 }],
      'dataType': 'integer',
      'defaultValue': 1,
      'hiddenTitle': true,
      'display': 'column',
      'cascadeDisplay': { 1: { show: [], hidden: ['fmt.format'] }, 2: { show: [], hidden: ['fmt.format'] }, 3: { show: [], hidden: ['fmt.format'] }, 99: { hidden: [], show: ['fmt.format'] }, default: { hidden: ['fmt.format'] }, empty: { hidden: ['fmt.format'] } },
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '100002420',
      'code': 'fmt.format',
      'name': '格式化',
      'desc': '自定义格式化字符串',
      'group': '基础信息',
      'controlType': 'text',
      'dataType': 'string',
      'orderNo': 20,
      'visiable': true
    },
    // {
    //   'id': '100002404',
    //   'code': 'test.combox',
    //   'name': '测试下拉框',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'combox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'underline': true, 'desc': '当前字体选择人数众多', 'bold': true, 'value': '1' }, { 'text': '方正', 'disabled': true, 'value': '2' }, { 'text': '正楷', 'deleted': true, 'desc': '当前字体即将被删除，请勿选择', 'value': '3' }, { 'text': '宋体', 'value': '4' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
    //   'canSearch': true,
    //   'defaultValue': '1',
    //   'orderNo': 5,
    //   'readonly': false,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.combox1',
    //   'name': '测试下拉框1',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'combox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1' }, { 'text': '方正', 'value': '2' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
    //   'canSearch': true,
    //   'readonly': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.combox2',
    //   'name': '测试下拉框1',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'combox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 80, height: 25, col: 1, row: 0, imgWidth: 20, imgHeight: 20 },
    //   'canSearch': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.checkbox',
    //   'name': '测试多选框1',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'ex-checkbox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 100, height: 30, col: 2, row: 3, imgWidth: 20, imgHeight: 20 },
    //   'canSearch': true,
    //   'isArray': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.checkbox1',
    //   'name': '测试多选框2',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'ex-checkbox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 100, height: 30, col: 2, row: 3, imgWidth: 20, imgHeight: 20, maxSelect: 2 },
    //   'canSearch': true,
    //   'isArray': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.checkbo2',
    //   'name': '测试多选框3',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'ex-checkbox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 100, height: 30, col: 2, row: 3, imgWidth: 20, imgHeight: 20, maxSelect: 1 },
    //   'canSearch': true,
    //   'isArray': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.checkbo3',
    //   'name': '测试多选框4',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'ex-checkbox',
    //   'dataType': 'string',
    //   'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
    //   'itemStyle': { width: 100, height: 30, col: 2, row: 3, imgWidth: 20, imgHeight: 20, maxSelect: 1 },
    //   'canSearch': true,
    //   'readonly': true,
    //   'isArray': true,
    //   'defaultValue': '2',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.date',
    //   'name': '测试日期',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'date' },
    //   'dataType': 'string',
    //   'defaultValue': '2023-01-01',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.date1',
    //   'name': '测试日期1',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'week' },
    //   'dataType': 'string',
    //   'defaultValue': '2023-01-01',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.date2',
    //   'name': '测试日期2',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'month' },
    //   'dataType': 'string',
    //   'defaultValue': '2023-01-01',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.date3',
    //   'name': '测试日期3',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'time' },
    //   'dataType': 'string',
    //   'defaultValue': '2023-01-01',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.date4',
    //   'name': '测试日期4',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'datetime' },
    //   'dataType': 'string',
    //   'defaultValue': '2023-01-01',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.email1',
    //   'name': '电子邮件',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'email' },
    //   'dataType': 'string',
    //   'defaultValue': '18375697093@qq.com',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.password',
    //   'name': '密码',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'password' },
    //   'dataType': 'string',
    //   'defaultValue': '密码',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.url',
    //   'name': 'URL',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'url' },
    //   'dataType': 'string',
    //   'defaultValue': 'http://',
    //   'orderNo': 5,
    //   'visiable': true
    // },
    // {
    //   'id': '100002404',
    //   'code': 'test.tel',
    //   'name': 'tel',
    //   'desc': '自动换行',
    //   'group': '基础信息',
    //   'controlType': 'text',
    //   'itemStyle': { type: 'tel' },
    //   'dataType': 'string',
    //   'defaultValue': '023-',
    //   'orderNo': 5,
    //   'visiable': true
    // },
  ],
  'visiable': true,
  'order': 2
}


/**
 * 定义组件的事件属性，事件属性一般用于外部扩展
 * 数据属性通常占用800段ID，开始计数
 */
export const events = {
  'name': '事件',
  'children': [
  ],
  'visiable': false,
  'order': 3
}
