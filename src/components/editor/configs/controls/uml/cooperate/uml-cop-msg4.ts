export default {
  'id': '306007',
  'name': '消息',
  'code': 'msg',
  'desc': '消息',
  'from': '306004',
  'icon': 'toolbox-shape-rect',
  define: {
    pvs: [
      { x: 0, y: 0, z: 1 },
      { x: -75, y: 0, z: 1 },
    ],
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
            x: 65, y: 0
          }
        }
      },
    ]
}
