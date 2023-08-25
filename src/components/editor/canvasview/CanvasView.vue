<template>
  <div id="ddei_editor_canvasview" @mousedown="changeEditorFocus"
    ondragstart="return false;"
    @dragover="createControlOver" 
    @drop="createControlDrop"
    @dragleave="createControlCancel"
    @contextmenu.prevent
        class="ddei_editor_canvasview">
  </div>
</template>

<script lang="ts">
import DDei from '@/components/framework/js/ddei';
import DDeiEditor from '../js/editor';
import DDeiEditorState from '../js/enums/editor-state';
import DDeiConfig from '../../framework/js/config';
import DDeiEnumControlState from '../../framework/js/enums/control-state';
import DDeiUtil from '../../framework/js/util';


export default {
  name: "DDei-Editor-CanvasView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  watch: {},
  created() {},
  emits: ['changeEditorFocus'],
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.ddInstance = DDei.newInstance("ddei_editor_view", "ddei_editor_canvasview");
  },
  methods: {

    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.$emit('changeEditorFocus', DDeiEditorState.DESIGNING)
    },

    /**
     * 拖拽元素移动
     */
    createControlOver(e) {
      if(!window.uptime){
        window.uptime = new Date().getTime();
      }
      //TOOD 引入双缓冲、考虑帧率的问题
      if(new Date().getTime()-window.uptime < 16){
        e.preventDefault();
        return;
      }
      window.uptime = new Date().getTime();
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let ddInstance = this.editor.ddInstance;
          //当前激活的图层
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          if(layer){
            ddInstance.stage.render.currentOperateContainer = layer
            let control = this.editor.creatingControl;
            //在画布上创建临时对象
            if(!layer.models.has(control.id)){
              layer.addModel(control);
               //绑定并初始化渲染器
              DDeiConfig.bindRender(control);
              control.render.init();
            }
            //当前编辑器最外部容器的坐标 TODO 无限画布后需要转换为layer的视窗坐标
            let containerX = e.offsetX;
            let containerY = e.offsetY;
            control.x = containerX - control.width * 0.5;
            control.y = containerY - control.height * 0.5;
            //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
            ddInstance.stage.render.drawShape();
            e.preventDefault();
          }
        }
      }
    },

    /**
     * 拖拽元素放开
     */
    createControlDrop(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let ddInstance:DDei = this.editor.ddInstance;
          ddInstance.stage.idIdx++;
          //清除透明
          // DDeiUtil.setStyle(this.editor.creatingControl, ["border.top.opacity", "border.right.opacity", "border.bottom.opacity",
          //   "border.left.opacity", "fill.opacity", "image.opacity"], null);
          //取消选中其他控件
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          layer.cancelSelectModels();
          //设置选中当前控件
          this.editor.creatingControl.state = DDeiEnumControlState.SELECTED;
          //根据选中图形的状态更新选择器
          ddInstance.stage.render.selector.updatedBoundsBySelectedModels();

          this.editor.creatingControl = null;
          //切换到设计器
          this.editor.state = DDeiEditorState.DESIGNING;
          //重绘
          ddInstance.stage.render.drawShape();
        }
      }
    },

    /**
     * 拖拽元素离开，清空元素
     */
    createControlCancel(e){
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let ddInstance: DDei = this.editor.ddInstance;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          layer.removeModel(this.editor.creatingControl);
          //重绘
          ddInstance.stage.render.drawShape();
        }
      }
    }
  }
};
</script>

<style scoped>
.ddei_editor_canvasview {
  background: blue;
  height:100%;
}
</style>
