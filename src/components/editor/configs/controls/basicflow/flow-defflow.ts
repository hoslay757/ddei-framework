export default {
  'id': '102041',
  'name': '预定义流程',
  'code': 'defflow',
  'desc': '流程的子流程节点',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 150,
    height: 90,
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
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,r:er, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
          if(i == 1){
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,r:er, group: j });
          }else if(i == 2){
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)
            pvs[3] = { x: x, y: y,r:er, group: j };
            pvs[1] = { x: x+10, y: y,r:er, group: j };
            pvs[2] = { x: pvs[0].x+10, y: pvs[0].y,r:er, group: j };
          }
        }`,
        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==2 ? 10: -10
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)+ds
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==2 ? 10: -10
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)+ds
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ]
    }
  }
}
