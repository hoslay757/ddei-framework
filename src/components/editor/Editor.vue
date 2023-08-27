<template>
  <div>
    <div id="ddei_editor" class="ddei_editor" @mousemove="changeSizePrepare" @mousedown="changeSizeStart">
      <div class="top" id="ddei_editor_frame_top">
        <TopMenu></TopMenu>
      </div>
      <div class="body">
        <div class="left" id="ddei_editor_frame_left">
          <Toolbox @changeEditorFocus="changeEditorFocus" @createControlPrepare="createControlPrepare"></Toolbox>
        </div>
        <div class="middle">
          <CanvasView></CanvasView>
        </div>
        <div class="right" id="ddei_editor_frame_right">
          <PropertyView></PropertyView>
        </div>
      </div>
      <div class="bottom" id="ddei_editor_frame_bottom">
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


export default {
  name: "DDei-Editor",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: DDeiEditor.newInstance("ddei_editor_ins", "ddei_editor")
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
  },
  methods: {

    /**
     * 判断是否移动到拖拽区
     */
    changeSizePrepare(e) {
      //判断落点是否在某个区域的拖拽区附近
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      let frameRightElement = document.getElementById("ddei_editor_frame_right");
      let frameTopElement = document.getElementById("ddei_editor_frame_top");
      let frameBottomElement = document.getElementById("ddei_editor_frame_bottom");

      //判断鼠标落点是否在框架上
      if (frameLeftElement.offsetTop <= e.clientY && frameLeftElement.offsetTop + frameLeftElement.offsetHeight >= e.clientY
        && frameLeftElement.offsetLeft + frameLeftElement.offsetWidth >= e.clientX && frameLeftElement.offsetLeft + frameLeftElement.offsetWidth - 5 <= e.clientX) {
        document.body.style.cursor = 'col-resize';
      } else if (frameRightElement.offsetTop <= e.clientY && frameRightElement.offsetTop + frameRightElement.offsetHeight >= e.clientY
        && frameRightElement.offsetLeft + 5 >= e.clientX && frameRightElement.offsetLeft <= e.clientX) {
        document.body.style.cursor = 'col-resize';
      } else if (frameTopElement.offsetTop + frameTopElement.offsetHeight - 5 <= e.clientY && frameTopElement.offsetTop + frameTopElement.offsetHeight >= e.clientY) {
        document.body.style.cursor = 'row-resize';
      } else if (frameBottomElement.offsetTop <= e.clientY && frameBottomElement.offsetTop + 5 >= e.clientY) {
        document.body.style.cursor = 'row-resize';
      } else {
        document.body.style.cursor = 'default';
      }

    },

    /**
        * 焦点进入当前区域
        */
    changeEditorFocus(state: DDeiEditorState): void {
      if (DDeiEditor.ACTIVE_INSTANCE.state != state) {
        DDeiEditor.ACTIVE_INSTANCE.state = state
      }
    },

    /**
     * 准备创建控件
     * @param control 要创建的控件定义
     */
    createControlPrepare(model: DDeiAbstractShape): void {
      if (model) {
        //修改编辑器状态为控件创建中
        this.changeEditorFocus(DDeiEditorState.CONTROL_CREATING);
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

.ddei_editor .top {
  background: grey;
  flex: 0 0 175px !important;
}

.ddei_editor .body {
  display: flex;
  flex: 1;
}

.ddei_editor .body .left {
  text-align: center;
  background: green;
  flex: 0 0 220px !important;
}

.ddei_editor .body .middle {
  background: blue;
  flex: 1;
}

.ddei_editor .body .right {
  flex: 0 0 275px !important;
}

.ddei_editor .bottom {
  flex: 0 0 60px !important;
}
</style>
