export default {
  'id': '100006',
  'name': '椭圆',
  'code': 'ellipse',
  'desc': '由极坐标系构造的椭圆形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 200,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 45,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r / Math.cos(45 * DDeiConfig.ROTATE_UNIT)+2
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            let v = new Vector3(model.cpv.x + x, model.cpv.y + y, 1);
            v.r = er
            v.type = 0
            v.group = j
            pvs.push(v);
        }`,
        `(i,j, sita, sample, pvs, model){
            if(i == 0){
              let er = sample.r
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              let v = new Vector3(model.cpv.x + x, model.cpv.y + y, 1);
              v.r = er
              v.group = j
              pvs.push(v);
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            let v = new Vector3(model.cpv.x + x, model.cpv.y + y, 1);
            v.r = er
            v.type = 10
            v.group = j
            pvs.push(v);
        }`,
      ]
    },
    textArea: [
      { x: -2.5, y: 32.5, z: 1 },
      { x: 102.5, y: 32.5, z: 1 },
      { x: 102.5, y: 142.5, z: 1 },
      { x: -2.5, y: 142.5, z: 1 },
    ],
  }
}
