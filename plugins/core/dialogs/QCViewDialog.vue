<template>
  <div :id="dialogId" class="ddei-core-dialog-qcview">
    <div class="items">
      <div class="item" :title="item.text" v-for="item in dataSource" @click="ok(item)">
        <svg class="icon" aria-hidden="true">
          <use :xlink:href="item.img"></use>
        </svg>
        <div>{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";

export default {
  name: "ddei-core-dialog-qcview",
  extends: null,
  mixins: [],
  props: {
    //外部传入的插件扩展参数
    options: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogId: 'ddei-core-dialog-qcview',
      //当前编辑器
      editor: null,
      dataSource: null,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.dataSource) {
      this.dataSource = this.editor?.tempDialogData[this.dialogId]?.dataSource;
    }
  },
  methods: {
    ok(item) {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(item);
      }
      DDeiEditorUtil.closeDialog(this.dialogId);
    },
    cancel() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.cancel) {
        this.editor.tempDialogData[this.dialogId].callback.cancel();
      }
      DDeiEditorUtil.closeDialog(this.dialogId);
    },
  }
};
</script>

<style lang="less" scoped>
.ddei-core-dialog-qcview {
  width: 80px;
  position: absolute;
  background-color: white;
  left: 0px;
  display: none;
  bottom: 16px;
  height: 34px;


  .icon {
    font-size: 18px;
  }

  .items {
    .item {
      height: 24px;
      width: 80px;
      display: flex;
      justify-content: center;
      align-items: center;

      >div {
        color: black;
        font-size: 13px;
        flex: 1
      }
    }

    .item:hover {
      background: rgb(235, 235, 239);
      cursor: pointer;
    }
  }

}
</style>
