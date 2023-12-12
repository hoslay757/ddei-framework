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
    width: 154,
    height: 154,
    //2为极坐标，缺省点为原点
    poly: 2,
    //采样信息
    sample: {
      //一圈10次采样
      loop: 10,
      //初始次采样的开始角度
      angle: -90,
      //半径距离
      r: 100,
      //圆心的间隔
      centerPadding: 20,
      //采样的规则，多组采样返回多组规则
      rules: [
        `(i, sita, sample, pvs, model){
          let er = i % 2 == 0 ? sample.r : sample.r / 3
          let x = er * Math.cos(sita * DDeiConfig.ROTATE_UNIT)
          let y = er * Math.sin(sita * DDeiConfig.ROTATE_UNIT)
          pvs.push(new Vector3(model.cpv.x + x, model.cpv.y + y, 1));
        }`,
      ]
    },
    textArea: [
      { x: -2.5, y: 32.5, z: 1 },
      { x: 102.5, y: 32.5, z: 1 },
      { x: 102.5, y: 142.5, z: 1 },
      { x: -2.5, y: 142.5, z: 1 },
    ],
  }
}
