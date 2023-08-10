import DDeiConfig from '../config';
import DDeiEnumControlState from '../enums/control-state';
import DDeiUtil from '../util';
import DDeiRectangle from './rectangle';
import DDeiAbstractShape from './shape';

/**
 * selector选择器，用来选择界面上的控件，选择器不是一个实体控件,不会被序列化
 * 选择器有两种状态一种是选择中（默认default)，一种是选择后selected
 * 选择中状态时，随鼠标的拖选而放大缩小
 * 选择后状态时，为所有选中图形的外接矩形
 * 选择器主体上是一个矩形，因此可以继承自Rectangle
 */
class DDeiSelector extends DDeiRectangle {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props);
    this.paddingWeight = props.paddingWeight;
    this.operateIconFill = props.operateIconFill;
  }

  // ============================ 静态变量 ============================
  // ============================ 静态方法 ============================

  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json): DDeiSelector {
    let shape = new DDeiSelector(json);
    return shape;
  }
  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiSelector';
  // 本模型的基础图形
  baseModelType: string = 'DDeiSelector';

  //间隔宽度，根据选中单个控件、选中多个控件，间隔宽度可以有所变化
  paddingWeight: object;

  //操作区域的填充样式，根据选中和未选中状态可以有所变化
  operateIconFill: object;

  //当前操作触发pass的下标，-1为未激活，1～8按，1:中上，2右上顺时针计数，9为旋转
  passIndex: number = -1;

  //当前操作触发pass的是否发生变化
  passChange: boolean = false;

  // ============================ 方法 ===============================


  /**
   * 计算移动后的坐标
   */
  getMovedBounds(dx: number, dy: number): object {
    if (!dx && !dy) {
      return null;
    }
    let returnBounds = { x: this.x, y: this.y, width: this.width, height: this.height }
    //获取旋转后的坐标
    if (this.rotate > 0) {
      let points = DDeiAbstractShape.getRotatedPoints(returnBounds, this.rotate);
      let rx: number = Infinity, ry: number = Infinity, rx1: number = 0, ry1: number = 0;
      //找到最大、最小的x和y
      points.forEach(p => {
        rx = Math.min(Math.floor(p.x), rx)
        rx1 = Math.max(Math.floor(p.x), rx1)
        ry = Math.min(Math.floor(p.y), ry)
        ry1 = Math.max(Math.floor(p.y), ry1)
      })
      returnBounds = { x: rx, y: ry, width: rx1 - rx, height: ry1 - ry }
    }

    switch (this.passIndex) {
      //上中
      case 1: {
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        break;
      }
      //上右
      case 2: {
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        returnBounds.width = returnBounds.width + dx
        break;
      }
      //中右
      case 3: {
        returnBounds.width = returnBounds.width + dx
        break;
      }
      //下右
      case 4: {
        returnBounds.width = returnBounds.width + dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //下中
      case 5: {
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //下左
      case 6: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.height = returnBounds.height + dy
        break;
      }
      //中左
      case 7: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        break;
      }
      //上左
      case 8: {
        returnBounds.x = returnBounds.x + dx
        returnBounds.width = returnBounds.width - dx
        returnBounds.y = returnBounds.y + dy
        returnBounds.height = returnBounds.height - dy
        break;
      }
      default: {
        break;
      }
    }
    return returnBounds;
  }


  /**
   * 根据移动后的坐标，调整选中控件的旋转角度
   * @param movedNumber 
   */
  changeSelectedModelRotate(movedNumber: number = 0) {

    let layer = this.stage.layers[this.stage.layerIndex];
    let selectedModels = layer.getSelectedModels();
    if (!selectedModels || this.passIndex == -1 || movedNumber == 0) {
      return false;
    }
    //更新旋转器角度
    if (!this.rotate) {
      this.rotate = 0;
      this.originX = this.x;
      this.originY = this.y;
    }
    //计算旋转角度
    let angle = movedNumber * 0.5;
    let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
    //获取当前选择控件外接矩形
    let originRect: object = DDeiAbstractShape.getOutRect(models);
    //外接矩形的圆心x0和y0
    let occ = { x: originRect.x + originRect.width * 0.5, y: originRect.y + originRect.height * 0.5 };
    //对所有选中图形进行位移并旋转
    for (let i = 0; i < models.length; i++) {
      let item = models[i]
      if (!item.rotate) {
        item.rotate = 0;
        item.originX = item.x;
        item.originY = item.y;
      }
      //当前图形的圆心x1和y1
      let rcc = { x: item.x + item.width * 0.5, y: item.y + item.height * 0.5 };
      //已知圆心位置、起始点位置和旋转角度，求终点的坐标位置，坐标系为笛卡尔坐标系，计算机中y要反转计算
      let dcc = DDeiUtil.computePosition(occ, rcc, angle);
      //修改坐标与旋转角度
      item.setPosition(dcc.x - item.width * 0.5, dcc.y - item.height * 0.5)
      item.rotate = item.rotate + angle
      if (item.rotate >= 360) {
        item.rotate = null
        item.x = item.originX;
        item.y = item.originY;
      }
    }

    this.rotate = this.rotate + angle
    if (this.rotate >= 360) {
      this.rotate = 0
      this.x = this.originX;
      this.y = this.originY;
    }
  }
  /**
   * 根据移动后的选择器，等比缩放图形
   * @return 是否成功改变，校验失败则会终止改变
   */
  changeSelectedModelBounds(movedBounds: object): boolean {
    let layer = this.stage.layers[this.stage.layerIndex];
    let selectedModels = layer.getSelectedModels();
    if (!selectedModels || this.passIndex == -1 || !movedBounds) {
      return false;
    }
    let models: DDeiAbstractShape[] = Array.from(selectedModels.values());
    //原始路径
    let originRect: object = DDeiAbstractShape.getOutRect(models);
    //记录每一个图形在原始矩形中的比例
    let originPosMap: Map<string, object> = new Map();
    //获取模型在原始模型中的位置比例
    for (let i = 0; i < models.length; i++) {
      let item = models[i]
      originPosMap.set(item.id, {
        xR: (item.x - originRect.x) / originRect.width,
        yR: (item.y - originRect.y) / originRect.height,
        wR: item.width / originRect.width,
        hR: item.height / originRect.height
      });
    }

    let helpLineWeight = 1;
    // 计算图形拖拽后将要到达的坐标
    if (DDeiConfig.GLOBAL_HELP_LINE_ENABLE) {
      //辅助对齐线宽度
      helpLineWeight = DDeiConfig.GLOBAL_HELP_LINE_WEIGHT;
    }
    let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
    let paddingWeight = 0;
    if (selectedModels.size > 1) {
      paddingWeight = paddingWeightInfo.multiple;
    } else {
      paddingWeight = paddingWeightInfo.single;
    }
    //考虑paddingWeight，计算实际移动后的区域
    movedBounds.y = movedBounds.y + paddingWeight
    movedBounds.height = movedBounds.height - 2 * paddingWeight
    movedBounds.x = movedBounds.x + paddingWeight
    movedBounds.width = movedBounds.width - 2 * paddingWeight
    //校验，如果拖拽后图形消失不见，则停止拖拽
    if (movedBounds.height <= paddingWeight || movedBounds.width <= paddingWeight) {
      return false
    }
    //同步多个模型到等比缩放状态
    if (this.passIndex != -1) {
      selectedModels.forEach((item, key) => {
        item.x = movedBounds.x + movedBounds.width * originPosMap.get(item.id).xR
        item.width = movedBounds.width * originPosMap.get(item.id).wR
        item.y = movedBounds.y + movedBounds.height * originPosMap.get(item.id).yR
        item.height = movedBounds.height * originPosMap.get(item.id).hR
      })

    }
    return true;
  }
  /**
   * 设置passindex
   * @param index pass值
   */
  setPassIndex(index: number) {
    if (this.passIndex != index) {
      this.passIndex = index;
      this.passChange = true;
    }
  }
  /**
   * 重制状态
   */
  resetState(x: number = -1, y: number = -1): void {
    //重置选择器状态
    this.startX = x
    this.startY = y
    this.x = x
    this.y = y
    this.width = 0
    this.height = 0
    this.rotate = 0
    this.state = DDeiEnumControlState.DEFAULT;
  }

  /**
   * 获取当前选择器包含的模型
   * @returns 
   */
  getIncludedModels(): Map<string, DDeiAbstractShape> {
    //选中选择器区域内控件
    let selectBounds = this.getBounds();
    let models = new Map();
    this.stage.layers[this.stage.layerIndex].models.forEach((item, key) => {
      //实际区域减小一定百分比，宽松选择
      let curModel = item;
      if (curModel.id != this.id) {
        let x = curModel.x + curModel.width * 0.1;
        let y = curModel.y + curModel.height * 0.1;
        let x1 = curModel.x + curModel.width * 0.9;
        let y1 = curModel.y + curModel.height * 0.9;
        //如果控件在选择区域内，选中控件
        if (selectBounds.x <= x && selectBounds.y < y
          && selectBounds.x1 >= x1 && selectBounds.y1 >= y1) {
          models.set(curModel.id, curModel);
        }
      }
    });
    return models;
  }

  /**
   * 根据已选择的控件更新坐标和状态
   */
  updatedBoundsBySelectedModels(): void {
    let selectedModels = this.stage.layers[this.stage.layerIndex].getSelectedModels();
    if (selectedModels && selectedModels.size > 0) {
      let models = Array.from(selectedModels.values());
      //获取间距设定
      let paddingWeightInfo = this.paddingWeight?.selected ? this.paddingWeight.selected : DDeiConfig.SELECTOR.PADDING_WEIGHT.selected;
      let paddingWeight = 0;
      if (models.length > 1) {
        paddingWeight = paddingWeightInfo.multiple;
      } else {
        paddingWeight = paddingWeightInfo.single;
      }
      //计算多个图形的顶点最大范围，根据顶点范围构建一个最大的外接矩形，规则的外接矩形，可以看作由4个顶点构成的图形
      let outRectBounds = null
      if (models.length > 1) {
        outRectBounds = DDeiAbstractShape.getOutRect(models);
      } else {
        outRectBounds = models[0].getBounds();
        this.rotate = models[0].rotate;
      }

      this.setBounds(outRectBounds.x - paddingWeight, outRectBounds.y - paddingWeight, outRectBounds.width + 2 * paddingWeight, outRectBounds.height + 2 * paddingWeight);

      //设置选择器状态为选中后
      this.state = DDeiEnumControlState.SELECTED;
    } else {
      this.resetState();
    }
  }

}


export default DDeiSelector
