export default {
  'id': '100004',
  'name': '圆角正方形',
  'code': 'square',
  'desc': '由4个点组成的正方形',
  'from': '100500',
  'icon': 'toolbox-shape-square',
  'define': {
    width: 100,
    height: 100,
    pvs: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    cpv: { x: 50, y: 50 },
    textArea: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    hpv: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
    border: {
      round: 5
    }
  }
}
