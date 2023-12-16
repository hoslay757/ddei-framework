export default {
  'id': '100007',
  'name': '矩形边框',
  'code': 'rect',
  'desc': '带边框的矩形',
  'from': '100002',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 80,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈采样次数
      loop: 4,
      //半径距离
      r: 50,
      //初始次采样的开始角度
      angle: 0,
      zIndex: 1,
      //半径距离
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
            let er = sample.r-10
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ],


    },
    //组合控件
    composes: [
      {
        id: '100002',
        zIndex: 2,
        cpv: {
          x: 0, y: 50
        },

        width: 140,
        height: 60,
      },
      {
        id: '100002',
        zIndex: 2,
        cpv: {
          x: 0, y: -50
        },
        width: 140,
        height: 60,
      },
    ]
  }
}
