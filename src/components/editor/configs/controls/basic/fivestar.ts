import DDeiConfig from '@/components/framework/js/config';
import type DDeiAbstractShape from '@/components/framework/js/models/shape';
import { Vector3 } from 'three';

export default {
  'id': '100070',
  'name': '五角星',
  'code': 'fivestar',
  'desc': '由极坐标系构造的五角星',
  'from': '100500',
  'icon': 'toolbox-shape-rect',
  'define': {
    width: 100,
    height: 100,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈10次采样
      loop: 10,
      //初始次采样的开始角度
      angle: -90,
      //半径距离
      r: 50,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i,  sample, pvs, model){
          let er = i % 2 == 0 ? sample.r : sample.r / 2.7
          let x = er * sample.cos
          let y = er * sample.sin
          pvs.push({ begin:i==0,end:i==9,x: x, y: y ,fill:1,select:1,stroke:1,clip:1,oppoint:1});
        }`,
        `(i,  sample, pvs, model){
          if (i == 0) {
            let er = sample.r / 3
            let x = er * Math.cos(45 * DDeiConfig.ROTATE_UNIT)
            let y = er * Math.sin(45 * DDeiConfig.ROTATE_UNIT)
            pvs.push({ begin:1,x: x, y: y, text:1 });
            x = er * Math.cos(135 * DDeiConfig.ROTATE_UNIT)
            y = er * Math.sin(135 * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y, text:1 });
            x = er * Math.cos(225 * DDeiConfig.ROTATE_UNIT)
            y = er * Math.sin(225 * DDeiConfig.ROTATE_UNIT)
            pvs.push({ x: x, y: y, text:1 });
            x = er * Math.cos(315 * DDeiConfig.ROTATE_UNIT)
            y = er * Math.sin(315 * DDeiConfig.ROTATE_UNIT)
            pvs.push({ end:1,x: x, y: y, text:1 });
          }
        }`,
      ]
    }
  }
}
