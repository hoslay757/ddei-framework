export default {
  'id': '100003',
  'name': '圆形',
  'code': 'circle',
  'desc': '由极坐标系构造的圆形，带有text',
  'from': '100103',
  'icon': 'toolbox-shape-rect',
  'define': {
    'ext': {
      //采样信息
      sample: {
        //采样的规则，多组采样返回多组规则
        rules: [
          //文本区域
          `(i, sample, pvs, model, ovs){
            pvs.push({x:sample.x,y:sample.y,r:sample.r,text:1});
          }`,
        ]
      }
    }
  }

}
