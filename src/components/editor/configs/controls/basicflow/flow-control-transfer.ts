export default {
  'id': '102058',
  'name': '控制传递',
  'code': 'ctran',
  'desc': '控制传递',
  'from': '100401',
  'icon': 'toolbox-shape-rect',
  'define': {
    type: 2,
    ep: {
      type: 1
    },
    pvs: [
      { x: 0, y: 0, z: 1 },
      { x: 150, y: 0, z: 1 },
    ],
    //组合控件
    composes: [
      {
        width: 30,
        height: 30,
        id: '100120',
        cIndex: 1,
        initCPV: {
          x: 75, y: 0, z: 1
        }
      },
    ],
    //操作点
    ovs: [
      {
        x: 75, y: 0, ix: 75, iy: 0,
        //约束，控制点的移动路径和位置
        constraint: {
          type: 4,//跟随线段
          line: ["this"]//当前对象的pvs
        },
        //联动，点移动后控制的其它点
        links: [
          {
            type: 1,//同步平移
            pvs: ["composes[0]"]
          }
        ]
      }
    ]

  }
}