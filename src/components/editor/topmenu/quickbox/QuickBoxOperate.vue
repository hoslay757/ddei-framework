<template>
  <div class="ddei_editor_quick_operate">
    <div class="ddei_editor_quick_operate_item"
         title="剪切"
         @click="editor?.ddInstance?.stage?.selectedModels?.size > 0 && execShearAction($event)">
      <div :class="{'ddei_editor_quick_operate_item_box_selected':editor?.ddInstance?.stage?.copyMode == 'cut','ddei_editor_quick_operate_item_box':editor?.ddInstance?.stage?.selectedModels?.size > 0 ,'ddei_editor_quick_operate_item_box_disabled':editor?.ddInstance?.stage?.selectedModels?.size == 0 || !editor?.ddInstance?.stage?.selectedModels}">
        <img :src="iconShear" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item"
         title="格式刷"
         @click="editor?.ddInstance?.stage?.selectedModels?.size == 1 && execBrushAction($event)">
      <div :class="{'ddei_editor_quick_operate_item_box_selected':editor?.ddInstance?.stage?.brushData,'ddei_editor_quick_operate_item_box':displayBrush ,'ddei_editor_quick_operate_item_box_disabled':!displayBrush}">
        <img :src="iconBrush" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item"
         title="复制"
         @click="editor?.ddInstance?.stage?.selectedModels?.size > 0 && execCopyAction($event)">
      <div :class="{'ddei_editor_quick_operate_item_box_selected':editor?.ddInstance?.stage?.copyMode == 'copy','ddei_editor_quick_operate_item_box':editor?.ddInstance?.stage?.selectedModels?.size > 0 ,'ddei_editor_quick_operate_item_box_disabled':editor?.ddInstance?.stage?.selectedModels?.size == 0 || !editor?.ddInstance?.stage?.selectedModels}">
        <img :src="iconCopy" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item"
         title="粘贴">
      <div :class="{'ddei_editor_quick_operate_item_box':hasClipData ,'ddei_editor_quick_operate_item_box_disabled':!hasClipData}">
        <img :src="iconPaste" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item"
         style="grid-column:1/3;">
      <div class="ddei_editor_quick_operate_item_text">
        剪切板
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import DDeiEnumKeyActionInst from "../../js/enums/key-action-inst";
import ICONS from "../../js/icon";

export default {
  name: "DDei-Editor-Quick-Operate",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      iconShear: ICONS["icon-shear"],
      iconBrush: ICONS["icon-brush"],
      iconCopy: ICONS["icon-copy"],
      iconPaste: ICONS["icon-paste"],
      hasClipData: false,
      displayBrush: false,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.hasClipboard();
    this.isDisplayBrush();
  },
  methods: {
    /**
     * 执行剪切
     */
    execShearAction(evt: Event) {
      DDeiEnumKeyActionInst.CUT.action(evt, this.editor.ddInstance);
    },

    /**
     * 执行复制
     */
    execCopyAction(evt: Event) {
      DDeiEnumKeyActionInst.Copy.action(evt, this.editor.ddInstance);
    },

    /**
     * 执行格式刷
     */
    execBrushAction(evt: Event) {
      DDeiEnumKeyActionInst.BrushData.action(evt, this.editor.ddInstance);
    },

    /**
     * 判定是否显示格式刷
     */
    isDisplayBrush() {
      this.displayBrush = false;
      if (this.editor?.ddInstance?.stage?.selectedModels?.size == 1) {
        let model = Array.from(
          this.editor?.ddInstance?.stage?.selectedModels?.values()
        )[0];
        if (model.baseModelType == "DDeiTable") {
          let selectedCells = model.getSelectedCells();
          if (selectedCells?.length > 0) {
            this.displayBrush = true;
          }
        } else {
          this.displayBrush = true;
        }
      }
    },
    /**
     * 检查剪切板中是否有内容
     */
    hasClipboard() {
      this.hasClipData = false;
      if (this.editor?.ddInstance?.stage?.copyMode) {
        this.hasClipData = true;
      } else {
        let cbData = navigator.clipboard;
        cbData.read().then((items) => {
          if (items?.length > 0) {
            this.hasClipData = true;
          }
        });
      }
    },
  },
};
</script>

<style scoped>
.ddei_editor_quick_operate {
  width: 70px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_quick_operate_item {
  margin: auto;
}

.ddei_editor_quick_operate_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
}

.ddei_editor_quick_operate_item_box {
  width: 25px;
  height: 25px;
  text-align: center;
}

.ddei_editor_quick_operate_item_box img {
  margin-top: 4px;
  width: 16px;
  height: 16px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_operate_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_operate_item_box_selected img {
  margin-top: 4px;
  width: 16px;
  height: 16px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_operate_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}

.ddei_editor_quick_operate_item_box_disabled {
  width: 25px;
  height: 25px;
  text-align: center;
  cursor: not-allowed;
  border-radius: 4px;
}

.ddei_editor_quick_operate_item_box_disabled img {
  margin-top: 4px;
  width: 16px;
  height: 16px;
  filter: brightness(100%) drop-shadow(0.2px 0px 0.2px #000);
}
</style>
