//拖动用于切分的操作点时，根据操作点的位置，动态修改componse控件的位置和大小
const ov_link_split_point = `(model, ov, ovd){
  //根据ov与圆心基准控件的大小，计算控件位置
  //获取Y轴的缩放比例
  let bpv = DDeiUtil.pointsToZero([model.bpv], model.cpv, model.rotate)[0]
  let scaleY = Math.abs(bpv.y / 100)
  let scaleX = Math.abs(bpv.x / 100)
  //获取当前ov的index，当前index与compose的index必须对应
  let ovIndex = model.ovs.indexOf(ov);
  let novIndex = ovIndex + 1

  let comp0 = model.composes[ovIndex]
  let comp1 = model.composes[ovIndex + 1]
  //得到当前控制点，还原到基准坐标的大小
  
  let oar = [ov]
  
  //如果是第一个点，则开始点为-50
  
  if(novIndex < model.ovs.length){
    oar.push(model.ovs[novIndex])
  }
  let opv = DDeiUtil.pointsToZero(oar, model.cpv, model.rotate)
  let opvY0 = opv[0].y / scaleY
  let sy,ey
  if(ovIndex == 0){
    sy = -50
  }else{
    let bopv = DDeiUtil.pointsToZero([model.ovs[ovIndex-1]], model.cpv, model.rotate)
    sy = bopv[0].y/scaleY
  }
  if(novIndex < model.ovs.length){
      let opvY1 = opv[1].y / scaleY
      ey = opvY1
  }else{
    ey = 50
  }

  let comp0HeightBase = opvY0-sy
  let comp1HeightBase = ey - opvY0

  let comp0CY = sy + comp0HeightBase / 2
  let comp1CY = sy + comp0HeightBase + comp1HeightBase / 2

  let cpvs = DDeiUtil.zeroToPoints([new Vector3(0, comp0CY, 1), new Vector3(0, comp1CY, 1)], model.cpv, model.rotate, scaleX, scaleY)
  //实际位移量=中心点位移量 X 2
 
  let comp0DeltaBPVX = (cpvs[0].x - comp0.cpv.x) * 2
  let comp0DeltaBPVY = (cpvs[0].y - comp0.cpv.y) * 2
  //计算位移量在原始大小中的比例

  let comp0DeltaBPVXRate = comp0DeltaBPVX / (comp0.bpv.x - comp0.cpv.x)
  let comp0DeltaBPVYRate = comp0DeltaBPVY / (comp0.bpv.y - comp0.cpv.y)
  comp0.bpv.x = (comp0.bpv.x - comp0.cpv.x) * (1 + comp0DeltaBPVXRate) + cpvs[0].x
  comp0.bpv.y = (comp0.bpv.y - comp0.cpv.y) * (1 + comp0DeltaBPVYRate) + cpvs[0].y
  comp0.cpv.x = cpvs[0].x
  comp0.cpv.y = cpvs[0].y
  
  
  


  let comp1DeltaBPVX = (cpvs[1].x - comp1.cpv.x) * 2
  let comp1DeltaBPVY = (cpvs[1].y - comp1.cpv.y) * 2

  //计算位移量在原始大小中的比例
  let comp1DeltaBPVXRate = comp1DeltaBPVX / (comp1.bpv.x - comp1.cpv.x)
  let comp1DeltaBPVYRate = comp1DeltaBPVY / (comp1.bpv.y - comp1.cpv.y)
  comp1.bpv.x = (comp1.bpv.x - comp1.cpv.x) * (1 - comp1DeltaBPVXRate) + cpvs[1].x
  comp1.bpv.y = (comp1.bpv.y - comp1.cpv.y) * (1 - comp1DeltaBPVYRate) + cpvs[1].y

  comp1.cpv.x = cpvs[1].x
  comp1.cpv.y = cpvs[1].y

  //重新初始化并采样
  comp0.initPVS();
  comp1.initPVS();
}`

export default ov_link_split_point