import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiEditor from "../js/editor";
import DDeiEditorState from "../js/enums/editor-state";

/**
 * 插入列菜单
 */
class MenuRemoveSheet {


  static action(model: object, evt: Event): void {
    if (model.modelType == 'DDeiSheet') {
      //将sheet插入文件
      let editor = DDeiEditor.ACTIVE_INSTANCE
      let file = editor?.files[editor.currentFileIndex];
      if (file.sheets.length > 1) {
        let ddInstance = model.stage.ddInstance
        let currentIndex = file.currentSheetIndex;
        file.sheets.splice(currentIndex, 1);
        if (currentIndex > 0) {
          file.changeSheet(file.currentSheetIndex - 1);
        } else {
          file.changeSheet(0);
        }
        let stage = file.sheets[file?.currentSheetIndex].stage;
        stage.ddInstance = ddInstance;
        //刷新页面
        ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
        editor.changeState(DDeiEditorState.DESIGNING);
        editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        //记录日志
        editor.bus.push(DDeiEnumBusCommandType.AddHistroy)
        editor.bus?.executeAll();
        //刷新下方列表
        editor?.viewEditor?.forceRefreshBottomMenu();
      }
    }
  }


  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    if (model?.modelType == 'DDeiSheet') {
      //将sheet插入文件
      let editor = DDeiEditor.ACTIVE_INSTANCE
      let file = editor?.files[editor.currentFileIndex];
      if (file.sheets.length > 1) {
        return true
      }
    }
    return false;
  }

}

export default MenuRemoveSheet;
