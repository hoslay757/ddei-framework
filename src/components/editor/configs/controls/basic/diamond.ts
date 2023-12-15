export default {
  'id': '100040',
  'name': '菱形',
  'code': 'diamond',
  'desc': '标准的菱形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: -90,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,oppoint:2,group:j});
            if(i == 3){
              pvs.push({x:0,y:0,r:er,type:0,oppoint:3,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            let er = sample.r/2
            let x = er * Math.cos((sita+45) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita+45) * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:10,group:j});
        }`,
      ]
    }
  }
}

