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
      'defaultValue': 1,
      'hiddenTitle': true,
      'display': 'column',
      'cascadeDisplay': { 2: { show: ['round'], hidden: [] }, default: { show: [], hidden: ['round'] }, notempty: { hidden: ['round'] } },
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
      'min': 0.1,
      'max': 10,
      'step': 0.1,
      'dataType': 'float',
      'defaultValue': 1,
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
      'code': 'sp.type',
      'name': '起点类型',
      'desc': '起点的样式样式',
      'group': '线段',
      'controlType': 'combox',
      'dataSource': [
        { 'text': '无', 'value': -1 },
        { 'text': '箭头', 'value': 1 },
        { 'text': '圆形', 'value': 2 },
        { 'text': '圆形-实心', 'value': 21 },
        { 'text': '方形', 'value': 3 },
        { 'text': '方形-实心', 'value': 31 },
        { 'text': '菱形', 'value': 4 },
        { 'text': '菱形-实心', 'value': 41 },
        { 'text': '三角形', 'value': 5 },
        { 'text': '三角形-实心', 'value': 51 },

      ],
      'itemStyle': { width: 80, height: 25, col: 2, row: 6 },
      'dataType': 'integer',
      'cascadeDisplay': { "-1": { hidden: ['startWeidht'] }, empty: { hidden: ['startWeidht'] }, notempty: { show: ['startWeidht'] } },
      'defaultValue': -1,
      'orderNo': 10
    },
    {
      'id': '100401011',
      'code': 'sp.weight',
      'name': '大小',
      'desc': '起点的箭头的宽度',
      'group': '线段',
      'controlType': 'range',
      'min': 1,
      'max': 30,
      'step': 1,
      'defaultValue': 6,
      'dataType': 'integer',
      'orderNo': 11,
      'visiable': true
    },
    {
      'id': '100401020',
      'code': 'ep.type',
      'name': '终点类型',
      'desc': '终点的样式样式',
      'group': '线段',
      'controlType': 'combox',
      'dataSource': [
        { 'text': '无', 'value': -1 },
        { 'text': '箭头', 'value': 1 },
        { 'text': '圆形', 'value': 2 },
        { 'text': '圆形-实心', 'value': 21 },
        { 'text': '方形', 'value': 3 },
        { 'text': '方形-实心', 'value': 31 },
        { 'text': '菱形', 'value': 4 },
        { 'text': '菱形-实心', 'value': 41 },
        { 'text': '三角形', 'value': 5 },
        { 'text': '三角形-实心', 'value': 51 },
      ],
      'itemStyle': { width: 80, height: 25, col: 2, row: 6 },
      'dataType': 'integer',
      'cascadeDisplay': { "-1": { hidden: ['endWeidht'] }, empty: { hidden: ['endWeidht'] }, notempty: { show: ['endWeidht'] } },
      'defaultValue': 5,
      'orderNo': 20
    },
    {
      'id': '100401021',
      'code': 'ep.weight',
      'name': '大小',
      'desc': '终点的箭头的宽度',
      'group': '线段',
      'controlType': 'range',
      'min': 1,
      'max': 30,
      'step': 1,
      'defaultValue': 6,
      'dataType': 'integer',
      'orderNo': 21,
      'visiable': true
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
      'orderNo': 30,
      'visiable': true
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
