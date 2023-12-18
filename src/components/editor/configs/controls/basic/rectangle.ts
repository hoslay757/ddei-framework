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
        `(i, sample, pvs, model){
          let start = 0,end = 0
            switch(i){
              case 0:
                start = 1  
              break;
              case 1:
                pvs[0].y=sample.y
              break;
              case 2:
                pvs[1].x=sample.x
              break;
              case 3:
                pvs[2].y=sample.y 
                sample.x = pvs[0].x
                end = 1
              break;
            }
            pvs.push({begin:start,end:end,x:sample.x,y:sample.y,r:sample.r,select:1,clip:1,text:1,stroke:1,fill:1});
        }`

      ]
    }

  }

}
