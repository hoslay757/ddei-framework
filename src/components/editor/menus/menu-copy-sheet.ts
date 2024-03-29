import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";
import DDeiEditorState from "@ddei-core/editor/js/enums/editor-state";
import DDeiSheet from "@ddei-core/editor/js/sheet";

/**
 * 复制页签
 */
class MenuCopySheet {
  /**
   * 执行的方法
   */
  static action(model: object, evt: Event): void {
    if (model.modelType == 'DDeiSheet') {
      //将sheet插入文件
      let editor = DDeiEditor.ACTIVE_INSTANCE
      let file = editor?.files[editor.currentFileIndex];
      let ddInstance = model.stage.ddInstance
      let sheetJson = model.toJSON()
      let newSheet = DDeiSheet.loadFromJSON(sheetJson, { currentDdInstance: ddInstance });
      file.sheets.splice(file?.currentSheetIndex + 1, 0, newSheet);
      newSheet.name = "页面-" + file.sheets.length
      file.changeSheet(file.currentSheetIndex + 1);
      let stage = newSheet.stage;
      stage.ddInstance = ddInstance;
      //刷新页面
      ddInstance.stage = stage;
      //加载场景渲染器
      stage.initRender();
      editor.changeState(DDeiEditorState.DESIGNING);
      editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, null);
      //记录日志
      editor.bus.push(DDeiEnumBusCommandType.AddHistroy)
      editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, { parts: ["bottommenu"] })
      editor.bus?.executeAll();
      editor.editorViewer?.changeFileModifyDirty();
    }
  }

  /**
   * 判定是否显示的方法
   */
  static isVisiable(model: object): boolean {
    return true;
  }

}

export default MenuCopySheet;
