export default {
  'id': '303015',
  'name': '角色',
  'code': 'actor',
  'desc': '角色',
  'from': '103006',
  'icon': 'toolbox-shape-rect',
  //其它同时创建的平级控件
  others: [
    {
      'id': '100002',
      'define': {
        width: 100,
        height: 25,
        font: {
          size: 16,
        },
        text: "Actor",
        fill: { disabled: true },
        border: { disabled: true },
        initCPV: {
          x: 0, y: 60
        }
      }
    },
    {
      'id': '303002',
      'define': {
        pvs: [
          { x: 0, y: 30, z: 1 },
          { x: 0, y: 450, z: 1 },
        ],
      }
    },
  ]

}
