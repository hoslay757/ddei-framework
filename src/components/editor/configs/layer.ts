export default {
  'id': 'DDeiLayer',
  'name': '图层',
  'code': 'layer',
  'desc': '整体图层的属性',
  'type': 'DDeiLayer',
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
      'id': '999002102',
      'code': 'bg.type',
      'name': '背景',
      'desc': '背景的类型',
      'group': '背景',
      'controlType': 'radio',
      'dataType': 'string',
      'dataSource': [{ 'text': '无', 'value': 0 }, { 'text': '纯色', 'value': 1 }, { 'text': '图片', 'value': 2 }],
      'defaultValue': 0,
      'type': 1,
      'orderNo': 2,
      'cascadeDisplay': { 1: { show: ['bg.color'], hidden: ['bg.image', 'bg.imageMode', 'bg.imageScale', 'bg.imageAlign'] }, 2: { show: ['bg.image', 'bg.imageMode', 'bg.imageScale', 'bg.imageAlign'], hidden: ['bg.color'] }, empty: { hidden: ['bg.color', 'bg.image', 'bg.imageMode', 'bg.imageScale', 'bg.imageAlign'] } },
      'hiddenTitle': true,
      'display': 'column',
      'visiable': true,

    },
    {
      'id': '999003103',
      'code': 'bg.color',
      'name': '背景颜色',
      'desc': '背景的颜色',
      'group': '背景',
      'controlType': 'color',
      'dataType': 'string',
      'defaultValue': 'white',
      'type': 1,
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '999003104',
      'code': 'bg.image',
      'name': '背景图片',
      'desc': '背景的图片',
      'group': '背景',
      'controlType': 'text',
      'dataType': 'string',
      'defaultValue': '',
      'type': 1,
      'orderNo': 3,
      'visiable': true
    },
    {
      'id': '999003105',
      'code': 'bg.opacity',
      'name': '透明度',
      'desc': '背景的透明度',
      'group': '背景',
      'controlType': 'range',
      'min': 0,
      'max': 1,
      'step': 0.01,
      'dataType': 'float',
      'defaultValue': 1,
      'display': 'column',
      'type': 1,
      'orderNo': 4,
      'visiable': true
    },
    {
      'id': '999003106',
      'code': 'bg.imageMode',
      'name': '模式',
      'desc': '背景的图片的模式',
      'group': '背景',
      'controlType': 'radio',
      'dataType': 'integer',
      'dataSource': [{ 'text': '原始', 'value': 0 }, { 'text': '缩放', 'value': 1 }, { 'text': '填充', 'value': 2 }],
      'cascadeDisplay': { 1: { show: ['bg.imageScale', 'bg.imageAlign'] }, 2: { hidden: ['bg.imageScale', 'bg.imageAlign'] }, empty: { hidden: ['bg.imageScale'], show: ['bg.imageAlign'] } },
      'defaultValue': 2,
      'type': 1,
      'orderNo': 5,
      'visiable': true
    },
    {
      'id': '999003107',
      'code': 'bg.imageScale',
      'name': '缩放比例',
      'desc': '背景的图片的缩放比例',
      'group': '背景',
      'controlType': 'range',
      'min': 0.01,
      'max': 10,
      'step': 0.01,
      'dataType': 'float',
      'defaultValue': 1,
      'type': 1,
      'orderNo': 6,
      'visiable': true
    },

    {
      'id': '999003108',
      'code': 'bg.imageAlign',
      'name': '位置',
      'desc': '背景的图片布局方位',
      'group': '背景',
      'controlType': 'align-type',
      'dataType': 'string',
      'type': 1,
      'orderNo': 7,
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
