export default {
  'id': '102041',
  'name': '预定义流程',
  'code': 'defflow',
  'desc': '流程的子流程节点',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 160,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈采样次数
      loop: 4,
      //半径距离
      r: 50,
      //初始次采样的开始角度
      angle: 45,
      //半径距离
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i, sample, pvs, model){
            pvs.push({ begin:i==0,end:i==3,x: sample.x, y: sample.y,select:1,clip:1,stroke:1,fill:1 });
        }`,

        `(i, sample, pvs, model){
            let er  = sample.r
            let x = sample.x
            let y = sample.y
            pvs.push({x:x,y:y,r:er,type:0,oppoint:2});
             if(i ==1 || i ==3){
              let ny = er * Math.sin((sample.sita+90) * DDeiConfig.ROTATE_UNIT)
              y = (y+ny)/2
            }else{
              let nx = er * Math.cos((sample.sita+90) * DDeiConfig.ROTATE_UNIT)
              x = (x+nx)/2
            }
            pvs.push({x:x,y:y,r:er,type:0,oppoint:2});
           
        }`,


        `(i, sample, pvs, model){
          if(i == 1){
            pvs.push({begin:1, x: sample.x, y: sample.y,stroke:1});
          }else if(i == 2){
            pvs[3] = {end:1, x: sample.x, y: sample.y,stroke:1};
            pvs[1] = { x: sample.x+10, y: sample.y,stroke:1};
            pvs[2] = { x: pvs[0].x+10, y: pvs[0].y,stroke:1};
          }
        }`,

        `(i, sample, pvs, model){
            let ds = i == 1 || i ==2 ? 10: -10
            let x = sample.x+ds
            let y = sample.y
            pvs.push({ begin:i==0,end:i==3,x: x, y: y,text:1,stroke:1 });
        }`,
      ]
    }
  }
}
