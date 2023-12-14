export default {
  'id': '103001',
  'name': '人',
  'code': 'human',
  'desc': '人形图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 50,
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
        `(i,j, sita, sample, pvs, model){
            let ds = i == 0 || i ==1 ? 20: 0
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)+ds
            pvs.push({ x: x, y: y,r:er,type:9, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
         
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,r:er,oppoint:1, group: j });
        }`,

        `(i,j, sita, sample, pvs, model){
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            if( i == 0 || i ==1){
              y+=20
            }else{
             y=pvs[0].y-20
            }
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ]
    }
  }
}
