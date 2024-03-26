//用于拖动纵向切分操作点时，根据操作点的位置，动态修改componse控件的位置和大小
const ov_link_v_split_point = `(model, ov, ovd,link){
  //根据ov与圆心基准控件的大小，计算控件位置
  //获取Y轴的缩放比例
  let bpv = DDeiUtil.pointsToZero([model.bpv], model.cpv, model.rotate)[0]
  let scaleY = Math.abs(bpv.y / 100)
  let scaleX = Math.abs(bpv.x / 100)
  //获取当前ov的index，当前index与compose的index必须对应
  let ovs = DDeiUtil.getOVSByType(model,1);
  let ovIndex = ovs.indexOf(ov);
  let novIndex = ovIndex + 1


  //得到当前控制点，还原到基准坐标的大小
  
  let oar = [ov]
  
  //如果是第一个点，则开始点为-50
  
  if(novIndex < ovs.length){
    oar.push(ovs[novIndex])
  }
  let opv = DDeiUtil.pointsToZero(oar, model.cpv, model.rotate)
  let opvY0 = opv[0].y / scaleY
  let sy,ey
  if(ovIndex == 0){
    sy = -50
  }else{
    let bopv = DDeiUtil.pointsToZero([ovs[ovIndex-1]], model.cpv, model.rotate)
    sy = bopv[0].y/scaleY
  }
  if(novIndex < ovs.length){
      let opvY1 = opv[1].y / scaleY
      ey = opvY1
  }else{
    ey = 50
  }

  
  let comp0HeightBase = opvY0-sy
  let comp1HeightBase = ey - opvY0

  let comp0CY = sy + comp0HeightBase / 2
  let comp1CY = sy + comp0HeightBase + comp1HeightBase / 2

  let models = link.models
  let comps0 = []
  let compsCPVS0 = []
  models?.forEach(comp0Path => {
    let comp0 = DDeiUtil.getDataByPathList(model, comp0Path)
    compsCPVS0.push(comp0.cpv)
    comps0.push(comp0)
  });
  let compCPVS0 = DDeiUtil.pointsToZero(compsCPVS0, model.cpv, model.rotate)
  let vs0 = []
  compCPVS0?.forEach(vs => {
    vs0.push(new Vector3(vs.x/scaleX, comp0CY, 1))
  });
  let cpvs = DDeiUtil.zeroToPoints(vs0, model.cpv, model.rotate, scaleX, scaleY)
  for(let i = 0;i < comps0.length;i++){
    let comp0 = comps0[i]
    //composes的cpv归零0坐标,如果compse的X坐标不为0，则需要考虑旋转后X增量带来的Y变化
    //实际位移量=中心点位移量 X 2
    let comp0DeltaBPVX = (cpvs[i].x - comp0.cpv.x) * 2
    let comp0DeltaBPVY = (cpvs[i].y - comp0.cpv.y) * 2
    //计算位移量在原始大小中的比例

    let comp0DeltaBPVXRate = comp0DeltaBPVX / (comp0.bpv.x - comp0.cpv.x)
    let comp0DeltaBPVYRate = comp0DeltaBPVY / (comp0.bpv.y - comp0.cpv.y)

    comp0.bpv.x = (comp0.bpv.x - comp0.cpv.x) * (1 + comp0DeltaBPVXRate) + cpvs[i].x
    comp0.bpv.y = (comp0.bpv.y - comp0.cpv.y) * (1 + comp0DeltaBPVYRate) + cpvs[i].y
    comp0.cpv.x = cpvs[i].x
    comp0.cpv.y = cpvs[i].y
    //重新初始化并采样
    comp0.initPVS();
  }


  let nextModels = link.nextModels
  let comps1 = []
  let compsCPVS1 = []
  nextModels?.forEach(comp1Path => {
    let comp1 = DDeiUtil.getDataByPathList(model, comp1Path)
    compsCPVS1.push(comp1.cpv)
    comps1.push(comp1)
  });
  let compCPVS1 = DDeiUtil.pointsToZero(compsCPVS1, model.cpv, model.rotate)
  let vs1 = []
  compCPVS1?.forEach(vs => {
    vs1.push(new Vector3(vs.x/scaleX, comp1CY, 1))
  });
  cpvs = DDeiUtil.zeroToPoints(vs1, model.cpv, model.rotate, scaleX, scaleY)

  for(let i = 0;i < comps1.length;i++){
    let comp1 = comps1[i]
    //composes的cpv归零0坐标,如果compse的X坐标不为0，则需要考虑旋转后X增量带来的Y变化
    let compCPVS = DDeiUtil.pointsToZero([comp1.cpv], model.cpv, model.rotate)

    let comp1DeltaBPVX = (cpvs[i].x - comp1.cpv.x) * 2
    let comp1DeltaBPVY = (cpvs[i].y - comp1.cpv.y) * 2

    //计算位移量在原始大小中的比例
    let comp1DeltaBPVXRate = comp1DeltaBPVX / (comp1.bpv.x - comp1.cpv.x)
    let comp1DeltaBPVYRate = comp1DeltaBPVY / (comp1.bpv.y - comp1.cpv.y)
    comp1.bpv.x = (comp1.bpv.x - comp1.cpv.x) * (1 - comp1DeltaBPVXRate) + cpvs[i].x
    comp1.bpv.y = (comp1.bpv.y - comp1.cpv.y) * (1 - comp1DeltaBPVYRate) + cpvs[i].y

    comp1.cpv.x = cpvs[i].x
    comp1.cpv.y = cpvs[i].y

    //重新初始化并采样
    comp1.initPVS();
  }
}`

//用于拖动横向切分操作点时，根据操作点的位置，动态修改componse控件的位置和大小
const ov_link_h_split_point = `(model, ov, ovd, link){
  //根据ov与圆心基准控件的大小，计算控件位置
  //获取Y轴的缩放比例
  let bpv = DDeiUtil.pointsToZero([model.bpv], model.cpv, model.rotate)[0]
  let scaleY = Math.abs(bpv.y / 100)
  let scaleX = Math.abs(bpv.x / 100)
  //获取当前ov的index，当前index与compose的index必须对应
  let ovs = DDeiUtil.getOVSByType(model,2);
  let ovIndex = ovs.indexOf(ov);
  let novIndex = ovIndex + 1
  //得到当前控制点，还原到基准坐标的大小
  
  let oar = [ov]
  
  //如果是第一个点，则开始点为-50
  
  if(novIndex < ovs.length){
    oar.push(ovs[novIndex])
  }
  let opv = DDeiUtil.pointsToZero(oar, model.cpv, model.rotate)
  let opvX0 = opv[0].x / scaleX
  let sx,ex
  if(ovIndex == 0){
    sx = -50
  }else{
    let bopv = DDeiUtil.pointsToZero([ovs[ovIndex-1]], model.cpv, model.rotate)
    sx = bopv[0].x/scaleX
  }
  if(novIndex < ovs.length){
    let opvX1 = opv[1].x / scaleX
    ex = opvX1
  }else{
    ex = 50
  }

  
  let comp0Base = opvX0-sx
  let comp1Base = ex - opvX0

  let comp0CX = sx + comp0Base / 2
  let comp1CX = sx + comp0Base + comp1Base / 2

  let models = link.models
  let comps0 = []
  let compsCPVS0 = []
  models?.forEach(comp0Path => {
    let comp0 = DDeiUtil.getDataByPathList(model, comp0Path)
    compsCPVS0.push(comp0.cpv)
    comps0.push(comp0)
  });

  let compCPVS0 = DDeiUtil.pointsToZero(compsCPVS0, model.cpv, model.rotate)
  let vs0 = []
  compCPVS0?.forEach(vs => {
    vs0.push(new Vector3(comp0CX, vs.y/scaleY , 1))
  });
  let cpvs = DDeiUtil.zeroToPoints(vs0, model.cpv, model.rotate, scaleX, scaleY)
  for(let i = 0;i < comps0.length;i++){
    let comp0 = comps0[i]
    //composes的cpv归零0坐标,如果compse的X坐标不为0，则需要考虑旋转后X增量带来的Y变化
    //实际位移量=中心点位移量 X 2
    let comp0DeltaBPVX = (cpvs[i].x - comp0.cpv.x) * 2
    let comp0DeltaBPVY = (cpvs[i].y - comp0.cpv.y) * 2
    //计算位移量在原始大小中的比例

    let comp0DeltaBPVXRate = comp0DeltaBPVX / (comp0.bpv.x - comp0.cpv.x)
    let comp0DeltaBPVYRate = comp0DeltaBPVY / (comp0.bpv.y - comp0.cpv.y)

    comp0.bpv.x = (comp0.bpv.x - comp0.cpv.x) * (1 + comp0DeltaBPVXRate) + cpvs[i].x
    comp0.bpv.y = (comp0.bpv.y - comp0.cpv.y) * (1 + comp0DeltaBPVYRate) + cpvs[i].y
    comp0.cpv.x = cpvs[i].x
    comp0.cpv.y = cpvs[i].y
    //重新初始化并采样
    comp0.initPVS();
  }


  let nextModels = link.nextModels
  let comps1 = []
  let compsCPVS1 = []

  nextModels?.forEach(comp1Path => {
    let comp1 = DDeiUtil.getDataByPathList(model, comp1Path)
    compsCPVS1.push(comp1.cpv)
    comps1.push(comp1)
  });
  let compCPVS1 = DDeiUtil.pointsToZero(compsCPVS1, model.cpv, model.rotate)
  let vs1 = []
  compCPVS1?.forEach(vs => {
    vs1.push(new Vector3(comp1CX,vs.y/scaleY, 1))
  });
  cpvs = DDeiUtil.zeroToPoints(vs1, model.cpv, model.rotate, scaleX, scaleY)

  for(let i = 0;i < comps1.length;i++){
    let comp1 = comps1[i]
    //composes的cpv归零0坐标,如果compse的X坐标不为0，则需要考虑旋转后X增量带来的Y变化
    let compCPVS = DDeiUtil.pointsToZero([comp1.cpv], model.cpv, model.rotate)

    let comp1DeltaBPVX = (cpvs[i].x - comp1.cpv.x) * 2
    let comp1DeltaBPVY = (cpvs[i].y - comp1.cpv.y) * 2

    //计算位移量在原始大小中的比例
    let comp1DeltaBPVXRate = comp1DeltaBPVX / (comp1.bpv.x - comp1.cpv.x)
    let comp1DeltaBPVYRate = comp1DeltaBPVY / (comp1.bpv.y - comp1.cpv.y)
    comp1.bpv.x = (comp1.bpv.x - comp1.cpv.x) * (1 - comp1DeltaBPVXRate) + cpvs[i].x
    comp1.bpv.y = (comp1.bpv.y - comp1.cpv.y) * (1 - comp1DeltaBPVYRate) + cpvs[i].y

    comp1.cpv.x = cpvs[i].x
    comp1.cpv.y = cpvs[i].y

    //重新初始化并采样
    comp1.initPVS();
  }
}`

export default ov_link_v_split_point
export { ov_link_v_split_point, ov_link_h_split_point }