import DDeiPluginBase from '../plugin/ddei-plugin-base'
import DDeiFuncData from "./funcdata"
/**
 * 生命周期插件，用于在内部事件或处理逻辑中以插件的方式影响现有逻辑
 * 所有的回调方法，都要遵循调度的规范
 */
class DDeiLifeCycle extends DDeiPluginBase {
  // ============================ 属性 ===============================
  /**
   * 控件选择前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_BEFORE: DDeiFuncData | null = null;

  /**
   * 控件选择后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_SELECT_AFTER: DDeiFuncData | null = null;

  /**
   * 控件创建前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_CREATE_BEFORE: DDeiFuncData | null = null;

  /**
   * 当前正在执行鼠标相关的动作，此方法为外部传入的钩子函数
   */
  EVENT_MOUSE_OPERATING: DDeiFuncData | null = null;

  /**
   * 控件创建后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_CREATE_AFTER: DDeiFuncData | null = null;

  /**
   * 控件拖拽前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DRAG_BEFORE: DDeiFuncData | null = null;

  /**
   * 控件拖拽后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DRAG_AFTER: DDeiFuncData | null = null;

  /**
   * 线段拖拽前，此方法为外部传入的勾子函数
   */
  EVENT_LINE_DRAG_BEFORE: DDeiFuncData | null = null;

  /**
   * 线段拖拽后，此方法为外部传入的勾子函数
   */
  EVENT_LINE_DRAG_AFTER: DDeiFuncData | null = null;

  /**
   * 控件删除前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DEL_BEFORE: DDeiFuncData | null = null;

  /**
   * 控件删除后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_DEL_AFTER: DDeiFuncData | null = null;

  /**
   * 控件属性编辑前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_EDIT_BEFORE: DDeiFuncData | null = null;

  /**
   * 控件属性编辑后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_EDIT_AFTER: DDeiFuncData | null = null;
  /**
   * 控件查看前，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_VIEW_BEFORE: DDeiFuncData | null = null;

  /**
   * 控件查看后，此方法为外部传入的勾子函数
   */
  EVENT_CONTROL_VIEW_AFTER: DDeiFuncData | null = null;

  /**
   * 移动视窗，此方法为外部传入的勾子函数
   */
  EVENT_STAGE_CHANGE_WPV: DDeiFuncData | null = null;

  /**
   * 全剧缩放，此方法为外部传入的勾子函数
   */
  EVENT_STAGE_CHANGE_RATIO: DDeiFuncData | null = null;
  // ============================ 方法 ===============================

  getLifeCyclies(editor) {
    let option = this.getOptions()
    if (option) {
      for (let i in option) {
        if (i != 'name') {
          this[i] = option[i];
        }
      }
    }
    return [this];
  }
}

export {DDeiLifeCycle}
export default DDeiLifeCycle
