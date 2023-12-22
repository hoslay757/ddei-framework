export default {
  'id': '305003',
  'name': '包',
  'code': 'pkg',
  'desc': '包',
  'from': '100500',
  'icon': 'toolbox-shape-square',
  'define': {
    width: 200,
    height: 160,
    //2为极坐标，以cpv为圆心，半径r采样获得点，在以width/100、height/100的的原始比例进行缩放
    poly: 2,
    //采样信息
    sample: {
      eqrat: false,
      //只采样一次
      loop: 1,
      //初始次采样的开始角度
      angle: 0,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        //选中区域
        `(i, sample, pvs, model){
            pvs.push({begin:1,x:50,y:50,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:-50,y:50,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:-50,y:-38,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:-50,y:-50,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:-10,y:-50,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:-10,y:-38,stroke:1,fill:1,clip:1,oppoint:2,select:1});
            pvs.push({x:50,y:-38,stroke:1,fill:1,clip:1,oppoint:2,select:1,end:1});
        }`,
        `(i, sample, pvs, model){
            pvs.push({begin:1,x:-50,y:-38,stroke:1,type:1});
            pvs.push({end:1,x:50,y:-38,stroke:1,type:1});
            
        }`,
      ],


    },
    // 组合控件
    composes: [
      {
        width: 80,
        height: 20,
        id: '100002',
        cIndex: 2,
        text: "Package",
        fill: { disabled: true },
        border: { disabled: true },
        initCPV: {
          x: -60, y: -70
        }
      },
      {
        width: 200,
        height: 140,
        id: '100002',
        cIndex: 2,
        fill: { disabled: true },
        border: { disabled: true },
        text: "Attribute",
        textStyle: {
          feed: 1
        },
        initCPV: {
          x: 0, y: 10
        }
      },
    ]
  }

}

