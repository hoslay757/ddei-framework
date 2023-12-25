export default {
  'id': '100050',
  'name': '平行四边形',
  'code': 'paralgram',
  'desc': '由4个点组成的平行四边形',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
    //2为极坐标，以cpv为圆心，半径r采样获得点，在以width/100、height/100的的原始比例进行缩放
    poly: 2,
    //采样信息
    sample: {
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 0,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i, sample, pvs, model){
          switch(i){
            case 0:
              pvs.push({begin:1,x:sample.x,y:sample.y,r:sample.r,select:1,clip:1,oppoint:2,stroke:1,fill:1});
            break;
            case 1:
              pvs.push({x:sample.x,y:sample.y,r:sample.r,select:1,clip:1,oppoint:2,stroke:1,fill:1});
            break;
            case 2:
              pvs.push({x:sample.x,y:sample.y,r:sample.r,select:1,clip:1,oppoint:2,stroke:1,fill:1});
            break;
            case 3:
              pvs.push({end:1,x:sample.x,y:sample.y,r:sample.r,select:1,clip:1,oppoint:2,stroke:1,fill:1});
              pvs[0].y = pvs[1].y
              pvs[1].x = pvs[2].x
              pvs[2].y = pvs[3].y
              pvs[3].x = pvs[0].x//+(model.ovs[0].x-model.cpv.x)
              pvs[2].x = pvs[2].x//+(model.ovs[0].x-model.cpv.x)
            break;
          }
        }`

      ],
      //操作点
      ovs: [
        {
          x: 25, y: -50,
          //约束，控制点的移动路径和位置
          constraint: {
            type: 2,//矩形范围
            x0: -100,
            x1: 100,
            y0: -50,
            y1: -50,
          },
          //联动，点移动后控制的其它点
          links: [
            {
              type: 1,//同步平移
              pvs: ["pvs[2]", "pvs[3]"]
            }
          ]
        }
      ]
    },

  }
}
