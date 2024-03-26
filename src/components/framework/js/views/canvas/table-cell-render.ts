import DDeiEnumControlState from '../../enums/control-state.js';
import DDeiUtil from '../../util.js';
import DDeiRectContainerCanvasRender from './rect-container-render.js';

/**
 * 表格单元格的渲染器
 */
class DDeiTableCellCanvasRender extends DDeiRectContainerCanvasRender {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)
  }


  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiTableCellCanvasRender {
    return new DDeiTableCellCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTableCellCanvasRender";
  // ============================== 方法 ===============================

  getHTML(): string {
    let cell = this.model;
    if (cell.isMergedCell() && !cell.isMergeCell()) {
      return '';
    }
    let fiFamily = this.getCachedValue("font.family");
    let fiSize = this.getCachedValue("font.size");
    let fiColor = this.getCachedValue("font.color");
    //字体对齐信息
    let align = this.getCachedValue("textStyle.align");
    let valign = this.getCachedValue("textStyle.valign");
    //粗体
    let bold = this.getCachedValue("textStyle.bold");
    //斜体
    let italic = this.getCachedValue("textStyle.italic");
    //下划线
    let underline = this.getCachedValue("textStyle.underline");
    //删除线
    let deleteline = this.getCachedValue("textStyle.deleteline");
    //自动换行
    let feed = this.getCachedValue("textStyle.feed");
    //获取边框区域，实际填充区域=坐标-边框区域
    let topDisabled = this.getCachedValue("border.top.disabled");
    let topColor = this.getCachedValue("border.top.color");
    let topOpac = this.getCachedValue("border.top.opacity");

    let topWidth = this.getCachedValue("border.top.width");
    let rightDisabled = this.getCachedValue("border.right.disabled");
    let rightColor = this.getCachedValue("border.right.color");
    let rightOpac = this.getCachedValue("border.right.opacity");
    let rightWidth = this.getCachedValue("border.right.width");
    let bottomDisabled = this.getCachedValue("border.bottom.disabled");
    let bottomColor = this.getCachedValue("border.bottom.color");
    let bottomOpac = this.getCachedValue("border.bottom.opacity");
    let bottomWidth = this.getCachedValue("border.bottom.width");
    let leftDisabled = this.getCachedValue("border.left.disabled");
    let leftColor = this.getCachedValue("border.left.color");
    let leftOpac = this.getCachedValue("border.left.opacity");
    let leftWidth = this.getCachedValue("border.left.width");
    let fillColor = this.getCachedValue("fill.color");
    let fillOpacity = this.getCachedValue("fill.opacity");
    let fillDisabled = this.getCachedValue("fill.disabled");
    let topDash = this.getCachedValue("border.top.dash");
    let bottomDash = this.getCachedValue("border.bottom.dash");
    let leftDash = this.getCachedValue("border.left.dash");
    let rightDash = this.getCachedValue("border.right.dash");

    let html = '';
    html += '<td style="'
    if (fiFamily) {
      //转换为中文描述
      html += 'font-family:' + fiFamily + ';'
    }
    if (fiSize) {
      html += 'font-size:' + fiSize + ';'
    }


    if (fiSize) {
      html += 'color:' + fiColor + ';'
    }
    if (bold == '1') {
      html += 'font-weight:bold;'
    }
    if (italic == '1') {
      html += 'font-style:italic;'
    }
    if (align) {
      let str = "center"
      if (align == 1) {
        str = "left"
      } else if (align == 2) {
        str = "center"
      } else if (align == 3) {
        str = "right"
      }
      html += 'text-align:' + str + ';'
    }
    if (valign) {
      let str = "middle"
      if (valign == 1) {
        str = "top"
      } else if (valign == 2) {
        str = "middle"
      } else if (valign == 3) {
        str = "bottom"
      }

      html += 'vertical-align:' + str + ';'
    }
    if (feed == "0") {
      html += 'white-space: nowrap;'
    }
    if (underline == "1") {
      html += 'text-decoration: underline;'
    } else if (deleteline == "1") {
      html += 'text-decoration: line-through;'
    }
    if (!topDisabled && topColor && (!topOpac || topOpac > 0) && topWidth > 0) {
      let dash = 'solid'
      if (topDash && topDash.length > 0) {
        dash = "dashed"
      }
      html += 'border-top: ' + topWidth + 'px ' + dash + ' ' + topColor + ';'
    }
    if (!bottomDisabled && bottomColor && (!bottomOpac || bottomOpac > 0) && bottomWidth > 0) {
      let dash = 'solid'
      if (bottomDash && bottomDash.length > 0) {
        dash = "dashed"
      }
      html += 'border-bottom: ' + bottomWidth + 'px ' + dash + ' ' + bottomColor + ';'
    }
    if (!leftDisabled && leftColor && (!leftOpac || leftOpac > 0) && leftWidth > 0) {
      let dash = 'solid'
      if (leftDash && leftDash.length > 0) {
        dash = "dashed"
      }
      html += 'border-left: ' + leftWidth + 'px ' + dash + ' ' + leftColor + ';'
    }
    if (!rightDisabled && rightColor && (!rightOpac || rightOpac > 0) && rightWidth > 0) {
      let dash = 'solid'
      if (rightDash && rightDash.length > 0) {
        dash = "dashed"
      }
      html += 'border-right: ' + rightWidth + 'px ' + dash + ' ' + rightColor + ';'
    }
    if (!fillDisabled && fillColor && (!fillOpacity || fillOpacity > 0)) {
      html += 'background-color: ' + fillColor + ';'
    }
    html += 'width: ' + cell.width + 'px;'
    html += 'height: ' + cell.height + 'px;'
    html += '"'
    if (cell.isMergeCell()) {
      html += ' rowspan="' + cell.mergeRowNum + '"'
      html += ' colspan="' + cell.mergeColNum + '"'
    }
    html += ' width="' + cell.width + '"'
    html += ' height="' + cell.height + '"'
    html += '>'
    if (cell.text) {
      html += cell.text
    }
    html += '</td>'
    return html;

  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }

  mouseUp(e: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    if (!this.stage.ddInstance.eventCancel) {

    }
  }
}

export default DDeiTableCellCanvasRender