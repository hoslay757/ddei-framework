export default {
  'id': '306008',
  'name': '消息',
  'code': 'msg',
  'desc': '消息',
  'from': '306004',
  'icon': 'toolbox-shape-rect',
  define: {
    pvs: [
      { x: 0, y: 0, z: 1 },
      { x: 0, y: -50, z: 1 },
    ],
    iLinkModels: {
      "0": { type: 3, dx: -60, dy: 0 }
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
          fill: { type: 0 },
          border: { disabled: true },
          initCPV: {
            x: -60, y: -25
          }
        }
      },
    ]
}
