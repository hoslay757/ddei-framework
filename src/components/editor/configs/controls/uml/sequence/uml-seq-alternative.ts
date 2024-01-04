import { ov_link_v_split_point, ov_link_h_split_point } from "../../../scripts/uml/ov-link-split-point"
export default {
  'id': '303007',
  'name': '替代片段',
  'code': 'alternative',
  'desc': '替代片段',
  'from': '100008',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 240,
    height: 160,
    //扩展采样信息，用于在原有的基础上增加采样，或者覆盖采样的部分信息
    ext: {
      //追加一个从中间切开的采样点，用于横向切割
      sample: {
        rules: [

          `(i, sample, pvs, model,ovs){
            if(i == 0){
             
              pvs.push({begin:1,x:-50,y:(ovs[0].y-model.cpv.y),stroke:1});
              pvs.push({x:-50,y:-50,stroke:1});
              pvs.push({x:(ovs[2].x-ovs[2].ovi.x-50),y:-50,stroke:1});
              pvs.push({x:(ovs[2].x-ovs[2].ovi.x-50),y:(ovs[0].y-model.cpv.y)-5,stroke:1});
              pvs.push({x:(ovs[2].x-ovs[2].ovi.x-50)-5,y:(ovs[0].y-model.cpv.y),stroke:1});
              pvs.push({x:-50,y:(ovs[0].y-model.cpv.y),stroke:1,end:1});
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
        width: 88,
        height: 22,
        id: '100002',
        cIndex: 1,
        text: "Alternative",
        textStyle: {
          autoScaleFill: 1,
          align: 1
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: -70, y: -68
        }
      },
      {
        width: 230,
        height: 65,
        id: '100002',
        cIndex: 1,
        text: `[Condition]`,
        textStyle: {
          align: 1,
          feed: 1,
          autoScaleFill: 1,
          vspace: 2,
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: 0, y: -22.5
        }
      },
      {
        width: 230,
        height: 65,
        id: '100002',
        cIndex: 1,
        text: `[Else]`,
        textStyle: {
          align: 1,
          feed: 1,
          autoScaleFill: 1,
          vspace: 2,
        },
        fill: {
          disabled: true
        },
        border: {
          disabled: true
        },
        initCPV: {
          x: 0, y: 45
        }
      },
    ],
    //操作点定义
    ovs: [
      //定义标题区域的高度控制点
      {
        x: -31.25, y: -35, ix: -31.25, iy: -50,
        type: 1, //纵向分割点
        constraint: {
          type: 2,
          x0: -31.25,
          x1: -31.25,
          y0: -50,
          y1: -20
        },
        //联动，控制第一个和第二个composes[0]的大小
        //这里计算较为复杂，需要用脚本来进行控制
        links: [
          {
            type: 99,//执行脚本
            script: ov_link_v_split_point,
            //参数可以自定义，脚本中可以取到
            models: ["composes[0]"],
            nextModels: ["composes[1]"]
          }
        ]
      },
      //定义属性区的高度控制点
      {
        x: 0, y: 6, ix: 0, iy: 6,
        type: 1, //纵向分割点
        constraint: {
          type: 2,
          x0: 0,
          x1: 0,
          y0: -35,
          y1: 50
        },
        //联动，控制第一个和第二个composes[0]的大小
        //这里计算较为复杂，需要用脚本来进行控制
        links: [
          {
            type: 99,//执行脚本
            script: ov_link_v_split_point,
            //参数可以自定义，脚本中可以取到
            models: ["composes[1]"],
            nextModels: ["composes[2]"]
          }
        ]
      },
      //上方标题的区域宽度控制点
      {
        x: -10, y: -43.75, ix: -50, iy: -43.75,
        type: 2, //横向分割点
        constraint: {
          type: 2,
          x0: -40,
          x1: 40,
          y0: -43.75,
          y1: -43.75
        },
        //联动，控制第一个和第二个composes的大小
        //这里计算较为复杂，需要用脚本来进行控制
        links: [
          {
            type: 99,//执行脚本
            script: ov_link_h_split_point,
            //参数可以自定义，脚本中可以取到
            models: ["composes[0]"],
            nextModels: []
          }
        ]
      }
    ]
  }

}
