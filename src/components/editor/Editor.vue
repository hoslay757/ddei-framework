<template>
  <div id="ddei_editor" class="ddei_editor" @contextmenu.prevent @mousewheel.prevent @mouseup="mouseUp"
    @mousemove="mouseMove" @mousedown="mouseDown">
    <div class="top" id="ddei_editor_frame_top">
      <TopMenu v-if="refreshTopMenuView"></TopMenu>
    </div>
    <div class="body">
      <div class="left" id="ddei_editor_frame_left">
        <Toolbox @createControlPrepare="createControlPrepare"></Toolbox>
      </div>
      <div class="middle" id="ddei_editor_frame_middle">
        <OpenFilesView v-if="allowOpenMultFiles && refreshOpenFilesView"></OpenFilesView>
        <CanvasView id="ddei_editor_canvasview"></CanvasView>
        <QuickColorView v-if="allowQuickColor"></QuickColorView>
      </div>
      <div class="right" id="ddei_editor_frame_right">
        <PropertyView v-if="refreshPropertyView"></PropertyView>
      </div>
    </div>
    <div class="bottom" id="ddei_editor_frame_bottom">
      <BottomMenu v-if="refreshBottomMenu"></BottomMenu>
    </div>
  </div>
  <MenuDialog v-show="!refreshMenu"></MenuDialog>
  <Dialogs></Dialogs>
</template>

<script lang="ts">
import { debounce } from "lodash";
import Dialogs from "./dialogs/Dialogs.vue";
import DDeiEditor from "./js/editor";
import TopMenu from "./topmenu/TopMenu.vue";
import Toolbox from "./toolbox/Toolbox.vue";
import BottomMenu from "./bottommenu/BottomMenu.vue";
import PropertyView from "./propertyview/PropertyView.vue";
import CanvasView from "./canvasview/CanvasView.vue";
import OpenFilesView from "./openfilesview/OpenFilesView.vue";
import QuickColorView from "./quickcolorview/QuickColorView.vue";
import DDeiEditorState from "./js/enums/editor-state";
import DDeiAbstractShape from "../framework/js/models/shape";
import DDeiEnumState from "../framework/js/enums/ddei-state";
import "./js/util/command";
import DDeiUtil from "../framework/js/util";
import DDeiEnumBusCommandType from "../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "./js/enums/editor-command-type";
import DDeiFileState from "./js/enums/file-state";
import DDeiEditorCommandFileDirty from "./js/bus/commands/file-dirty";
import DDeiEditorCommandAddHistroy from "./js/bus/commands/add-histroy";
import MenuDialog from "./menus/menudialog/MenuDialog.vue";
import { throttle } from "lodash";
import DDeiEnumOperateState from "../framework/js/enums/operate-state";
import DDeiEditorUtil from "./js/util/editor-util";
import DDeiFile from "./js/file";
export default {
  name: "DDei-Editor",
  extends: null,
  mixins: [],
  props: {
    //外部配置文件的定义，当传入外部配置文件时，用外部配置文件覆盖内部配置
    //外部配置文件包含对缺省值、快捷键、默认行为、扩展函数的配置
    config: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      editor: null,
      dragObj: null,
      changeIndex: -1,
      refreshBottomMenu: true,
      refreshOpenFilesView: true,
      refreshPropertyView: true,
      refreshMenu: true,
      refreshTopMenuView: true,
      allowOpenMultFiles: true,
      allowQuickColor: true,
      initLeftWidth: 0,
      initRightWidth: 0,
    };
  },
  //注册组件
  components: {
    TopMenu,
    Toolbox,
    BottomMenu,
    PropertyView,
    OpenFilesView,
    CanvasView,
    QuickColorView,
    MenuDialog,
    Dialogs
  },
  computed: {},
  watch: {},
  created() {
    window.onresize = this.resetSize;
    this.mouseMove = throttle(this.mouseMove, 20);
    if (DDeiEditor.ACTIVE_INSTANCE) {
      this.editor = DDeiEditor.ACTIVE_INSTANCE;
    } else {
      this.editor = DDeiEditor.newInstance("ddei_editor_ins", "ddei_editor");
    }
    //载入局部配置
    this.editor.applyConfig(this.config);
    this.editor.extConfig = this.config;
    this.allowOpenMultFiles = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_OPEN_MULT_FILES",
      this.editor
    );
    this.allowQuickColor = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_QUICK_COLOR",
      this.editor
    );
    window.onbeforeunload = this.beforeUnload;

  },
  mounted() {

    this.editor.editorViewer = this;
    this.editor.bindEvent();

    let frameLeftElement = document.getElementById("ddei_editor_frame_left");
    let frameRightElement = document.getElementById("ddei_editor_frame_right");
    let frameTopElement = document.getElementById("ddei_editor_frame_top");
    let frameBottomElement = document.getElementById(
      "ddei_editor_frame_bottom"
    );
    let frameMiddleElement = document.getElementById(
      "ddei_editor_frame_middle"
    );

    this.editor.leftWidth = frameLeftElement.offsetWidth;
    this.editor.rightWidth = frameRightElement.offsetWidth;
    this.editor.topHeight = frameTopElement.offsetHeight;
    this.editor.bottomHeight = frameBottomElement.offsetHeight;
    this.editor.middleWidth = frameMiddleElement.offsetWidth;
    this.editor.middleHeight = frameMiddleElement.offsetHeight;
    this.initLeftWidth = frameLeftElement.offsetWidth
    this.initRightWidth = frameRightElement.offsetWidth
    this.editor.maxWidth =
      this.editor.leftWidth + this.editor.rightWidth + this.editor.middleWidth;

    //初始化拦截器
    //以下为拦截器的配置
    this.editor.bus.interceptor[DDeiEnumBusCommandType.NodifyChange] = {
      after: [this.changeFileModifyDirty],
    };

    this.editor.bus.interceptor[DDeiEnumBusCommandType.ModelChangeValue] = {
      after: [this.changeFileModifyDirty],
    };
    if (DDeiEditor.HISTROY_LEVEL == "file") {
      this.editor.bus.interceptor[DDeiEnumBusCommandType.AddHistroy] = {
        execute: [this.addFileHistroy],
      };
    }
    this.editor.bus.interceptor[DDeiEnumBusCommandType.TextEditorChangeSelectPos] = {
      execute: [this.textEditorChangeSelectPos],
    };
    if (!DDeiUtil.setCurrentMenu) {
      DDeiUtil.setCurrentMenu = this.setCurrentMenu;
    }
  },
  methods: {



    beforeUnload(e) {
      let files = this.editor?.files

      let hasDirty = false;
      for (let i = 0; i < files?.length; i++) {
        if (files[i].state != DDeiFileState.NONE) {
          hasDirty = true;
          break;
        }
      }
      if (hasDirty) {
        var e = window.event || e;
        e.returnValue = ("确定离开当前页面吗（未保存数据将会丢失）？");
      }
    },

    forceRefreshBottomMenu() {
      this.refreshBottomMenu = false;
      this.$nextTick(() => {
        this.refreshBottomMenu = true;
      });
    },

    forcePropertyView() {
      this.refreshPropertyView = false;
      this.$nextTick(() => {
        this.refreshPropertyView = true;
      });
    },

    forceRefreshOpenFilesView() {
      this.refreshOpenFilesView = false;
      this.$nextTick(() => {
        this.refreshOpenFilesView = true;
      });
    },

    forceRefreshTopMenuView() {
      this.refreshTopMenuView = false;
      this.$nextTick(() => {
        this.refreshTopMenuView = true;
      });
    },
    /**
     * 设置当前菜单
     * @returns 控件ID
     */
    setCurrentMenu(menus: object): void {
      this.editor.currentMenuData = menus;
      this.refreshMenu = false;
      this.$nextTick(() => {
        this.refreshMenu = true;
      });
    },

    changeFileModifyDirty() {
      let action: DDeiEditorCommandFileDirty =
        DDeiEditorCommandFileDirty.newInstance();
      return action.action(
        { state: DDeiFileState.MODIFY },
        this.editor.bus,
        null
      );
    },

    //记录文件的histroy
    addFileHistroy() {
      let action: DDeiEditorCommandAddHistroy =
        DDeiEditorCommandAddHistroy.newInstance();
      return action.action({}, this.editor.bus, null);
    },


    textEditorChangeSelectPos() {
      //触发文本焦点改变内部监听
      if (!this.editor.textEditorSelectedChange) {
        this.editor.textEditorSelectedChange = 1
      } else {
        this.editor.textEditorSelectedChange++
      }
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
    },

    resetSize() {
      let width = document.body.scrollWidth
      let height = document.body.scrollHeight
      if (!window.upSizeWidth || !window.upSizeHeight) {
        window.upSizeWidth = width;
        window.upSizeHeight = height;
      } else {
        let deltaWidth = width - window.upSizeWidth;
        let deltaHeight = height - window.upSizeHeight;
        if (this.editor.middleWidth + deltaWidth >= 305) {
          window.upSizeWidth = width;
          this.editor.middleWidth += deltaWidth;
          this.editor.maxWidth =
            this.editor.leftWidth +
            this.editor.rightWidth +
            this.editor.middleWidth;
        }
        if (this.editor.middleHeight + deltaHeight >= 305) {
          window.upSizeHeight = height;
          this.editor.middleHeight += deltaHeight;
          this.editor.maxHeight =
            this.editor.leftHeight +
            this.editor.rightHeight +
            this.editor.middleHeight;
        }
        this.editor.ddInstance.render.setSize(
          this.editor.middleWidth,
          this.editor.middleHeight,
          0,
          0
        );
        this.editor.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.ddInstance.bus.executeAll();
      }
    },
    /**
     * 停止改变大小
     * @param e
     */
    mouseUp(e: Event) {
      if (this.editor.state == DDeiEditorState.FRAME_CHANGING) {
        this.dragObj = null;
        this.changeIndex = -1;
        this.editor.state = DDeiEditorState.DESIGNING;
        this.editor.ddInstance.state = DDeiEnumState.NONE;
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.cancelBubble = true;
        e.preventDefault();
        return false;
      } else if (this.editor.state == DDeiEditorState.DESIGNING || this.editor.state == DDeiEditorState.QUICK_EDITING) {
        //事件下发到绘图区
        this.editor.ddInstance.render.mouseUp(e);
      }
    },
    /**
     * 判断是否移动到拖拽区
     */
    mouseMove(e: Event) {
      //判断落点是否在某个区域的拖拽区附近
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      let frameRightElement = document.getElementById(
        "ddei_editor_frame_right"
      );
      let frameTopElement = document.getElementById("ddei_editor_frame_top");
      let frameMiddleElement = document.getElementById(
        "ddei_editor_frame_middle"
      );
      let frameBottomElement = document.getElementById(
        "ddei_editor_frame_bottom"
      );
      let filesElement = document.getElementById("ddei_editor_ofsview");
      let quickColorElement = document.getElementById("ddei_editor_qcview");
      let middleCanvas = document.getElementById("ddei_editor_canvasview");
      let middleCanvasPos = DDeiUtil.getDomAbsPosition(middleCanvas);
      this.editor.middleWidth = frameMiddleElement.offsetWidth;
      this.editor.middleHeight =
        frameMiddleElement.offsetHeight -
        filesElement?.offsetHeight -
        quickColorElement?.offsetHeight;
      //拖拽中，根据拖拽的类型，改变大小
      if (this.editor.state == DDeiEditorState.FRAME_CHANGING) {
        if (e.buttons !== 1) {
          this.mouseUp(e);
          e.preventDefault();
          return;
        }
        let deltaY = e.clientY - this.dragObj.y;
        let deltaX = e.clientX - this.dragObj.x;
        switch (this.changeIndex) {
          case 1:
            break;
          case 2:
            if (deltaX != 0) {
              if (frameRightElement.offsetWidth - deltaX < this.initRightWidth) {
                deltaX = -this.initRightWidth + frameRightElement.offsetWidth
              }
              if (this.editor.middleWidth + deltaX >= 300 && deltaX != 0) {
                frameRightElement.style.flexBasis =
                  frameRightElement.offsetWidth - deltaX + "px";
                frameRightElement.style.flexShrink = "0";
                frameRightElement.style.flexGrow = "0";
                this.editor.middleWidth += deltaX;
                this.dragObj.x = e.clientX;
                this.dragObj.y = e.clientY;
                this.editor.ddInstance.render.setSize(
                  this.editor.middleWidth,
                  this.editor.middleHeight,
                  0,
                  0
                );
                this.editor.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape)
                this.editor.ddInstance.bus.executeAll()
              }
            }
            break;
          case 4:
            if (deltaX != 0) {
              if (frameLeftElement.offsetWidth + deltaX < this.initLeftWidth / 1.5) {
                deltaX = parseInt(this.initLeftWidth / 1.5) - frameLeftElement.offsetWidth
              }
              if (this.editor.middleWidth - deltaX >= 300 && deltaX != 0) {
                frameLeftElement.style.flexBasis =
                  frameLeftElement.offsetWidth + deltaX + "px";
                frameLeftElement.style.flexShrink = "0";
                frameLeftElement.style.flexGrow = "0";
                //重新设置画布大小
                this.editor.middleWidth -= deltaX;
                this.dragObj.x = e.clientX;
                this.dragObj.y = e.clientY;
                this.editor.ddInstance.render.setSize(
                  this.editor.middleWidth,
                  this.editor.middleHeight,
                  0,
                  0
                );
                this.editor.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape)
                this.editor.ddInstance.bus.executeAll()
              }
            }
            break;
          default:
            break;
        }

        //同步记录大小
        this.editor.leftWidth = frameLeftElement.offsetWidth;
        this.editor.rightWidth = frameRightElement.offsetWidth;
        this.editor.topHeight = frameTopElement.offsetHeight;
        this.editor.bottomHeight = frameBottomElement.offsetHeight;
      } else {
        //如果正在拖拽内部画布的滚动条
        if (
          this.editor.ddInstance.stage.render.operateState ==
          DDeiEnumOperateState.STAGE_SCROLL_WORKING
        ) {
          this.editor.ddInstance.render.mouseMove(e);
        }
        //判断鼠标落点是否在框架上
        else if (
          frameLeftElement.offsetTop <= e.clientY &&
          frameLeftElement.offsetTop + frameLeftElement.offsetHeight >=
          e.clientY &&
          Math.abs(
            e.clientX -
            (frameLeftElement.offsetLeft + frameLeftElement.offsetWidth)
          ) <= 5
        ) {
          document.body.style.cursor = "col-resize";
        } else if (
          frameRightElement.offsetTop <= e.clientY &&
          frameRightElement.offsetTop + frameRightElement.offsetHeight >=
          e.clientY &&
          e.clientX - frameRightElement.offsetLeft >= -5 &&
          e.clientX - frameRightElement.offsetLeft <= -1
        ) {
          if (frameRightElement.offsetWidth > 38) {
            document.body.style.cursor = "col-resize";
          }
        } else if (
          middleCanvasPos.top <= e.clientY &&
          middleCanvasPos.left <= e.clientX &&
          middleCanvasPos.top + middleCanvas.offsetHeight >= e.clientY &&
          middleCanvasPos.left + middleCanvas.offsetWidth >= e.clientX
        ) {
          //事件下发到绘图区
          this.editor.ddInstance.render.mouseMove(e);
        } else {
          document.body.style.cursor = "default";
        }
      }
    },
    /**
     * 准备拖拽
     */
    mouseDown(e: Event) {

      //判断落点是否在某个区域的拖拽区附近
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      let frameRightElement = document.getElementById(
        "ddei_editor_frame_right"
      );
      let frameTopElement = document.getElementById("ddei_editor_frame_top");
      let ex = e.clientX
      let ey = e.clientY
      //判断鼠标落点是否在框架上
      if (
        frameLeftElement.offsetTop <= ey &&
        frameLeftElement.offsetTop + frameLeftElement.offsetHeight >=
        ey &&
        Math.abs(
          ex -
          (frameLeftElement.offsetLeft + frameLeftElement.offsetWidth)
        ) <= 5
      ) {
        this.changeIndex = 4;
        this.dragObj = {
          x: ex,
          y: ey,
          originX: e.offsetX,
          originY: e.offsetY,
        };
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if (
        frameRightElement.offsetTop <= ey &&
        frameRightElement.offsetTop + frameRightElement.offsetHeight >=
        ey &&
        ex - frameRightElement.offsetLeft >= -5 &&
        ex - frameRightElement.offsetLeft <= -1
      ) {
        this.changeIndex = 2;
        this.dragObj = {
          x: ex,
          y: ey,
          originX: e.offsetX,
          originY: e.offsetY,
        };
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if (
        Math.abs(
          ey - (frameTopElement.offsetTop + frameTopElement.offsetHeight)
        ) <= 5
      ) {
        this.changeIndex = 1;
        this.dragObj = {
          x: ex,
          y: ey,
          originX: e.offsetX,
          originY: e.offsetY,
        };
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      }
    },

    /**
     * 准备创建控件
     * @param control 要创建的控件定义
     */
    createControlPrepare(models: DDeiAbstractShape[]): void {
      if (models?.length > 0) {
        let ddInstance = this.editor.ddInstance;
        let stage = ddInstance.stage;
        if (stage?.render?.operateState == DDeiEnumOperateState.QUICK_EDITING && stage?.render?.editorShadowControl) {
          DDeiUtil.getEditorText()?.enterValue()
        }
        //修改编辑器状态为控件创建中
        this.editor.changeState(DDeiEditorState.CONTROL_CREATING);
        //设置正在需要创建的控件
        this.editor.creatingControls = models;
        this.editor.bus?.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        this.editor.bus?.executeAll();
      }
    },
  },
};
</script>

<style scoped>
.ddei_editor {

  width: 100%;
  height: calc(100vh);
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 240, 240);
  min-width: 1700px;
}

.ddei_editor .top {
  flex: 0 0 103px
}

.ddei_editor .bottom {
  flex: 0 0 50px;
  background: #F2F2F7;
  border: 1px solid #D4D4D4;
}

.ddei_editor .body {
  display: flex;
  flex: 1;
}

.ddei_editor .body .left {
  flex: 0 1 292px;
  border: 1px solid #D5D5DF;
}

.ddei_editor .body .middle {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ddei_editor .body .right {
  flex: 0 1 292px;
  border: 1px solid #D5D5DF;
}
</style>
<style>
.ddei_editor img {
  -webkit-user-drag: none;
  user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.ddei_editor div {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
