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


  canAppend(x: number, y: number, models: DDeiAbstractShape[]): boolean {
    if (models?.length == 1 || models?.length <= 9 - this.container.models.size) {
      //获取当前容器的上级，形成链路，直到layer
      let parentControls = this.container.getParents();
      //检测，拖入对象不能为自身容器以及自身容器子控件
      for (let i = 0; i < models.length; i++) {
        let model = models[i];
        if (model.id.indexOf("_shadow") != -1) {
          let id = model.id.substring(model.id, model.id.lastIndexOf("_shadow"))
          model = this.container.stage?.getModelById(id)
        }
        if (model == this.container) {
          return false;
        } else if (parentControls.indexOf(model) != -1) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  append(x: number, y: number, models: DDeiAbstractShape[]): boolean {

    let layoutData = null;
    if (this?.container?.layoutData?.nine) {
      layoutData = this.container.layoutData.nine
    }
    //获取鼠标在九宫格的位置
    let layoutIndex = this.getLayoutIndex(x, y);
    //获取鼠标落点是否存在已有控件
    let indexModel = null;
    //预先计算空位
    let emptyAreas = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]
    for (let key in layoutData) {
      let data = layoutData[key];
      if (data.row == layoutIndex.row && data.col == layoutIndex.col) {
        indexModel = this.container.models.get(key);
      }
      emptyAreas[data.row][data.col] = 1;
    }
    let newContainer = this.container;
    for (let i = 0; i < models.length; i++) {
      let item = models[i]
      let oldContainer = item.pModel;

      //转换坐标，获取最外层的坐标
      let itemAbsPos = item.getAbsPosition();
      let itemAbsRotate = item.getAbsRotate();
      //将元素从就容器移出
      if (oldContainer) {
        oldContainer.removeModel(item);
      }
      let loAbsPos = newContainer.getAbsPosition();
      let loAbsRotate = newContainer.getAbsRotate();
      item.setPosition(itemAbsPos.x - loAbsPos.x, itemAbsPos.y - loAbsPos.y)
      item.rotate = itemAbsRotate - loAbsRotate
      newContainer.addModel(item);
      //绑定并初始化渲染器
      item.initRender();
      //如果操作的只有一个元素，就在空位插入元素，
      if (models.length == 1) {
        layoutData[item.id] = { row: layoutIndex.row, col: layoutIndex.col }
        //如果已存在元素，则交换
        if (indexModel) {

          let oldAbsPos = indexModel.getAbsPosition();
          newContainer.removeModel(indexModel);
          //坐标为移入控件的坐标
          if (item.dragOriginX || item.dragOriginX == 0) {
            indexModel.setBounds(item.dragOriginX, item.dragOriginY, item.dragOriginWidth, item.dragOriginHeight);
            item.dragOriginX = null;
            item.dragOriginY = null;
            item.dragOriginWidth = null;
            item.dragOriginHeight = null;
          }
          //如果也为九宫格布局，则交换宫格
          if (oldContainer.layout == 'nine') {
            let oldLayoutData = oldContainer?.layoutData?.nine;
            let oldLayoutInfo = oldLayoutData[item.id]
            if (oldLayoutInfo) {
              delete oldLayoutData[item.id]
              oldLayoutData[indexModel.id] = oldLayoutInfo;
            }
          }
          //交换
          oldContainer.addModel(indexModel);
          //绑定并初始化渲染器
          indexModel.initRender();
          oldContainer.layoutManager?.updateLayout(oldAbsPos.x, oldAbsPos.y, [indexModel]);
        }
      } else {
        //如果有多个元素，则从头开始在空位插入元素
        for (let sr = 0; sr < 3; sr++) {
          let has = false;
          for (let sc = 0; sc < 3; sc++) {
            if (emptyAreas[sr][sc] == 0) {
              layoutData[item.id] = { row: sr, col: sc }
              emptyAreas[sr][sc] = 1;
              has = true;
              break;
            }
          }
          if (has) {
            break;
          }
        }
      }
    }
    return true
  }

  /**
   * 修改布局信息
   */
  updateLayout(x: number, y: number, models: DDeiAbstractShape[]): void {
    //计算鼠标移入的区域  TODO 旋转的情况
    if (this?.container?.layoutData?.nine && models?.length > 0) {
      let layoutData = this.container.layoutData.nine
      //获取鼠标在九宫格的位置
      let layoutIndex = this.getLayoutIndex(x, y);
      if (layoutIndex.row != -1 && layoutIndex.col != -1) {
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
          if (data.row == layoutIndex.row && data.col == layoutIndex.col) {
            oldModel = this.container.models.get(key);
            break;
          }
        }
        //如果不存在老位置，且新位置也有元素,不能移入
        if (oldRow == -1 && oldModel) {

        }
        //存在老位置，新位置有元素,交换
        else if (oldRow != -1 && oldModel) {
          layoutData[models[0].id] = { row: layoutIndex.row, col: layoutIndex.col }
          layoutData[oldModel.id] = { row: oldRow, col: oldCol }
        }
        //新位置无元素，允许移入
        else if (!oldModel) {
          layoutData[models[0].id] = { row: layoutIndex.row, col: layoutIndex.col }
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

  /**
     * 获取落入的布局行列
     * @param x 
     * @param y 
     * @returns 
     */
  private getLayoutIndex(x: number, y: number): object {
    //计算鼠标落点在哪个位置
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
    return { row: row, col: col }
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
