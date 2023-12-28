import ov_link_split_point from "../../../scripts/uml/ov-link-split-point"
export default {
  'id': '307001',
  'name': '类',
  'code': 'cls',
  'desc': 'UML的类节点',
  'from': '100008',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 230,
    height: 160,
    border: {
      round: 5
    },
    //扩展采样信息，用于在原有的基础上增加采样，或者覆盖采样的部分信息
    ext: {
      //追加一个从中间切开的采样点，用于横向切割
      sample: {
        rules: [
          `(i, sample, pvs, model,ovs){
            if(i == 0){
              pvs.push({begin:1,x:-50,y:(ovs[0].y-model.cpv.y),stroke:1,type:1});
              pvs.push({end:1,x:50,y:(ovs[0].y-model.cpv.y),stroke:1,type:1});
            }
          }`,
          `(i, sample, pvs, model,ovs){
            if(i == 0){
              pvs.push({begin:1,x:-50,y:(ovs[1].y-model.cpv.y),stroke:1,type:1});
              pvs.push({end:1,x:50,y:(ovs[1].y-model.cpv.y),stroke:1,type:1});
            }
          }`
        ]
      }
    },
    //组合控件
    composes: [
      {
        width: 230,
        height: 30,
        id: '100002',
        cIndex: 1,
        text: "类名",
        textStyle: {
          bold: 1,
          autoScaleFill: 1
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: 0, y: -65
        }
      },
      {
        width: 230,
        height: 64,
        id: '100002',
        cIndex: 1,
        text: ` + attribute1:type = defaultValue
 + attribute2: type 
 - attribute3: type`,
        textStyle: {
          align: 1,
          feed: 1,
          autoScaleFill: 1
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: 0, y: -17
        }
      },
      {
        width: 230,
        height: 64,
        id: '100002',
        cIndex: 1,
        text: ` + operation1(params):returnType
 - operation2(params)
 - operation3()`,
        textStyle: {
          align: 1,
          feed: 1,
          autoScaleFill: 1
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: 0, y: 47
        }
      },
    ],
    //操作点定义
    ovs: [
      //定义标题区域的高度控制点
      {
        x: 0, y: -31, ix: 0, iy: -50,
        constraint: {
          type: 2,
          x0: 0,
          x1: 0,
          y0: -50,
          y1: -20
        },
        //联动，控制第一个和第二个composes[0]的大小
        //这里计算较为复杂，需要用脚本来进行控制
        links: [
          {
            type: 99,//执行脚本
            script: ov_link_split_point
          }
        ]
      },
      //定义属性区的高度控制点
      {
        x: 0, y: 9.375, ix: 0, iy: 9.375,
        constraint: {
          type: 2,
          x0: 0,
          x1: 0,
          y0: -31,
          y1: 50
        },
        //联动，控制第一个和第二个composes[0]的大小
        //这里计算较为复杂，需要用脚本来进行控制
        links: [
          {
            type: 99,//执行脚本
            script: ov_link_split_point
          }
        ]
      }
    ]
  }

}
