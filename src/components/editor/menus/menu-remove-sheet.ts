import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import DDeiEditor from "../js/editor";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";
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
        let currentIndex = -1;
        for (let i = 0; i < file?.sheets?.length; i++) {
          if (file.sheets[i].unicode == model.unicode) {
            currentIndex = i;
            break;
          }
        }

        file.sheets.splice(currentIndex, 1);

        if (currentIndex <= file.currentSheetIndex) {
          file.changeSheet(file.currentSheetIndex - 1);
        }
        let stage = file.sheets[file?.currentSheetIndex].stage;
        stage.ddInstance = ddInstance;
        //刷新页面
        ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
        editor.changeState(DDeiEditorState.DESIGNING);
        editor.editorViewer?.changeFileModifyDirty();
        editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        //记录日志
        editor.bus.push(DDeiEnumBusCommandType.AddHistroy)
        editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, { parts: ["bottommenu"] })
        editor.bus?.executeAll();
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
