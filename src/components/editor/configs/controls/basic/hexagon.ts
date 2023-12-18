export default {
  'id': '100030',
  'name': '六边形',
  'code': 'hexagon',
  'desc': '由六个点构成的六边形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 200,
    height: 173.2,
    pvs: [
      { begin: 1, x: 50, y: 0, z: 1, stroke: 1, clip: 1, fill: 1 },
      { x: 150, y: 0, z: 1 },
      { x: 200, y: 86.6, z: 1 },
      { x: 150, y: 173.2, z: 1 },
      { x: 50, y: 173.2, z: 1 },
      { end: 1, x: 0, y: 86.6, z: 1 },
    ],
    cpv: { x: 100, y: 86.6, z: 1 },
    textArea: [
      { begin: 1, x: 25, y: 41.6, z: 1 },
      { x: 175, y: 41.6, z: 1 },
      { x: 175, y: 131.6, z: 1 },
      { end: 1, x: 25, y: 131.6, z: 1 },
    ],
    hpv: [
      { x: 50, y: 0, z: 1 },
      { x: 150, y: 0, z: 1 },
    ]
  }
}
