export default {
  'id': '100001',
  'name': '正方形',
  'code': 'square',
  'desc': '标准的正方形',
  'type': 'DDeiRectangle',
  'icon': 'toolbox-shape-square'
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
      'id': '100001001',
      'code': 'width',
      'name': '宽度',
      'desc': '控件的宽度',
      'group': '布局',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': 100,
      'orderNo': 1,
      'visiable': false
    },
    {
      'id': '100001002',
      'code': 'height',
      'name': '高度',
      'desc': '控件的高度',
      'group': '布局',
      'controlType': 'text',
      'dataSource': null,
      'dataType': 'integer',
      'defaultValue': 100,
      'orderNo': 2,
      'visiable': false
    },
    {
      'id': '100001003',
      'code': 'borderType',
      'name': '边框类型',
      'desc': '用来快速选择边框的类型，以便于套用相关的样式',
      'group': '边框',
      'controlType': 'radio',
      'dataSource': [{ 'text': '无线条', 'value': '0' }, { 'text': '实线', 'value': '1' }],
      'dataType': 'string',
      'defaultValue': '1',
      'hiddenTitle': true,
      'display': 'column',
      'mapping': [],
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '100001004',
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
      'id': '100001005',
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
      'id': '100001006',
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
      'id': '100001007',
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
      'id': '100001008',
      'code': 'borderRound',
      'name': '圆角',
      'desc': '图形的边框的是否为为圆角的弧度',
      'group': '边框',
      'controlType': 'range',
      'mapping': ["border.top.round", "border.right.round", "border.bottom.round", "border.left.round"],
      'min': 0,
      'max': 100,
      'step': 1,
      'defaultValue': 0,
      'dataType': 'integer',
      'orderNo': 6,
      'visiable': true
    },
    {
      'id': '100001101',
      'code': 'fillType',
      'name': '填充类型',
      'desc': '图形填充的类型快速设置',
      'group': '填充',
      'controlType': 'radio',
      'dataSource': [{ 'text': '无填充', 'value': '0' }, { 'text': '单色填充', 'value': '1' }],
      'mapping': [],
      'dataType': 'string',
      'defaultValue': '1',
      'hiddenTitle': true,
      'display': 'column',
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '100001102',
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
      'id': '100001103',
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
      'id': '100001201',
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
      'id': '100001202',
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
      'id': '100001203',
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
      'id': '100001204',
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
      'id': '100001205',
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
      'id': '100001206',
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
      'id': '100001207',
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
      'id': '100001208',
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
      'id': '100001209',
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
      'id': '100001210',
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
      'id': '100001211',
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
      'id': '100001212',
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
      'id': '100001303',
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
      'id': '100001304',
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
      'id': '100001305',
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
      'id': '100001306',
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
      'id': '100001307',
      'code': 'imageCreatingOpacity',
      'name': '透明度',
      'desc': '图形的填充图片的透明度，0完全透明~1完全不透明',
      'group': '填充',
      'controlType': 'text',
      'mapping': ["image.creating.opacity"],
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
      'id': '100001401',
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
      'id': '100001402',
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
      'id': '100001403',
      'code': 'text',
      'name': '文本',
      'desc': '控件的主体显示文本',
      'group': '基础信息',
      'controlType': 'text',
      'defaultValue': '文本',
      'dataType': 'string',
      'type': [1, 2], //类别，1图形，2业务，3事件
      'orderNo': 3,
      'visiable': true,
    },
    {
      'id': '100001404',
      'code': 'test.combox',
      'name': '测试下拉框',
      'desc': '自动换行',
      'group': '基础信息',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': [{ 'text': '微软雅黑', 'underline': true, 'desc': '当前字体选择人数众多', 'bold': true, 'value': '1' }, { 'text': '方正', 'disabled': true, 'value': '2' }, { 'text': '正楷', 'deleted': true, 'desc': '当前字体即将被删除，请勿选择', 'value': '3' }, { 'text': '宋体', 'value': '4' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
      'canSearch': true,
      'defaultValue': '1',
      'orderNo': 5,
      'readonly': false,
      'visiable': true
    },
    {
      'id': '100001404',
      'code': 'test.combox1',
      'name': '测试下拉框1',
      'desc': '自动换行',
      'group': '基础信息',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': [{ 'text': '微软雅黑', 'value': '1' }, { 'text': '方正', 'value': '2' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
      'canSearch': true,
      'readonly': true,
      'defaultValue': '2',
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '100001404',
      'code': 'test.combox2',
      'name': '测试下拉框1',
      'desc': '自动换行',
      'group': '基础信息',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': [{ 'text': '微软雅黑', 'value': '1', 'img': 'icon-add' }, { 'text': '方正', 'value': '2', 'img': 'icon-reduce' }, { 'text': '正楷', 'value': '3' }, { 'text': '宋体', 'value': '4', 'img': 'icon-align-center' }, { 'text': 'PingFang', 'value': '5' }, { 'text': '斜体', 'searchText': 'xxx', 'value': '6' }],
      'itemStyle': { width: 80, height: 25, col: 1, row: 0, imgWidth: 20, imgHeight: 20 },
      'canSearch': true,
      'defaultValue': '2',
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '100001404',
      'code': 'test.combox3',
      'name': '测试下拉框3',
      'desc': '自动换行',
      'group': '基础信息',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': [{ 'img': 'icon-add', value: "1" }, { 'img': 'icon-reduce', value: "2" }, { 'img': 'icon-align-center', value: "3" }, { 'img': 'icon-align-center', value: "4" }, { 'img': 'icon-align-center', value: "5" }, { 'img': 'icon-align-center', value: "6" }, { 'img': 'icon-align-center', value: "7" }, { 'img': 'icon-align-center', value: "8" }],
      'itemStyle': { width: 60, height: 60, col: 2, row: 2, imgWidth: 40, imgHeight: 40 },
      'canSearch': true,
      'defaultValue': '2',
      'orderNo': 5,
      'visiable': true
    },
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