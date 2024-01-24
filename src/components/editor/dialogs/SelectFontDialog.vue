<template>
  <div :id="dialogId" class="selectfont_dialog">
    <div class="content">
      <div class="group">
        <div class="group_content">
          <div
            :class="{ 'item': true, 'item_selected': item.value == value, 'item_deleted': item.deleted, 'item_disabled': item.disabled, 'item_underline': item.underline, 'item_bold': item.bold }"
            v-for="item in dataSource" @click="!item.disabled && ok(item.value)" :title="item.desc">
            <div class="text" v-if="item.text" :style="{ 'font-family': item.fontFamily }">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEditorUtil from "../js/util/editor-util.ts";

export default {
  name: "DDei-Editor-Dialog-SelectFont",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'selectfont_dialog',
      //当前编辑器
      editor: null,
      dataSource: null,
      value: null,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId].dataSource) {
      this.dataSource = this.editor?.tempDialogData[this.dialogId].dataSource
    }
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId].value) {
      this.value = this.editor?.tempDialogData[this.dialogId].value
    }

  },
  methods: {
    ok(data) {
      this.value = data
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(data);
      }
    },
  }
};
</script>

<style lang="less" scoped>
/**以下是选择字体的弹出框 */
.selectfont_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 170px;
  position: absolute;
  background-color: white;
  height: 310px;
  z-index: 999;
  user-select: none;

  .content {
    width: 100%;
    max-height: 310px;
    overflow-y: auto;

    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;

      .group_content {
        font-size: 14px;
        width: 100%;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 30px 30px 30px 30px 30px;
        display: grid;

        .item {
          outline: none;
          font-size: 15px;
          margin: auto;
          background: transparent;
          border-radius: 4px;
          width: 80px;
          height: 30px;
          display: flex;
          justify-content: start;
          align-items: center;
          cursor: pointer;

          .text {
            text-align: center;
            white-space: nowrap;
            display: table-cell;
            width: 100%;
            vertical-align: middle;
          }
        }

        .itembox_deleted {
          text-decoration: line-through;
        }

        .itembox_disabled {
          color: rgb(210, 210, 210);
          text-decoration: line-through;
        }

        .itembox_disabled:hover {
          cursor: not-allowed !important;
        }

        .itembox_underline {
          text-decoration: underline;
        }

        .item_selected {
          font-weight: bold;
          background-color: rgb(233, 233, 238);

        }

        .item:hover {
          background-color: rgb(233, 233, 238);
        }


      }
    }
  }
}
</style>
