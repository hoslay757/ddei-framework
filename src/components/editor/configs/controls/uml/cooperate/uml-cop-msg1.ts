export default {
  'id': '306004',
  'name': '消息',
  'code': 'msg',
  'desc': '消息',
  'from': '306003',
  'icon': 'toolbox-shape-rect',
  define: {
    ep: {
      type: 51,
      weight: 15
    }
  },
  others:
    [
      {
        'id': '100002',
        'define': {
          width: 100,
          height: 20,
          text: "Operation A()",
          fill: { disabled: true },
          border: { disabled: true },
          initCPV: {
            x: -60, y: 0
          }
        }
      },
    ]
}
