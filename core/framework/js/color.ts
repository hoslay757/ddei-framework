import DDei from "./ddei";

/**
 * 颜色代表了一个颜色的rgba定义，并提供了方法对颜色进行加工处理
 */
class DDeiColor {
  constructor(r,g,b,a){
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  r: number;
  g: number;
  b: number;
  a: number = 1;

  darken(rate: number): DDeiColor {
    let r = this.r
    let g = this.g
    let b = this.b
    r -= r * rate
    g -= g * rate
    b -= b * rate
    if (r < 0) {
      r = 0
    }
    if (g < 0) {
      g = 0
    }
    if (b < 0) {
      b = 0
    }

    return new DDeiColor(r, g, b, this.a)
  }

  lighten(rate: number): DDeiColor {
    let r = this.r
    let g = this.g
    let b = this.b
    r += r * rate
    g += g * rate
    b += b * rate
    if (r < 0) {
      r = 0
    }
    if (g < 0) {
      g = 0
    }
    if (b < 0) {
      b = 0
    }

    return new DDeiColor(r, g, b, this.a)
  }

  toColor(){
    return "rgba("+this.r+","+this.g+","+this.b+","+this.a+")"
  }


}

export default DDeiColor
