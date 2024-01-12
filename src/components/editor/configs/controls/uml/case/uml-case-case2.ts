export default {
  'id': '302007',
  'name': '扩展用例',
  'code': 'case',
  'desc': 'UML的用例节点',
  'from': '100104',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 140,
    height: 100,
    ext: {
      sample: {
        eqrat: false,
        //分割横线的纵坐标
        pvalue: -10,
      }
    },
    //组合控件
    composes: [
      {
        width: 85,
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
          x: 0, y: -27.5
        },
      },
      {
        width: 90,
        height: 45,
        cIndex: 2,
        id: '100002',
        textStyle: {
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
          x: 0, y: 13
        },
      },
    ]
  }

}
