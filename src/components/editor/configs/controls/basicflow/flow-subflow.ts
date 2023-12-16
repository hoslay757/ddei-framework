export default {
  'id': '102040',
  'name': '子流程',
  'code': 'subflow',
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
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos((sita) * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin((sita) * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y,r:er, group: j });
        }`,
        `(i,j, sita, sample, pvs, model){
            let er  = sample.r
            let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:x,y:y,r:er,type:0,oppoint:2,group:j});
             if(i ==1 || i ==3){
              let ny = er * Math.sin((sita+90) * DDeiConfig.ROTATE_UNIT)
              y = (y+ny)/2
            }else{
              let nx = er * Math.cos((sita+90) * DDeiConfig.ROTATE_UNIT)
              x = (x+nx)/2
            }
            pvs.push({x:x,y:y,r:er,type:0,oppoint:2,group:j});
           
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
