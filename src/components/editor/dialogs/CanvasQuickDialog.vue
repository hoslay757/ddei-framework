
<template>
  <div :id="dialogId" class="canvas_quick_dialog">
    <div class="content">
      12345
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEditorUtil from "../js/util/editor-util.ts";
import DDeiUtil from "../../framework/js/util.ts";

export default {
  name: "DDei-Editor-Canvas-Quick-Pop",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'canvas_quick_dialog',
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    // if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.dataSource) {
    //   this.dataSource = this.editor?.tempDialogData[this.dialogId].dataSource
    // }
    // if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.value) {
    //   this.value = this.editor?.tempDialogData[this.dialogId].value
    // }
  },
  methods: {
    
  }
};
</script>

<style lang="less" scoped>
/**以下是快捷样式编辑的弹出框 */
.canvas_quick_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 600px;
  position: absolute;
  background-color: white;
  height: 80px;
  z-index: 999;
  user-select: none;

  .content {
    width: 100%;
    max-height: 80px;
    overflow-y: auto;

  }
}
</style>
