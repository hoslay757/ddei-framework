<template>
  <div :id="dialogId" class="coll_file_confirm_dialog" @keydown.esc="cancel">
    <div class="content">
      <div class="header">
        <svg class="icon warn" aria-hidden="true">
          <use xlink:href="#icon-shoucang"></use>
        </svg>
        <span>收藏文件</span>
        <div style="flex:1"></div>
        <svg class="icon close" aria-hidden="true" @click="cancel">
          <use xlink:href="#icon-a-ziyuan422"></use>
        </svg>
      </div>
      <div class="msg">
      </div>
      <div class="tail">
        <div class="button button-main" @click="ok">确定</div>
        <div class="button" @click="cancel">取消</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEditorUtil from "../js/util/editor-util.ts";

export default {
  name: "DDei-Editor-Confirm-CollFile",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'coll_file_confirm_dialog',
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
  },
  methods: {
    ok() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok();
      }
      DDeiEditorUtil.closeDialog('coll_file_confirm_dialog');
    },
    cancel() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.cancel) {
        this.editor.tempDialogData[this.dialogId].callback.cancel();
      }
      DDeiEditorUtil.closeDialog('coll_file_confirm_dialog');
    },
  }
};
</script>

<style lang="less" scoped>
/**以下为询问框的样式 */
.coll_file_confirm_dialog {
  width: 420px;
  height: 165px;
  background: #FFFFFF;
  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 12px;
  display: none;
  position: absolute;
  overflow: hidden;
  z-index: 999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .content {
    width: 420px;
    height: 165px;
    display: flex;
    flex-direction: column;
    padding: 0 24px;

    .header {
      flex: 0 0 55px;
      display: flex;
      align-items: center;
      font-size: 18px;
      font-family: "Microsoft YaHei";
      font-weight: 400;
      color: #000000;

      >span {
        margin: 0 2px;
      }


      .close {
        font-size: 22px;
      }

      .warn {
        font-size: 20px !important;
      }
    }

    .msg {
      flex: 0 0 55px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      font-family: "Microsoft YaHei";
      font-weight: 400;
      color: #000000;
    }

    .tail {
      flex: 0 0 55px;
      display: flex;
      align-items: center;
      text-align: center;
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
}
</style>
