import DDeiConfig from "../config";
import DDei from "../ddei";
import DDeiEnumControlState from "../enums/control-state";
import DDeiEnumOperateState from "../enums/operate-state";
import DDeiRectContainer from "../models/rect-container";
import DDeiAbstractShape from "../models/shape";
import DDeiKeyAction from "./key-action";

/**
 * 键行为:图形移动到上层或下层、顶层或底层
 * 将已选图形移动到当前图层的上层或下层、顶层或底层
 */
class DDeiKeyActionPushModels extends DDeiKeyAction {

  // ============================ 方法 ===============================
  action(evt: Event, ddInstance: DDei): void {
    //修改当前操作控件坐标
    if (ddInstance && ddInstance.stage) {
      let stageRender = ddInstance.stage.render;
      let optContainer = stageRender.currentOperateContainer;
      if (optContainer) {
        let selectedModels = optContainer.getSelectedModels();
        if (selectedModels.size > 0) {
          let isCtrl = DDei.KEY_DOWN_STATE.get("ctrl");
          let isShift = DDei.KEY_DOWN_STATE.get("shift");
          //同时按下ctrl和shift
          if (isCtrl && isShift) {
            //上
            if (evt.keyCode == 38) {
              optContainer.pushTop(Array.from(selectedModels.values()))
            }
            //下
            else if (evt.keyCode == 40) {
              optContainer.pushBottom(Array.from(selectedModels.values()))
            }
          }
          //只按下了shift
          else if (isShift) {
            //上
            if (evt.keyCode == 38) {
              optContainer.pushUp(Array.from(selectedModels.values()))
            }
            //下
            else if (evt.keyCode == 40) {
              optContainer.pushDown(Array.from(selectedModels.values()))
            }
          }
        }
      }
      //重新绘制
      stageRender.drawShape()
      stageRender.operate = DDeiEnumOperateState.NONE;
    }
  }

}


export default DDeiKeyActionPushModels
