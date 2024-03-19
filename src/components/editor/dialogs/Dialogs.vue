<template>
  <div id="dialog_background_div" class="dialog_background_div"></div>
  <CloseFileConfirmDialog v-if="refresh_close_file_confirm_dialog"></CloseFileConfirmDialog>
  <QCViewDialog v-if="refresh_qcview_dialog"></QCViewDialog>
  <ChangeRatioDialog v-if="refresh_changeratio_dialog"></ChangeRatioDialog>
  <ManageLayersDialog v-if="refresh_managelayers_dialog"></ManageLayersDialog>
  <SelectFontDialog v-if="refresh_selectfont_dialog"></SelectFontDialog>
  <SelectFontSizeDialog v-if="refresh_selectfontsize_dialog"></SelectFontSizeDialog>
  <PositionDialog v-if="refresh_position_dialog"></PositionDialog>
  <AlignDialog v-if="refresh_align_dialog"></AlignDialog>
  <MergeComposeDialog v-if="refresh_mergecompose_dialog"></MergeComposeDialog>
  <RotateDialog v-if="refresh_rotate_dialog"></RotateDialog>
  <SelectColorDialog v-if="refresh_selectcolor_dialog"></SelectColorDialog>
  <ChooseControlGroupDialog v-if="refresh_choose_control_group_dialog"></ChooseControlGroupDialog>
  <ReLoginDialog v-if="refresh_relogin_dialog"></ReLoginDialog>
  <PublishFileConfirmDialog v-if="refresh_publish_file_confirm_dialog"></PublishFileConfirmDialog>
  <SelectBorderDashDialog v-if="refresh_select_border_dash_dialog"></SelectBorderDashDialog>
  <CreateShareDialog v-if="refresh_create_share_dialog"></CreateShareDialog>
  <UserRegistryDialog v-if="refresh_user_registry_dialog"></UserRegistryDialog>
  <CollFileConfirmDialog v-if="refresh_coll_file_confirm_dialog"></CollFileConfirmDialog>
  <ExportOptionDialog v-if="refresh_export_option_dialog"></ExportOptionDialog>
  <CanvasQuickDialog v-if="refresh_canvas_quick_dialog"></CanvasQuickDialog>
  <TextAlignDialog v-if="refresh_text_align_dialog"></TextAlignDialog>
  <QuickSetStyleDialog v-if="refresh_quick_setstyle_dialog"></QuickSetStyleDialog>

  

</template>

<script lang="ts">
import CloseFileConfirmDialog from "./CloseFileConfirmDialog.vue";
import ChangeRatioDialog from "./ChangeRatioDialog.vue"
import ManageLayersDialog from "./ManageLayersDialog.vue"
import SelectFontDialog from "./SelectFontDialog.vue"
import SelectFontSizeDialog from "./SelectFontSizeDialog.vue"
import PositionDialog from "./PositionDialog.vue"
import AlignDialog from "./AlignDialog.vue"
import MergeComposeDialog from "./MergeComposeDialog.vue"
import RotateDialog from "./RotateDialog.vue"
import QCViewDialog from "./QCViewDialog.vue";
import SelectColorDialog from "./SelectColorDialog.vue";
import ChooseControlGroupDialog from "./ChooseControlGroupDialog.vue";
import ReLoginDialog from "./ReLoginDialog.vue";
import PublishFileConfirmDialog from "./PublishFileConfirmDialog.vue";
import SelectBorderDashDialog from "./SelectBorderDashDialog.vue";
import CreateShareDialog from "./CreateShareDialog.vue";
import ExportOptionDialog from "./ExportOptionDialog.vue";
import UserRegistryDialog from "./UserRegistryDialog.vue";
import CollFileConfirmDialog from "./CollFileConfirmDialog.vue";
import CanvasQuickDialog from "./CanvasQuickDialog.vue";
import TextAlignDialog from "./TextAlignDialog.vue";
import QuickSetStyleDialog from "./QuickSetStyleDialog.vue";
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
      refresh_selectfont_dialog: true,
      refresh_selectfontsize_dialog: true,
      refresh_position_dialog: true,
      refresh_align_dialog: true,
      refresh_mergecompose_dialog: true,
      refresh_selectcolor_dialog: true,
      refresh_rotate_dialog: true,
      refresh_choose_control_group_dialog: true,
      refresh_relogin_dialog: true,
      refresh_publish_file_confirm_dialog: true,
      refresh_select_border_dash_dialog: true,
      refresh_create_share_dialog: true,
      refresh_user_registry_dialog: true,
      refresh_coll_file_confirm_dialog: true,
      refresh_export_option_dialog: true,
      refresh_canvas_quick_dialog: true,
      refresh_text_align_dialog:true,
      refresh_quick_setstyle_dialog:false,
    };
  },
  computed: {},
  components: {
    CloseFileConfirmDialog,
    QCViewDialog,
    ChangeRatioDialog,
    ManageLayersDialog,
    SelectFontDialog,
    SelectFontSizeDialog,
    PositionDialog,
    AlignDialog,
    MergeComposeDialog,
    RotateDialog,
    SelectColorDialog,
    ChooseControlGroupDialog,
    ReLoginDialog,
    PublishFileConfirmDialog,
    SelectBorderDashDialog,
    CreateShareDialog,
    UserRegistryDialog,
    CollFileConfirmDialog,
    ExportOptionDialog,
    CanvasQuickDialog,
    TextAlignDialog,
    QuickSetStyleDialog
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


