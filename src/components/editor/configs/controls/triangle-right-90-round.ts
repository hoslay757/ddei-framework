export default {
  'id': '100015',
  'name': '直角三角形',
  'code': 'triangle',
  'desc': '由三个点构成的三角形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 120,
    height: 90,
    pvs: [
      { x: 0, y: 90 },
      { x: 120, y: 90 },
      { x: 120, y: 0 }
    ],
    cpv: { x: 60, y: 45 },
    textArea: [
      { x: 60, y: 45 },
      { x: 120, y: 45 },
      { x: 120, y: 90 },
      { x: 60, y: 90 },
    ],
    hpv: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ],
    border: {
      round: 5
    }
  }
}
