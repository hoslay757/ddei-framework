import DDeiConfig from '../../config.js'
import DDeiEnumBusCommandType from '../../enums/bus-command-type.js';
import DDeiEnumOperateState from '../../enums/operate-state.js';
import DDeiSelector from '../../models/selector.js';
import DDeiAbstractShape from '../../models/shape.js';
import DDeiStage from '../../models/stage.js';
import DDeiUtil from '../../util.js';
import DDeiCanvasRender from './ddei-render.js';
import DDeiAbstractShapeRender from './shape-render-base.js';

/**
 * DDeiStage的渲染器类，用于渲染文件
 * 渲染器必须要有模型才可以初始化
 * 模型应该操作渲染器，而不是操作canvas
 */
class DDeiStageCanvasRender {

  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.model = props.model;
    this.ddRender = null;
  }

  // ============================== 静态方法 ============================
  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static newInstance(props: object): DDeiStageCanvasRender {
    return new DDeiStageCanvasRender(props)
  }

  // ============================== 属性 ===============================

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiStageCanvasRender";
  /**
   * 当前对应模型
   */
  model: DDeiStage;
  /**
   * 当前的ddei实例
   */
  ddRender: DDeiCanvasRender | null;

  /**
   * 当前操作图形
   */
  currentOperateShape: DDeiAbstractShape | null = null;

  /**
   * 当前操作状态
   */
  operateState: DDeiEnumOperateState = DDeiEnumOperateState.NONE;


  /**
   * 选择框控件模型
   */
  selector: DDeiSelector;

  /**
   * 刷新，如果为true则会绘制图形
   */
  refresh: boolean = true;


  //横向滚动条和纵向滚动条，当需要显示时不为空
  hScroll: object | null = null;
  vScroll: object | null = null;

  //缩略图，用来快速定位
  thumbnail: Image | null = null;
  // ============================== 方法 ===============================
  /**
   * 初始化
   */
  init(): void {
    this.ddRender = this.model.ddInstance.render
    this.initSelector();
  }

  /**
   * 创建图形
   */
  drawShape(): void {
    //根据视窗平移
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    let rat1 = this.ddRender.ratio;
    ctx.save();
    ctx.translate(this.model.wpv.x * rat1, this.model.wpv.y * rat1)
    //计算滚动条
    this.calScroll();
    //display=2的节点，最后渲染
    let topDisplayIndex = -1;
    for (let i = this.model.layers.length - 1; i >= 0; i--) {
      if (this.model.layers[i].display == 1) {
        this.model.layers[i].render.drawShape();
      } else if (this.model.layers[i].display == 2) {
        topDisplayIndex = i;
      }
    }
    if (topDisplayIndex != -1) {
      this.model.layers[topDisplayIndex].render.drawShape();
    }
    if (this.selector) {
      this.selector.render.drawShape();
    }
    ctx.restore();
    //绘制滚动条
    this.drawScroll();

  }

  /**
   * 绘制滚动条
   */
  drawScroll() {
    //获得 2d 上下文对象
    let canvas = this.ddRender.getCanvas();
    let ctx = canvas.getContext('2d');
    let rat1 = this.ddRender.ratio;
    ctx.save();

    //获取全局缩放比例
    let scrollWeight = rat1 * 15;
    let cwidth = canvas.width - scrollWeight;
    let cheight = canvas.height - scrollWeight;
    //绘制画布滚动条
    if (this.hScroll) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "rgb(220,220,220)"
      ctx.fillRect(0, cheight, this.hScroll.width * rat1, scrollWeight)
      ctx.strokeRect(0, cheight, this.hScroll.width * rat1, scrollWeight)
      //绘制当前位置区域
      ctx.fillStyle = "rgb(210,210,210)"
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING && this.dragObj?.scroll == 1) {
        ctx.fillStyle = "rgb(200,200,200)"
      }
      ctx.fillRect(this.hScroll.x * rat1, cheight, this.hScroll.contentWidth * rat1, scrollWeight)
    }
    if (this.vScroll) {
      ctx.fillStyle = "white"
      ctx.strokeStyle = "rgb(220,220,220)"
      ctx.fillRect(cwidth, 0, scrollWeight, this.vScroll.height * rat1)
      ctx.strokeRect(cwidth, 0, scrollWeight, this.vScroll.height * rat1)
      ctx.fillStyle = "rgb(210,210,210)"
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING && this.dragObj?.scroll == 2) {
        ctx.fillStyle = "rgb(200,200,200)"
      }
      ctx.fillRect(cwidth, this.vScroll.y * rat1, scrollWeight, this.vScroll.contentHeight * rat1)
      //绘制当前位置区域
    }

    //绘制缩略图图标
    if (this.vScroll || this.hScroll) {
      ctx.fillStyle = "blue"
      ctx.fillRect(cwidth, cheight, scrollWeight, scrollWeight)
    }
    //设置所有文本的对齐方式，以便于后续所有的对齐都采用程序计算
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    //设置字体
    ctx.font = "bold 24px 宋体"
    //设置字体颜色
    ctx.fillStyle = "red"
    ctx.fillText(this.model.wpv.x + "," + this.model.wpv.y, 0, 0)
    ctx.fillText(this.model.width + "," + this.model.height, 0, 20)
    ctx.fillText(this.ddRender.container.clientWidth + "," + this.ddRender.container.clientHeight, 0, 40)
    ctx.fillText(this.vScroll?.y + "", 0, 60)
    ctx.restore();
  }

  /**
   * 计算滚动条信息
   */
  calScroll() {

    let canvas = this.ddRender.getCanvas();
    let rat1 = this.ddRender.ratio;
    //视窗的大小
    let canvasHeight = canvas.height / rat1;
    let canvasWidth = canvas.width / rat1;
    //当前位置
    let curX = -this.model.wpv.x;
    let curY = -this.model.wpv.y;
    //滚动条大小
    let scrollWeight = 15;
    //画布总大小
    let maxWidth = this.model.width
    let maxHeight = this.model.height;
    //计算纵向滚动条信息
    if (maxHeight > canvasHeight) {
      let height = canvasHeight - scrollWeight;
      this.vScroll = { height: height, contentHeight: height * height / maxHeight, y: height * curY / maxHeight, bn: curY / maxHeight };
    } else {
      this.vScroll = null;
    }
    //计算横向滚动条信息
    if (maxWidth > canvasWidth) {
      let width = canvasWidth - scrollWeight;
      this.hScroll = { width: width, contentWidth: width * width / maxWidth, x: width * curX / maxWidth, bn: curX / maxWidth };
    } else {
      this.hScroll = null;
    }
  }

  /**
   * 初始化选择器
   */
  initSelector(): void {
    if (!this.selector) {

      //创建选择框控件
      this.selector = DDeiSelector.initByJSON({
        id: this.model.id + "_inner_selector",
        border: DDeiConfig.SELECTOR.BORDER,
        fill: { default: {}, selected: {} }
      });
      this.selector.stage = this.model
      DDeiConfig.bindRender(this.selector);
      this.selector.initRender();
    }
    this.selector.resetState();
  }


  /**
   * 重置选择器状态
   * @param evt 事件
   */
  resetSelectorState(evt: Event): void {
    this.selector.resetState(evt.offsetX - this.model.wpv.x, evt.offsetY - this.model.wpv.y);
  }

  // ============================== 事件 ===============================
  /**
   * 鼠标按下事件
   */
  mouseDown(evt: Event): void {
    //分发到当前图层的mouseDown
    if (!this.model.ddInstance.eventCancel) {
      let canvas = this.ddRender.getCanvas();
      let rat1 = this.ddRender.ratio;
      let ex = evt.offsetX;
      let ey = evt.offsetY;
      //判断是否在滚动条区间
      let scrollWeight = 15;
      let cwidth = canvas.width / rat1 - scrollWeight;
      let cheight = canvas.height / rat1 - scrollWeight;
      if (this.vScroll && ex > cwidth && ey >= this.vScroll.y && (ey) <= (this.vScroll.y + this.vScroll.contentHeight)) {
        this.dragObj = {
          dy: ey - this.vScroll.y,
          scroll: 2
        }
        this.operateState = DDeiEnumOperateState.STAGE_SCROLL_WORKING;
      } else if (this.hScroll && ey > cheight && ex >= this.hScroll.x && (ex) <= (this.hScroll.x + this.hScroll.contentWidth)) {
        this.dragObj = {
          dx: ex - this.hScroll.x,
          scroll: 1
        }
        this.operateState = DDeiEnumOperateState.STAGE_SCROLL_WORKING;
      } else {
        this.model.layers[this.model.layerIndex].render.mouseDown(evt);
      }
    }
  }
  /**
   * 绘制图形
   */
  mouseUp(evt: Event): void {
    //分发到当前图层的mouseUp
    if (!this.model.ddInstance.eventCancel) {
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING) {
        this.dragObj = null;
        this.operateState = DDeiEnumOperateState.NONE;
      } else {
        this.model.layers[this.model.layerIndex].render.mouseUp(evt);
      }
    }
  }

  /**
   * 鼠标移动
   */
  mouseMove(evt: Event): void {
    //分发到当前图层的mouseUp
    if (!this.model.ddInstance.eventCancel) {
      if (this.operateState == DDeiEnumOperateState.STAGE_SCROLL_WORKING) {
        let canvasPos = DDeiUtil.getDomAbsPosition(this.ddRender?.canvas)
        let ex = evt.clientX - canvasPos.left;
        let ey = evt.clientY - canvasPos.top;
        if (this.dragObj?.scroll == 1) {
          let width = this.hScroll.width;
          //原始鼠标位置在操作区域的位置
          //当前鼠标位置在滚动条的比例位置
          let posRat = (ex - this.dragObj.dx) / width;
          this.model.wpv.x = -this.model.width * posRat;
          let hScrollWidth = this.hScroll?.width ? this.hScroll?.width : 0
          if (this.model.wpv.x > 0) {
            this.model.wpv.x = 0
          } else if (this.model.wpv.x < -this.model.width + hScrollWidth) {
            this.model.wpv.x = -this.model.width + hScrollWidth
          }
        } else if (this.dragObj?.scroll == 2) {
          let height = this.vScroll.height;
          //原始鼠标位置在操作区域的位置
          //当前鼠标位置在滚动条的比例位置
          let posRat = (ey - this.dragObj.dy) / height;
          this.model.wpv.y = -this.model.height * posRat;
          let vScrollHeight = this.vScroll?.height ? this.vScroll?.height : 0
          if (this.model.wpv.y > 0) {
            this.model.wpv.y = 0
          } else if (this.model.wpv.y < -this.model.height + vScrollHeight) {
            this.model.wpv.y = -this.model.height + vScrollHeight
          }
        }
        this.model.ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        this.model.ddInstance?.bus?.executeAll()
      } else {
        this.model.layers[this.model.layerIndex].render.mouseMove(evt);
      }
    }
  }
}

export default DDeiStageCanvasRender