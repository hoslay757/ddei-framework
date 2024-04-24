import DDeiConfig from '../config'
import DDeiAbstractShape from './shape';
import DDeiTableCell from './table-cell';
import DDeiEnumControlState from '../enums/control-state';
import DDeiTableSelector from './table-selector';
import DDeiUtil from '../util';
import { Matrix3, Vector3 } from 'three';
import { first } from 'lodash';
import DDeiEnumBusCommandType from '../enums/bus-command-type';


/**
 * 表格控件
 * 表格控件本身可以承载数据，也能够作为布局元素装载其它控件
 * 表格控件由多个单元格行列构成，允许合并、拆分、调整每列，每行的大小以及高度
 * 表格布局的layoutdata是一个表格控件
 */
class DDeiTable extends DDeiAbstractShape {

  // ============================ 构造函数 ============================
  constructor(props: object) {
    super(props)

    this.cols = props.cols;

    this.rows = props.rows;

    this.initRowNum = props.initRowNum ? props.initRowNum : 5;

    this.initColNum = props.initColNum ? props.initColNum : 5;


  }

  // ============================ 方法 ===============================
  /**
   * 初始化渲染器
   */
  initRender(): void {

    //绑定并初始化渲染器
    DDeiConfig.bindRender(this);
    this.render.init();
    //初始化单元格渲染器
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.stage = this.stage
        cellObj.table = this
        cellObj.layer = this.layer
        cellObj.pModel = this;
        cellObj.ddInstance = this.ddInstance
        cellObj.initRender();
      }
    }
    this.initSelector()
  }

  /**
   * 初始化表格
   */
  initTable(): void {
    //如果行和列的集合对象都未生成，则缺省根据initRowNum，initColNum生成
    if (!(this.rows?.length > 0 && this.cols?.length > 0)) {
      //计算缺省横列宽高
      let initWidth = parseFloat((this.width / this.initColNum).toFixed(4));
      let initHeight = parseFloat((this.height / this.initRowNum).toFixed(4));
      this.rows = [];
      this.cols = [];
      //获取子属性定义，用于初始化单元格
      for (let i = 0; i < this.initRowNum; i++) {
        this.rows[i] = [];
        for (let j = 0; j < this.initColNum; j++) {
          if (i == 0) {
            this.cols[j] = [];
          }
          let initJSON = DDeiUtil.getSubControlJSON(this.modelCode,this.stage?.ddInstance);
          initJSON.id = this.id + "_c_" + i + "_" + j
          let x = (j + 0.5) * initWidth
          let y = (i + 0.5) * initHeight
          initJSON.row = i
          initJSON.col = j
          initJSON.width = initWidth
          initJSON.height = initHeight
          initJSON.table = this
          //同时初始化行和列的引用
          this.rows[i][j] = DDeiTableCell.initByJSON(initJSON, { currentStage: this.stage });
          this.rows[i][j].cpv.x += this.x + x
          this.rows[i][j].cpv.y += this.y + y
          this.rows[i][j].pvs.forEach(pv => {
            pv.x += this.x + x
            pv.y += this.y + y
          });

          this.rows[i][j].calLoosePVS()
          this.cols[j][i] = this.rows[i][j];
        }
      }
    }
  }

  /**
   * 初始化选择器
   */
  initSelector(): void {
    if (!this.selector) {
      //创建选择框控件
      this.selector = DDeiTableSelector.initByJSON({
        id: this.id + "_table_selector",
        border: DDeiConfig.TABLE.selector.border,
        fill: { default: {}, selected: {} },
        table: this
      });

      this.selector.stage = this.stage
      DDeiConfig.bindRender(this.selector);
      this.selector.initRender();
      this.selector.resetState();
    }

  }


  /**
   * 清除所有选中的单元格，并将curRow和curCol归位
   */
  clearSelectionCells(): void {
    //重设所有单元格的行列关系      
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.setState(DDeiEnumControlState.DEFAULT)
      }
    }
    this.curRow = -1;
    this.curCol = -1;
  }

  //重设所有单元格的行列关系,以及对应的坐标、向量等
  resetCellData(): void {
    //重新计算坐标和行列数
    let tmpY = 0;
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      let tmpX = 0;
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.row = i;
        cellObj.col = j;
        cellObj.setPosition(tmpX, tmpY)
        if (cellObj.mergedCell != null || cellObj.mergeRowNum > 1 || cellObj.mergeColNum > 1) {
          tmpX = tmpX + cellObj.originWidth;
        } else {
          tmpX = tmpX + cellObj.width;
        }
        if (j == rowObj.length - 1) {
          if (cellObj.mergedCell != null || cellObj.mergeRowNum > 1 || cellObj.mergeColNum > 1) {
            tmpY = tmpY + cellObj.originHeight;
          } else {
            tmpY = tmpY + cellObj.height;
          }
        }
      }
    }
  }



  /**
   * 获取子模型
   */
  getSubModels(ignoreModelIds: string[], level: number = 1): DDeiAbstractShape[] {
    let models: DDeiAbstractShape[] = [];
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let subModels = rowObj[j].getSubModels(ignoreModelIds, level - 1)
        models = models.concat(subModels);
      }
    }
    return models;
  }


  /**
   * 设置表格大小
   * @param w 
   * @param h 
   */
  setSize(w: number, h: number): void {

    if (this.width && this.height) {
      let wR = w / this.width;
      let hR = h / this.height;
      //设置所有单元格的大小，等比变化
      //重设所有单元格的行列关系      
      for (let i = 0; i < this.rows.length; i++) {
        let rowObj = this.rows[i];
        for (let j = 0; j < rowObj.length; j++) {
          let cellObj = rowObj[j];
          cellObj.setBounds(cellObj.x * wR, cellObj.y * hR, cellObj.width * wR, cellObj.height * hR)
          cellObj.originWidth = cellObj.originWidth * wR
          cellObj.originHeight = cellObj.originHeight * hR
        }
      }
    }
    super.setSize(w, h);
  }

  /**
   * 在第row行（下标）之下插入一个新行，插入的行的大小等于row的大小
   * 插入后会重新维护所有行列关系
   * 插入后会维护合并单元格关系
   * 插入行后会往下增加表格的总高度，使表格高度=SUM（行高）
   * @param row 行数 
   * @param direction 1向上，2向下
   */
  insertRow(row: number, direction: number): void {
    let firstInsert = false;
    if (row < 0) {
      row = 0;
      firstInsert = true;
    } else if (row > this.rows.length - 1) {
      row = this.rows.length - 1;
    }
    //取得当前行的对象,如果是第一行，则以第0行为蓝本
    let currentRow = this.rows[row];

    //以当前行的各个单元格样式为蓝本，创建新的行，并将新的行插入
    let newRow = [];
    let corssMergeCell = [];
    let addHeight = 0;
    for (let i = 0; i < currentRow.length; i++) {
      let oldCell = currentRow[i];
      let newWidth = 0;
      let newHeight = 0;
      if (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1 || oldCell.mergedCell) {
        newWidth = oldCell.originWidth;
        newHeight = oldCell.originHeight;
      } else {
        newWidth = oldCell.width;
        newHeight = oldCell.height;
      }
      let initJSON = DDeiUtil.getSubControlJSON(this.modelCode, this.stage?.ddInstance);
      initJSON.width = newWidth
      initJSON.height = newHeight
      initJSON.table = this

      //同时初始化行和列的引用
      let newCell = DDeiTableCell.initByJSON(initJSON, { currentStage: this.stage });
      newCell.cpv.x += x
      newCell.cpv.y += y
      newCell.pvs.forEach(pv => {
        pv.x += x
        pv.y += y
      });
      newCell.calLoosePVS()
      newCell.layer = this.layer;
      newCell.stage = this.stage;
      newCell.pModel = this;
      newCell.initRender();
      newRow[i] = newCell;
      if (i == 0) {
        addHeight = newCell.height;
      }

      //维护合并单元格关系，在这里处理比较简单
      let mCell = null;
      if (!firstInsert && (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1 || oldCell.mergedCell)) {
        //如果当前单元格是合并单元格
        if (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1) {
          mCell = oldCell;
        }
        //如果当前单元格是被合并的单元格
        else if (oldCell.mergedCell) {
          mCell = this.rows[oldCell.mergedCell.row][oldCell.mergedCell.col];
        }
        newCell.mergedCell = mCell;
        if (corssMergeCell.indexOf(mCell) == -1) {
          corssMergeCell[corssMergeCell.length] = mCell;
          mCell.mergeRowNum = mCell.mergeRowNum + 1;
          mCell.setSize(undefined, parseFloat(mCell.height) + parseFloat(newCell.height));
        }
        newCell.originWidth = newCell.width;
        newCell.originHeight = newCell.height;
        newCell.height = 0;
        newCell.width = 0;
      }
    }
    //设置表格的高度
    this.height = this.height + addHeight;
    this.setModelChanged()
    //循环列，维护列的关系
    for (let i = 0; i < this.cols.length; i++) {
      let currentCol = this.cols[i];
      //向当每一个列集合中添加行
      if (firstInsert) {
        currentCol.splice(0, 0, newRow[i]);
      } else {
        currentCol.splice(row + 1, 0, newRow[i]);
      }
    }
    //插入行
    if (firstInsert) {
      this.rows.splice(0, 0, newRow);
    } else {
      this.rows.splice(row + 1, 0, newRow);
    }
    //重设所有单元格的行列关系
    this.resetCellData();

    //TODO 清空剪切区域
    window.globalTableCopyData = null;
    window.globalTableCutData = null;
    if (this.copyAreaShape) {
      this.copyAreaShape.style.display = "none";
    }

    this.clearSelectionCells();

    //设置选中行
    if (firstInsert) {
      if (direction == 1) {
        this.curRow = 0;
      } else {
        this.curRow = 1;
      }
    } else {
      this.curRow = row + 1;
    }
    //选中当前表格与新插入的单元格
    this.setState(DDeiEnumControlState.SELECTED);
    for (let i = 0; i < this.cols.length; i++) {
      this.cols[i][this.curRow].setState(DDeiEnumControlState.SELECTED);
    }
    this.changeChildrenBounds();
  }

  /**
   * 修改自身状态
   */
  setState(state: DDeiEnumControlState) {
    super.setState(state);
    if (this.state == DDeiEnumControlState.DEFAULT) {
      //设置清空子控件的选中状态
      this.selector.resetState();
    }
  }



  /**
   * 计算单元格的点旋转后的坐标
   * @param rotateMatrix 旋转矩阵 
   */
  calCellsRotatePointVectors(rotateMatrix): void {
    //宽松判定区域的宽度
    let looseWeight = 10;
    let parentCenterPointVector = this.centerPointVector;
    if (parentCenterPointVector) {
      for (let i = 0; i < this.rows.length; i++) {
        let rowObj = this.rows[i];
        for (let j = 0; j < rowObj.length; j++) {

          let item = rowObj[j]

          let halfWidth = item.width * 0.5;
          let halfHeight = item.height * 0.5;

          let vc, vc1, vc2, vc3, vc4;
          let loosePointVectors = null;
          if (item.pointVectors?.length > 0) {
            vc = item.centerPointVector;
            vc1 = item.pointVectors[0];
            vc2 = item.pointVectors[1];
            vc3 = item.pointVectors[2];
            vc4 = item.pointVectors[3];
            loosePointVectors = item.loosePointVectors
          } else {
            item.pointVectors = []
            let absBoundsOrigin = item.getAbsBounds()
            vc = new Vector3(absBoundsOrigin.x + halfWidth, absBoundsOrigin.y + halfHeight, 1);
            vc1 = new Vector3(vc.x - halfWidth, vc.y - halfHeight, 1);
            vc2 = new Vector3(vc.x + halfWidth, vc.y - halfHeight, 1);
            vc3 = new Vector3(vc.x + halfWidth, vc.y + halfHeight, 1);
            vc4 = new Vector3(vc.x - halfWidth, vc.y + halfHeight, 1);
            item.pointVectors.push(vc1)
            item.pointVectors.push(vc2)
            item.pointVectors.push(vc3)
            item.pointVectors.push(vc4)
            item.centerPointVector = vc;
            //stage级全局缩放
            //全局缩放
            let stageRatio = item.getStageRatio();
            let globalScaleMatrix = new Matrix3(
              stageRatio, 0, 0,
              0, stageRatio, 0,
              0, 0, 1);
            item.centerPointVector.applyMatrix3(globalScaleMatrix);
            item.pointVectors.forEach(pv => {
              pv.applyMatrix3(globalScaleMatrix);
            });
            loosePointVectors = []
            //记录宽松判定区域的点
            loosePointVectors.push(new Vector3(vc1.x - looseWeight, vc1.y - looseWeight, vc1.z))
            loosePointVectors.push(new Vector3(vc2.x + looseWeight, vc2.y - looseWeight, vc2.z))
            loosePointVectors.push(new Vector3(vc3.x + looseWeight, vc3.y + looseWeight, vc3.z))
            loosePointVectors.push(new Vector3(vc4.x - looseWeight, vc4.y + looseWeight, vc4.z))
            item.loosePointVectors = loosePointVectors;
          }
          vc1.applyMatrix3(rotateMatrix);
          vc2.applyMatrix3(rotateMatrix);
          vc3.applyMatrix3(rotateMatrix);
          vc4.applyMatrix3(rotateMatrix);
          vc.applyMatrix3(rotateMatrix);
          loosePointVectors?.forEach(pv => {
            pv.applyMatrix3(rotateMatrix);
          });

          item.calChildrenRotatePointVectors(rotateMatrix);
        }

      }
    }
  }

  /**
   * 修改上层模型大小
   */
  changeParentsBounds(): boolean {
    if (this.pModel) {
      this.pModel.changeParentsBounds();
    }
    return true;
  }
  /**
     * 修改子元素大小
     */
  changeChildrenBounds(originRect, newRect): boolean {
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cell = rowObj[j]
        cell?.layoutManager?.changeSubModelBounds();
      }
    }
    return true;
  }
  /**
   * 在第col列（下标）之下插入一个新列，插入的列的大小等于col的大小
   * 插入后会重新维护所有行列关系
   * 插入后会维护合并单元格关系
   * 插入行后会往下增加表格的总高度，使表格高度=SUM（行高）
   * @param col
   * @param direction 1左边，2右边 
   */
  insertCol(col: number, direction: number): void {
    let firstInsert = false;
    if (col < 0) {
      col = 0;
      firstInsert = true;
    } else if (col > this.cols.length - 1) {
      col = this.cols.length - 1;
    }
    //取得当前列的对象,如果是第一列，则以第0列为蓝本
    let currentCol = this.cols[col];

    //以当前列的各个单元格样式为蓝本，创建新的列，并将新的列插入
    let newCol = [];
    let corssMergeCell = [];
    let addWidth = 0;
    for (let i = 0; i < currentCol.length; i++) {
      let oldCell = currentCol[i];
      let newWidth = 0;
      let newHeight = 0;
      if (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1 || oldCell.mergedCell) {
        newWidth = oldCell.originWidth;
        newHeight = oldCell.originHeight;
      } else {
        newWidth = oldCell.width;
        newHeight = oldCell.height;
      }

      let initJSON = DDeiUtil.getSubControlJSON(this.modelCode, this.stage?.ddInstance);
      initJSON.width = newWidth
      initJSON.height = newHeight
      initJSON.table = this

      //同时初始化行和列的引用
      let newCell = DDeiTableCell.initByJSON(initJSON);
      newCell.layer = this.layer
      newCell.stage = this.stage;
      newCell.pModel = this;
      newCell.initRender();
      newCol[i] = newCell;
      if (i == 0) {
        addWidth = newCell.width;
      }

      //维护合并单元格关系，在这里处理比较简单
      let mCell = null;
      if (!firstInsert && (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1 || oldCell.mergedCell)) {
        //如果当前单元格是合并单元格
        if (oldCell.mergeRowNum > 1 || oldCell.mergeColNum > 1) {
          mCell = oldCell;
        }
        //如果当前单元格是被合并的单元格
        else if (oldCell.mergedCell) {
          mCell = this.rows[oldCell.mergedCell.row][oldCell.mergedCell.col];
        }
        newCell.mergedCell = mCell;
        if (corssMergeCell.indexOf(mCell) == -1) {
          corssMergeCell[corssMergeCell.length] = mCell;
          mCell.mergeColNum = mCell.mergeColNum + 1;
          mCell?.setSize(parseFloat(mCell.width) + parseFloat(newCell.width));
        }
        newCell.originWidth = newCell.width;
        newCell.originHeight = newCell.height;
        newCell.height = 0;
        newCell.width = 0;

      }
    }
    //设置表格的高度
    this.width = this.width + addWidth;
    this.setModelChanged()
    //循环行，维护行的关系
    for (let i = 0; i < this.rows.length; i++) {
      let currentRow = this.rows[i];
      //向当每一个列集合中添加行
      if (firstInsert) {
        currentRow.splice(0, 0, newCol[i]);

      } else {
        currentRow.splice(col + 1, 0, newCol[i]);

      }
    }
    //插入列
    if (firstInsert) {
      this.cols.splice(0, 0, newCol);
    } else {
      this.cols.splice(col + 1, 0, newCol);
    }


    //重设所有单元格的行列关系
    this.resetCellData();


    //TODO 清空剪切区域
    window.globalTableCopyData = null;
    window.globalTableCutData = null;
    if (this.copyAreaShape) {
      this.copyAreaShape.style.display = "none";
    }

    this.clearSelectionCells();


    //设置选中行
    if (firstInsert) {
      if (direction == 1) {
        this.curCol = 0;
      } else {
        this.curCol = 1;
      }
    } else {
      this.curCol = col + 1;
    }
    //选中当前表格与新插入的单元格
    this.setState(DDeiEnumControlState.SELECTED)
    for (let i = 0; i < this.rows.length; i++) {
      this.rows[i][this.curCol].setState(DDeiEnumControlState.SELECTED)
    }
    this.changeChildrenBounds();
  }

  /**
   * 删除行
   * @param  row 
   */
  removeRow(row: number): void {
    //如果仅剩一行则不可删除
    if (this.rows.length <= 1) {
      return;
    }
    let firstRemove = false;
    if (row < 0) {
      row = 0;
      firstRemove = true;
    } else if (row > this.rows.length - 1) {
      row = this.rows.length - 1;
    }

    //取得将要被删除的单元格
    let removeCells = null;
    if (firstRemove) {
      removeCells = this.rows[0];
    } else {
      removeCells = this.rows[row];
    }
    let removeHeight = 0;
    let corssMergeCell = [];
    //遍历单元格，如果其中存在合并单元格或者被合并单元格，则进行处理
    for (let x = 0; x < removeCells.length; x++) {
      let removeCell = removeCells[x];
      removeHeight = removeCell.height;
      let mCell = null;
      //如果是合并单元格
      if (removeCell.mergeRowNum == 1) {
        //不做任何处理
      }
      else if (removeCell.mergeRowNum > 1 || removeCell.mergeColNum > 1) {
        //将合并单元格下移
        mCell = this.rows[removeCell.row + 1][x];
        //重新设置依赖关系
        mCell.setSize(removeCell.width, removeCell.height)
        mCell.mergeRowNum = removeCell.mergeRowNum;
        mCell.mergeColNum = removeCell.mergeColNum;

        for (let i = mCell.row; i < mCell.row + removeCell.mergeRowNum - 1; i++) {
          for (let j = mCell.col; j < mCell.col + mCell.mergeColNum; j++) {
            this.rows[i][j].mergedCell = mCell;
          }
        }
        removeHeight = removeCell.originHeight;

      }
      //如果是被合并单元格
      else if (removeCell.mergedCell != null) {
        mCell = removeCell.mergedCell;
        removeHeight = removeCell.originHeight;
      }
      if (mCell != null) {
        //加入受影响的合并单元格列表中
        if (corssMergeCell.indexOf(mCell) == -1) {
          corssMergeCell[corssMergeCell.length] = mCell;
          mCell.mergeRowNum = mCell.mergeRowNum - 1;
          mCell.setSize(mCell.width, parseInt(mCell.height) - removeHeight);
        }
      }
    }

    if (firstRemove) {
      this.rows.splice(0, 1);
    } else {
      this.rows.splice(row, 1);
    }
    //设置表格的高度
    this.height = this.height - removeHeight;
    this.setModelChanged()
    //循环列，维护列的关系
    for (let i = 0; i < this.cols.length; i++) {
      let currentCol = this.cols[i];
      //删除列中的行
      if (firstRemove) {
        currentCol.splice(0, 1);
      } else {
        currentCol.splice(row, 1);
      }
    }
    if (row < 0) {
      this.curRow = 0;
    } else if (row > this.rows.length - 1) {
      this.curRow = this.rows.length - 1;
    } else {
      this.curRow = row;
    }

    //重设所有单元格的行列关系
    this.resetCellData();
  }

  /**
   * 删除列
   * @param  col 
   */
  removeCol(col: number): void {
    //如果仅剩一列则不可删除
    if (this.cols.length <= 1) {
      return;
    }
    let firstRemove = false;
    if (col < 0) {
      col = 0;
      firstRemove = true;
    } else if (col > this.cols.length - 1) {
      col = this.cols.length - 1;
    }

    //取得将要被删除的单元格
    let removeCells = null;
    if (firstRemove) {
      removeCells = this.cols[0];
    } else {
      removeCells = this.cols[col];
    }
    let removeWidth = 0;
    let corssMergeCell = [];
    //遍历单元格，如果其中存在合并单元格或者被合并单元格，则进行处理
    for (let x = 0; x < removeCells.length; x++) {
      let removeCell = removeCells[x];
      removeWidth = removeCell.width;
      let mCell = null;
      //如果是合并单元格
      if (removeCell.mergeColNum == 1) {
        //不做任何处理
      }
      else if (removeCell.mergeColNum > 1 || removeCell.mergeRowNum > 1) {
        //将合并单元格右移
        mCell = this.rows[x][removeCell.col + 1];
        //重新设置依赖关系
        mCell.setSize(removeCell.width, removeCell.height)
        mCell.mergeRowNum = removeCell.mergeRowNum;
        mCell.mergeColNum = removeCell.mergeColNum;

        for (let i = mCell.col; i < mCell.col + removeCell.mergeColNum - 1; i++) {
          for (let j = mCell.row; j < mCell.row + mCell.mergeRowNum; j++) {
            this.rows[j][i].mergedCell = mCell;
          }
        }
        removeWidth = removeCell.originWidth;

      }
      //如果是被合并单元格
      else if (removeCell.mergedCell != null) {
        mCell = removeCell.mergedCell;
        removeWidth = removeCell.originWidth;
      }
      if (mCell != null) {
        //加入受影响的合并单元格列表中
        if (corssMergeCell.indexOf(mCell) == -1) {
          corssMergeCell[corssMergeCell.length] = mCell;
          mCell.mergeColNum = mCell.mergeColNum - 1;
          mCell.setSize(parseInt(mCell.width) - removeWidth, mCell.height)
        }
      }
    }


    //设置表格的宽度
    this.width = this.width - removeWidth
    this.setModelChanged()

    if (firstRemove) {
      this.cols.splice(0, 1);
    } else {
      this.cols.splice(col, 1);
    }
    //循环行，维护行的关系
    for (let i = 0; i < this.rows.length; i++) {
      let currentRow = this.rows[i];
      //删除行中的列
      if (firstRemove) {
        currentRow.splice(0, 1);
      } else {
        currentRow.splice(col, 1);
      }
    }

    if (col < 0) {
      this.curCol = 0;
    } else if (col > this.cols.length - 1) {
      this.curCol = this.cols.length - 1;
    } else {
      this.curCol = col;
    }

    //重设所有单元格的行列关系
    this.resetCellData();
    //TODO 清空剪切区域
  }

  // 取得区域内的所有单元格
  getCellsByRect(minRow: number, minCol: number, maxRow: number, maxCol: number): DDeiTableCell[] {
    let returnCells: DDeiTableCell[] = [];
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        returnCells[returnCells.length] = this.rows[i][j];
      }
    }
    return returnCells
  }

  /**
     * 合并选中的单元格
     */
  mergeSelectedCells(): void {
    //取得选中的单元格
    let selectedCells: DDeiTableCell[] = this.getSelectedCells();
    //取消合并单元格
    this.cancelMergeCells(selectedCells);
    //重新取得单元格
    selectedCells = this.getSelectedCells();
    //合并单元格
    this.mergeCells(selectedCells);
  }

  /**
   * 合并的单元格
   */
  mergeCells(selectedCells: DDeiTableCell[]): void {

    //求得选中单元格中最小的
    let minMaxRowCol = this.getMinMaxRowAndCol(selectedCells);
    //得到第一个单元格
    let firstCell = this.rows[minMaxRowCol.minRow][minMaxRowCol.minCol];
    //得到合并后单元格的宽度和高度

    let mergeHeight = 0;
    for (let i = minMaxRowCol.minRow; i <= minMaxRowCol.maxRow; i++) {
      mergeHeight = mergeHeight + this.rows[i][minMaxRowCol.minCol].height;
    }
    let mergeWidth = 0;
    for (let j = minMaxRowCol.minCol; j <= minMaxRowCol.maxCol; j++) {
      mergeWidth = mergeWidth + this.rows[minMaxRowCol.minRow][j].width;
    }
    firstCell.originWidth = firstCell.width;
    firstCell.originHeight = firstCell.height;
    //修改合并单元格的高度和宽度
    for (let i = minMaxRowCol.minRow; i <= minMaxRowCol.maxRow; i++) {
      for (let j = minMaxRowCol.minCol; j <= minMaxRowCol.maxCol; j++) {
        //记录合并前的大小
        this.rows[i][j].originWidth = this.rows[i][j].width;
        this.rows[i][j].originHeight = this.rows[i][j].height;
        this.rows[i][j].setSize(0, 0)
        //设置合并单元格与被合并单元格的引用关系
        this.rows[i][j].mergedCell = firstCell;
        //如果第一个单元格没有内容，则把内容移动到第一个单元格
        if ((!firstCell.text || firstCell.text.trim() == "")
          && firstCell.midList.length == 0) {
          if (this.rows[i][j].midList.length > 0) {
            this.stage?.ddInstance?.bus?.push(DDeiEnumBusCommandType.ModelChangeContainer, { oldContainer: this.rows[i][j], newContainer: firstCell, models: Array.from(this.rows[i][j].models.values()) }, { offsetX: 0, offsetY: 0 });
          } else if (this.rows[i][j].text && this.rows[i][j].text.trim() != "") {
            firstCell.text = this.rows[i][j].text
            this.rows[i][j].text = "";
          }
        }
        this.rows[i][j].setState(DDeiEnumControlState.DEFAULT);
      }
    }
    firstCell.mergeRowNum = minMaxRowCol.maxRow - minMaxRowCol.minRow + 1;
    firstCell.mergeColNum = minMaxRowCol.maxCol - minMaxRowCol.minCol + 1;

    firstCell.setSize(mergeWidth, mergeHeight)
    firstCell.setState(DDeiEnumControlState.SELECTED);
    //修改当前的选中单元格为合并后的单元格
    this.curRow = firstCell.row;
    this.curCol = firstCell.col;
    this.changeChildrenBounds();
  }

  /**
   * 将当前选中的单元格取消合并
   */
  cancelSelectedMergeCells(): void {
    //取得选中的单元格
    let selectedCells: DDeiTableCell[] = this.getSelectedCells();
    this.cancelMergeCells(selectedCells);
  }

  /**
   * 取得区域的开始和结束坐标
   */
  getCellPositionRect(startRow: number, startCol: number, endRow: number, endCol: number): { x: number, y: number, width: number, height: number } {
    let x = 0, y = 0, width = 0, height = 0;
    x = this.rows[startRow][startCol].x;
    y = this.rows[startRow][startCol].y;
    for (let i = startRow; i <= endRow; i++) {
      let rowWidth = 0;
      for (let j = startCol; j <= endCol; j++) {
        rowWidth = rowWidth + this.rows[i][j].width;
      }
      if (rowWidth > width) {
        width = rowWidth;
      }
    }
    for (let i = startCol; i <= endCol; i++) {
      let colHeight = 0;
      for (let j = startRow; j <= endRow; j++) {
        colHeight = colHeight + this.cols[i][j].height;
      }
      if (colHeight > height) {
        height = colHeight;
      }
    }

    return { x: x, y: y, width: width, height: height };
  }


  /**
   * 取消合并传入的单元格
   */
  cancelMergeCells(cells: DDeiTableCell[]): void {
    //取得选中的单元格
    if (cells != null) {
      for (let c = 0; c < cells.length; c++) {
        let firstCell = cells[c];
        //对合并的单元格进行还原，恢复以往单元格的大小，合并关系等
        for (let i = firstCell.row; i < firstCell.row + firstCell.mergeRowNum; i++) {
          for (let j = firstCell.col; j < firstCell.col + firstCell.mergeColNum; j++) {
            let cel = this.rows[i][j];
            cel.setSize(cel.originWidth, cel.originHeight)
            cel.originWidth = null;
            cel.originHeight = null;
            cel.mergedCell = null;
            cel.setState(DDeiEnumControlState.SELECTED)

          }
        }
        firstCell.mergeRowNum = null;
        firstCell.mergeColNum = null;
        //修改当前的选中单元格为合并后的单元格
        this.curRow = firstCell.row;
        this.curCol = firstCell.col;
      }
      this.changeChildrenBounds();
    }
  }

  /**
   * 根据表格内坐标获取单元格
   */
  getCellByTablePosition(x: number, y: number): DDeiTableCell {
    //判断属于哪一行
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cell = rowObj[j];
        if (cell.width <= 0 || cell.height <= 0) {
          continue;
        }
        if (cell.isInAreaLoose(x, y)) {
          return cell;
        }
      }
    }
    return null;
  }

  // 返回当前表格所有选中的单元格,ignoreMerged默认为false，不忽略
  getSelectedCells(): DDeiTableCell[] {
    let arr = [];
    for (let i = 0; i < this.rows.length; i++) {
      for (let j = 0; j < this.rows[i].length; j++) {
        if (this.rows[i][j].state == DDeiEnumControlState.SELECTED) {
          arr[arr.length] = this.rows[i][j];
        }
      }
    }
    return arr;
  }

  /**
   * 根据ID获取模型
   * @param id 模型id
   */
  getModelById(id: string): DDeiAbstractShape | null {
    //找到点所在的单元格
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cell = rowObj[j];
        let returnModel = cell.getModelById(id);
        if (returnModel) {
          return returnModel;
        }
      }
    }
  }

  /**
   * 获取实际的内部容器控件
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainer(): DDeiAbstractShape {
    return this;
  }

  /**
   * 获取实际的内部容器控件
   * @param x 相对路径坐标
   * @param y 相对路径坐标
   * @return 容器控件根据布局的模式不同返回不同的内部控件，普通控件返回null
   */
  getAccuContainerByPos(x: number, y: number): DDeiAbstractShape {
    //找到点所在的单元格
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cell = rowObj[j];
        if (cell.width <= 0 || cell.height <= 0) {
          continue;
        }
        if (cell.isInAreaLoose(x, y)) {
          return cell;
        }
      }
    }
    return null;
  }

  // 判断两个区域是否有重合
  isOverlap(rect1: { minRow: number, minCol: number, maxRow: number, maxCol: number },
    rect2: { minRow: number, minCol: number, maxRow: number, maxCol: number }): boolean {
    let l1 = { x: rect1.minCol, y: rect1.minRow }
    let r1 = { x: rect1.maxCol, y: rect1.maxRow }
    let l2 = { x: rect2.minCol, y: rect2.minRow }
    let r2 = { x: rect2.maxCol, y: rect2.maxRow }
    if (
      l1.x > r2.x ||
      l2.x > r1.x ||
      l1.y > r2.y ||
      l2.y > r1.y
    ) return false
    return true
  }


  // 判断区域内是否存在合并单元格或被合并单元格
  hasMergeCell(minRow: number, minCol: number, maxRow: number, maxCol: number): boolean {
    for (let i = minRow; i <= maxRow && i <= this.rows.length - 1; i++) {
      for (let j = minCol; j <= maxCol && j <= this.cols.length - 1; j++) {
        if (this.rows[i][j].isMergeCell() || this.rows[i][j].isMergedCell()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取单元格的最大外接矩形区域
   * @arr 单元格
   */
  getMinMaxRowAndCol(arr: DDeiTableCell[]): object | null {
    let minCol = -1, maxCol = -1, minRow = -1, maxRow = -1;
    for (let i = 0; i < arr.length; i++) {
      if (i == 0) {
        minRow = arr[i].row;
        minCol = arr[i].col;
        maxRow = arr[i].row;
        maxCol = arr[i].col;
        if (arr[i].mergeRowNum > 1 || arr[i].mergeColNum > 1) {
          maxRow = arr[i].row + arr[i].mergeRowNum - 1;
          maxCol = arr[i].col + arr[i].mergeColNum - 1;
        }
      } else {
        if (minRow > arr[i].row) {
          minRow = arr[i].row;
        }
        if (minCol > arr[i].col) {
          minCol = arr[i].col;
        }
        if (arr[i].mergeRowNum > 1 || arr[i].mergeColNum > 1) {
          let r1 = arr[i].row + arr[i].mergeRowNum - 1;
          let c1 = arr[i].col + arr[i].mergeColNum - 1;
          if (maxRow < r1) {
            maxRow = r1;
          }
          if (maxCol < c1) {
            maxCol = c1;
          }
        } else {
          if (maxRow < arr[i].row) {
            maxRow = arr[i].row;
          }
          if (maxCol < arr[i].col) {
            maxCol = arr[i].col;
          }
        }
      }
    }
    //遍历整个区域，如果包含的单元格中出现了合并单元格，并且超出了这个范围，则递归调用，重新计算
    if (minRow != -1 && maxRow != -1 && minCol != -1 && maxCol != -1) {
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minCol; j <= maxCol; j++) {
          //判断当前单元格是否为合并单元格，如果是合并单元格，则继续判断是否合并区域超出了本区域
          if (this.rows[i][j].mergeRowNum > 1 || this.rows[i][j].mergeColNum > 1) {
            if ((this.rows[i][j].row + this.rows[i][j].mergeRowNum - 1 > maxRow) || (this.rows[i][j].col + this.rows[i][j].mergeColNum - 1 > maxCol)) {
              arr[arr.length] = this.rows[i][j];
              return this.getMinMaxRowAndCol(arr);
            }
          }
          //如果是被合并的单元格，则找到其合并单元格后，再判断其合并单元格
          else if (this.rows[i][j].mergedCell != null) {
            let mCell = this.rows[this.rows[i][j].mergedCell.row][this.rows[i][j].mergedCell.col];
            if ((mCell.row + mCell.mergeRowNum - 1 > maxRow) || (mCell.col + mCell.mergeColNum - 1 > maxCol)
              || (mCell.col < minCol) || (mCell.row < minRow)) {
              arr[arr.length] = mCell;
              return this.getMinMaxRowAndCol(arr);
            }
          }
        }
      }
    }
    if (minCol != -1 && maxCol != -1 && minRow != -1 && maxRow != -1) {
      return { minCol: minCol, maxCol: maxCol, minRow: minRow, maxRow: maxRow };
    }
    return null;
  }

  /**
   * 判断指定区域内的所有单元格是否都被选中
   * @param r 行
   * @param c 列
   * @param r1 行1
   * @param c1 列1
   * @returns true都选中，false都没选中
   */
  isAllSelected(r: number, c: number, r1: number, c1: number): boolean {
    let returnData = true;
    let minCol = c > c1 ? c1 : c;
    let maxCol = c > c1 ? c : c1;
    let minRow = r > r1 ? r1 : r;
    let maxRow = r > r1 ? r : r1;
    for (let i = minRow; i <= maxRow; i++) {
      for (let j = minCol; j <= maxCol; j++) {
        //被合并的单元格不在判断的类别中
        if (this.rows[i][j].mergedCell != null) {
          continue;
        }
        if (this.rows[i][j].state != DDeiEnumControlState.SELECTED) {
          return false;
        }
      }
    }
    return returnData;
  }

  /**
   * 从上边调整表格的大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  changeTableSizeToTop(x: number, y: number): void {
    //取得当前列对象
    let table = this;
    //拖动行只修改行大小
    let dragObj = table.stage.render.dragObj;
    let changeHeight = dragObj.y - y
    dragObj.y = dragObj.y - changeHeight
    if (changeHeight != 0) {
      let processedCells = [];
      //执行前置校验，如果改变后的单元格大小或者原始大小小于5，则不允许拖拽
      for (let i = 0; i < table.cols.length; i++) {
        let afterCell = table.cols[i][0];
        if ((afterCell.height != 0 && afterCell.height + changeHeight < 5) || (afterCell.originHeight != null && afterCell.originHeight + changeHeight < 5)) {
          return;
        }
      }
      for (let i = 0; i < table.cols.length; i++) {
        let rowObj = table.cols[i];
        //处理后面的单元格
        let afterCell = table.cols[i][0];
        if (processedCells.indexOf(afterCell) == -1) {
          //普通单元格
          if (!afterCell.isMergedCell() && !afterCell.isMergeCell()) {
            afterCell.setSize(undefined, afterCell.height + changeHeight);
            processedCells[processedCells.length] = afterCell;
          }
          //合并单元格
          else if (afterCell.isMergeCell()) {
            let mCell = afterCell;
            mCell.originHeight = mCell.originHeight + changeHeight;
            mCell.setSize(undefined, mCell.height + changeHeight);
            processedCells[processedCells.length] = mCell;
          }
          //被合并单元格
          else if (afterCell.isMergedCell()) {
            afterCell.originHeight = afterCell.originHeight + changeHeight;
            processedCells[processedCells.length] = afterCell;
          }
        }
        for (let j = 1; j < rowObj.length; j++) {
          rowObj[j].setPosition(undefined, rowObj[j].y + changeHeight);
        }
      }
      table.height = table.height + changeHeight;
      table.setPosition(undefined, table.y - changeHeight);
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }

  /**
   * 从下边调整表格的大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  changeTableSizeToBottom(x: number, y: number): void {
    //取得当前列对象
    let table = this;
    //拖动行只修改行大小
    let dragObj = table.stage.render.dragObj;
    let changeHeight = y - dragObj.y;
    dragObj.y = dragObj.y + changeHeight
    if (changeHeight != 0) {
      let processedCells = [];
      //执行前置校验，如果改变后的单元格大小或者原始大小小于5，则不允许拖拽
      for (let i = 0; i < table.cols.length; i++) {
        let beforeCell = table.cols[i][table.rows.length - 1];
        if ((beforeCell.height != 0 && beforeCell.height + changeHeight < 5) || (beforeCell.originHeight != null && beforeCell.originHeight + changeHeight < 5)) {
          return;
        }
      }

      for (let i = 0; i < table.cols.length; i++) {
        //处理当前列单元格
        let beforeCell = table.cols[i][table.rows.length - 1];
        if (processedCells.indexOf(beforeCell) == -1) {
          //普通单元格
          if (!beforeCell.isMergedCell() && !beforeCell.isMergeCell()) {
            beforeCell.setSize(undefined, beforeCell.height + changeHeight);
            processedCells[processedCells.length] = beforeCell;
          }
          //合并单元格
          else if (beforeCell.isMergeCell()) {
            beforeCell.originHeight = beforeCell.originHeight + changeHeight;
            beforeCell.setSize(undefined, beforeCell.height + changeHeight);
            processedCells[processedCells.length] = beforeCell;
          }
          //被合并单元格
          else if (beforeCell.isMergedCell()) {
            let mCell = beforeCell.mergedCell;
            //尾部的合并单元格
            beforeCell.originHeight = beforeCell.originHeight + changeHeight;
            if (processedCells.indexOf(mCell) == -1) {
              processedCells[processedCells.length] = mCell;
              mCell.setSize(undefined, mCell.height + changeHeight);
            }
            processedCells[processedCells.length] = beforeCell;
          }
        }
      }
      table.height = table.height + changeHeight;
      table.setModelChanged()
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }
  /**
   * 从左边调整表格的大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  changeTableSizeToLeft(x: number, y: number): void {
    //取得当前列对象
    let table = this;
    //拖动列只修改列大小
    let dragObj = table.stage.render.dragObj;
    let changeWidth = dragObj.x - x;
    dragObj.x = dragObj.x - changeWidth
    if (changeWidth != 0) {
      let processedCells = [];
      //执行前置校验，如果改变后的单元格大小或者原始大小小于5，则不允许拖拽
      for (let i = 0; i < table.rows.length; i++) {
        let afterCell = table.rows[i][0];
        if ((afterCell.width != 0 && afterCell.width + changeWidth < 5) || (afterCell.originWidth != null && afterCell.originWidth + changeWidth < 5)) {
          return;
        }
      }
      for (let i = 0; i < table.rows.length; i++) {
        let rowObj = table.rows[i];
        //处理后面的单元格
        let afterCell = table.rows[i][0];
        if (processedCells.indexOf(afterCell) == -1) {
          //普通单元格
          if (!afterCell.isMergedCell() && !afterCell.isMergeCell()) {
            afterCell.setSize(afterCell.width + changeWidth)
            processedCells[processedCells.length] = afterCell;
          }
          //合并单元格
          else if (afterCell.isMergeCell()) {
            let mCell = afterCell;
            mCell.originWidth = mCell.originWidth + changeWidth;
            mCell.setSize(mCell.width + changeWidth)
            processedCells[processedCells.length] = mCell;
          }
          //被合并单元格
          else if (afterCell.isMergedCell()) {
            afterCell.originWidth = afterCell.originWidth + changeWidth;
            processedCells[processedCells.length] = afterCell;
          }
        }
        for (let j = 1; j < rowObj.length; j++) {
          rowObj[j].setPosition(rowObj[j].x + changeWidth)
        }
      }
      table.width = table.width + changeWidth
      table.setPosition(table.x - changeWidth)
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }
  /**
   * 从右边调整表格的大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  changeTableSizeToRight(x: number, y: number): void {
    //取得当前列对象
    let table = this;
    //拖动列只修改列大小
    let dragObj = table.stage.render.dragObj;
    let changeWidth = x - dragObj.x;
    dragObj.x = dragObj.x + changeWidth
    if (changeWidth != 0) {
      let processedCells = [];
      //执行前置校验，如果改变后的单元格大小或者原始大小小于5，则不允许拖拽
      for (let i = 0; i < table.rows.length; i++) {
        let beforeCell = table.rows[i][table.cols.length - 1];
        if ((beforeCell.width != 0 && beforeCell.width + changeWidth < 5) || (beforeCell.originWidth != null && beforeCell.originWidth + changeWidth < 5)) {
          return;
        }
      }

      for (let i = 0; i < table.rows.length; i++) {
        //处理当前列单元格
        let beforeCell = table.rows[i][table.cols.length - 1];
        if (processedCells.indexOf(beforeCell) == -1) {
          //普通单元格
          if (!beforeCell.isMergedCell() && !beforeCell.isMergeCell()) {
            beforeCell.setSize(beforeCell.width + changeWidth)
            processedCells[processedCells.length] = beforeCell;
          }
          //合并单元格
          else if (beforeCell.isMergeCell()) {
            beforeCell.originWidth = beforeCell.originWidth + changeWidth;
            beforeCell.setSize(beforeCell.width + changeWidth)
            processedCells[processedCells.length] = beforeCell;
          }
          //被合并单元格
          else if (beforeCell.isMergedCell()) {
            let mCell = beforeCell.mergedCell;
            //尾部的合并单元格
            beforeCell.originWidth = beforeCell.originWidth + changeWidth;
            if (processedCells.indexOf(mCell) == -1) {
              processedCells[processedCells.length] = mCell;
              mCell.setSize(mCell.width + changeWidth);
            }
            processedCells[processedCells.length] = beforeCell;
          }
        }
      }
      table.width = table.width + changeWidth
      table.setModelChanged()
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }


  /**
   * 拖拽行大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  dragRow(x: number, y: number): void {
    //取得当前行对象
    let cell = this.dragCell;
    let table = this;
    //如果不是尾行修改当前单元格所在行下边列所有单元格的大小
    if (cell.row >= table.rows.length - 1) {
      return;
    }
    //如果当前单元格所在列存在一个特殊单元格，则所有行单元格特殊,本次拖拽也是特殊拖拽

    for (let i = 0; i < table.rows.length; i++) {
      if (table.cols[cell.col][i].specilCol) {
        this.specilDrag = true;
        for (let j = 0; j < table.rows.length; j++) {
          if (!table.cols[cell.col][j].specilCol) {
            table.cols[cell.col][j].specilCol = true;
          }
        }
        break;
      }
    }
    //拖动行只修改行大小
    let dragObj = table.stage.render.dragObj;
    let changeHeight = y - dragObj.y;
    dragObj.y = dragObj.y + changeHeight
    if (changeHeight != 0) {
      //特殊拖拽，只修改本单元格大小，如果影响了合并单元格才修改合并单元格的大小
      if (this.specilDrag) {
        let pass = false;
        //判断当前行的所有列是否为合并单元格或被合并单元格，如果不是则允许拖
        for (let i = 0; i < table.rows.length; i++) {
          if (table.cols[cell.col][i].isMergedCell() || table.cols[cell.col][i].isMergeCell()) {
            pass = true;
            break;
          }
        }
        if ((cell.height != 0 && cell.height + changeHeight < 5) || (table.cols[cell.col][cell.row + 1].height != 0 && table.cols[cell.col][cell.row + 1].height - changeHeight < 5)) {
          pass = true;
        }
        if (!pass) {
          //修改当前单元格和后续单元格大小
          cell.setSize(undefined, cell.height + changeHeight);
          table.cols[cell.col][cell.row + 1].setSize(undefined, table.cols[cell.col][cell.row + 1].height - changeHeight);
          table.cols[cell.col][cell.row + 1].setPosition(undefined, table.cols[cell.col][cell.row + 1].y + changeHeight);
          //将当前行所有单元格打上标识，为特殊拖动单元格
          for (let i = 0; i < table.rows.length; i++) {
            table.cols[cell.col][i].specilCol = true;
          }
          return;
        }
      }

      let processedCells = [];
      //执行前置校验，如果改变后的单元格大小或者原始大小小于5，则不允许拖拽
      for (let i = 0; i < table.cols.length; i++) {
        let beforeCell = table.cols[i][cell.row];
        let afterCell = table.cols[i][cell.row + 1];
        if (!beforeCell.specilCol && ((beforeCell.height != 0 && beforeCell.height + changeHeight < 5) || (beforeCell.originHeight != null && beforeCell.originHeight + changeHeight < 5))) {
          return;
        }
        if (!afterCell.specilCol && ((afterCell.height != 0 && afterCell.height - changeHeight < 5) || (afterCell.originHeight != null && afterCell.originHeight - changeHeight < 5))) {
          return;
        }
      }
      for (let i = 0; i < table.cols.length; i++) {
        //处理当前列单元格
        let beforeCell = table.cols[i][cell.row];
        if (processedCells.indexOf(beforeCell) == -1 && !beforeCell.specilCol) {
          //普通单元格
          if (!beforeCell.isMergedCell() && !beforeCell.isMergeCell()) {
            beforeCell.setSize(undefined, beforeCell.height + changeHeight);
            processedCells[processedCells.length] = beforeCell;
          }
          //合并单元格
          else if (beforeCell.isMergeCell()) {
            let mCell = beforeCell;
            //长度为1的合并单元格
            if (mCell.mergeRowNum == 1) {
              beforeCell.originHeight = beforeCell.originHeight + changeHeight;
              beforeCell.setSize(undefined, beforeCell.height + changeHeight);
              processedCells[processedCells.length] = beforeCell;
            }
            //长度大于1的合并单元格
            else {
              beforeCell.originHeight = beforeCell.originHeight + changeHeight;
              processedCells[processedCells.length] = beforeCell;
            }
          }
          //被合并单元格
          else if (beforeCell.isMergedCell()) {
            let mCell = beforeCell.mergedCell;
            //尾部的合并单元格
            if (mCell.row + mCell.mergeRowNum - 1 == beforeCell.row) {
              beforeCell.originHeight = beforeCell.originHeight + changeHeight;
              if (processedCells.indexOf(mCell) == -1) {
                processedCells[processedCells.length] = mCell;
                mCell.setSize(undefined, mCell.height + changeHeight);
              }
              processedCells[processedCells.length] = beforeCell;
            }
            //中间的合并单元格
            else {
              beforeCell.originHeight = beforeCell.originHeight + changeHeight;
              processedCells[processedCells.length] = beforeCell;
            }
          }
        }
        //处理后面的单元格
        let afterCell = table.cols[i][cell.row + 1];
        if (processedCells.indexOf(afterCell) == -1 && !afterCell.specilCol) {
          //普通单元格
          if (!afterCell.isMergedCell() && !afterCell.isMergeCell()) {
            afterCell.setSize(undefined, afterCell.height - changeHeight);
            afterCell.setPosition(undefined, afterCell.y + changeHeight);
            processedCells[processedCells.length] = afterCell;
          }
          //合并单元格
          else if (afterCell.isMergeCell()) {
            let mCell = afterCell;
            mCell.originHeight = mCell.originHeight - changeHeight;
            mCell.setSize(undefined, mCell.height - changeHeight);
            mCell.setPosition(undefined, mCell.y + changeHeight);
            processedCells[processedCells.length] = mCell;
            //处理涉及的被合并单元格,调整坐标显示以及原始大小
            for (let x = mCell.col + 1; x < mCell.col + mCell.mergeColNum; x++) {
              if (!table.cols[x][mCell.row].specilCol) {
                table.cols[x][mCell.row].originHeight = table.cols[x][mCell.row].originHeight - changeHeight;
                table.cols[x][mCell.row].setPosition(undefined, table.cols[x][mCell.row].y + changeHeight);
                processedCells[processedCells.length] = table.cols[x][mCell.row];
              }
            }
          }
          //被合并单元格
          else if (afterCell.isMergedCell()) {
            let mCell = afterCell.mergedCell;
            //尾部的合并单元格
            if (mCell.row + mCell.mergeRowNum == afterCell.row) {
              afterCell.originHeight = afterCell.originHeight - changeHeight;
              if (processedCells.indexOf(mCell) == -1) {
                mCell.setSize(undefined, mCell.height - changeHeight);
                processedCells[processedCells.length] = mCell;
              }
              processedCells[processedCells.length] = afterCell;
            }
            //中间的合并单元格
            else {
              afterCell.originHeight = afterCell.originHeight - changeHeight;
              afterCell.setPosition(undefined, afterCell.y + changeHeight);
              processedCells[processedCells.length] = afterCell;
            }
          }
        }

      }
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }

  /**
   * 拖拽时选中单元格
   * @param x
   * @param y
   */
  dragAndSelectedCell(x: number, y: number): void {
    //取得当前列对象
    let cell = this.dragCell;
    let table = this;
    //记录上一次拖动的单元格，用于选取两个单元格
    if (!table.tempUpCel) {
      table.tempUpCel = cell;
    }
    //获取当前鼠标落点的单元格
    let targetCell = table.getCellByTablePosition(x, y);

    if (targetCell && table.tempUpCel != targetCell) {
      //取消之前的选中状态
      let minMax = table.getMinMaxRowAndCol([cell, table.tempUpCel]);
      for (let i = minMax.minRow; i <= minMax.maxRow; i++) {
        for (let j = minMax.minCol; j <= minMax.maxCol; j++) {
          table.rows[i][j].setState(DDeiEnumControlState.DEFAULT)
        }
      }

      //设置新的选中状态
      table.tempUpCel = targetCell;

      minMax = table.getMinMaxRowAndCol([cell, table.tempUpCel]);
      for (let i = minMax.minRow; i <= minMax.maxRow; i++) {
        for (let j = minMax.minCol; j <= minMax.maxCol; j++) {
          table.rows[i][j].setState(DDeiEnumControlState.SELECTED)
        }
      }

    }

  }

  /**
   * 拖拽列大小
   * 该方法在拖拽过程中调用，会处理由拖拽引起的合并单元格的变动
   */
  dragCol(x: number, y: number): void {
    //取得当前列对象
    let cell = this.dragCell;
    let table = this;
    if (cell.col >= table.cols.length - 1) {
      return;
    }
    //如果当前单元格所在行存在一个特殊单元格，则所有列单元格特殊,本次拖拽也是特殊拖拽
    for (let i = 0; i < table.cols.length; i++) {
      if (table.rows[cell.row][i].specilRow) {
        this.specilDrag = true;
        for (let j = 0; j < table.cols.length; j++) {
          if (!table.rows[cell.row][j].specilRow) {
            table.rows[cell.row][j].specilRow = true;
          }
        }
        break;
      }
    }
    //拖动列只修改列大小
    let dragObj = table.stage.render.dragObj;
    let changeWidth = x - dragObj.x;
    dragObj.x = dragObj.x + changeWidth
    if (changeWidth != 0) {
      //特殊拖拽，只修改本单元格大小，如果影响了合并单元格才修改合并单元格的大小
      if (this.specilDrag) {
        let pass = false;
        //判断当前行的所有列是否为合并单元格或被合并单元格，如果不是则允许拖
        for (let i = 0; i < table.cols.length; i++) {
          if (table.rows[cell.row][i].isMergedCell() || table.rows[cell.row][i].isMergeCell()) {
            pass = true;
            break;
          }
        }
        if ((cell.width != 0 && cell.width + changeWidth < 5) || (table.rows[cell.row][cell.col + 1].width != 0 && table.rows[cell.row][cell.col + 1].width - changeWidth < 5)) {
          pass = true;
        }
        if (!pass) {
          //修改当前单元格和后续单元格大小
          cell.setSize(cell.width + changeWidth)
          table.rows[cell.row][cell.col + 1].setSize(table.rows[cell.row][cell.col + 1].width - changeWidth)
          table.rows[cell.row][cell.col + 1].setPosition(table.rows[cell.row][cell.col + 1].x + changeWidth);
          //将当前行所有单元格打上标识，为特殊拖动单元格
          for (let i = 0; i < table.cols.length; i++) {
            table.rows[cell.row][i].specilRow = true;
          }
          return;
        }
      }
      //普通拖拽，修改整列的大小
      //执行前置校验
      for (let i = 0; i < table.rows.length; i++) {
        let beforeCell = table.rows[i][cell.col];
        let afterCell = table.rows[i][cell.col + 1];
        if (!beforeCell.specilRow && ((beforeCell.width != 0 && beforeCell.width + changeWidth < 5) || (beforeCell.originWidth != null && beforeCell.originWidth + changeWidth < 5))) {
          return;
        }
        if (!afterCell.specilRow && ((afterCell.width != 0 && afterCell.width - changeWidth < 5) || (afterCell.originWidth != null && afterCell.originWidth - changeWidth < 5))) {
          return;
        }
      }

      let processedCells = [];
      //循环修改所有相关单元格
      for (let i = 0; i < table.rows.length; i++) {
        //处理当前列单元格
        let beforeCell = table.rows[i][cell.col];
        if (processedCells.indexOf(beforeCell) == -1 && !beforeCell.specilRow) {
          //普通单元格
          if (!beforeCell.isMergedCell() && !beforeCell.isMergeCell()) {
            beforeCell.setSize(beforeCell.width + changeWidth);
            processedCells[processedCells.length] = beforeCell;
          }
          //合并单元格
          else if (beforeCell.isMergeCell()) {
            let mCell = beforeCell;
            //长度为1的合并单元格
            if (mCell.mergeColNum == 1) {
              beforeCell.originWidth = beforeCell.originWidth + changeWidth;
              beforeCell.setSize(beforeCell.width + changeWidth);
              processedCells[processedCells.length] = beforeCell;
            }
            //长度大于1的合并单元格
            else {
              beforeCell.originWidth = beforeCell.originWidth + changeWidth;
              processedCells[processedCells.length] = beforeCell;
            }
          }
          //被合并单元格
          else if (beforeCell.isMergedCell()) {
            let mCell = beforeCell.mergedCell;
            //尾部的合并单元格
            if (mCell.col + mCell.mergeColNum - 1 == beforeCell.col) {
              beforeCell.originWidth = beforeCell.originWidth + changeWidth;
              if (processedCells.indexOf(mCell) == -1) {
                processedCells[processedCells.length] = mCell;
                mCell.setSize(mCell.width + changeWidth);
              }
              processedCells[processedCells.length] = beforeCell;
            }
            //中间的合并单元格
            else {
              beforeCell.originWidth = beforeCell.originWidth + changeWidth;
              processedCells[processedCells.length] = beforeCell;
            }
          }
        }
        //处理后面的单元格
        let afterCell = table.rows[i][cell.col + 1];
        if (processedCells.indexOf(afterCell) == -1 && !afterCell.specilRow) {
          //普通单元格
          if (!afterCell.isMergedCell() && !afterCell.isMergeCell()) {
            afterCell.setSize(afterCell.width - changeWidth);
            afterCell.setPosition(afterCell.x + changeWidth);
            processedCells[processedCells.length] = afterCell;
          }
          //合并单元格
          else if (afterCell.isMergeCell()) {
            let mCell = afterCell;
            mCell.originWidth = mCell.originWidth - changeWidth;
            mCell.setSize(mCell.width - changeWidth);
            mCell.setPosition(mCell.x + changeWidth);
            processedCells[processedCells.length] = mCell;
            //处理涉及的被合并单元格,调整坐标显示以及原始大小
            for (let x = mCell.row + 1; x < mCell.row + mCell.mergeRowNum; x++) {
              if (!table.rows[x][mCell.col].specilRow) {
                table.rows[x][mCell.col].originWidth = table.rows[x][mCell.col].originWidth - changeWidth;
                table.rows[x][mCell.col].setPosition(table.rows[x][mCell.col].x + changeWidth);
                processedCells[processedCells.length] = table.rows[x][mCell.col];
              }
            }
          }
          //被合并单元格
          else if (afterCell.isMergedCell()) {
            let mCell = afterCell.mergedCell;

            //尾部的合并单元格
            if (mCell.col + mCell.mergeColNum == afterCell.col) {
              afterCell.originWidth = afterCell.originWidth - changeWidth;
              if (processedCells.indexOf(mCell) == -1) {
                mCell.setSize(mCell.width - changeWidth);
                processedCells[processedCells.length] = mCell;
              }
              processedCells[processedCells.length] = afterCell;
            }
            //中间的合并单元格
            else {
              afterCell.originWidth = afterCell.originWidth - changeWidth;
              afterCell.setPosition(afterCell.x + changeWidth);
              processedCells[processedCells.length] = afterCell;
            }
          }
        }
      }
      //更新复制图形的区域
      this.updateCopyShapeArea();
      //更新表格布局子组件
      this.changeChildrenBounds();
    }
  }

  /**
   * TODO 更新复制图形的区域
   */
  updateCopyShapeArea(): void {
    if (window.globalTableCopyData || window.globalTableCutData) {
      let sourceCells = null;
      if ((window.globalTableCopyData && window.globalTableCopyData.length > 0)) {
        sourceCells = window.globalTableCopyData;
      } else {
        sourceCells = window.globalTableCutData;
      }
      if (sourceCells[0].table == this) {
        //显示剪切区域
        let minMaxColRow = this.getMinMaxRowAndCol(sourceCells);
        let rect = this.getCellPositionRect(minMaxColRow.minRow, minMaxColRow.minCol, minMaxColRow.maxRow, minMaxColRow.maxCol);
        //设置选中区域
        this.copyAreaShape.style.width = (rect.width - 1) + "px";
        this.copyAreaShape.style.height = (rect.height - 1) + "px";
        this.copyAreaShape.style.left = PDSetting.DEFAULT_TABLE_BORDER_PADDING + rect.x - 1 + "px";
        this.copyAreaShape.style.top = PDSetting.DEFAULT_TABLE_BORDER_PADDING + rect.y - 1 + "px";
        this.copyAreaShape.style.display = "block";
      }

    }
  }

  /**
  * 变换向量
  */
  transVectors(matrix: Matrix3, params: { ignoreBPV: boolean, ignoreComposes: boolean }): void {
    super.transVectors(matrix)
    for (let i = 0; i < this.rows.length; i++) {
      let rowObj = this.rows[i];
      for (let j = 0; j < rowObj.length; j++) {
        let cellObj = rowObj[j];
        cellObj.transVectors(matrix)
      }
    }
  }

  // ============================ 静态方法 ============================


  // 通过一个JSON反向序列化成对象，模型数据与JSON完全一样
  static loadFromJSON(json, tempData: object = {}): any {
    let model = new DDeiTable(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    if (!model.pModel) {
      model.pModel = model.layer;
    }
    tempData[model.id] = model;

    //循环初始化表格的单元格
    let rows = [];
    let cols = [];
    for (let i = 0; i < json.rows.length; i++) {
      let rowJSON = json.rows[i];
      rows[i] = [];
      for (let j = 0; j < rowJSON.length; j++) {
        if (i == 0) {
          cols[j] = [];
        }
        let cell = DDeiTableCell.loadFromJSON(rowJSON[j], tempData);
        cell.table = model;
        rows[i][j] = cell;
        cols[j][i] = cell;
      }
    }
    //重设合并关系
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        let cellJSON = json.rows[i][j];
        if (cellJSON.mergeRowNum > 1 || cellJSON.mergeColNum > 1) {
          let mergedCell = rows[i][j];
          for (let mr = 0; mr < cellJSON.mergeRowNum; mr++) {
            for (let mj = 0; mj < cellJSON.mergeColNum; mj++) {
              let mergeCell = rows[i + mr][j + mj];
              mergeCell.mergedCell = mergedCell;
            }
          }
        }
      }
    }
    model.rows = rows;
    model.cols = cols;

    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    model.initRender();
    return model;
  }
  // 通过JSON初始化对象，数据未传入时将初始化数据
  static initByJSON(json, tempData: object = {}): DDeiTable {
    let model = new DDeiTable(json);
    model.layer = tempData['currentLayer']
    model.stage = tempData['currentStage']
    model.pModel = tempData['currentContainer']
    //基于初始化的宽度、高度，构建向量
    model.initPVS();
    //初始化表格
    model.initTable();
    return model;
  }

  //类名，用于反射和动态加载
  static ClsName: string = "DDeiTable";

  //用于初始化子元素的json
  static initSubControlJson: object | null = null;

  // ============================ 属性 ===============================
  // 本模型的唯一名称
  modelType: string = 'DDeiTable';
  // 本模型的基础图形
  baseModelType: string = 'DDeiTable';

  //列集合
  cols: DDeiTableCell[][]
  //行集合
  rows: DDeiTableCell[][]

  //初始行数，初始每行高度=表格高度/初始行数
  initRowNum: number = 5;
  //初始列数，初始每列宽度=表格宽度/初始列数
  initColNum: number = 5;
  //当前行列号
  curCol: number = -1;
  curRow: number = -1;

  //表格的选择器
  selector: DDeiTableSelector | null = null;


}


export { DDeiTable}
export default DDeiTable
