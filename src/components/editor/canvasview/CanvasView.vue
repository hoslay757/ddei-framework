<template>
  <div id="ddei_editor_canvasview" class="ddei_editor_canvasview" @mousedown="changeEditorFocus"
    ondragstart="return false;" @dragover="createControlOver" @drop="createControlDrop" @dragleave="createControlCancel"
    @contextmenu.prevent>
  </div>
</template>

<script lang="ts">
import DDei from '@/components/framework/js/ddei';
import DDeiEditor from '../js/editor';
import DDeiEditorState from '../js/enums/editor-state';
import DDeiConfig from '../../framework/js/config';
import DDeiEnumControlState from '../../framework/js/enums/control-state';
import DDeiAbstractShape from '@/components/framework/js/models/shape';
import DDeiKeyAction from '../js/hotkeys/key-action';
import DDeiEnumOperateState from '@/components/framework/js/enums/operate-state';


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
  watch: {

  },
  created() {
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.ddInstance = DDei.newInstance("ddei_editor_view", "ddei_editor_canvasview");
    this.editor.ddInstance.bus.invoker = this.editor;
    this.editor.bus = this.editor.ddInstance.bus;
  },
  methods: {
    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },

    /**
     * 拖拽元素移动
     */
    createControlOver(e) {

      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        DDeiKeyAction.updateKeyState(e);
        if (this.editor.creatingControl) {
          let ddInstance = this.editor.ddInstance;
          //当前激活的图层
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          if (layer) {
            ddInstance.stage.render.currentOperateContainer = layer
            ddInstance.stage.render.operateState = DDeiEnumOperateState.CONTROL_CREATING
            let control = this.editor.creatingControl;
            //在画布上创建临时对象
            if (!layer.models.has(control.id)) {
              layer.addModel(control);
              //绑定并初始化渲染器
              DDeiConfig.bindRender(control);
              control.render.init();
              //记录当前的拖拽的x,y,写入dragObj作为临时变量
              let dragObj = {
                x: e.offsetX,
                y: e.offsetY,
                originX: e.offsetX,
                originY: e.offsetY,
                model: control
              }
              ddInstance.stage.render.dragObj = dragObj;
              //当前编辑器最外部容器的坐标 TODO 无限画布后需要转换为layer的视窗坐标
              let containerX = e.offsetX;
              let containerY = e.offsetY;
              control.x = containerX - control.width * 0.5;
              control.y = containerY - control.height * 0.5;
              //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
              ddInstance.render.drawShape();
            } else {
              //获取增量
              let movedPosDelta = layer.render.getMovedPositionDelta(e);
              if (movedPosDelta.x != 0 || movedPosDelta.y != 0) {
                control.x += movedPosDelta.x;
                control.y += movedPosDelta.y;
                //更新dragObj临时变量中的数值,确保坐标对应关系一致
                ddInstance.stage.render.dragObj.x += movedPosDelta.x;
                ddInstance.stage.render.dragObj.y += movedPosDelta.y;
                let isAlt = DDeiEditor.KEY_DOWN_STATE.get("alt");
                ddInstance.stage.render.selector.setPassIndex(10);
                let lastOnContainer = layer;
                if (isAlt) {
                  //寻找鼠标落点当前所在的容器
                  let mouseOnContainers = DDeiAbstractShape.findBottomContainersByArea(layer, e.offsetX, e.offsetY);
                  if (mouseOnContainers && mouseOnContainers.length > 0) {
                    lastOnContainer = mouseOnContainers[mouseOnContainers.length - 1];
                  }
                  //如果最小层容器不是当前容器，则修改鼠标样式，代表可能要移入
                  if (lastOnContainer != layer) {
                    ddInstance.stage.render.selector.setPassIndex(11);
                  }
                }



                //显示辅助对齐线、坐标文本等图形
                let selectedModels: Map<string, DDeiAbstractShape> = new Map();
                selectedModels.set(control.id, control);
                layer.render.helpLines = {
                  "bounds": control?.getAbsBounds(),
                  models: selectedModels
                };
                //重新绘制图形
                ddInstance.render.drawShape();
              }
            }
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
          let isAlt = DDeiEditor.KEY_DOWN_STATE.get("alt");
          let ddInstance: DDei = this.editor.ddInstance;
          ddInstance.stage.idIdx++;
          //取消选中其他控件
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          //如果按下了ctrl键，则移入容器
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] = DDeiAbstractShape.findBottomContainersByArea(layer, e.offsetX, e.offsetY);
            let lastOnContainer = layer;
            if (mouseOnContainers && mouseOnContainers.length > 0) {
              lastOnContainer = mouseOnContainers[mouseOnContainers.length - 1];
            }
            //如果最小层容器不是当前容器，执行的移动容器操作
            if (lastOnContainer != layer) {
              let loAbsPos = lastOnContainer.getAbsPosition();
              let loAbsRotate = lastOnContainer.getAbsRotate();
              //转换坐标，获取最外层的坐标
              let item = this.editor.creatingControl;
              let itemAbsPos = item.getAbsPosition();
              let itemAbsRotate = item.getAbsRotate();
              item.x = itemAbsPos.x - loAbsPos.x
              item.y = itemAbsPos.y - loAbsPos.y
              item.rotate = itemAbsRotate - loAbsRotate
              layer.removeModel(item);
              lastOnContainer.addModel(item);
              //绑定并初始化渲染器
              DDeiConfig.bindRender(item);
              item.render.init();
              //更新新容器大小
              lastOnContainer.changeParentsBounds()
            }
          }

          ddInstance.stage.render.selector.setPassIndex(-1);

          layer.cancelSelectModels();
          //设置选中当前控件
          this.editor.creatingControl.state = DDeiEnumControlState.SELECTED;
          //根据选中图形的状态更新选择器
          ddInstance.stage.render.selector.updatedBoundsBySelectedModels();

          this.editor.creatingControl = null;

          ddInstance.stage.render.dragObj = null;

          ddInstance.stage.render.operateState = DDeiEnumOperateState.NONE;
          //切换到设计器
          this.editor.state = DDeiEditorState.DESIGNING;
          //重绘
          ddInstance.render.drawShape();
        }
      }
    },

    /**
     * 拖拽元素离开，清空元素
     */
    createControlCancel(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let ddInstance: DDei = this.editor.ddInstance;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
          layer.removeModel(this.editor.creatingControl);
          ddInstance.stage.render.dragObj = null;
          ddInstance.stage.render.operateState = DDeiEnumOperateState.NONE;
          //重绘
          ddInstance.render.drawShape();
        }
      }
    }
  }
};
</script>

<style scoped>
.ddei_editor_canvasview {
  flex: 1;
}
</style>
