export default {
  'id': '100401',
  'name': '连接线',
  'code': 'line',
  'desc': '直线、折线、曲线三种连接线',
  'type': 'DDeiLine',
  'icon': 'icon-line-fold'
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
      'id': '100401001',
      'code': 'type',
      'name': '连线类型',
      'desc': '用来快速连线类型，以便于套用相关的样式',
      'group': '线段',
      'controlType': 'radio',
      'dataSource': [{ 'text': '直线', 'value': 1 }, { 'text': '折线', 'value': 2 }, { 'text': '曲线', 'value': 3 }],
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'cascadeDisplay': {},
      'mapping': [],
      'type': 1,
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '100401002',
      'code': 'weight',
      'name': '宽度',
      'desc': '控件的宽度',
      'group': '线段',
      'controlType': 'range',
      'dataType': 'integer',
      'defaultValue': "1",
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '100401003',
      'code': 'color',
      'name': '颜色',
      'desc': '线段的边框显示颜色',
      'group': '线段',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': 'black',
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '100401004',
      'code': 'dash',
      'name': '虚线',
      'desc': '图形的边框的是否为虚线样式，虚线由长短不一的线段构成',
      'group': '线段',
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
      'dataType': 'integer',
      'defaultValue': [],
      'isArray': true,
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '100401005',
      'code': 'opacity',
      'name': '透明度',
      'desc': '图形的边框的透明度，0完全透明~1完全不透明',
      'group': '线段',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'dataType': 'float',
      'defaultValue': 1,
      'display': 'column',
      'orderNo': 5,
      'visiable': true
    },


    {
      'id': '100401010',
      'code': 'stype',
      'name': '起点类型',
      'desc': '起始点的样式样式',
      'group': '线段',
      'controlType': 'combox',
      'dataSource': [
        { 'text': '无', 'value': 0 },
        { 'text': '圆形', 'value': 1 },
        { 'text': '方形', 'value': 2 },
        { 'text': '箭头', 'value': 3 }
      ],
      'itemStyle': { width: 80, height: 25, col: 2, row: 6 },
      'dataType': 'integer',
      'defaultValue': 0,
      'orderNo': 10
    },
    {
      'id': '100401020',
      'code': 'etype',
      'name': '起点类型',
      'desc': '起始点的样式样式',
      'group': '线段',
      'controlType': 'combox',
      'dataSource': [
        { 'text': '无', 'value': 0 },
        { 'text': '圆形', 'value': 1 },
        { 'text': '方形', 'value': 2 },
        { 'text': '箭头', 'value': 3 }
      ],
      'itemStyle': { width: 80, height: 25, col: 2, row: 6 },
      'dataType': 'integer',
      'defaultValue': 0,
      'orderNo': 20
    },

    {
      'id': '100401030',
      'code': 'round',
      'name': '圆角',
      'desc': '图形的边框的是否为为圆角的弧度',
      'group': '线段',
      'controlType': 'range',
      'min': 0,
      'max': 30,
      'step': 1,
      'defaultValue': 0,
      'dataType': 'integer',
      'orderNo': 30
    },
    {
      'id': '100401403',
      'code': 'text',
      'name': '文本',
      'desc': '控件的主体显示文本',
      'group': '文本',
      'controlType': 'textarea',
      'defaultValue': '',
      'dataType': 'string',
      'type': [1, 2], //类别，1图形，2业务，3事件
      'orderNo': 3,
      'visiable': true,
    },

    {
      'id': '100401201',
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
      'id': '100401202',
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
      'id': '100401203',
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
      'id': '100401204',
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
      'id': '100401205',
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
      'id': '100401206',
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
      'id': '100401207',
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
      'id': '100401208',
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
      'id': '100401209',
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
      'id': '100401210',
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
      'id': '100401211',
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
      'id': '100401212',
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
      'id': '100401303',
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
      'id': '100401304',
      'code': 'textStyle.valign',
      'name': '垂直对齐',
      'desc': '文本的垂直对齐',
      'group': '文本',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 2,
      'visiable': false
    },
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
      'id': '100401401',
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
      'id': '100401402',
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
