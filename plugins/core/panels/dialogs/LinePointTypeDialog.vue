<template>
  <div :id="dialogId" class="linepoint_type_dialog">
    <div class="content">
      <div class="group">
        <div class="title">选择端点类型</div>
        <div class="group_content">
          <div :class="{ 'item': true, 'item-selected': JSON.stringify(value) == JSON.stringify(data.value) }"
            v-for="data in dataSource" @click="select(data.value)" @dblclick="selectAndConfirm(data.value)">
            {{ data.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";

export default {
  name: "ddei-core-component-dialog-linepointtype",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'linepoint_type_dialog',
      //当前编辑器
      editor: null,
      value: [],
      dataSource: null
    }
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.value) {
      this.value = this.editor?.tempDialogData[this.dialogId].value
    }
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.dataSource) {
      this.dataSource = this.editor?.tempDialogData[this.dialogId].dataSource
    }
  },
  methods: {
    select(value) {
      this.value = value
      if (this.value) {
        if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
          this.editor?.tempDialogData[this.dialogId]?.callback?.ok(this.value);
        }
      }
    },
    selectAndConfirm(value) {
      this.value = value
      if (this.value) {
        if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
          this.editor?.tempDialogData[this.dialogId]?.callback?.ok(this.value);
        }
      }
      this.ok()
    },

    ok() {

      DDeiEditorUtil.closeDialog(this.dialogId);
    },
  }
};
</script>

<style lang="less" scoped>
/**以下是选择颜色的弹出框 */
.linepoint_type_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 240px;
  position: absolute;
  background-color: white;
  height: 250px;
  z-index: 999;
  user-select: none;

  .content {
    width: 100%;
    max-height: 250px;
    overflow-y: auto;

    .group {
      color: black;
      width: 100%;

      .title {
        color: black;
        flex: 0 0 30px;
        width: 100%;
        display: flex;
        justify-content: start;
        align-items: center;
        padding-left: 10px;
        font-size: 15px;
        border: none;
        margin-top: 5px;
        margin-bottom: 5px;
      }

      .group_content {
        width: 100%;
        padding: 0px 15px;
        display: grid;
        gap: 5px;
        grid-template-columns: 1fr 1fr;
      }

      .item {
        height: 30px;

        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 0.5px solid #DBDBDB;

        .div_input {
          width: calc(100% - 10px);
          height: 3px;
        }
      }

      .item:hover {
        outline: 1px solid #1F72FF;
      }

      .item-selected {
        outline: 1px solid #1F72FF;
      }
    }
  }

  .tail {
    margin-top: 5px;
    flex: 0 0 55px;
    display: flex;
    align-items: center;
    text-align: center;
    padding: 0 15px;
    justify-content: end;
  }

  .button {
    flex: 0 0 70px;
    height: 32px;
    background: #FFFFFF;
    border: 1px solid #E6E6E6;
    border-radius: 6px;
    font-size: 16px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #040404;
    margin-left: 13px;
    display: flex;
    align-items: center;
    justify-content: center;

  }

  .button:hover {
    color: white;
    background: #176EFF;
    cursor: pointer;
  }

  .button-main {
    color: white;
    background: #176EFF;

  }
}
</style>
