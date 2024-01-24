<template>
  <div id="dialog_background_div" class="dialog_background_div"></div>
  <CloseFileConfirmDialog v-if="refresh_close_file_confirm_dialog"></CloseFileConfirmDialog>
  <QCViewDialog v-if="refresh_qcview_dialog"></QCViewDialog>
  <ChangeRatioDialog v-if="refresh_changeratio_dialog"></ChangeRatioDialog>
  <ManageLayersDialog v-if="refresh_managelayers_dialog"></ManageLayersDialog>
</template>

<script lang="ts">
import CloseFileConfirmDialog from "./CloseFileConfirmDialog.vue";
import ChangeRatioDialog from "./ChangeRatioDialog.vue"
import ManageLayersDialog from "./ManageLayersDialog.vue"
import QCViewDialog from "./QCViewDialog.vue";
import DDeiEditorUtil from "../js/util/editor-util.ts";

export default {
  name: "DDei-Editor-Dialogs",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      refresh_close_file_confirm_dialog: true,
      refresh_qcview_dialog: true,
      refresh_changeratio_dialog: true,
      refresh_managelayers_dialog: true,
    };
  },
  computed: {},
  components: {
    CloseFileConfirmDialog,
    QCViewDialog,
    ChangeRatioDialog,
    ManageLayersDialog,
  },
  watch: {},
  created() { },
  mounted() {
    DDeiEditorUtil.dialogViewer = this;
  },
  methods: {
    //强行刷新dialog
    forceRefreshDialog(dialogId) {
      this["refresh_" + dialogId] = false;
      this.$nextTick(() => {
        this["refresh_" + dialogId] = true;
      });
    },
  }
};
</script>

<style lang="less" scoped>
.dialog_background_div {
  width: 100%;
  height: 100vh;
  opacity: 50%;
  z-index: 500;
  left: 0;
  top: 0;
  display: none;
  position: absolute;
}
</style>


