export default {
  'id': '100006',
  'name': '椭圆',
  'code': 'ellipse',
  'desc': '由极坐标系构造的椭圆形',
  'from': '100003',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 200,
    height: 100,
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
            let er  = sample.r / Math.cos(45 * DDeiConfig.ROTATE_UNIT) + 2
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,group:j});
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
