export default {
  'id': '308004',
  'name': '状态',
  'code': 'state',
  'desc': 'UML的活动的状态节点',
  'from': '100009',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 120,
    height: 80,

    border: {
      round: 5
    },

    ext: {
      sample: {
        //分割横线的纵坐标
        pvalue: -20,
      }
    },

    //组合控件
    composes: [
      {
        width: 115,
        height: 20,
        cIndex: 2,
        id: '100002',
        border: {
          disabled: true
        },
        fill: {
          type: 0
        },
        text: "State",
        initCPV: {
          x: 0, y: -27
        },
      },
      {
        width: 115,
        height: 53,
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
        text: "Action",
        initCPV: {
          x: 0, y: 12
        },
      },
    ]
  }

}
