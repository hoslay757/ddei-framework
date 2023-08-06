import DDeiKeyActionAllSelect from "../hotkeys/key-action-all-select";
import DDeiKeyActionCancelQuickEdit from "../hotkeys/key-action-cancel-quick-edit";
import DDeiKeyActionMoveModels from "../hotkeys/key-action-move-models";
import DDeiKeyActionEnterQuickEdit from "../hotkeys/key-action-enter-quick-edit";
import DDeiKeyActionRemoveModels from "../hotkeys/key-action-remove-models";
import DDeiKeyActionStartQuickEdit from "../hotkeys/key-action-start-quick-edit";
import DDeiKeyActionCancelSelect from "../hotkeys/key-action-cancel-select";

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
  CancelQuickEdit = new DDeiKeyActionCancelQuickEdit({ code: "key-action-cancel-quick-edit", name: "取消快捷编辑", desc: "当某个控件具备快捷编辑的特性时，取消快捷编辑框" })
}

export default DDeiEnumKeyActionInst
