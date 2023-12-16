export default {
  'id': '100002',
  'name': '长方形',
  'code': 'rect',
  'desc': '由4个点组成的长方形',
  'from': '100001',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      eqrat: false,
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 0,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            switch(i){
              case 1:
                pvs[0].y=y
              break;
              case 2:
                pvs[1].x=x
              break;
              case 3:
                pvs[2].y=y 
               x = pvs[0].x
              break;
            }
            pvs.push({x:x,y:y,r:er,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            switch(i){
              case 1:
                pvs[0].y=y
              break;
              case 2:
                pvs[1].x=x
              break;
              case 3:
                pvs[2].y=y 
               x = pvs[0].x
              break;
            }
            pvs.push({x:x,y:y,r:er,type:10,group:j});
        }`,
      ]
    }

  }

}
