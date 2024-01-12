export default {
  'id': '302004',
  'name': '参与者',
  'code': 'state',
  'desc': 'UML的用例图参与者',
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
        textStyle: {
          align: 3,
        },
        text: "<<actor>>",
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
        text: "系统参与者",
        initCPV: {
          x: 0, y: 13.5
        },
      },
    ]
  }

}
