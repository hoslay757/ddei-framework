export default {
  'id': '103010',
  'name': '数据库',
  'code': 'database',
  'desc': '数据库图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 50,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈采样次数
      loop: 4,
      //半径距离
      r: 50,
      //初始次采样的开始角度
      angle: 45,
      //半径距离
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let ds = i == 1 || i ==0 ? 18: -18
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)+ds
            pvs.push({ x: x, y: y,r:er,type:0, group: j });
        }`,

        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let rad = (sita) * DDeiConfig.ROTATE_UNIT
            let x = er * Math.cos(rad)
            let y = er * Math.sin(rad)
            let type = 1;
            let direct =0;
            if(i == 1 || i == 3){
              type = 2
              direct = 1
            }
            pvs.push({ x: x, y: y,type:type,r:er,rad:rad,direct:direct, group: j });
            if(i == 3){
              let uPvs = pvs[pvs.length-2];
              let lPvs = pvs[pvs.length-1];
              pvs.push({ x: uPvs.x, y: uPvs.y,type:type,r:er,rad:uPvs.rad,direct:0,m:1, group: j });
              pvs.push({ x: x, y: y,type:type,r:er,rad:rad,direct:direct, group: j });
            }
        }`,

        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==0 ? 0: 12
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)+ds
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ]
    }
  }
}
