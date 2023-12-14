export default {
  'id': '100060',
  'name': '梯形',
  'code': 'trapezoid',
  'desc': '由4个点组成的梯形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    pvs: [
      { x: 20, y: 0 },
      { x: 140, y: 0 },
      { x: 160, y: 80 },
      { x: 0, y: 80 }
    ],
    cpv: { x: 80, y: 40 },
    textArea: [
      { x: 20, y: 0 },
      { x: 140, y: 0 },
      { x: 140, y: 80 },
      { x: 20, y: 80 }
    ],
    hpv: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]
  }
}
