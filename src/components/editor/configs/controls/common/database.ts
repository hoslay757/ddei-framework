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
    zIndex: 2,
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
            if(i == 2 || i ==0){
              sita += 45
            }
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            if(i ==1 || i ==3){
              let ny = er * Math.sin((sita+90) * DDeiConfig.ROTATE_UNIT)
              y = (y+ny)/2
            }
            pvs.push({ x: x, y: y,r:er,type:0,oppoint:1, group: j });
            if(i == 0){
              pvs.push({ x: 0, y: 0,r:er,type:0,oppoint:1, group: j });
            }
        }`,

        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let rad = (sita) * DDeiConfig.ROTATE_UNIT
            let x = er * Math.cos(rad)
            let y = er * Math.sin(rad)
            let type = 1;
            let direct =0;
            if(i == 3){
              type = 2
              direct = 1
            }
            pvs.push({ x: x, y: y,type:type,r:er,rad:rad,direct:direct, group: j });
           
        }`,

        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==0 ? 0: 12
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)+ds
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ]
    },
    //组合控件
    composes: [
      {
        id: '100006',
        zIndex: 3,
        cpv: {
          x: 0, y: -28
        },
        width: 70.5,
        height: 5
      },


      {
        id: '100006',
        zIndex: 1,
        cpv: {
          x: 50, y: -28
        },
        width: 70.5,
        height: 5
      },



    ]
  }
}
