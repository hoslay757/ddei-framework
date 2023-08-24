<template>
  <div id="ddei_editor_canvasview" @mousedown="forceEditorView"
        class="ddei_editor_canvasview">
  </div>
</template>

<script lang="ts">
import DDei from '@/components/framework/js/ddei';
import DDeiEditor from '../js/editor';
import DDeiEditorState from '../js/enums/editor-state';


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
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.ddInstance = DDei.newInstance("ddei_editor_view", "ddei_editor_canvasview");
  },
  methods: {
    /**
     * 焦点进入当前区域
     */
    forceEditorView() {
      if (DDeiEditor.ACTIVE_INSTANCE.state != DDeiEditorState.DESIGNING) {
        DDeiEditor.ACTIVE_INSTANCE.state = DDeiEditorState.DESIGNING
      }
    },
  }
};
</script>

<style scoped>
.ddei_editor_canvasview {
  background: blue;
  height:100%;
}
</style>
