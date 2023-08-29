<template>
  <div>
    <div id="ddei_editor" class="ddei_editor" @mouseup="mouseUp" @mousemove="mouseMove" @mousedown="mouseDown">
      <div style="flex:0 0 175px" class="top" id="ddei_editor_frame_top">
        <TopMenu></TopMenu>
      </div>
      <div class="body">
        <div style="flex:0 0 220px" id="ddei_editor_frame_left">
          <Toolbox @createControlPrepare="createControlPrepare"></Toolbox>
        </div>
        <div class="middle" id="ddei_editor_frame_middle">
          <CanvasView></CanvasView>
        </div>
        <div style="flex:0 0 275px" class="right" id="ddei_editor_frame_right">
          <PropertyView></PropertyView>
        </div>
      </div>
      <div style="flex: 0 0 60px;" class="bottom" id="ddei_editor_frame_bottom">
        <BottomMenu></BottomMenu>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from './js/editor';
import TopMenu from './topmenu/TopMenu.vue';
import Toolbox from './toolbox/Toolbox.vue';
import BottomMenu from './bottommenu/BottomMenu.vue';
import PropertyView from './propertyview/PropertyView.vue';
import CanvasView from './canvasview/CanvasView.vue';
import DDeiEditorState from './js/enums/editor-state';
import DDeiAbstractShape from '../framework/js/models/shape';
import DDeiEnumState from '../framework/js/enums/ddei-state';


export default {
  name: "DDei-Editor",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: DDeiEditor.newInstance("ddei_editor_ins", "ddei_editor"),
      dragObj:null,
      changeIndex: -1
    };
  },
  //注册组件
  components: {
    TopMenu,
    Toolbox,
    BottomMenu,
    PropertyView,
    CanvasView
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
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
    this.editor.middleHeight = frameMiddleElement.offsetHeight-25;
  },
  methods: {

    /**
     * 停止改变大小
     * @param e 
     */
    mouseUp(e:Event){
      if (this.editor.state == DDeiEditorState.FRAME_CHANGING) {
        this.dragObj = null;
        this.changeIndex = -1;
        this.editor.state = DDeiEditorState.DESIGNING;
        this.editor.ddInstance.state = DDeiEnumState.NONE;
      }else if(this.editor.state == DDeiEditorState.DESIGNING){
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
      this.editor.middleWidth = frameMiddleElement.offsetWidth;
      this.editor.middleHeight = frameMiddleElement.offsetHeight-25;
      //拖拽中，根据拖拽的类型，改变大小
      if(this.editor.state == DDeiEditorState.FRAME_CHANGING){
        let deltaY = e.clientY - this.dragObj.y;
        let deltaX = e.clientX - this.dragObj.x;
        switch(this.changeIndex){
          case 1:
            if(deltaY != 0){
              if(frameTopElement.offsetHeight+ deltaY <= 175 && frameTopElement.offsetHeight+ deltaY >= 40){
                frameTopElement.style.flexBasis =  (frameTopElement.offsetHeight+ deltaY)+"px";
                frameTopElement.style.flexShrink = "0";
                frameTopElement.style.flexGrow = "0";
                this.editor.middleHeight -= deltaY;
                this.editor.ddInstance.render.setSize(this.editor.middleWidth , this.editor.middleHeight, 0,0)
                this.editor.ddInstance.render.drawShape()
              }
            } 
            break;
          case 2:
            if (deltaX != 0) {
              if (frameRightElement.offsetWidth - deltaX <= 500 && frameRightElement.offsetWidth - deltaX >= 275) {
                frameRightElement.style.flexBasis = (frameRightElement.offsetWidth - deltaX) + "px";
                frameRightElement.style.flexShrink = "0";
                frameRightElement.style.flexGrow = "0";
                this.editor.middleWidth += deltaX;
                this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
                this.editor.ddInstance.render.drawShape()
              }
            }
            break;
          case 4:
            if (deltaX != 0) {
              if (frameLeftElement.offsetWidth + deltaX <= 500 && frameLeftElement.offsetWidth + deltaX >= 140) {
                frameLeftElement.style.flexBasis = (frameLeftElement.offsetWidth + deltaX) + "px";
                frameLeftElement.style.flexShrink = "0";
                frameLeftElement.style.flexGrow = "0";
                //重新设置画布大小
                this.editor.middleWidth -= deltaX;
                this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
                this.editor.ddInstance.render.drawShape()
              }
            }
            break;
          default:
            break;
        }
        this.dragObj.x = e.clientX;
        this.dragObj.y = e.clientY;
        //同步记录大小
        this.editor.leftWidth = frameLeftElement.offsetWidth;
        this.editor.rightWidth = frameRightElement.offsetWidth;
        this.editor.topHeight = frameTopElement.offsetHeight;
        this.editor.bottomHeight = frameBottomElement.offsetHeight;
      }else{
        //判断鼠标落点是否在框架上
        if (frameLeftElement.offsetTop <= e.clientY && frameLeftElement.offsetTop + frameLeftElement.offsetHeight >= e.clientY
          && Math.abs(e.clientX-(frameLeftElement.offsetLeft + frameLeftElement.offsetWidth)) <= 5 ) {
          document.body.style.cursor = 'col-resize';
        } else if (frameRightElement.offsetTop <= e.clientY && frameRightElement.offsetTop + frameRightElement.offsetHeight >= e.clientY
          && Math.abs(e.clientX - frameRightElement.offsetLeft) <= 5) {
          if(frameRightElement.offsetWidth > 38){
            document.body.style.cursor = 'col-resize';
          }
        } else if (Math.abs(e.clientY - (frameTopElement.offsetTop + frameTopElement.offsetHeight))  <= 5) {
          document.body.style.cursor = 'row-resize';
        } else if (frameMiddleElement.offsetTop <= e.clientY && frameMiddleElement.offsetLeft <= e.clientX
          && frameMiddleElement.offsetTop + frameMiddleElement.offsetHeight >= e.clientY && frameMiddleElement.offsetLeft + frameMiddleElement.offsetWidth >= e.clientX) {
            //事件下发到绘图区
          this.editor.ddInstance.render.mouseMove(e);
        } else {
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
        && Math.abs(e.clientX - frameRightElement.offsetLeft) <= 5) {
        this.changeIndex = 2
        this.dragObj = { x: e.clientX, y: e.clientY, originX: e.offsetX, originY: e.offsetY }
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if(Math.abs(e.clientY - (frameTopElement.offsetTop + frameTopElement.offsetHeight)) <= 5) {
        this.changeIndex = 1
        this.dragObj = { x: e.clientX, y: e.clientY, originX: e.offsetX, originY: e.offsetY }
        this.editor.state = DDeiEditorState.FRAME_CHANGING;
        this.editor.ddInstance.state = DDeiEnumState.IN_ACTIVITY;
      } else if (frameMiddleElement.offsetTop <= e.clientY && frameMiddleElement.offsetLeft <= e.clientX
        && frameMiddleElement.offsetTop + frameMiddleElement.offsetHeight >= e.clientY && frameMiddleElement.offsetLeft + frameMiddleElement.offsetWidth >= e.clientX) {
        //事件下发到绘图区
        this.editor.ddInstance.state = DDeiEnumState.NONE;
        this.editor.ddInstance.render.mouseDown(e);
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
  background-color: aquamarine;
}

.ddei_editor .body {
  display: flex;
  flex: 1;
}


.ddei_editor .body .middle {
  flex: 1;
}

.ddei_editor .body .right {
  display: flex;
  flex-direction: column;
}
</style>
