export default {
  'id': '103010',
  'name': '数据库',
  'code': 'database',
  'desc': '数据库图标',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 70,
    //2为极坐标，缺省点为原点
    poly: 2,
    cIndex: 2,
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
        `(i, sample, pvs, model){
            let dn = 22;
            pvs.push({begin:1,x:50,y:50+dn,select:1,clip:1})
            pvs.push({x:-50,y:50+dn,select:1,clip:1})
            pvs.push({x:-50,y:-50-dn,select:1,clip:1})
            pvs.push({end:1,x:50,y:-50-dn,select:1,clip:1})
        }`,
        //操作点
        `(i, sample, pvs, model){
            let dn = 22;
            pvs.push({begin:1,x:50,y:0,oppoint:1})
            pvs.push({x:0,y:50+dn,oppoint:1})
            pvs.push({x:-50,y:0,oppoint:1})
            pvs.push({end:1,x:0,y:-50-dn,oppoint:1})
        }`,
        //绘制线段区域
        `(i, sample, pvs, model){
            pvs.push({begin:1,x:50,y:50,stroke:1})
            pvs.push({x:-50,y:50,stroke:1,type:3})
            pvs.push({x:-50,y:-50,stroke:1})
            pvs.push({x:50,y:-50,stroke:1,type:3})
            pvs.push({x:50,y:50,stroke:1})
        }`,
        //填充区域
        `(i, sample, pvs, model){
            pvs.push({begin:1,x:50,y:50,fill:1})
            pvs.push({x:-50,y:50,fill:1})
            pvs.push({x:-50,y:-50,fill:1})
            pvs.push({end:1,x:50,y:-50, fill:1})
        }`,
        //文本区域
        `(i, sample, pvs, model){
            let dn = 20;
            pvs.push({begin:1,x:50,y:50,text:1})
            pvs.push({x:-50,y:50,text:1})
            pvs.push({x:-50,y:-50+dn,text:1})
            pvs.push({end:1,x:50,y:-50+dn,text:1})
        }`,
      ]
    },
    //组合控件
    composes: [
      {
        id: '100006',
        cIndex: 3,
        initCPV: {
          x: 0, y: -35
        },
        width: 100,
        height: 30
        , attrLinks: [
          { code: "border", mapping: ["*"] },
          { code: "fill", mapping: ["*"] },
        ]
      },
      {
        id: '100006',
        cIndex: 1,
        initCPV: {
          x: 0, y: 35
        },
        width: 100,
        height: 30
        , attrLinks: [
          { code: "border", mapping: ["*"] },
          { code: "fill", mapping: ["*"] },
        ]
      },

    ]
  }
}
