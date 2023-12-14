export default {
  'id': '100075',
  'name': '六芒星',
  'code': 'hexstar',
  'desc': '由极坐标系构造的六芒星',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈6次采样
      loop: 12,
      //初始次采样的开始角度
      angle: -90,
      //半径距离
      r: 80,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er = i%2 == 0 ? sample.r : sample.r * 0.58
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
          if(i % 2 == 1){
            let er = sample.r * 0.58
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y, group: j });
          }
        }`,
        `(i,j, sita, sample, pvs, model){
          if(i % 2 == 0 && i != 6 && i !=0){
            let er = sample.r * 0.5
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,type:10, group: j });
          }
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
