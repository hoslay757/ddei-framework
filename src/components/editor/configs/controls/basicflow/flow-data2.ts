export default {
  'id': '102032',
  'name': '存储数据',
  'code': 'fdata',
  'desc': '流程的数据节点',
  'from': '102030',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 70,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈采样次数
      loop: 1,
      //半径距离
      r: 50,
      //初始次采样的开始角度
      angle: 0,
      //半径距离
      //采样的规则，多组采样返回多组规则
      rules: [
        //选中区域
        `(i,j, sita, sample, pvs, model){
            let dr  = -50/ Math.cos(45 * DDeiConfig.ROTATE_UNIT)
            pvs.push({startpath:true,x:50,y:50,type:0,group:j})
            pvs.push({x:dr,y:50,type:0,group:j})
            pvs.push({x:dr,y:-50,type:0,group:j})
            pvs.push({closepath:true,x:50,y:-50,type:0,group:j})
        }`,
        //操作点
        `(i,j, sita, sample, pvs, model){
            let dr  = 50/ Math.cos(45 * DDeiConfig.ROTATE_UNIT)
            pvs.push({x:100-dr,y:0,type:0,oppoint:1,group:j})
            pvs.push({x:-dr,y:0,type:0,oppoint:1,group:j})
            pvs.push({x:0,y:50,type:0,oppoint:1,group:j})
            pvs.push({x:0,y:-50,type:0,oppoint:1,group:j})
        }`,
        //主体区域
        `(i,j, sita, sample, pvs, model){
            let dr  = 50/ Math.cos(45 * DDeiConfig.ROTATE_UNIT)
            let rad1 = 135 * DDeiConfig.ROTATE_UNIT
            let rad2 = 225 * DDeiConfig.ROTATE_UNIT
            //因为bpv在缩放时同步变大，因此会随着stageRatio变化大小
            let bpv = DDeiUtil.pointsToZero([model.bpv], model.cpv, model.rotate)[0]
            let stageRatio = model.getStageRatio()
            let scaleX = Math.abs(bpv.x / 100)/stageRatio
            let dp = DDeiUtil.getRotatedPoint({x:100*scaleX,y:0,z:1},model.rotate)
            pvs.push({begin:true,x:50,y:50,group:j})
            pvs.push({x:-50,y:50,r:dr,rad:rad1,group:j})
            pvs.push({x:-50,y:-50,type:2,r:dr,rad:rad2,direct:1,group:j})
            pvs.push({x:50,y:-50,r:dr,rad:rad2,group:j})
            pvs.push({end:true,dx:dp.x,dy:dp.y,type:2,r:dr,rad:rad1,direct:0,group:j})
        }`,
        //文本区域
        `(i,j, sita, sample, pvs, model){
            let dr  = 50/ Math.cos(45 * DDeiConfig.ROTATE_UNIT)
            pvs.push({startpath:true,x:100-dr,y:50,type:10,group:j})
            pvs.push({x:-50,y:50,type:10,group:j})
            pvs.push({x:-50,y:-50,type:10,group:j})
            pvs.push({closepath:true,x:100-dr,y:-50,type:10,group:j})
        }`,
      ],
    }
  }
}
