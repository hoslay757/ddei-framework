export default {
  'id': '100010',
  'name': '三角形',
  'code': 'triangle',
  'desc': '由三个点构成的三角形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      eqrat: true,
      //一圈12次采样
      loop: 12,
      //初始次采样的开始角度
      angle: -90,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            if(i % 4 == 0){
              let er  = sample.r
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              pvs.push({x:x,y:y,r:er,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            if(i % 4 == 0){
              let er  = sample.r
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              pvs.push({x:x,y:y,r:er,type:0,oppoint:2,group:j});
             
            }
        }`,

        `(i,j, sita, sample, pvs, model){
            if(i % 3 == 0){
              let er = sample.r/2
              let x = er * Math.cos((sita+45) * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin((sita+45) * DDeiConfig.ROTATE_UNIT)
              pvs.push({x:x,y:y,r:er,type:10,group:j});
            }
        }`,
      ]
    }
  }
}
