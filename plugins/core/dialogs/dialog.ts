import DDeiEditor from "@ddei-core/editor/js/editor";
const DialogBase = {
  data: function () {
    return {
      editor:null,
      forceRefresh: false,
    }
  },
  methods: {
    forceRefreshView: function () {
      this.forceRefresh = false
      this.$nextTick(() => {
        this.forceRefresh = true;
      });
    }
  },
  mounted () {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.dialogs[this.dialogId].viewer = this
  }
};

export default DialogBase