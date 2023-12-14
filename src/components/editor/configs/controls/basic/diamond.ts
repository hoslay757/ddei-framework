export default {
  'id': '100040',
  'name': '菱形',
  'code': 'diamond',
  'desc': '标准的菱形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    pvs: [
      { x: 80, y: 0, z: 1 },
      { x: 160, y: 40, z: 1 },
      { x: 80, y: 80, z: 1 },
      { x: 0, y: 40, z: 1 }
    ],
    cpv: { x: 80, y: 40, z: 1 },
    textArea: [
      { x: 40, y: 20, z: 1 },
      { x: 120, y: 20, z: 1 },
      { x: 120, y: 60, z: 1 },
      { x: 40, y: 60, z: 1 }
    ],
    hpv: [
      { x: 80, y: 0, z: 1 },
      { x: 90, y: 0, z: 1 },
    ]
  }
}
