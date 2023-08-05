import DDeiKeyActionAllSelect from "../hotkeys/key-action-all-select";
import DDeiKeyActionAppendSelect from "../hotkeys/key-action-append-select";
import DDeiKeyActionCancelQuickEdit from "../hotkeys/key-action-cancel-quick-edit";
import DDeiKeyActionDownMoveModels from "../hotkeys/key-action-down-move-models";
import DDeiKeyActionEnterQuickEdit from "../hotkeys/key-action-enter-quick-edit";
import DDeiKeyActionLeftMoveModels from "../hotkeys/key-action-left-move-models";
import DDeiKeyActionRemoveModels from "../hotkeys/key-action-remove-models";
import DDeiKeyActionRightMoveModels from "../hotkeys/key-action-right-move-models";
import DDeiKeyActionStartQuickEdit from "../hotkeys/key-action-start-quick-edit";
import DDeiKeyActionUpMoveModels from "../hotkeys/key-action-up-move-models";

/**
 * 所有key实例的枚举
 */
enum DDeiEnumKeyActionInst {
  AppendSelect = new DDeiKeyActionAppendSelect({ code: "key-action-append-select", name: "追加选择控件", desc: "按下某个键，再选择控件时，为追加选择状态" }),
  LeftMoveModels = new DDeiKeyActionLeftMoveModels({ code: "key-action-left-move-models", name: "左移控件", desc: "按下某个键，使所有选择控件左移" }),
  RightMoveModels = new DDeiKeyActionRightMoveModels({ code: "key-action-right-move-models", name: "右移控件", desc: "按下某个键，使所有选择控件右移" }),
  UpMoveModels = new DDeiKeyActionUpMoveModels({ code: "key-action-up-move-models", name: "上移控件", desc: "按下某个键，使所有选择控件上移" }),
  DownMoveModels = new DDeiKeyActionDownMoveModels({ code: "key-action-down-move-models", name: "下移控件", desc: "按下某个键，使所有选择控件下移" }),
  RemoveModels = new DDeiKeyActionRemoveModels({ code: "key-action-remove-models", name: "删除控件", desc: "按下某个键，使所有选择控件删除" }),
  AllSelect = new DDeiKeyActionAllSelect({ code: "key-action-all-select", name: "全选控件", desc: "按下某个键，选择所有控件" }),
  StartQuickEdit = new DDeiKeyActionStartQuickEdit({ code: "key-action-start-quick-edit", name: "开始快捷编辑", desc: "当某个控件具备快捷编辑的特性时，弹出快捷编辑框" }),
  EnterQuickEdit = new DDeiKeyActionEnterQuickEdit({ code: "key-action-enter-quick-edit", name: "确认快捷编辑", desc: "当某个控件具备快捷编辑的特性时，将快捷编辑框的内容写入实际控件" }),
  CancelQuickEdit = new DDeiKeyActionCancelQuickEdit({ code: "key-action-cancel-quick-edit", name: "取消快捷编辑", desc: "当某个控件具备快捷编辑的特性时，取消快捷编辑框" })
}

export default DDeiEnumKeyActionInst
