export default {
  'id': '103001',
  'name': '人',
  'code': 'human',
  'desc': '人形图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 50,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    zIndex: 1,
    //采样信息
    sample: {
      //一圈采样次数
      loop: 4,
      //半径距离
      r: 50,
      //初始次采样的开始角度
      angle: 0,
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
            pvs.push({x:x,y:y,r:er,type:9,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
          if(i == 0){
            let er  = sample.r
            let x = 0
            let y = -20
            pvs.push({x:x,y:y,r:er,group:j});
            y = 10
            pvs.push({x:x,y:y,r:er,group:j});
            y += 10
            let y1= y
            let x1 = x
            pvs.push({x:x,y:y,r:er,group:j});
            x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            let y2 = er * Math.sin(90 * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y2,r:er,oppoint:1,group:j});
            pvs.push({x:x1,y:y1,type:3,r:er,group:j});
            let x3 = er * Math.cos(180 * DDeiConfig.ROTATE_UNIT)
            let y3 = er * Math.sin(180 * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x3,y:y2,r:er,oppoint:1,group:j});
            pvs.push({x:x1,y:y1,type:3,r:er,group:j});
            pvs.push({x:0,y:-10,type:3,r:er,group:j});
            pvs.push({x:x3,y:10,r:er,oppoint:1,group:j});
            pvs.push({x:0,y:-10,type:3,r:er,group:j});
            pvs.push({x:x,y:10,r:er,oppoint:1,group:j});
            pvs.push({x:0,y:-10,type:3,r:er,group:j});
          }
        }`
      ]
    },
    //组合控件
    composes: [
      {
        id: '100003',
        zIndex: 2,
        initCPV: {
          x: 0, y: -35
        },
        width: 30,
        height: 30
      },
    ]
  }
}
