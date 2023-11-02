export default {
  'id': 'DDeiStage',
  'name': '画布',
  'code': 'stage',
  'desc': '整体画布的属性',
  'type': 'DDeiStage',
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
      'id': '999001201',
      'code': 'paper.type',
      'name': '纸张类型',
      'desc': '用来快速选择纸张的类型，以便于套用相关的样式',
      'group': '纸张',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': {
        'type': 'config',
        'data': 'PAPER_DATASOURCE',
        'text': 'name',
        'value': 'code',
        'desc': 'desc'
      },
      'canSearch': false,
      'itemStyle': { width: 170, align: 'left', paddingLeft: '10px', height: 25, col: 1, row: 8, imgWidth: 20, imgHeight: 20 },
      'defaultValue': 'A4',
      'cascadeDisplay': { '无': { hidden: ['paper.direct', 'paper.width', 'paper.height', 'paper.unit'] }, '自定义': { show: ['paper.direct', 'paper.width', 'paper.height', 'paper.unit'] }, notempty: { show: ['paper.direct'], hidden: ['paper.width', 'paper.height', 'paper.unit'] }, empty: { hidden: ['paper.width', 'paper.height', 'paper.unit'] } },
      'type': 1,
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '999001203',
      'code': 'paper.width',
      'name': '宽度',
      'desc': '用来设置纸张的宽度，以便于套用相关的样式',
      'group': '纸张',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 210,
      'type': 1,
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '999001204',
      'code': 'paper.height',
      'name': '高度',
      'desc': '用来设置纸张的高度，以便于套用相关的样式',
      'group': '纸张',
      'controlType': 'text',
      'dataType': 'integer',
      'defaultValue': 297,
      'type': 1,
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '999001205',
      'code': 'paper.unit',
      'name': '单位',
      'desc': '用来设置纸张的宽高单位，以便于套用相关的样式',
      'group': '纸张',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '毫米', 'value': 'mm' }, { 'text': '厘米', 'value': 'cm' }, { 'text': '米', 'value': 'm' }, { 'text': '英寸', 'value': 'inch' }, { 'text': '像素', 'value': 'pix' }],
      'defaultValue': 'mm',
      'orderNo': 5,
      'readonly': false,
      'visiable': true
    },
    {
      'id': '999001202',
      'code': 'paper.direct',
      'name': '方向',
      'desc': '用来设置纸张的方向，以便于套用相关的样式',
      'group': '纸张',
      'controlType': 'radio',
      'dataSource': [{ 'text': '纵向', 'value': 1 }, { 'text': '横向', 'value': 2 }],
      'dataType': 'integer',
      'defaultValue': 2,
      'type': 1,
      'orderNo': 5,
      'visiable': true
    },

    {
      'id': '999001101',
      'code': 'mark.type',
      'name': '水印类型',
      'desc': '用来快速选择水印的类型，以便于套用相关的样式',
      'group': '水印',
      'controlType': 'radio',
      'dataSource': [{ 'text': '无水印', 'value': 0 }, { 'text': '文本', 'value': 1 }, { 'text': '图片', 'value': 2 }],
      'dataType': 'integer',
      'defaultValue': 0,
      'hiddenTitle': true,
      'display': 'column',
      'cascadeDisplay': { 1: { show: ['mark.data', 'mark.direct', 'mark.opacity', 'mark.font.family', 'mark.font.size', 'mark.font.color'] }, 2: { show: ['mark.data', 'mark.direct', 'mark.opacity'], hidden: ['mark.font.family', 'mark.font.size', 'mark.font.color'] }, empty: { hidden: ['mark.data', 'mark.direct', 'mark.opacity', 'mark.font.family', 'mark.font.size', 'mark.font.color'] } },
      'mapping': [],
      'type': 1,
      'orderNo': 1,
      'visiable': true
    },
    {
      'id': '999001102',
      'code': 'mark.data',
      'name': '水印',
      'desc': '当水印类型为1时，此字段将显示文本，当类行为2时，此字段显示为图片',
      'group': '水印',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '',
      'type': 1,
      'orderNo': 2,
      'visiable': true
    },

    {
      'id': '999001103',
      'code': 'mark.direct',
      'name': '方向',
      'desc': '水印的显示方向',
      'group': '水印',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '从左往右', 'value': '1' }, { 'text': '从右往左', 'value': '2' }, { 'text': '水平显示', 'value': '3' }],
      'defaultValue': '1',
      'type': 1,
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '999001104',
      'code': 'mark.opacity',
      'name': '透明度',
      'desc': '透明度，0完全透明~1完全不透明',
      'group': '水印',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'dataType': 'float',
      'defaultValue': 0.25,
      'display': 'column',
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '999001105',
      'code': 'mark.font.family',
      'name': '字体',
      'desc': '文本的字体名称',
      'group': '水印',
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
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '999001106',
      'code': 'mark.font.size',
      'name': '大小',
      'desc': '文本的字体大小',
      'group': '水印',
      'max': 50,
      'min': 5,
      'step': 0.5,
      'controlType': 'font-size',
      'dataType': 'float',
      'defaultValue': 14,
      'orderNo': 6,
      'visiable': true
    },
    {
      'id': '999001107',
      'code': 'mark.font.color',
      'name': '颜色',
      'desc': '文本的颜色',
      'group': '水印',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': "#252525",
      'orderNo': 7,
      'visiable': true
    },
    {
      'id': '999001301',
      'code': 'ruler.display',
      'name': '标尺',
      'desc': '是否显示标尺',
      'group': '辅助功能',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 1,
      'display': 'column',
      'hiddenTitle': true,
      'type': 1,
      'orderNo': 1,
      'cascadeDisplay': { 1: { show: ['ruler.unit'] }, default: { show: ['ruler.unit'] }, empty: { hidden: ['ruler.unit'] } },
      'visiable': true
    },
    {
      'id': '999001302',
      'code': 'ruler.unit',
      'name': '单位',
      'desc': '用来设置标尺单位样式',
      'group': '辅助功能',
      'controlType': 'combox',
      'dataType': 'string',
      'dataSource': [{ 'text': '毫米', 'value': 'mm' }, { 'text': '厘米', 'value': 'cm' }, { 'text': '米', 'value': 'm' }, { 'text': '英寸', 'value': 'inch' }, { 'text': '像素', 'value': 'px' }],
      'itemStyle': { width: 80, height: 25, col: 2, row: 0, imgWidth: 20, imgHeight: 20 },
      'defaultValue': 'mm',
      'type': 1,
      'orderNo': 2,
      'visiable': true
    },
    {
      'id': '999001303',
      'code': 'grid.display',
      'name': '网格线',
      'desc': '设置是否显示网格线',
      'group': '辅助功能',
      'controlType': 'switch-checkbox',
      'dataType': 'integer',
      'defaultValue': 1,
      'type': 1,
      'orderNo': 3,
      'display': 'column',
      'hiddenTitle': true,
      'visiable': true
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
