<template>
  <div :id="dialogId" class="ddei-core-dialog-closefile">
    <div class="content">
      <div class="header">
        <svg class="icon warn" aria-hidden="true">
          <use xlink:href="#icon-a-ziyuan411"></use>
        </svg>
        <span>是否保存文件？</span>
        <div style="flex:1"></div>
        <svg class="icon close" aria-hidden="true" @click="cancel">
          <use xlink:href="#icon-a-ziyuan422"></use>
        </svg>
      </div>
      <div class="msg">

      </div>
      <div class="tail">
        <div class="button button-main" @click="ok">保存</div>
        <div class="button" @click="abort">不保存</div>
        <div class="button" @click="cancel">取消</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";

export default {
  name: "ddei-core-dialog-closefile",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'ddei-core-dialog-closefile',
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
      DDeiEditorUtil.closeDialog('ddei-core-dialog-closefile');
    },
    cancel() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.cancel) {
        this.editor.tempDialogData[this.dialogId].callback.cancel();
      }
      DDeiEditorUtil.closeDialog('ddei-core-dialog-closefile');
    },
    abort() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.abort) {
        this.editor.tempDialogData[this.dialogId].callback.abort();
      }
      DDeiEditorUtil.closeDialog('ddei-core-dialog-closefile');
    },
  }
};
</script>

<style lang="less" scoped>
/**以下为询问框的样式 */
.ddei-core-dialog-closefile {
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
        color: #F05B13;
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
