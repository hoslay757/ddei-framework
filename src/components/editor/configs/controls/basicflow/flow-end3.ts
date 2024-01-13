export default {
  'id': '102093',
  'name': '结束',
  'code': 'end',
  'desc': '流程的开始节点',
  'from': '100003',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 40,
    height: 40,
    cIndex: 1,
    composes: [
      {
        id: "102001",
        width: 30,
        height: 30,
        cIndex: 2,
        attrLinks: [
          { code: "fill", mapping: ["*"] },
          { code: "border", mapping: ["*"] },
        ]
      }
    ],

  }
}
