import DDeiConfig from '../config';
import DDeiRectangle from './rectangle'
import { Matrix3, Vector3 } from 'three';

/**
 * diamond（菱型）可以看作一个矩形，继承自矩形
 * 主要样式属性：坐标、高宽、边框、字体、填充
 * 主要属性：文本、对齐、自动换行、缩小字体填充
 */
class DDeiDiamond extends DDeiRectangle {




  /**
   * 得到点在图形连接线上的投射点
   * @param point 测试点
   * @param distance 内外部判定区间的距离
   * @param direct 方向，1外部，2内部 默认1
   * @returns 投影点的坐标
   */
  getProjPoint(point: { x: number, y: number }
    , distance: { in: number, out: number } = { in: -5, out: 15 }, direct: number = 1): { x: number, y: number } | null {

    //采用中心点连线作为投影点位置拍断的线
    let pvs = []
    for (let i = 0; i < this.currentPointVectors.length; i++) {
      let s = null;
      let e = null;
      if (i == this.currentPointVectors.length - 1) {
        s = this.currentPointVectors[i];
        e = this.currentPointVectors[0];
      } else {
        s = this.currentPointVectors[i];
        e = this.currentPointVectors[i + 1];
      }
      let p = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 }
      pvs.push(p);
    }

    let x0 = point.x;
    let y0 = point.y;


    //判断鼠标是否在某个控件的范围内
    if (pvs?.length > 0) {
      let st, en;
      for (let j = 0; j < pvs.length; j++) {
        //点到直线的距离
        let plLength = Infinity;
        if (j == pvs.length - 1) {
          st = j;
          en = 0;
        } else {
          st = j;
          en = j + 1;
        }
        let x1 = pvs[st].x;
        let y1 = pvs[st].y;
        let x2 = pvs[en].x;
        let y2 = pvs[en].y;
        //获取控件所有向量
        if (x1 == x2 && y1 == y2) {
          plLength = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0))
        } else {
          //根据向量外积计算面积
          let s = (x0 - x1) * (y2 - y1) - (y0 - y1) * (x2 - x1)
          //计算直线上两点之间的距离
          let d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          plLength = s / d
        }
        let flag = false;
        //plLength > 0时，方向向外,满足内外部条件
        if (direct == 1) {
          if (plLength >= distance.in && plLength <= distance.out) {
            flag = true;
          }
        } else if (direct == 2) {
          if (plLength <= distance.in && plLength >= distance.out) {
            flag = true;
          }
        }
        //进一步判断：1.点的投影是否在线段中间，2.点的投影的坐标位置
        if (flag) {
          //A.求得线向量与直角坐标系的夹角
          let lineV = new Vector3(x2, y2, 1);
          let pointV = new Vector3(x0, y0, 1);
          let toZeroMatrix = new Matrix3(
            1, 0, -x1,
            0, 1, -y1,
            0, 0, 1);
          //归到原点，求夹角
          lineV.applyMatrix3(toZeroMatrix)
          pointV.applyMatrix3(toZeroMatrix)
          let lineAngle = (new Vector3(1, 0, 0).angleTo(new Vector3(lineV.x, lineV.y, 0)) * 180 / Math.PI).toFixed(4);
          //判断移动后的线属于第几象限
          //B.构建旋转矩阵。旋转linvV和pointV
          let angle = 0;
          if (lineV.x >= 0 && lineV.y >= 0) {
            angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x <= 0 && lineV.y >= 0) {
            angle = (lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x <= 0 && lineV.y <= 0) {
            angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          } else if (lineV.x >= 0 && lineV.y <= 0) {
            angle = (- lineAngle * DDeiConfig.ROTATE_UNIT).toFixed(4);
          }
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          lineV.applyMatrix3(rotateMatrix);
          pointV.applyMatrix3(rotateMatrix);

          //C.判断两个向量的关系，pointV.x必须大于0，且小于lineV.x
          if (pointV.x >= 0 && pointV.x <= lineV.x) {
            //D.投影点=（pointV.x,0)，通过旋转+位移到达目标点
            let v1 = new Vector3(pointV.x, 0, 1);
            angle = -angle;
            let rotateMatrix = new Matrix3(
              Math.cos(angle), Math.sin(angle), 0,
              -Math.sin(angle), Math.cos(angle), 0,
              0, 0, 1);
            v1.applyMatrix3(rotateMatrix);
            let removeMatrix = new Matrix3(
              1, 0, x1,
              0, 1, y1,
              0, 0, 1);
            v1.applyMatrix3(removeMatrix);
            //返回投影点
            return v1;
          }
        }
      }
    }
    return null;
  }
  // ============================ 静态方法 ============================

  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let model = new DDeiDiamond(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;
    model.initRender();
    return model;
  }

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiDiamond {
    let shape = new DDeiDiamond(json);
    return shape;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiDiamond";

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiDiamond';
  // 本模型的基础图形
  baseModelType: string = 'DDeiRectangle';

}

export default DDeiDiamond
