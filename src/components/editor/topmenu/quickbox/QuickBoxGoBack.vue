<template>
  <div class="ddei_editor_go_back">
    <div class="header"></div>
    <div class="content">
      <div class="goback">
        <div class="out">
          <svg class="icon" aria-hidden="true" @click="goBackFileList">
            <use xlink:href="#icon-a-ziyuan476"></use>
          </svg>
        </div>
      </div>
      <div class="logo">
        <img :src="icons['logo']">
      </div>
    </div>
    <div class="tail">
    </div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import ICONS from "../../js/icon";
import DDeiEditorUtil from "../../js/util/editor-util";

export default {
  name: "DDei-Editor-Go-Back",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      icons: ICONS,
      file: {},
      fileNameEditing: false,
      fileDescEditing: false,
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.file = this.editor?.files[this.editor?.currentFileIndex];
  },
  methods: {
    goBackFileList() {
      //调用SPI进行保存
      let goBackFileList = DDeiEditorUtil.getConfigValue(
        "EVENT_GOBACK_FILE_LIST",
        this.editor
      );
      if (goBackFileList) {
        goBackFileList();
      }
    },

  },
};
</script>

<style lang="less" scoped>
.ddei_editor_go_back {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #E2E2EB;

    .goback {
      flex: 0 1 36px;
      display: flex;
      justify-content: center;
      align-items: center;

      .out {
        flex: 0 0 25px;
        height: 36px;
        background: #E9E7F0;
        border-radius: 2px;
        display: flex;
        justify-content: center;
        align-items: center;

        >svg:hover {
          filter: brightness(40%);
          cursor: pointer;
        }
      }


    }

    .logo {
      flex: 0 1 75px;
      display: flex;
      justify-content: center;
      align-items: center;

      >img {
        width: 65px;
        height: 65px;
      }
    }
  }

  .tail {
    border-right: 1px solid #E2E2EB;

  }
}
</style>
