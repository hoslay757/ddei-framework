export default {
  'id': '102091',
  'name': '结束',
  'code': 'end',
  'desc': '流程的开始节点',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 40,
    height: 40,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈4次采样
      loop: 4,
      //初始次采样的开始角度
      angle: 45,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r / Math.cos(45 * DDeiConfig.ROTATE_UNIT) + 2
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos((sita+45) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita+45) * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,oppoint:1,group:j});
        }`,
        `(i,j, sita, sample, pvs, model){
            if(i == 0){
              let er = sample.r
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              pvs.push({r:er,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            if(i == 0){
              let er = sample.r -10
              let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
              let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
              pvs.push({r:er,group:j});
            }
        }`,
        `(i,j, sita, sample, pvs, model){
            let er = sample.r-10
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:10,group:j});
        }`,
      ]
    }
  }
}
