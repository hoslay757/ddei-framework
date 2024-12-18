import DDeiAbstractShape from "../../models/shape";
import DDeiUtil from "../../util";
import DDeiLayoutManager from "../layout-manager";
import { Matrix3, Vector3 } from 'three';
import DDeiConfig from "../../config";

/**
 * 九宫格布局
 */
class DDeiLayoutManagerNine extends DDeiLayoutManager {

  // ============================ 方法 ===============================

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
    let areasPVS = this.getAreasPVS();
    //按照布局数据，更新model的坐标和大小
    for (let key in layoutData) {
      let model = this.container.models.get(key);
      let data = layoutData[key];
      if (model) {
        //基于当前容器构建缩放矩阵，将内部控件的向量，缩放到当前容器的大小，再位移到容器中心
        let m1 = new Matrix3()
        //移动到原点
        let moveZeroMatrix = new Matrix3(
          1, 0, - model.cpv.x,
          0, 1, - model.cpv.y,
          0, 0, 1);
        m1.premultiply(moveZeroMatrix)
        //旋转到0度
        if (model.rotate) {
          let angle = (model.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          m1.premultiply(rotateMatrix)
        }
        //构建缩放矩阵
        let scaleMatrix = new Matrix3(
          unitWidth / model.width, 0, 0,
          0, unitHeight / model.height, 0,
          0, 0, 1);
        m1.premultiply(scaleMatrix)
        //旋转到回原始角度
        if (model.rotate) {
          let angle = -(model.rotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
          let rotateMatrix = new Matrix3(
            Math.cos(angle), Math.sin(angle), 0,
            -Math.sin(angle), Math.cos(angle), 0,
            0, 0, 1);
          m1.premultiply(rotateMatrix)
        }


        //位移到区域中心点
        let areaPV = areasPVS[data.row * 3 + data.col]
        let areaPVC = { x: (areaPV[0].x + areaPV[2].x) / 2, y: (areaPV[0].y + areaPV[2].y) / 2 }
        let moveContainerMatrix = new Matrix3(
          1, 0, areaPVC.x,
          0, 1, areaPVC.y,
          0, 0, 1);
        m1.premultiply(moveContainerMatrix)
        //应用变换
        model.transVectors(m1)

        // model.setBounds(data.col * unitWidth, data.row * unitHeight, unitWidth, unitHeight)
        if (model.changeChildrenBounds) {
          model.changeChildrenBounds();
        }
      }
    }
  }

  /**
   * 根据子模型大小，修改自身大小
   */
  changeParentsBounds(): void {

  }

  transVectors(matrix): void {
    this.container.transVectors(matrix)
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
      //将元素从就容器移出
      if (oldContainer) {
        oldContainer.removeModel(item,false);
      }
      newContainer.addModel(item,false);
      //绑定并初始化渲染器
      item.initRender();
      //如果操作的只有一个元素，就在空位插入元素，
      if (models.length == 1 && layoutIndex.row != -1 && layoutIndex.col != -1) {
        layoutData[item.id] = { row: layoutIndex.row, col: layoutIndex.col }
        //如果已存在元素，则交换
        if (indexModel) {
          newContainer.removeModel(indexModel,false);
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
          oldContainer.addModel(indexModel,false);
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
    //计算鼠标移入的区域
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
    return true;
  }



  /**
   * 获取切分区域的点，超出区域的范围不会显示内容
   */
  getAreasPVS(): object[][] {
    let stageRatio = this.container?.getStageRatio()
    let vc1 = new Vector3(this.container.pvs[0].x, this.container.pvs[0].y, 1);
    let vc2 = new Vector3(this.container.pvs[1].x, this.container.pvs[1].y, 1);
    let vc3 = new Vector3(this.container.pvs[2].x, this.container.pvs[2].y, 1);
    let vc4 = new Vector3(this.container.pvs[3].x, this.container.pvs[3].y, 1);
    let width = this.container.width * stageRatio
    let height = this.container.height * stageRatio
    let unitWidth = width / 3;
    let unitHeight = height / 3;
    //恢复旋转进行计算，再旋转回来
    if (this.container.rotate) {
      let move1Matrix = new Matrix3(
        1, 0, -this.container.cpv.x,
        0, 1, -this.container.cpv.y,
        0, 0, 1);
      let angle = this.container.rotate * DDeiConfig.ROTATE_UNIT
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      let move2Matrix = new Matrix3(
        1, 0, this.container.cpv.x,
        0, 1, this.container.cpv.y,
        0, 0, 1);
      let m1 = new Matrix3().premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix);
      vc1.applyMatrix3(m1)
      vc2.applyMatrix3(m1)
      vc3.applyMatrix3(m1)
      vc4.applyMatrix3(m1)
    }

    //计算外部的点
    let p11 = new Vector3(vc1.x, vc1.y, 1);
    let p12 = new Vector3(vc1.x + unitWidth, vc1.y, 1)
    let p13 = new Vector3(vc1.x + unitWidth * 2, vc1.y, 1)
    let p14 = new Vector3(vc2.x, vc2.y, 1);
    let p21 = new Vector3(vc1.x, vc1.y + unitHeight, 1);
    let p22 = new Vector3(vc1.x + unitWidth, vc1.y + unitHeight, 1)
    let p23 = new Vector3(vc1.x + unitWidth * 2, vc1.y + unitHeight, 1)
    let p24 = new Vector3(vc2.x, vc1.y + unitHeight, 1);
    let p31 = new Vector3(vc1.x, vc1.y + unitHeight * 2, 1);
    let p32 = new Vector3(vc1.x + unitWidth, vc1.y + unitHeight * 2, 1)
    let p33 = new Vector3(vc1.x + unitWidth * 2, vc1.y + unitHeight * 2, 1)
    let p34 = new Vector3(vc2.x, vc1.y + unitHeight * 2, 1);
    let p41 = new Vector3(vc4.x, vc4.y, 1);
    let p42 = new Vector3(vc4.x + unitWidth, vc4.y, 1)
    let p43 = new Vector3(vc4.x + unitWidth * 2, vc4.y, 1)
    let p44 = new Vector3(vc3.x, vc4.y, 1);
    if (this.container.rotate) {
      let centerPoint = this.container.cpv;
      let move1Matrix = new Matrix3(
        1, 0, -centerPoint.x,
        0, 1, -centerPoint.y,
        0, 0, 1);
      let angle = -this.container.rotate * DDeiConfig.ROTATE_UNIT
      let rotateMatrix = new Matrix3(
        Math.cos(angle), Math.sin(angle), 0,
        -Math.sin(angle), Math.cos(angle), 0,
        0, 0, 1);
      let move2Matrix = new Matrix3(
        1, 0, centerPoint.x,
        0, 1, centerPoint.y,
        0, 0, 1);
      let m1 = new Matrix3().premultiply(move1Matrix).premultiply(rotateMatrix).premultiply(move2Matrix);

      p11.applyMatrix3(m1);
      p12.applyMatrix3(m1);
      p13.applyMatrix3(m1);
      p14.applyMatrix3(m1);
      p21.applyMatrix3(m1);
      p22.applyMatrix3(m1);
      p23.applyMatrix3(m1);
      p24.applyMatrix3(m1);
      p31.applyMatrix3(m1);
      p32.applyMatrix3(m1);
      p33.applyMatrix3(m1);
      p34.applyMatrix3(m1);
      p41.applyMatrix3(m1);
      p42.applyMatrix3(m1);
      p43.applyMatrix3(m1);
      p44.applyMatrix3(m1);
    }
    //构造九个数组返回
    let returnArray = [
      [p11, p12, p22, p21], [p12, p13, p23, p22], [p13, p14, p24, p23],
      [p21, p22, p32, p31], [p22, p23, p33, p32], [p23, p24, p34, p33],
      [p31, p32, p42, p41], [p32, p33, p43, p42], [p33, p34, p44, p43]
    ]


    return returnArray;
  }

  /**
  * 计算时拖入待确认时的显示图形的向量
  */
  calDragInPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    //获取向量
    if (this.container.layer) {
      let areasPVS = this.getAreasPVS();
      for (let i = 0; i < areasPVS.length; i++) {
        let inArea = DDeiAbstractShape.isInsidePolygon(
          areasPVS[i], { x: x, y: y });
        if (inArea) {
          this.container.layer.dragInPoints = areasPVS[i];
          return;
        }
      }
    }
  }

  /**
  * 计算时拖入出确认时的显示图形的向量
  */
  calDragOutPVS(x: number, y: number, models: DDeiAbstractShape[]): void {
    if (this.container.layer && models.length > 0) {
      let model = models[0]
      if (model.id.indexOf("_shadow") != -1) {
        model = this.container?.stage?.getModelById(model.id.substring(0, model.id.lastIndexOf("_shadow")));
      }
      let areasPVS = this.getAreasPVS();
      for (let i = 0; i < areasPVS.length; i++) {
        let inArea = DDeiAbstractShape.isInsidePolygon(
          areasPVS[i], { x: model.cpv.x, y: model.cpv.y });
        if (inArea) {
          this.container.layer.dragOutPoints = areasPVS[i];
          return;
        }
      }
    }
  }

  /**
     * 获取落入的布局行列
     * @param x 
     * @param y 
     * @returns 
     */
  private getLayoutIndex(x: number, y: number): object {
    //获取向量
    if (this.container.layer) {
      let areasPVS = this.getAreasPVS();
      for (let i = 0; i < areasPVS.length; i++) {
        let inArea = DDeiAbstractShape.isInsidePolygon(
          areasPVS[i], { x: x, y: y });
        if (inArea) {
          let row = parseInt(i / 3)
          let col = parseInt(i % 3)
          return { row: row, col: col }
        }
      }
    }
    return { row: -1, col: -1 }
  }
  // ============================ 静态方法 ============================
  /**
   * 返回当前实例
   */
  static newInstance(model: DDeiAbstractShape): DDeiLayoutManager {
    return new DDeiLayoutManagerNine(model);
  }

}

export { DDeiLayoutManagerNine }
export default DDeiLayoutManagerNine
