<template>
  <div class="ddei-core-panel-bottommenu" @mousedown="changeEditorFocus">
    <component v-for="(item, index) in editor?.getPartPanels(options, 'panels') " :is="item.comp"
      :options="item.options" v-bind="item.options"></component>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";
import DDeiEditorState from "@ddei-core/editor//js/enums/editor-state";


export default {
  name: "ddei-core-panel-bottommenu",
  extends: null,
  mixins: [],
  props: {
    //外部传入的插件扩展参数
    options: {
      type: Object,
      default: null
    },
  },
  data() {
    return {
      editor: null,
    };
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {

    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.bottomMenuViewer = this;
  },
  methods: {

    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      if (this.editor.state != DDeiEditorState.BOTTOM_MENU_OPERATING && this.editor.state != DDeiEditorState.QUICK_EDITING) {
        this.editor.changeState(DDeiEditorState.BOTTOM_MENU_OPERATING);
      }
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
    },
  },
};
</script>

<style lang="less" scoped>

.ddei-core-panel-bottommenu {
  height: 50px;
  display: flex;
  color: black;
  justify-content: center;
  align-items: center;
  font-size: 16px;
}
</style>
