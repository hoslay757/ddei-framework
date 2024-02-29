export default {
  'id': '102057',
  'name': '手动操作',
  'code': 'fmo',
  'desc': '由人工手动完成的节点',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 140,
    height: 70,
    //2为极坐标，以cpv为圆心，半径r采样获得点，在以width/100、height/100的的原始比例进行缩放
    poly: 2,
    //采样信息
    sample: {
      eqrat: true,
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 0,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i, sample, pvs, model, ovs){
          let start = 0,end = 0
            switch(i){
              case 0:
                start = 1  
                sample.x -= 20
              break;
              case 1:
                pvs[0].y=sample.y
              break;
              case 2:
                pvs[1].x = sample.x+20
              break;
              case 3:
                pvs[2].y=sample.y 
                sample.x = pvs[0].x+20
                end = 1
              break;
            }
            pvs.push({begin:start,end:end,x:sample.x,y:sample.y,oppoint:2,op2close:i == 3 ? 1 :0,select:1,clip:1,stroke:1,fill:1});
        }`,

        `(i, sample, pvs, model, ovs){
          let start = 0,end = 0
            switch(i){
              case 0:
                start = 1  
              break;
              case 1:
                pvs[0].y=sample.y
              break;
              case 2:
                sample.x +=20
                pvs[1].x = sample.x
              break;
              case 3:
                pvs[2].y=sample.y 
                sample.x = pvs[0].x
                end = 1
              break;
            }
            pvs.push({begin:start,end:end,x:sample.x,y:sample.y,text:1});
        }`

      ]
    }
  }
}
