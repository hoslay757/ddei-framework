<template>
  <div>
    <div id="ddei_editor" class="ddei_editor" @mouseup="mouseUp" @mousemove="mouseMove" @mousedown="mouseDown">
      <div style="flex:0 0 100px" class="top" id="ddei_editor_frame_top">
        <TopMenu></TopMenu>
      </div>
      <div class="body">
        <div style="flex:0 0 220px" id="ddei_editor_frame_left">
          <Toolbox @createControlPrepare="createControlPrepare"></Toolbox>
        </div>
        <div class="middle" id="ddei_editor_frame_middle">
          <OpenFilesView></OpenFilesView>
          <CanvasView id="ddei_editor_canvasview"></CanvasView>
          <QuickColorView></QuickColorView>
        </div>
        <div style="flex:0 0 330px" class="right" id="ddei_editor_frame_right">
          <PropertyView></PropertyView>
        </div>
      </div>
      <div style="flex: 0 0 35px;" class="bottom" id="ddei_editor_frame_bottom">
        <BottomMenu></BottomMenu>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash';
import DDeiEditor from './js/editor';
import TopMenu from './topmenu/TopMenu.vue';
import Toolbox from './toolbox/Toolbox.vue';
import BottomMenu from './bottommenu/BottomMenu.vue';
import PropertyView from './propertyview/PropertyView.vue';
import CanvasView from './canvasview/CanvasView.vue';
import OpenFilesView from './openfilesview/OpenFilesView.vue'
import QuickColorView from './quickcolorview/QuickColorView.vue'
import DDeiEditorState from './js/enums/editor-state';
import DDeiAbstractShape from '../framework/js/models/shape';
import DDeiEnumState from '../framework/js/enums/ddei-state';
import { COMMANDS } from "../framework/js/config/command"
import { loadEditorCommands } from "./js/util/command"
import DDeiUtil from '../framework/js/util';
import DDeiFile from './js/file';
import DDeiEnumBusCommandType from '../framework/js/enums/bus-command-type';
import DDeiEditorEnumBusCommandType from './js/enums/editor-command-type';
import DDeiFileState from './js/enums/file-state';
import DDeiEditorCommandFileDirty from './js/bus/commands/file-dirty';


export default {
  name: "DDei-Editor",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: DDeiEditor.newInstance("ddei_editor_ins", "ddei_editor"),
      dragObj: null,
      changeIndex: -1
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
    QuickColorView
  },
  computed: {},
  watch: {},
  created() {
    window.onresize = this.resetSize
  },
  mounted() {


    loadEditorCommands();
    this.editor.bindEvent();
    let frameLeftElement = document.getElementById("ddei_editor_frame_left");
    let frameRightElement = document.getElementById("ddei_editor_frame_right");
    let frameTopElement = document.getElementById("ddei_editor_frame_top");
    let frameBottomElement = document.getElementById("ddei_editor_frame_bottom");
    let frameMiddleElement = document.getElementById("ddei_editor_frame_middle");

    this.editor.leftWidth = frameLeftElement.offsetWidth;
    this.editor.rightWidth = frameRightElement.offsetWidth;
    this.editor.topHeight = frameTopElement.offsetHeight;
    this.editor.bottomHeight = frameBottomElement.offsetHeight;
    this.editor.middleWidth = frameMiddleElement.offsetWidth;
    this.editor.middleHeight = frameMiddleElement.offsetHeight;
    this.editor.maxWidth = this.editor.leftWidth + this.editor.rightWidth + this.editor.middleWidth;
    //初始化拦截器
    //以下为拦截器的配置
    this.editor.bus.interceptor[DDeiEnumBusCommandType.ModelChangeBounds] = { 'after': [this.changeFileModifyDirty] };
    this.editor.bus.interceptor[DDeiEnumBusCommandType.ModelChangeContainer] = { 'after': [this.changeFileModifyDirty] };
    this.editor.bus.interceptor[DDeiEnumBusCommandType.ModelChangeRotate] = { 'after': [this.changeFileModifyDirty] };
    this.editor.bus.interceptor[DDeiEnumBusCommandType.ModelChangeValue] = { 'after': [this.changeFileModifyDirty] };

  },
  methods: {

    changeFileModifyDirty() {
      let action: DDeiEditorCommandFileDirty = DDeiEditorCommandFileDirty.newInstance();
      return action.action({ state: DDeiFileState.MODIFY }, this.editor.bus, null);
    },

    resetSize(evt, a, b) {
      let width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;
      if (!window.upSize) {
        window.upSize = width;
      } else {
        let deltaWidth = width - window.upSize
        if (this.editor.middleWidth + deltaWidth >= 305) {

          window.upSize = width;
          this.editor.middleWidth += deltaWidth;
          this.editor.maxWidth = this.editor.leftWidth + this.editor.rightWidth + this.editor.middleWidth;
          this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
          this.editor.ddInstance.render.drawShape()
        }
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
      } else if (this.editor.state == DDeiEditorState.DESIGNING) {
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
      let frameRightElement = document.getElementById("ddei_editor_frame_right");
      let frameTopElement = document.getElementById("ddei_editor_frame_top");
      let frameMiddleElement = document.getElementById("ddei_editor_frame_middle");
      let frameBottomElement = document.getElementById("ddei_editor_frame_bottom");
      let filesElement = document.getElementById("ddei_editor_ofsview");
      let quickColorElement = document.getElementById("ddei_editor_qcview");
      let middleCanvas = document.getElementById("ddei_editor_canvasview");
      let middleCanvasPos = DDeiUtil.getDomAbsPosition(middleCanvas)
      this.editor.middleWidth = frameMiddleElement.offsetWidth;
      this.editor.middleHeight = frameMiddleElement.offsetHeight - filesElement?.offsetHeight - quickColorElement?.offsetHeight;
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
            // if (deltaY != 0) {
            //   if (frameTopElement.offsetHeight + deltaY <= 175 && frameTopElement.offsetHeight + deltaY >= 40) {
            //     frameTopElement.style.flexBasis = (frameTopElement.offsetHeight + deltaY) + "px";
            //     frameTopElement.style.flexShrink = "0";
            //     frameTopElement.style.flexGrow = "0";
            //     this.editor.middleHeight -= deltaY;
            //     this.dragObj.x = e.clientX;
            //     this.dragObj.y = e.clientY;
            //     this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
            //     this.editor.ddInstance.render.drawShape()
            //   }
            // }
            break;
          case 2:
            if (deltaX != 0) {
              if (this.editor.middleWidth + deltaX >= 300 && frameRightElement.offsetWidth - deltaX > 330) {
                frameRightElement.style.flexBasis = (frameRightElement.offsetWidth - deltaX) + "px";
                frameRightElement.style.flexShrink = "0";
                frameRightElement.style.flexGrow = "0";
                this.editor.middleWidth += deltaX;
                this.dragObj.x = e.clientX;
                this.dragObj.y = e.clientY;
                this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
                this.editor.ddInstance.render.drawShape()
              }
            }
            break;
          case 4:
            if (deltaX != 0) {
              if (this.editor.middleWidth - deltaX >= 300 && frameLeftElement.offsetWidth + deltaX >= 140) {
                frameLeftElement.style.flexBasis = (frameLeftElement.offsetWidth + deltaX) + "px";
                frameLeftElement.style.flexShrink = "0";
                frameLeftElement.style.flexGrow = "0";
                //重新设置画布大小
                this.editor.middleWidth -= deltaX;
                this.dragObj.x = e.clientX;
                this.dragObj.y = e.clientY;
                this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
                this.editor.ddInstance.render.drawShape()
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
        //判断鼠标落点是否在框架上
        if (frameLeftElement.offsetTop <= e.clientY && frameLeftElement.offsetTop + frameLeftElement.offsetHeight >= e.clientY
          && Math.abs(e.clientX - (frameLeftElement.offsetLeft + frameLeftElement.offsetWidth)) <= 5) {
          document.body.style.cursor = 'col-resize';
        }
        else if (frameRightElement.offsetTop <= e.clientY && frameRightElement.offsetTop + frameRightElement.offsetHeight >= e.clientY
          && e.clientX - frameRightElement.offsetLeft >= -5 && e.clientX - frameRightElement.offsetLeft <= -1) {
          if (frameRightElement.offsetWidth > 38) {
            document.body.style.cursor = 'col-resize';
          }
        }
        // else if (Math.abs(e.clientY - (frameTopElement.offsetTop + frameTopElement.offsetHeight)) <= 5) {
        //   document.body.style.cursor = 'row-resize';
        // } 
        else if (middleCanvasPos.top <= e.clientY && middleCanvasPos.left <= e.clientX
          && middleCanvasPos.top + middleCanvas.offsetHeight >= e.clientY && middleCanvasPos.left + middleCanvas.offsetWidth >= e.clientX) {

          //事件下发到绘图区
          this.editor.ddInstance.render.mouseMove(e);
        }
        else {
          document.body.style.cursor = 'default';
        }
      }


    },
    /**
     * 准备拖拽
     */
    mouseDown(e: Event) {
      //判断落点是否在某个区域的拖拽区附近
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      let frameRightElement = document.getElementById("ddei_editor_frame_right");
      let frameTopElement = document.getElementById("ddei_editor_frame_top");
      let frameMiddleElement = document.getElementById("ddei_editor_frame_middle");

      //判断鼠标落点是否在框架上
      if (frameLeftElement.offsetTop <= e.clientY && frameLeftElement.offsetTop + frameLeftElement.offsetHeight >= e.clientY
        && Math.abs(e.clientX - (frameLeftElement.offsetLeft + frameLeftElement.offsetWidth)) <= 5) {
        this.changeIndex = 4
        this.dragObj = { x: e.clientX, y: e.clientY, originX: e.offsetX, originY: e.offsetY }
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if (frameRightElement.offsetTop <= e.clientY && frameRightElement.offsetTop + frameRightElement.offsetHeight >= e.clientY
        && e.clientX - frameRightElement.offsetLeft >= -5 && e.clientX - frameRightElement.offsetLeft <= -1) {
        this.changeIndex = 2
        this.dragObj = { x: e.clientX, y: e.clientY, originX: e.offsetX, originY: e.offsetY }
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if (Math.abs(e.clientY - (frameTopElement.offsetTop + frameTopElement.offsetHeight)) <= 5) {
        this.changeIndex = 1
        this.dragObj = { x: e.clientX, y: e.clientY, originX: e.offsetX, originY: e.offsetY }
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      }
    },

    /**
     * 准备创建控件
     * @param control 要创建的控件定义
     */
    createControlPrepare(model: DDeiAbstractShape): void {
      if (model) {
        //修改编辑器状态为控件创建中
        this.editor.changeState(DDeiEditorState.CONTROL_CREATING);
        //设置正在需要创建的控件
        this.editor.creatingControl = model;
      }
    },




  }
};
</script>

<style scoped>
.ddei_editor {
  width: 100%;
  height: calc(100vh);
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 240, 240);
}



.ddei_editor .body {
  display: flex;
  flex: 1;
}


.ddei_editor .body .middle {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ddei_editor .body .right {
  display: flex;
  flex-direction: column;
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
