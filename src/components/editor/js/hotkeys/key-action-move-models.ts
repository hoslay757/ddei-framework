import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiEnumControlState from "@/components/framework/js/enums/control-state";
import DDeiModelArrtibuteValue from "@/components/framework/js/models/attribute/attribute-value";
import DDeiUtil from "@/components/framework/js/util";

/**
 * 键行为:移动模型
 * 批量移动模型
 */
class DDeiKeyActionDownMoveModels extends DDeiKeyAction {


  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let selectedModels = ddInstance.stage.selectedModels;
      let models = Array.from(selectedModels.values());
      if (models.length == 1 && models[0].baseModelType == 'DDeiTable' && models[0].curRow != -1 && models[0].curCol != -1) {

        //上
        if (evt.keyCode == 38) {
          if (models[0].curRow > 0) {
            if (models[0].tempDragCell) {
              models[0].tempDragCell.setState(DDeiEnumControlState.DEFAULT)
            }
            models[0].curRow--;
            models[0].tempDragCell = models[0].rows[models[0].curRow][models[0].curCol]
            models[0].tempDragCell.setState(DDeiEnumControlState.SELECTED)
          }
        }//下
        else if (evt.keyCode == 40) {
          if (models[0].curRow < models[0].rows.length - 1) {
            if (models[0].tempDragCell) {
              models[0].tempDragCell.setState(DDeiEnumControlState.DEFAULT)
            }
            models[0].curRow++;
            models[0].tempDragCell = models[0].rows[models[0].curRow][models[0].curCol]
            models[0].tempDragCell.setState(DDeiEnumControlState.SELECTED)
          }
        }//左
        else if (evt.keyCode == 37) {
          if (models[0].curCol > 0) {
            if (models[0].tempDragCell) {
              models[0].tempDragCell.setState(DDeiEnumControlState.DEFAULT)
            }
            models[0].curCol--;
            models[0].tempDragCell = models[0].rows[models[0].curRow][models[0].curCol]
            models[0].tempDragCell.setState(DDeiEnumControlState.SELECTED)
          }
        }//右
        else if (evt.keyCode == 39) {
          if (models[0].curCol < models[0].cols.length - 1) {
            if (models[0].tempDragCell) {
              models[0].tempDragCell.setState(DDeiEnumControlState.DEFAULT)
            }
            models[0].curCol++;
            models[0].tempDragCell = models[0].rows[models[0].curRow][models[0].curCol]
            models[0].tempDragCell.setState(DDeiEnumControlState.SELECTED)
          }
        }
      } else {
        let moveSize = 1;

        let isShift = DDei.KEY_DOWN_STATE.get("shift");
        if (!isShift) {

          //辅助对齐线宽度
          moveSize = 10;
        }

        let outRect = DDeiAbstractShape.getOutRectByPV(models);
        let deltaX, deltaY
        //上
        if (evt.keyCode == 38) {
          let mod = 0;
          //如果开启辅助对齐线，则跳回到对齐线上
          if (!isShift) {
            if (outRect.y % moveSize > 0) {
              mod = moveSize - (outRect.y % moveSize);
            }
          }
          deltaY = - moveSize + mod
        }
        //下
        else if (evt.keyCode == 40) {
          let mod = 0;
          if (!isShift) {
            mod = outRect.y % moveSize;
          }
          deltaY = moveSize - mod
        }
        //左
        else if (evt.keyCode == 37) {
          let mod = 0;
          //如果开启辅助对齐线，则跳回到对齐线上
          if (!isShift) {
            if (outRect.x % moveSize > 0) {
              mod = moveSize - (outRect.x % moveSize);
            }
          }
          deltaX = - moveSize + mod
        }
        //右
        else if (evt.keyCode == 39) {
          let mod = 0;
          if (!isShift) {
            mod = outRect.x % moveSize;
          }
          deltaX = moveSize - mod
        }
        DDeiAbstractShape.moveModels(models, deltaX, deltaY);
        ddInstance.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
        ddInstance.bus.push(DDeiEnumBusCommandType.NodifyChange);
        ddInstance.bus.push(DDeiEnumBusCommandType.AddHistroy, null, evt);

      }
      //渲染图形
      ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);

      ddInstance.bus.executeAll();

    }
  }

}


export default DDeiKeyActionDownMoveModels
