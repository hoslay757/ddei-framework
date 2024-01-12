export default {
  'id': '301003',
  'name': '状态',
  'code': 'state',
  'desc': 'UML的状态机节点',
  'from': '100009',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 140,
    height: 90,

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
        textStyle: {
          align: 3,
        },
        text: "Name",
        initCPV: {
          x: 0, y: -31.5
        },
      },
      {
        width: 136,
        height: 60,
        cIndex: 2,
        id: '100002',
        textStyle: {
          align: 3,
          feed: 1
        },
        border: {
          disabled: true
        },
        fill: {
          type: 0,
        },
        text: "Activities",
        initCPV: {
          x: 0, y: 13.5
        },
      },
    ]
  }

}
