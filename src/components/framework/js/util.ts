import DDeiConfig from './config.js'
import DDeiModelArrtibuteValue from './models/attribute/attribute-value.js';

class DDeiUtil {



  // ============================ 静态方法 ============================

  //钩子函数，调用外部的配置属性读取函数,由外部调用者初始化
  static getAttrValueByConfig: Function;


  /**
   * 返回dom绝对坐标
   * @param element 
   */
  static getDomAbsPosition(element): object {
    //计算x坐标
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null) {
      actualLeft += current.offsetLeft;
      current = current.offsetParent;
    }
    //计算y坐标
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (current !== null) {
      actualTop += (current.offsetTop + current.clientTop);
      current = current.offsetParent;
    }
    //返回结果
    return { left: actualLeft, top: actualTop }
  }

  /**
   * 设置样式属性，自动创建不存在的层级
   * @param model 模型
   * @param paths 样式路径,支持传入多个
   * @param value 值
   */
  static setStyle(model: DDeiAbstractShape, paths: string[] | string, value: object): void {
    if (model) {
      let pathArray: string[];
      if (typeof (paths) == 'string') {
        pathArray = [paths];
      } else {
        pathArray = paths;
      }
      pathArray.forEach(path => {
        if (path != '') {
          let attrPaths: string[] = path.split('.');
          let curObj = model;
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
  static getDataByPathList(data: object, ...paths: string): object | null {
    if (data && paths) {
      for (let ix = 0; ix < paths.length; ix++) {
        if (paths[ix]) {
          let obj = paths[ix];
          let pathArray = null;
          if (typeof (obj) == "string") {
            pathArray = paths[ix].split(".");
            try {
              let returnJSON = DDeiUtil.getDataByPath(data, pathArray);
              if (returnJSON?.data) {
                return returnJSON.data;
              }
            } catch (e) { }
          } else if (Array.isArray(obj)) {
            if (obj.length > 0) {
              for (let jx = 0; jx < obj.length; jx++) {
                pathArray = obj[jx].split(".");
                try {
                  let returnJSON = DDeiUtil.getDataByPath(data, pathArray);
                  if (returnJSON?.data) {
                    return returnJSON.data;
                  }
                } catch (e) { }
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * 根据配置定义，设置属性值
   * @param model 模型
   * @param paths 属性路径,支持传入多个
   * @param value值
   * @return 由构成的属性的实际路径和配置中对应的值组成的Map
   */
  static setAttrValueByPath(model: object, paths: string[] | string, value: any): void {
    if (model && paths) {
      let attrPaths = null;
      if (typeof (paths) == 'string') {
        attrPaths = paths.split(",");
      } else {
        attrPaths = paths;
      }

      for (let i = 0; i < attrPaths.length; i++) {
        let attCode = attrPaths[i];
        let attrCodePaths = attCode.split(".");
        let currentObj = model;
        for (let j = 0; j < attrCodePaths.length; j++) {
          //最后一个元素，直接设置值，无需创建中间json
          let code = attrCodePaths[j];
          if (j == attrCodePaths.length - 1) {
            currentObj[code] = value;
          } else {
            if (!currentObj[code]) {
              currentObj[code] = {};
            }
            currentObj = currentObj[code];
          }
        }
      }
    }
  }

  /**
   * 声称唯一编码
   * @returns 
   */
  static getUniqueCode() {
    let data = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
      data += performance.now();
    }
    // #endif
    let codeId = 'xxxxxxxxxxxx6xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (msg) {
      let rand = (data + Math.random() * 16) % 16 | 0;
      data = Math.floor(data / 16);
      return (msg == 'x' ? rand : (rand & 0x3 | 0x8)).toString(16);
    });
    return codeId;
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
    let backingStore = context.backingStorePixelRatio ||
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
      if (pos.x || pos.x == 0) {
        returnP.x = pos.x * ratio;
      }
      if (pos.y || pos.y == 0) {
        returnP.y = pos.y * ratio;
      }
      if (pos.width || pos.width == 0) {
        returnP.width = pos.width * ratio;
      }
      if (pos.height || pos.height == 0) {
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
