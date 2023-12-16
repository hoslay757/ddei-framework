export default {
  'id': '103010',
  'name': '数据库',
  'code': 'database',
  'desc': '数据库图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 70,
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
      angle: 0,
      //半径距离
      //采样的规则，多组采样返回多组规则
      rules: [
        //确定范围
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            switch(i){
              case 1:
                pvs[0].y=y+22
                y=y+22
              break;
              case 2:
                pvs[1].x=x
                
              break;
              case 3:
                 y = y-20
                pvs[2].y=y
               x = pvs[0].x
              
              break;
            }
            pvs.push({x:x,y:y,type:0,r:er,group:j});
        }`,
        //关键点
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,type:0,oppoint:1,r:er,group:j});
             switch(i){
              case 1:
                y=y+20
              break;
              case 3:
                y=y-20
              break;
            }
            pvs.push({x:x,y:y,type:0,oppoint:1,r:er,group:j});
        }`,
        // 主体区域
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            let type = 1;
            switch(i){
              case 1:
                type = 3
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
            
            pvs.push({x:x,y:y,r:er,type:type,group:j});
        }`,


        //文本区域
        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==0 ? 0: 20
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
          x: 0, y: -35
        },
        width: 100,
        height: 30
      },
      {
        id: '100006',
        zIndex: 1,
        cpv: {
          x: 0, y: 35
        },
        width: 100,
        height: 30
      },

    ]
  }
}
