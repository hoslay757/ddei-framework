export default {
  'id': '100050',
  'name': '平行四边形',
  'code': 'paralgram',
  'desc': '由4个点组成的平行四边形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 180,
    height: 80,
    pvs: [
      { begin: 1, x: 20, y: 0, stroke: 1, clip: 1, fill: 1 },
      { x: 180, y: 0 },
      { x: 160, y: 80 },
      { end: 1, x: 0, y: 80 }
    ],
    cpv: { x: 80, y: 40 },
    textArea: [
      { begin: 1, x: 20, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 80 },
      { end: 1, x: 20, y: 80 }
    ],
    hpv: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
    textStyle: {
      italic: 1
    }
  }
}
