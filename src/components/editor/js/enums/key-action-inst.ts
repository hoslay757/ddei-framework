import DDeiKeyActionAllSelect from "../hotkeys/key-action-all-select";
import DDeiKeyActionCancelQuickEdit from "../hotkeys/key-action-cancel-quick-edit";
import DDeiKeyActionMoveModels from "../hotkeys/key-action-move-models";
import DDeiKeyActionEnterQuickEdit from "../hotkeys/key-action-enter-quick-edit";
import DDeiKeyActionRemoveModels from "../hotkeys/key-action-remove-models";
import DDeiKeyActionStartQuickEdit from "../hotkeys/key-action-start-quick-edit";
import DDeiKeyActionCancelSelect from "../hotkeys/key-action-cancel-select";
import DDeiKeyActionCompose from "../hotkeys/key-action-compose";
import DDeiKeyActionCancelCompose from "../hotkeys/key-action-cancel-compose";
import DDeiKeyActionPushModels from "../hotkeys/key-action-push-models";
import DDeiKeyActionPaste from "../hotkeys/key-action-paste";
import DDeiKeyActionCopy from "../hotkeys/key-action-copy";

/**
 * 所有key实例的枚举
 */
enum DDeiEnumKeyActionInst {
  LeftMoveModels = new DDeiKeyActionMoveModels({ code: "key-action-left-move-models", name: "左移控件", desc: "按下某个键，使所有选择控件左移" }),
  RightMoveModels = new DDeiKeyActionMoveModels({ code: "key-action-right-move-models", name: "右移控件", desc: "按下某个键，使所有选择控件右移" }),
  UpMoveModels = new DDeiKeyActionMoveModels({ code: "key-action-up-move-models", name: "上移控件", desc: "按下某个键，使所有选择控件上移" }),
  DownMoveModels = new DDeiKeyActionMoveModels({ code: "key-action-down-move-models", name: "下移控件", desc: "按下某个键，使所有选择控件下移" }),
  RemoveModels = new DDeiKeyActionRemoveModels({ code: "key-action-remove-models", name: "删除控件", desc: "按下某个键，使所有选择控件删除" }),
  AllSelect = new DDeiKeyActionAllSelect({ code: "key-action-all-select", name: "全选控件", desc: "按下某个键，选择所有控件" }),
  CancelSelect = new DDeiKeyActionCancelSelect({ code: "key-action-cancel-select", name: "取消全选控件", desc: "取消选择所有的已选控件" }),
  StartQuickEdit = new DDeiKeyActionStartQuickEdit({ code: "key-action-start-quick-edit", name: "开始快捷编辑", desc: "当某个控件具备快捷编辑的特性时，弹出快捷编辑框" }),
  EnterQuickEdit = new DDeiKeyActionEnterQuickEdit({ code: "key-action-enter-quick-edit", name: "确认快捷编辑", desc: "当某个控件具备快捷编辑的特性时，将快捷编辑框的内容写入实际控件" }),
  CancelQuickEdit = new DDeiKeyActionCancelQuickEdit({ code: "key-action-cancel-quick-edit", name: "取消快捷编辑", desc: "当某个控件具备快捷编辑的特性时，取消快捷编辑框" }),
  MakeCompose = new DDeiKeyActionCompose({ code: "key-action-make-compose", name: "组合", desc: "选择多个控件时，将其组合成一个控件" }),
  CancelCompose = new DDeiKeyActionCancelCompose({ code: "key-action-cancel-compose", name: "取消组合", desc: "将一个组合控件打散成为多个控件" }),
  PushUpModels = new DDeiKeyActionPushModels({ code: "key-action-push-up-models", name: "置于上层", desc: "将选中图形置于上层" }),
  PushDownModels = new DDeiKeyActionPushModels({ code: "key-action-push-down-models", name: "置于下层", desc: "将选中图形置于下层" }),
  PushTopModels = new DDeiKeyActionPushModels({ code: "key-action-push-top-models", name: "置于顶层", desc: "将选中图形置于顶层" }),
  PushBottomModels = new DDeiKeyActionPushModels({ code: "key-action-push-bottom-models", name: "置于底层", desc: "将选中图形置于底层" }),
  Copy = new DDeiKeyActionCopy({ code: "key-action-push-top-models", name: "复制", desc: "复制选中图形到剪切板" }),
  Paste = new DDeiKeyActionPaste({ code: "key-action-push-bottom-models", name: "粘贴", desc: "粘贴剪切板内容到当前图层" }),
}

export default DDeiEnumKeyActionInst
