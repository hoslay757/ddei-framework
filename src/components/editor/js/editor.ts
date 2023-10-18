import DDeiEnumKeyActionInst from "./enums/key-action-inst";
import DDeiKeyAction from "./hotkeys/key-action"
import DDeiEditorState from "./enums/editor-state";
import DDei from "@/components/framework/js/ddei";
import DDeiEditorUtil from "./util/editor-util";
import DDeiUtil from "@/components/framework/js/util";
import DDeiBus from "@/components/framework/js/bus/bus";
import DDeiEditorEnumBusCommandType from "./enums/editor-command-type";
import type DDeiFile from "./file";

/**
 * DDei图形编辑器类，用于维护编辑器实例、全局状态以及全局属性
 */
class DDeiEditor {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.containerid = props.containerid
    this.files = props.files ? props.files : []
    this.currentFileIndex = props.currentFileIndex ? props.currentFileIndex : -1;
    this.state = DDeiEditorState.DESIGNING;
  }
  // ============================ 静态变量 ============================



  /**
   * 所有当前被初始化的DDei实例
   */
  static INSTANCE_POOL: Map<string, DDeiEditor> = new Map();

  /**
   * 日志的级别，file：记录整个文件的变化，stage：只记录stage的变化
   */
  static HISTROY_LEVEL: string = 'file'

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
    //F2快捷编辑
    { keys: "113", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.StartQuickEdit },
    //ESC取消快捷编辑
    { keys: "27", editorState: DDeiEditorState.QUICK_EDITING, action: DDeiEnumKeyActionInst.CancelQuickEdit },
    //Enter确定快捷编辑
    { keys: "13", editorState: DDeiEditorState.QUICK_EDITING, action: DDeiEnumKeyActionInst.EnterQuickEdit },
    //Enter新行
    { keys: "13", alt: true, editorState: DDeiEditorState.QUICK_EDITING, action: DDeiEnumKeyActionInst.NewRowQuickEdit },
    //表格内部回车，往下一行
    { keys: "13", modelType: 'DDeiTable', editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.TableNextRow },
    //表格内部tab，往下一列
    { keys: "9", modelType: 'DDeiTable', editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.TableNextCol },
    //上
    { shift: 2, keys: "38", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.UpMoveModels },
    //下
    { shift: 2, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.DownMoveModels },
    //左
    { shift: 2, keys: "37", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.LeftMoveModels },
    //右
    { shift: 2, keys: "39", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.RightMoveModels },
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
    { ctrl: 1, shift: 1, keys: "40", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.PushBottomModels },
    //复制
    { ctrl: 1, keys: "67", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Copy },
    //剪切
    { ctrl: 1, keys: "88", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CUT },
    //复制为图片
    { ctrl: 1, keys: "73", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.CopyImage },
    //粘贴
    { ctrl: 1, keys: "86", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Paste },
    //格式刷
    { ctrl: 1, shift: 1, keys: "67", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.BrushData },
    //清除格式刷
    { keys: "27", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ClearBrushData },

    //撤销
    { ctrl: 1, keys: "90", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.Revoke },

    //反撤销
    { ctrl: 1, keys: "89", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ReRevoke },
    { ctrl: 1, shift: 1, keys: "90", editorState: DDeiEditorState.DESIGNING, action: DDeiEnumKeyActionInst.ReRevoke },

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
        let editorInstance = new DDeiEditor({ id: id, containerid: containerid });
        if (!DDeiUtil.getAttrValueByConfig) {
          DDeiUtil.getAttrValueByConfig = DDeiEditorUtil.getAttrValueByConfig;
        }
        if (!DDeiUtil.getMenuConfig) {
          DDeiUtil.getMenuConfig = DDeiEditorUtil.getMenuConfig;
        }
        if (!DDeiUtil.getMenuControlId) {
          DDeiUtil.getMenuControlId = DDeiEditorUtil.getMenuControlId;
        }

        if (!DDeiUtil.getSubControlJSON) {
          DDeiUtil.getSubControlJSON = DDeiEditorUtil.getSubControlJSON;
        }

        //将DDeiEditor对象装入全局缓存
        DDeiEditor.INSTANCE_POOL[id] = editorInstance;
        if (active) {
          DDeiEditor.ACTIVE_INSTANCE = editorInstance;
        }
        return editorInstance;
      } else {
        throw new Error('实例池中已存在ID相同的实例，初始化失败')
      }
    }
  }

  // ============================ 属性 ============================
  id: string;
  // 承载的容器id
  containerid: string;

  //当前打开的文件列表
  files: DDeiFile[];

  //当前打开的文件下标
  currentFileIndex: number;

  // 当前实例的状态
  state: DDeiEditorState | null;
  //当前模型的类型
  modelType: string = "DDeiEditor";
  //当前的实例
  ddInstance: DDei | null = null;
  //上下左右四个方向的大小
  leftWidth: number = 0;
  topHeight: number = 0;
  rightWidth: number = 0;
  bottomHeight: number = 0;
  middleWidth: number = 0;
  middleHeight: number = 0;

  //当前bus
  bus: DDeiBus | null = null;

  viewEditor: object | null = null;

  // ============================ 方法 ============================
  /**
   * 添加文件到列表中,默认添加到最后面
   */
  addFile(file: DDeiFile, index: number): void {
    if (index || index == 0) {
      this.files.splice(index, 0, file);
    } else {
      this.files.push(file);
    }
  }

  /**
   * 移除文件
   */
  removeFile(file: DDeiFile, index: number): void {
    if (file) {
      if (this.files.indexOf(file) != -1) {
        this.files.splice(this.files.indexOf(file), 1);
      }
    } else if (index || index == 0) {
      this.files.splice(index, 1);
    }
  }

  /**
   * 交换文件的位置
   */
  changeFile(indexA: number, indexB: number): void {
    let fileA = this.files[indexA];
    let fileB = this.files[indexB];
    this.files[indexA] = fileB
    this.files[indexB] = fileA
  }

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
   * 改变编辑器状态
   * @param state 新状态
   */
  changeState(state: DDeiEditorState): void {
    if (this.state != state) {
      this.state = state

    }
    this.bus?.push(DDeiEditorEnumBusCommandType.ClearTemplateUI, null, null)
    this.bus?.executeAll();
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