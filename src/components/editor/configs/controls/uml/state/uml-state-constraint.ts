export default {
  'id': '301010',
  'name': '约束',
  'code': 'constr',
  'desc': 'UML的约束',
  'from': '103005',
  'icon': 'toolbox-shape-circle',
  'define': {
    width: 140,
    height: 90,
    textStyle: {
      align: 3,
      feed: 1
    },
    text: "Constraint Name : \r\nBody",
    composes: [
      {
        width: 90,
        height: 18,
        cIndex: 3,
        id: '100002',
        border: {
          disabled: true
        },
        fill: {
          type: 0
        },
        textStyle: {
          align: 2,
        },
        text: "<<invariant>>",
        initCPV: {
          x: -15, y: -35
        },
      },
    ]
  }
}
