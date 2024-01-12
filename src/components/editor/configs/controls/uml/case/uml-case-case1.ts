export default {
  'id': '302006',
  'name': '扩展用例',
  'code': 'case',
  'desc': 'UML的用例节点',
  'from': '100009',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 140,
    height: 90,
    ext: {
      sample: {
        //分割横线的纵坐标
        pvalue: -20,
      }
    },
    //组合控件
    composes: [
      {
        width: 136,
        height: 24,
        cIndex: 2,
        id: '100002',
        border: {
          disabled: true
        },
        fill: {
          type: 0
        },
        text: "用例",
        initCPV: {
          x: 0, y: -31.5
        },
      },
      {
        width: 136,
        height: 55,
        cIndex: 2,
        id: '100002',
        textStyle: {
          valign: 1,
          feed: 1
        },
        border: {
          disabled: true
        },
        fill: {
          type: 0,
        },
        text: "扩展点",
        initCPV: {
          x: 0, y: 16
        },
      },
    ]
  }

}
