export default {
  'id': '103002',
  'name': '人',
  'code': 'human',
  'desc': '人形图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 60,
    height: 85,
    //2为极坐标，缺省点为原点
    poly: 2,
    cIndex: 1,
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
        `(i, sample, pvs, model){
            let x = sample.x
            let y = sample.y
            switch(i){
              case 1:
                y = y-20
                pvs[0].y=y
              break;
              case 2:
                pvs[1].x=x
              break;
              case 3:
                y = y-12
                pvs[2].y=y
               x = pvs[0].x
              break;
            }
            pvs.push({begin:i==0,end:i==3,x:x,y:y,select:1,clip:1});
        }`,

      ]
    },
    //组合控件
    composes: [
      {
        id: '100003',
        cIndex: 2,
        initCPV: {
          x: 0, y: -35
        },
        width: 35,
        height: 35
      },
      {
        id: '100002',
        cIndex: 1,
        width: 60,
        height: 50,
        border: {
          round: 15
        }
      },
    ]
  }
}
