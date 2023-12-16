export default {
  'id': '100003',
  'name': '圆形',
  'code': 'circle',
  'desc': '由极坐标系构造的圆形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
    //2为极坐标，以cpv为圆心，半径r采样获得点，在以width/100、height/100的的原始比例进行缩放
    poly: 2,
    //采样信息
    sample: {
      //锁定比例
      eqrat: true,
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 45,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r / Math.cos(45 * DDeiConfig.ROTATE_UNIT) + 2
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r 
            let x = er * Math.cos((sita+45) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita+45) * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,oppoint:1,group:j});
            if(i == 3){
              pvs.push({x:0,y:0,r:er,type:0,oppoint:3,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            if(i == 0){
              let er = sample.r
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              pvs.push({r:er,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:10,group:j});
        }`,
      ]
    }
  }
}
