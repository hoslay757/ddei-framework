<template>
  <div :id="dialogId" v-if="allowOpenMultLayers" class="managelayers_dialog">
    <div class="content">
      <div class="title">图层</div>
      <div class="group">
        <div class="group_content">
          <div class="item" @click="createNewLayer(0)" v-show="allowAddLayer">
            <span style="grid-column:1/8;">新建图层</span>
            <span class="iconfont icon-a--01"></span>
          </div>
          <div :class="{ 'item': true, 'current': currentStage?.layerIndex === index }"
            v-for="(layer, index) in currentStage?.layers" draggable="true" @dragstart="layerDragStart(index, $event)"
            @dragover="layerDragOver($event)" @drop="layerDragDrop($event)" @dragleave="layerDragCancel($event)">
            <span style="grid-column:1/8;" @dblclick="startChangeLayerName(layer, $event)">{{ layer.name ? layer.name :
              '图层' }}</span>
            <span class="iconfont icon-a-ziyuan207" @click="removeLayer(index)"></span>
            <span style="grid-column:1/4;font-weight:normal">形状:{{ layer.modelNumber }}</span>

            <span class="iconfont icon-a--01" @click="createNewLayer(index)" v-show="allowAddLayer"></span>
            <span
              :class="{ 'iconfont': true, 'icon-a-ziyuan80': layer.display == 0 && !layer.tempDisplay, 'icon-a-ziyuan81': !(layer.display == 0 && !layer.tempDisplay) }"
              @click="displayOrShowLayer(layer)"></span>

            <span :class="{ 'iconfont': true, 'icon-a-ziyuan185': layer.lock, 'icon-a-ziyuan167': !layer.lock }"
              @click="lockOrUnLockLayer(layer)"></span>

            <input type="radio" :class="{ 'not_temp_display': !layer.tempDisplay }" name="rdo_layers" :value="layer.id"
              @mousedown="changeLayer(index, $event)" :checked="currentStage?.layerIndex === index" />

            <span :class="{ 'iconfont': true, 'icon-a-ziyuan179': layer.print, 'icon-a-ziyuan179': !layer.print }"
              @click="printOrNoPrintLayer(layer)"></span>

          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiEditor from "../js/editor";
import DDeiSheet from "../js/sheet";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";
import DDeiUtil from "../../framework/js/util";
import DDeiEditorState from "../js/enums/editor-state";
import DDeiAbstractShape from "../../framework/js/models/shape";
import DDeiModelArrtibuteValue from "../../framework/js/models/attribute/attribute-value";
import DDeiEnumOperateType from "../../framework/js/enums/operate-type";
import DDeiEditorUtil from "../js/util/editor-util";
export default {
  name: "DDei-Editor-Dialog-ManageLayers",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'managelayers_dialog',
      //当前编辑器
      editor: null,
      allowAddLayer: true,
      allowOpenMultLayers: true,
      currentStage: null,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //获取权限
    this.allowOpenMultLayers = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_OPEN_MULT_LAYERS",
      this.editor
    );
    this.allowAddLayer = DDeiUtil.isAccess(
      DDeiEnumOperateType.CREATE,
      { modelType: "DDeiLayer" },
      DDeiUtil.getConfigValue("MODE_NAME", this.editor.ddInstance),
      this.editor.ddInstance
    );
    let file = this.editor?.files[this.editor?.currentFileIndex];
    let sheet = file?.sheets[file?.currentSheetIndex];
    this.currentStage = sheet?.stage;
  },
  methods: {
    /**
     * layer开始拖拽移动
     */
    layerDragStart(layerEle, evt) {
      this.dragLayerEle = evt.target;
    },

    /**
     * 拖拽layer移动
     */
    layerDragOver(e) {
      if (this.dragLayerEle) {
        let parentDiv = this.dragLayerEle.parentElement;
        let sourceIndex = -1;
        let targetIndex = -1;
        let children = parentDiv.children;

        for (let i = 1; i < children.length; i++) {
          children[i].style.borderTop = "";
          children[i].style.borderBottom = "";
          if (children[i] == this.dragLayerEle) {
            sourceIndex = i;
          } else if (e.target.parentElement == children[i]) {
            targetIndex = i;
          }
        }

        if (sourceIndex != -1 && targetIndex != -1) {
          this.sourceLayerIndex = sourceIndex - 1;
          if (targetIndex == children.length - 1) {
            let pos = DDeiUtil.getDomAbsPosition(children[targetIndex]);
            let halfPos = pos.top + children[targetIndex].offsetHeight / 2;
            if (
              halfPos <= e.clientY &&
              e.clientY <= pos.top + children[targetIndex].offsetHeight
            ) {
              this.changeLayerIndex = targetIndex;
              children[targetIndex].style.borderBottom = "2px solid #017fff";
            } else {
              this.changeLayerIndex = targetIndex - 1;
              children[targetIndex].style.borderTop = "2px solid #017fff";
            }
          } else {
            this.changeLayerIndex = targetIndex - 1;
            children[targetIndex].style.borderTop = "2px solid #017fff";
          }
        }

        e.preventDefault();
      }
    },

    /**
     * 拖拽layer放开
     */
    layerDragDrop(e) {
      if (
        (this.sourceLayerIndex || this.sourceLayerIndex == 0) &&
        (this.changeLayerIndex || this.changeLayerIndex == 0)
      ) {
        //修改layer顺序
        let layers = this.currentStage.layers;
        let sourceLayer = this.currentStage.layers[this.sourceLayerIndex];
        let currentLayer =
          this.currentStage.layers[this.currentStage.layerIndex];
        layers[this.sourceLayerIndex] = null;
        layers.splice(this.changeLayerIndex, 0, sourceLayer);
        for (let j = layers.length; j >= 0; j--) {
          if (layers[j] == null) {
            layers.splice(j, 1);
          }
        }
        for (let j = layers.length; j >= 0; j--) {
          if (currentLayer == layers[j]) {
            this.currentStage.layerIndex = j;
          }
        }
        this.editor.editorViewer?.changeFileModifyDirty();
        this.editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
      //还原样式
      let children = this.dragLayerEle.parentElement.children;
      for (let i = 1; i < children.length; i++) {
        children[i].style.borderTop = "";
        children[i].style.borderBottom = "";
      }
      //刷新当前画布
      this.dragLayerEle = null;
      this.sourceLayerIndex = null;
      this.changeLayerIndex = null;
    },

    /**
     * 拖拽layer离开
     */
    layerDragCancel(e) {
      if (this.dragLayerEle) {
        //还原样式
        let children = this.dragLayerEle.parentElement.children;
        for (let i = 1; i < children.length; i++) {
          children[i].style.borderTop = "";
          children[i].style.borderBottom = "";
        }
        this.sourceLayerIndex = null;
        this.changeLayerIndex = null;
      }
    },

    //创建新图层
    createNewLayer(index: number) {
      if (this.allowAddLayer) {
        let newLayer = this.currentStage.addLayer(null, index);
        newLayer.initRender();
        this.editor.bus.push(
          DDeiEnumBusCommandType.CancelCurLevelSelectedModels
        );
        this.editor.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
        this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
        this.editor.editorViewer?.changeFileModifyDirty();
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },

    //移除图层
    removeLayer(index: number) {
      this.currentStage.removeLayer(index);
      this.editor.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels);
      this.editor.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
      this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
      this.editor.editorViewer?.changeFileModifyDirty();
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },

    //设置图层显示或隐藏
    displayOrShowLayer(layer) {
      if (layer.display == 0) {
        layer.display = 1;
      } else {
        layer.display = 0;
      }
      this.editor.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels);
      this.editor.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
      this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
      this.editor.editorViewer?.changeFileModifyDirty();
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },

    //设置图层锁定和解锁
    lockOrUnLockLayer(layer) {
      layer.lock = !layer.lock;
    },

    //设置图层打印或不打印
    printOrNoPrintLayer(layer) {
      layer.print = !layer.print;
    },

    //切换当前图层
    changeLayer(index, evt) {
      this.currentStage.changeLayer(index);
      this.currentStage.displayLayer(null, true);

      if (evt.target.className == "not_temp_display") {
        this.currentStage.layers[index].tempDisplay = true;
      } else {
        this.currentStage.layers[index].tempDisplay = false;
      }
      this.editor.bus.push(DDeiEnumBusCommandType.CancelCurLevelSelectedModels);
      this.editor.bus.push(DDeiEnumBusCommandType.UpdateSelectorBounds);
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
      this.editor.editorViewer?.changeFileModifyDirty();
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },

    /**
     * 开始修改图层名称
     */
    startChangeLayerName(layer, evt) {
      let ele = evt.target;
      let domPos = DDeiUtil.getDomAbsPosition(ele);
      let input = document.getElementById("change_layer_name_input");
      this.currentChangeLayer = layer;
      if (!input) {
        input = document.createElement("input");
        input.setAttribute("id", "change_layer_name_input");
        input.style.position = "absolute";
        document.body.appendChild(input);
        const that = this;
        input.onblur = function () {
          //设置属性值
          if (input.value) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            if (input.value != that.currentChangeLayer.name) {
              that.currentChangeLayer.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
            }
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
          }
        };
        input.onkeydown = function (e) {
          //回车
          if (e.keyCode == 13) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            if (input.value != that.currentChangeLayer.name) {
              that.currentChangeLayer.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
            }
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
          } else if (e.keyCode == 27) {
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
          }
        };
      }
      input.style.width = ele.offsetWidth + "px";
      input.style.height = ele.offsetHeight + "px";
      input.style.left = domPos.left + "px";
      input.style.fontSize = "12px";
      input.style.top = domPos.top + "px";
      input.style.outline = "1px solid #017fff";
      input.style.border = "none";
      input.style.borderRadius = "1px";
      input.value = layer.name;
      input.style.zIndex = 999;
      input.style.display = "block";
      input.selectionStart = 0; // 选中开始位置
      input.selectionEnd = input.value.length; // 获取输入框里的长度。
      input.focus();
      //修改编辑器状态为快捷编辑中
      this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
    },
  }
};
</script>

<style lang="less" scoped>
/**以下是编辑图层的弹出框 */
.managelayers_dialog {
  width: 240px;
  position: absolute;
  background-color: white;
  height: 320px;
  z-index: 999;
  display: none;
  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;


  .content {
    width: 240px;
    height: 320px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
      color: black;
      font-weight: bold;
      flex: 0 0 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      border-bottom: 1px solid rgb(240, 240, 240);
    }

    .group {
      color: black;
      flex: 1 1 40px;

      .group_content {

        width: 100%;
        height: 280px;
        display: flex;
        flex-direction: column;

        overflow-y: auto;

        .item {
          width: 100%;
          flex: 0 0 30px;
          display: grid;
          gap: 2px;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
          padding: 3px 10px;

          >span {
            font-size: 14px;
            font-weight: bold;
          }

          >input {
            width: 16px;
            height: 16px;
            margin-top: 3px
          }
        }

        .current {
          background-color: rgb(220, 220, 220);
        }

        .item_selected {
          font-weight: bold;
        }

        .item:hover {
          background-color: rgb(233, 233, 238);
          cursor: pointer;
        }
      }
    }
  }
}
</style>
