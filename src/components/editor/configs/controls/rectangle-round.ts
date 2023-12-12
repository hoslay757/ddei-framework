export default {
  'id': '100005',
  'name': '圆角矩形',
  'code': 'rect',
  'desc': '由4个点组成的矩形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    pvs: [
      { x: 0, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 80 },
      { x: 0, y: 80 }
    ],
    cpv: { x: 80, y: 40 },
    textArea: [
      { x: 0, y: 0 },
      { x: 160, y: 0 },
      { x: 160, y: 80 },
      { x: 0, y: 80 }
    ],
    hpv: [
      { x: 0, y: 0 },
      { x: 160, y: 0 },
    ],
    border: {
      round: 5
    }
  }
}
