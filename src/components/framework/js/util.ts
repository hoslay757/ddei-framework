import DDeiConfig from './config.js'
import DDeiModelArrtibuteValue from './models/attribute/attribute-value.js';

class DDeiUtil {



  // ============================ 静态方法 ============================


  /**
   * 设置样式属性，自动创建不存在的层级
   * @param model 模型
   * @param paths 样式路径,支持传入多个
   * @param value 值
   */
  static setStyle(model: DDeiAbstractShape, paths: string[] | string, value: object): void {
    if (model?.attrs) {
      let pathArray: string[];
      if (typeof (paths) == 'string') {
        pathArray = [paths];
      } else {
        pathArray = paths;
      }
      pathArray.forEach(path => {
        if (path != '') {
          let attrPaths: string[] = path.split('.');
          let curObj = model?.attrs;
          for (let i = 0; i < attrPaths.length; i++) {
            if (i != attrPaths.length - 1) {
              if (!curObj[attrPaths[i]]) {
                curObj[attrPaths[i]] = {};
              }
              curObj = curObj[attrPaths[i]];
            } else {
              curObj[attrPaths[i]] = value;
            }
          }
        }
      });
    }
  }

  /**
   * 根据Path获取JSON的数据
   * 如果data路径中存在override，则强制覆盖不从上级获取
   */
  static getDataByPath(data: object, path: string[]): object {
    let returnValue = null;
    let isoverwrite = false;
    if (path && path.length > 0) {
      //属性详情路径code
      let dataJson = data;
      //尝试转为json获取深层次数据
      if (typeof (data) == 'string') {
        dataJson = JSON.parse(data);
      }
      if (dataJson?.overwrite == true) {
        isoverwrite = true
      }
      //获取属性
      for (let i = 0; i < path.length; i++) {
        dataJson = dataJson[path[i]];
        if (dataJson?.overwrite == true) {
          isoverwrite = true
        }
      }
      returnValue = dataJson;
    } else {
      returnValue = data;
      if (returnValue?.overwrite == true) {
        isoverwrite = true
      }
    }
    return { data: returnValue, overwrite: isoverwrite }
  }

  /**
   * 获取设备像素比
   */
  static getPixelRatio(context: any): number {
    var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  }

  // 16进制编码转rgb
  static hex2rgb(hex: string): string {
    let hexNum = hex.substring(1);
    hexNum = '0x' + (hexNum.length < 6 ? repeatLetter(hexNum, 2) : hexNum);
    let r = hexNum >> 16;
    let g = hexNum >> 8 & '0xff';
    let b = hexNum & '0xff';
    return `rgb(${r},${g},${b})`;
  }

  static repeatWord(word: string, num: number): string {
    let result = '';
    for (let i = 0; i < num; i++) {
      result += word;
    }
    return result;
  }

  static repeatLetter(word: string, num: number): String {
    var result = '';
    for (let letter of word) {
      result += repeatWord(letter, num);
    }
    return result;
  }


  // rgb转16进制
  static rgb2hex(color: string): string {
    let rgb = color.split(',');
    let r = parseInt(rgb[0].split('(')[1]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2].split(')')[0]);
    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  }

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  static getColor(color: string): string {
    if (!color) {
      return null;
    }
    if (color.startsWith("#")) {
      return this.hex2rgb(color);
    }
    //其余情况原样返回
    else {
      return color;
    }
  }

  /**
   * 对坐标以及大小进行缩放，并返回新的坐标
   * @param pos 原始位置
   * @param ratio 缩放比率
   * @returns 缩放后的坐标
   */
  static getRatioPosition(pos: object, ratio: number): any {
    if (!pos) {
      return null;
    } else {
      let returnP = {};
      if (pos.x) {
        returnP.x = pos.x * ratio;
      }
      if (pos.y) {
        returnP.y = pos.y * ratio;
      }
      if (pos.width) {
        returnP.width = pos.width * ratio;
      }
      if (pos.height) {
        returnP.height = pos.height * ratio;
      }
      return returnP;
    }
  }

  /**
   * 获取不同字体大小的空格所占空间
   */
  static getSpaceWidth(fontFamily: string, fontSize: number, fontStyle: string): number {
    let key = fontFamily + "_" + fontSize + "_" + fontStyle;
    if (!DDeiConfig.SPACE_WIDTH_MAP[key]) {
      if ("Arial Unicode" == fontFamily) {
        let spaceWidth = fontSize * 0.21 / 0.75;
        DDeiConfig.SPACE_WIDTH_MAP[key] = spaceWidth;
      } else if ("STSong-Light" == fontFamily) {
        let spaceWidth = fontSize * 0.21;
        DDeiConfig.SPACE_WIDTH_MAP[key] = spaceWidth;
      }
    }
    return DDeiConfig.SPACE_WIDTH_MAP[key]
  }

  /**
    * 通过当前P点和旋转角度计算旋转之前的点
    */
  static computePosition(occ: { x: number, y: number }, rcc: { x: number, y: number }, angle: number): { x: number, y: number } {
    // 圆心
    let a: number = occ.x;
    let b: number = occ.y;
    // 计算
    let c: number = Math.PI / 180 * angle;
    let rx: number = (rcc.x - a) * Math.cos(c) - (rcc.y - b) * Math.sin(c) + a;
    let ry: number = (rcc.y - b) * Math.cos(c) + (rcc.x - a) * Math.sin(c) + b;
    // 取整
    // rx = Math.round(rx);
    // ry = Math.round(ry);
    return { x: rx, y: ry };
  }
}

export default DDeiUtil
