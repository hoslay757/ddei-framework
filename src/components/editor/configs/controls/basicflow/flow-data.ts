export default {
  'id': '102030',
  'name': '数据',
  'code': 'fdata',
  'desc': '流程的数据节点',
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
            let ds = i == 2 || i ==3 ? 5: -5
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)+ds
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,r:er, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
            let ds = i == 1 || i ==2 ? 5: -5
            let er = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)+ds
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,type:10, group: j });
        }`,
      ]
    }
  }
}
