export default {
  'id': '102032',
  'name': '存储数据',
  'code': 'fdata',
  'desc': '流程的数据节点',
  'from': '102030',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
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
            pvs.push({x:x,y:y,r:er,type:0,group:j});
        }`,
        //主体区域
        `(i,j, sita, sample, pvs, model){
            if(i == 0){
              let path = "M 100 100 L 0 100 L 0 0 L 100 0";
              pvs.push({type:8,path:path,group:j});
            }
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
      ],
    }
  }
}
