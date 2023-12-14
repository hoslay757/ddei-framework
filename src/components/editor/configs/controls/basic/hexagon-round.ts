export default {
  'id': '100031',
  'name': '六边形',
  'code': 'hexagon',
  'desc': '由六个点构成的六边形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 200,
    height: 173.2,
    pvs: [
      { x: 50, y: 0, z: 1 },
      { x: 150, y: 0, z: 1 },
      { x: 200, y: 86.6, z: 1 },
      { x: 150, y: 173.2, z: 1 },
      { x: 50, y: 173.2, z: 1 },
      { x: 0, y: 86.6, z: 1 },
    ],
    cpv: { x: 100, y: 86.6, z: 1 },
    textArea: [
      { x: 25, y: 41.6, z: 1 },
      { x: 175, y: 41.6, z: 1 },
      { x: 175, y: 131.6, z: 1 },
      { x: 25, y: 131.6, z: 1 },
    ],
    hpv: [
      { x: 50, y: 0, z: 1 },
      { x: 150, y: 0, z: 1 },
    ],
    border: {
      round: 5
    }
  }
}
