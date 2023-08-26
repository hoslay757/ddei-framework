import DDeiEnumKeyActionInst from "./enums/key-action-inst";
import DDeiKeyAction from "./hotkeys/key-action"
import DDeiEditorState from "./enums/editor-state";
import DDei from "@/components/framework/js/ddei";
import DDeiEditorUtil from "./util/editor-util";
import DDeiUtil from "@/components/framework/js/util";

/**
 * DDei图形编辑器类，用于维护编辑器实例、全局状态以及全局属性
 */
class DDeiEditor {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.containerid = props.containerid
    this.state = DDeiEditorState.DESIGNING;
  }
  // ============================ 静态变量 ============================


  /**
   * 所有当前被初始化的DDei实例
   */
  static INSTANCE_POOL: Map<string, DDeiEditor> = new Map();

  /**
   * 当前活动的实例
   */
  static ACTIVE_INSTANCE: DDeiEditor | null = null;

  // 键盘对齐,开启后允许通过上下左右来改变控件位置,每次改变位置的大小为GLOBAL_HELP_LINE_WEIGHT
  static GLOBAL_KEYBOARD_ALIGN_ENABLE: boolean = true;

  /**
  * 所有特殊按键的按下状态，当键盘按下时会触发事件，并修改当前全局状态
  * 通过全局状态可以判断一些键鼠组合操作，如按下ctrl和鼠标左键时追加选择
  * Editor的此转台会传导到DDei上
  */
  static KEY_DOWN_STATE: Map<string, boolean> = new Map();

  /**
   * 所有特殊按键的计时器，记录了上一次按下按键的时间
   */
  static KEY_DOWN_INTERVAL: Map<string, number> = new Map();

  /**
   * 所有特殊按键的计数器，记录了有效时间内事件的执行次数
   */
  static KEY_DOWN_TIMES: Map<string, number> = new Map();

  // 快捷键-键行为映射配置
  static HOT_KEY_MAPPING: object[] = [
    //全选,ctrl 0/null 不按下，1必须按下，2可选按下
    { ctrl: 1, keys: "65", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.AllSelect },
    //取消全选,500毫秒内，连续按两下esc键
    { keys: "27", times: 2, interval: 500, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelSelect },
    //删除
    { keys: "8", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RemoveModels },
    //F2
    { keys: "113", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.StartQuickEdit },
    //上
    { shift: 2, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.UpMoveModels },
    //下
    { shift: 2, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.DownMoveModels },
    //左
    { shift: 2, keys: "37", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.LeftMoveModels },
    //右
    { shift: 2, keys: "39", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RightMoveModels },
    //回车
    { keys: "13", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.EnterQuickEdit },
    //取消
    { keys: "27", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelQuickEdit },
    //组合
    { keys: "71", ctrl: 1, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.MakeCompose },
    //取消组合
    { keys: "71", ctrl: 1, shift: 1, editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CancelCompose },
    //置于上层
    { ctrl: 1, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushUpModels },
    //置于下层
    { ctrl: 1, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushDownModels },
    //置于顶层
    { ctrl: 1, shift: 1, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushTopModels },
    //置于底层
    { ctrl: 1, shift: 1, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushBottomModels }
  ];


  // ============================ 静态方法 ============================
  /**
   * 给予container构建一个DDei实例
   * 每一个DDei至少包含1个文件
   * @param {id} id 文件id
   * @param {containerid} containerid 容器id
   * @param {active} active 是否设置为活动实例，缺省是
  */
  static newInstance(id: string, containerid: string, active: boolean = true): DDeiEditor {
    if (id && containerid) {
      if (!DDeiEditor.INSTANCE_POOL[id]) {
        //初始化DDeiEditor对象
        let ddInstance = new DDeiEditor({ id: id, containerid: containerid });
        if (!DDeiUtil.getAttrValueByConfig) {
          DDeiUtil.getAttrValueByConfig = DDeiEditorUtil.getAttrValueByConfig;
        }
        //将DDeiEditor对象装入全局缓存
        DDeiEditor.INSTANCE_POOL[id] = ddInstance;
        if (active) {
          DDeiEditor.ACTIVE_INSTANCE = ddInstance;
        }
        return ddInstance;
      } else {
        throw new Error('实例池中已存在ID相同的实例，初始化失败')
      }
    }
  }

  // ============================ 属性 ============================
  id: string;
  // 承载的容器id
  containerid: string;
  // 当前实例的状态
  state: DDeiEditorState | null;
  //当前模型的类型
  modelType: string = "DDeiEditor";
  //当前的实例
  ddInstance: DDei | null;

  // ============================ 方法 ============================
  // ============================ 事件 ============================
  /**
   * 绑定事件
   */
  bindEvent(): void {
    //绑定键盘事件
    document.addEventListener('keydown', (evt: Event) => {
      if (this.keyDown(evt)) {
        evt.preventDefault()
      }
    });
    document.addEventListener('keyup', (evt: Event) => {
      this.keyUp(evt)
      evt.preventDefault()
    });
  }

  /**
   * 键盘按下
   */
  keyDown(evt: Event): void {
    return DDeiKeyAction.route(evt, this)
  }

  /**
   * 键盘弹起
   */
  keyUp(evt: Event): void {
    DDeiKeyAction.updateKeyState(evt);
  }
}

export default DDeiEditor