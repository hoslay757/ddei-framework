<template>
  <div id="ddei_editor_topmenu" class="ddei_editor_topmenu" @mousedown="changeEditorFocus">
    <div id="ddei_editor_topmenu_quickbox" class="ddei_editor_topmenu_quickbox">
      <div class="ddei_editor_topmenu_quickbox_group g1">
        <QuickBoxGoBack></QuickBoxGoBack>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g2" v-show="file?.extData?.owner == 1">
        <QuickBoxFileInfo></QuickBoxFileInfo>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g2_share" v-show="file?.extData?.owner == 0">
        <QuickBoxShare></QuickBoxShare>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g3">
        <QuickBoxOperate></QuickBoxOperate>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g4">
        <QuickBoxFontAndText></QuickBoxFontAndText>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g5">
        <QuickBoxTool></QuickBoxTool>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g6">
        <QuickBoxSort></QuickBoxSort>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group g7" v-show="file?.extData?.owner == 1">
        <QuickBoxEImport></QuickBoxEImport>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group" style="flex:1">
        <QuickBoxRight></QuickBoxRight>
      </div>
    </div>

  </div>
</template>
<script lang="ts">
import QuickBoxOperate from "./quickbox/QuickBoxOperate.vue";
import QuickBoxFontAndText from "./quickbox/QuickBoxFontAndText.vue";
import QuickBoxTool from "./quickbox/QuickBoxTool.vue";
import QuickBoxStyle from "./quickbox/QuickBoxStyle.vue";
import QuickBoxSort from "./quickbox/QuickBoxSort.vue";
import QuickBoxChangeShape from "./quickbox/QuickBoxChangeShape.vue";
import QuickBoxFileInfo from "./quickbox/QuickBoxFileInfo.vue";
import QuickBoxShare from "./quickbox/QuickBoxShare.vue";
import QuickBoxGoBack from "./quickbox/QuickBoxGoBack.vue";
import QuickBoxSDP from "./quickbox/QuickBoxSDP.vue";
import QuickBoxEImport from "./quickbox/QuickBoxEImport.vue";
import QuickBoxRight from "./quickbox/QuickBoxRight.vue";
import Cookies from "js-cookie";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorState from "@ddei-core/editor/js/enums/editor-state";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";

export default {
  name: "panel-topmenu",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      file: null,
      sslink: null,
      user: null,
    };
  },
  //注册组件
  components: {
    QuickBoxOperate,
    QuickBoxFontAndText,
    QuickBoxTool,
    QuickBoxStyle,
    QuickBoxSort,
    QuickBoxChangeShape,
    QuickBoxSDP,
    QuickBoxFileInfo,
    QuickBoxEImport,
    QuickBoxGoBack,
    QuickBoxRight,
    QuickBoxShare
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.topMenuViewer = this;
    let userCookie = Cookies.get("user");
    let file = this.editor?.files[this.editor?.currentFileIndex];
    if (userCookie && file) {
      this.user = JSON.parse(userCookie)
      for (let i = 0; i < this.user?.sslinks?.length; i++) {
        if (this.user.sslinks[i].file_id == file.id) {
          this.sslink = this.user.sslinks[i]
          break;
        }
      }

    }
    this.file = file
  },
  methods: {
    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      if (this.editor.state != DDeiEditorState.TOP_MENU_OPERATING && this.editor.state != DDeiEditorState.QUICK_EDITING) {
        this.editor.changeState(DDeiEditorState.TOP_MENU_OPERATING);
      }
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_topmenu {
  background: rgb(225, 225, 225);

}

.ddei_editor_topmenu_quickbox {
  background-color: #F5F5F5;
  width: 100%;

  height: 103px;
  display: flex;
}

.ddei_editor_topmenu_quickbox_group {
  flex: 0;
  margin: auto 0;
}

.g1 {
  flex: 0 1 120px
}

.g2 {
  flex: 0 1 172px
}

.g2_share {
  flex: 0 1 250px
}

.g3 {
  flex: 0 1 234px
}

.g4 {
  flex: 0 1 418px
}

.g5 {
  flex: 0 1 200px
}

.g6 {
  flex: 0 1 237px
}

.g7 {
  flex: 0 1 260px
}

.ddei_editor_topmenu_quickbox_group_empty {
  flex: 1;
  margin: auto 0;
  margin-left: 5px;
}
</style>
