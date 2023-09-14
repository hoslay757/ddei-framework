<template>
  <div id="ddei_editor_topmenu" class="ddei_editor_topmenu" @mousedown="changeEditorFocus">
    <div id="ddei_editor_topmenu_quickbox" class="ddei_editor_topmenu_quickbox">
      <div class="ddei_editor_topmenu_quickbox_group" v-show="editor?.maxWidth >= 130">
        <QuickBoxOperate v-if="reFresh"></QuickBoxOperate>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group" v-show="editor?.maxWidth >= 500">
        <QuickBoxFontAndText v-if="reFresh"></QuickBoxFontAndText>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group" v-show="editor?.maxWidth >= 700">
        <QuickBoxTool v-if="reFresh"></QuickBoxTool>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group" v-show="editor?.maxWidth >= 1000">
        <QuickBoxStyle v-if="reFresh"></QuickBoxStyle>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group" v-show="editor?.maxWidth >= 1300">
        <QuickBoxSort v-if="reFresh"></QuickBoxSort>
      </div>
      <div class="ddei_editor_topmenu_quickbox_group"  v-show="editor?.maxWidth >= 1400">
          <QuickBoxChangeShape v-if="reFresh"></QuickBoxChangeShape>
        </div>
      <div class="ddei_editor_topmenu_quickbox_group">
        <QuickBoxSDP v-if="reFresh"></QuickBoxSDP>
      </div>
    </div>

  </div>
</template>
<script lang="ts">
import QuickBoxOperate from './quickbox/QuickBoxOperate.vue';
import QuickBoxFontAndText from './quickbox/QuickBoxFontAndText.vue';
import QuickBoxTool from './quickbox/QuickBoxTool.vue';
import QuickBoxStyle from './quickbox/QuickBoxStyle.vue';
import QuickBoxSort from './quickbox/QuickBoxSort.vue';
import QuickBoxChangeShape from './quickbox/QuickBoxChangeShape.vue';
import QuickBoxSDP from './quickbox/QuickBoxSDP.vue';
import DDeiEditor from '../js/editor';
import DDeiEditorState from '../js/enums/editor-state';

export default {
  name: "DDei-Editor-TopMenu",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      reFresh: true
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
    QuickBoxSDP
  },
  computed: {},
  watch: {

  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.currentControlDefine', this.forceRefresh);

    // 监听obj对象中prop属性的变化
    this.$watch('editor.refresh', this.forceRefresh);
  },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    forceRefresh(newVal, oldVal) {
      console.log("refresh")
      this.reFresh = false
      this.$nextTick(() => {
        this.reFresh = true
      })
    },
    /**
    * 焦点进入当前区域
    */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.TOP_MENU_OPERATING);
    },
  }
};
</script>

<style scoped>
.ddei_editor_topmenu {
  background: rgb(225, 225, 225);
}

.ddei_editor_topmenu_quickbox {
  background-color: #F2F2F7;
  width: 100%;
  height: 100px;
  display: flex;
}

.ddei_editor_topmenu_quickbox_group {
  flex: 0;
  margin: auto 0;
  margin-left: 5px;
}
</style>
