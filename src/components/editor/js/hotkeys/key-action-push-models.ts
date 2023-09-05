import DDei from "@/components/framework/js/ddei";
import DDeiEditor from "../editor";
import DDeiKeyAction from "./key-action";
import DDeiEnumBusActionType from "@/components/framework/js/enums/bus-action-type";

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
        let isCtrl = DDeiEditor.KEY_DOWN_STATE.get("ctrl");
        let isShift = DDeiEditor.KEY_DOWN_STATE.get("shift");
        //同时按下ctrl和shift
        if (isCtrl && isShift) {
          //上
          if (evt.keyCode == 38) {
            ddInstance.bus.push(DDeiEnumBusActionType.ModelPush, { container: optContainer, type: "top" }, evt);
          }
          //下
          else if (evt.keyCode == 40) {
            ddInstance.bus.push(DDeiEnumBusActionType.ModelPush, { container: optContainer, type: "bottom" }, evt);
          }
        }
        //只按下了ctrl
        else if (isCtrl) {
          //上
          if (evt.keyCode == 38) {
            ddInstance.bus.push(DDeiEnumBusActionType.ModelPush, { container: optContainer, type: "up" }, evt);
          }
          //下
          else if (evt.keyCode == 40) {
            ddInstance.bus.push(DDeiEnumBusActionType.ModelPush, { container: optContainer, type: "down" }, evt);
          }
        }
      }
      //渲染图形
      ddInstance.bus.push(DDeiEnumBusActionType.RefreshShape, null, evt);

      ddInstance.bus.executeAll();
    }
  }

}


export default DDeiKeyActionPushModels
