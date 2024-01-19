<template>
  <div class="ddei_editor_right">
    <div class="header">
      <div style="flex:1 1 100px"></div>
      <span class="iconfont icon-a-ziyuan124" style="flex:0 0 22px;font-size:15px"></span>
      <div style="flex:0 1 12px"></div>
      <div class="userinfo">W</div>
      <div style="flex:0 1 12px"></div>
      <div class="loginout">注销</div>
      <div style="flex:0 1 40px"></div>
    </div>
    <div class="content">
    </div>
    <div class="tail">
    </div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import DDeiEditorUtil from "../../js/util/editor-util";

export default {
  name: "DDei-Editor-Right",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
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
.ddei_editor_right {
  height: 103px;
  display: grid;
  grid-template-rows: 50px 23px 23px;
  grid-template-columns: 1fr;

  .header {
    display: flex;
    justify-content: center;
    align-items: center;

    .userinfo {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 28px;
      height: 28px;
      background: #176EFF;
      border-radius: 50%;
      text-align: center;
      flex: 0 0 28px;
      font-size: 14px;
      font-family: "Microsoft YaHei";
      font-weight: 400;
      color: #FFFFFF;
      cursor: pointer;
    }

    .loginout {
      display: flex;
      white-space: nowrap;
      justify-content: center;
      align-items: center;
      flex: 0 1 28px;
      height: 14px;
      font-size: 14px;
      font-family: Microsoft YaHei;
      font-weight: 400;
      color: #000000;
    }
  }
}
</style>
