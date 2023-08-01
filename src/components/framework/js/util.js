import DDeiConfig from './config.js'

export default {
  //获取设备像素比
  getPixelRatio (context) {
    var backingStore = context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
  },

  // 16进制编码转rgb
  hex2rgb (hex) {
    var hexNum = hex.substring(1);
    hexNum = '0x' + (hexNum.length < 6 ? repeatLetter(hexNum, 2) : hexNum);
    var r = hexNum >> 16;
    var g = hexNum >> 8 & '0xff';
    var b = hexNum & '0xff';
    return `rgb(${r},${g},${b})`;

    function repeatWord (word, num) {
      var result = '';
      for (let i = 0; i < num; i++) {
        result += word;
      }
      return result;
    }
    function repeatLetter (word, num) {
      var result = '';
      for (let letter of word) {
        result += repeatWord(letter, num);
      }
      return result;
    }
  },

  // rgb转16进制
  rgb2hex (color) {
    var rgb = color.split(',');
    var r = parseInt(rgb[0].split('(')[1]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2].split(')')[0]);
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
  },

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  getColor (color) {
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
  },

  // 将颜色转换为可用颜色(rgb),其他情况原样返回
  getRatioPosition (pos, ratio) {
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
  },

  // 获取不同字体大小的空格所占空间
  getSpaceWidth (fontFamily, fontSize, fontStyle) {
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


}
