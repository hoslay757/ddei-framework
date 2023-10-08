import DDeiAbstractShape from "../../models/shape";
import DDeiUtil from "../../util";
import DDeiLayoutManager from "../layout-manager";

/**
 * 九宫格布局
 */
class DDeiLayoutManagerNine extends DDeiLayoutManager {

  // ============================ 方法 ===============================
  /**
  * 校验控件是否可以进入容器
  */
  valid(): boolean {
    if (this.container.models.size <= 9) {
      return true
    } else {
      return false
    }
  }

  /**
    * 是否可以从其他布局转换到当前布局的方法
    * @return true可以转换，false不可以转换
    */
  canConvertLayout(oldLayout: string): boolean {
    if (oldLayout == 'free' || !oldLayout) {
      if (this.container.models.size <= 9) {
        return true;
      } else {
        return false;
      }
    } else if (oldLayout == 'full') {
      return true;
    } else if (oldLayout == 'table') {

    } else if (oldLayout == 'cc') {

    }
    return false;
  }
  /**
    * 从其他布局转换到当前布局的方法
    */
  convertLayout(oldLayout: string): void {
    //创建并初始化布局数据layoutData
    if (!this.container.layoutData) {
      this.container.layoutData = {}
    }
    this.container.layoutData.nine = {}
    if (oldLayout == 'free' || !oldLayout) {
      //将控件按照从上到下，从左到右的顺序排列
      let models = DDeiUtil.getSortedModels(this.container.models);
      let idx = 0;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (models.length > idx) {
            this.container.layoutData.nine[models[idx].id] = { 'row': row, 'col': col }
            idx++;
          }
        }
      }
    } else if (oldLayout == 'full') {
      //将控件按照从上到下，从左到右的顺序排列
      if (this.container.models?.size > 0) {
        let model = Array.from(this.container.models.values())[0];
        this.container.layoutData.nine[model.id] = { 'row': 1, 'col': 1 }
      }
    } else if (oldLayout == 'table') {

    } else if (oldLayout == 'cc') {

    }
  }

  /**
   * 根据layoutData修改模型的位置和大小
   */
  changeSubModelBounds(): void {

    //布局数据layoutData
    let layoutData = this.container.layoutData.nine;
    let unitWidth = this.container.width / 3;
    let unitHeight = this.container.height / 3;
    //按照布局数据，更新model的坐标和大小
    for (let key in layoutData) {
      let model = this.container.models.get(key);
      let data = layoutData[key];
      if (model) {
        model.setBounds(data.col * unitWidth, data.row * unitHeight, unitWidth, unitHeight)
        if (model.changeChildrenBounds) {
          model.changeChildrenBounds();
        }
      }
    }
  }

  /**
   * 修改布局信息
   */
  updateLayout(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): void {

    //计算鼠标移入的区域  TODO 旋转的情况
    if (this?.container?.layoutData?.nine && models?.length > 0) {
      let layoutData = this.container.layoutData.nine
      let unitWidth = this.container.width / 3;
      let unitHeight = this.container.height / 3;
      let absPosition = this.container?.getAbsPosition();
      let px = x - absPosition.x;
      let py = y - absPosition.y;
      let row = -1;
      let col = -1;
      if (px >= 0 && px < unitWidth) {
        col = 0
      } else if (px >= unitWidth && px < 2 * unitWidth) {
        col = 1
      } else if (px >= 2 * unitWidth && px < this.container.width) {
        col = 2
      }
      if (py >= 0 && py < unitHeight) {
        row = 0
      } else if (py >= unitHeight && py < 2 * unitHeight) {
        row = 1
      } else if (py >= 2 * unitHeight && py < this.container.height) {
        row = 2
      }
      if (col != -1 && row != -1) {
        let oldRow = -1;
        let oldCol = -1;
        //获取当前元素的老位置
        if (layoutData[models[0].id]) {
          oldRow = layoutData[models[0].id].row
          oldCol = layoutData[models[0].id].col
        }
        //计算落点的新位置以前是否有元素
        let oldModel = null;
        for (let key in layoutData) {
          let data = layoutData[key];
          if (data.row == row && data.col == col) {
            oldModel = this.container.models.get(key);
            break;
          }
        }
        //如果不存在老位置，且新位置也有元素,不能移入
        if (oldRow == -1 && oldModel) {

        }
        //存在老位置，新位置有元素,交换
        else if (oldRow != -1 && oldModel) {
          layoutData[models[0].id] = { row: row, col: col }
          layoutData[oldModel.id] = { row: oldRow, col: oldCol }
        }
        //新位置无元素，允许移入
        else if (!oldModel) {
          layoutData[models[0].id] = { row: row, col: col }
        }


      }
    }
    //刷新子元素位置
    this.changeSubModelBounds();
  }


  canChangePosition(x: number, y: number, models: DDeiAbstractShape[], isAlt: boolean = false): boolean {
    //如果在元素之内，则可以移动
    if (isAlt) {
      return true;
    } else if (this.container.isInAreaLoose(x, y, 0)) {
      return true;
    }
    return false;
  }

  canChangeSize(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    return false;
  }

  canChangeRotate(): boolean {
    return false;
  }


  /**
  * 计算时拖入待确认时的显示图形的向量
  */
  calDragInPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    //获取向量
    if (this.container.layer) {
      //计算鼠标移入的区域  TODO 旋转的情况
      let unitWidth = this.container.width / 3;
      let unitHeight = this.container.height / 3;
      let absPosition = this.container?.getAbsPosition();
      let px = x - absPosition.x;
      let py = y - absPosition.y;
      let row = -1;
      let col = -1;
      if (px >= 0 && px < unitWidth) {
        col = 0
      } else if (px >= unitWidth && px < 2 * unitWidth) {
        col = 1
      } else if (px >= 2 * unitWidth && px < this.container.width) {
        col = 2
      }
      if (py >= 0 && py < unitHeight) {
        row = 0
      } else if (py >= unitHeight && py < 2 * unitHeight) {
        row = 1
      } else if (py >= 2 * unitHeight && py < this.container.height) {
        row = 2
      }
      if (col != -1 && row != -1) {
        this.container.layer.dragInPoints = [
          { x: absPosition.x + col * unitWidth, y: absPosition.y + row * unitHeight },
          { x: absPosition.x + col * unitWidth + unitWidth, y: absPosition.y + row * unitHeight },
          { x: absPosition.x + col * unitWidth + unitWidth, y: absPosition.y + row * unitHeight + unitHeight },
          { x: absPosition.x + col * unitWidth, y: absPosition.y + row * unitHeight + unitHeight },
        ]
      }
    }
  }

  /**
  * 计算时拖入出确认时的显示图形的向量
  */
  calDragOutPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    if (this.container.layer && models.length > 0) {
      let pvs = models[0].currentPointVectors;
      this.container.layer.dragOutPoints = pvs;
    }
  }


  // ============================ 静态方法 ============================
  /**
   * 返回当前实例
   */
  static newInstance(model: DDeiAbstractShape): DDeiLayoutManager {
    return new DDeiLayoutManagerNine(model);
  }

}

export default DDeiLayoutManagerNine
