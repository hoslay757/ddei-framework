<template>
  <div class="layout_standrad">
    <div class="top">
      <component :is="editor?.panels['ddei-core-panel-topmenu']" v-if="refreshTopMenuView"></component>
    </div>
    <div class="body">
      <div class="left" v-show="toolboxShow">
        <component :is="editor?.panels['ddei-core-panel-toolbox']" v-if="refreshToolBox"></component>
      </div>

      <div class="middle">
        <component :is="editor?.panels['ddei-core-panel-openfilesview']"
          v-if="allowOpenMultFiles && refreshOpenFilesView">
        </component>
        <component :is="editor?.panels['ddei-core-panel-canvasview']"></component>
        <component :is="editor?.panels['ddei-core-panel-quickcolorview']" v-if="allowQuickColor"></component>
      </div>
      <div class="right" v-show="propertyViewShow">
        <component :is="editor?.panels['ddei-core-panel-propertyview']" v-if="refreshPropertyView"></component>
      </div>
    </div>
    <div class="bottom">
      <component :is="editor?.panels['ddei-core-panel-bottommenu']" v-if="refreshBottomMenu"></component>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";

export default {
  name: "layout-standard",
  extends: null,
  mixins: [],
  props: {

  },
  data() {
    return {
      editor: null,
      dragObj: null,
      changeIndex: -1,
      refreshBottomMenu: true,
      refreshOpenFilesView: true,
      refreshPropertyView: true,
      refreshToolBox: true,
      refreshMenu: true,
      refreshTopMenuView: true,
      allowOpenMultFiles: true,
      allowQuickColor: true,
      initLeftWidth: 0,
      initRightWidth: 0,
      toolboxShow: true,
      propertyViewShow: true
    };
  },
  //注册组件
  components: {
  },
  computed: {},
  watch: {},
  created() {
    if (DDeiEditor.ACTIVE_INSTANCE) {
      this.editor = DDeiEditor.ACTIVE_INSTANCE;
    } else {
      this.editor = DDeiEditor.newInstance("ddei_editor_ins", "ddei_editor", true, this.options);
    }
  },
  mounted() {
    this.editor.layoutViewer = this;
  },
  methods: {
    forceRefreshBottomMenu() {
      this.refreshBottomMenu = false;
      this.$nextTick(() => {
        this.refreshBottomMenu = true;
      });
    },

    forcePropertyView() {
      this.refreshPropertyView = false;
      this.$nextTick(() => {
        this.refreshPropertyView = true;
      });
    },

    forceToolBox() {
      this.refreshToolBox = false;
      this.$nextTick(() => {
        this.refreshToolBox = true;
      });
    },

    forceRefreshOpenFilesView() {
      this.refreshOpenFilesView = false;
      this.$nextTick(() => {
        this.refreshOpenFilesView = true;
      });
    },

    forceRefreshTopMenuView() {
      this.refreshTopMenuView = false;
      this.$nextTick(() => {
        this.refreshTopMenuView = true;
      });
    },
  }
};
</script>

<style lang="less" scoped>
.layout_standrad {

  width: 100%;
  height: calc(100vh);
  display: flex;
  flex-direction: column;
  background-color: rgb(240, 240, 240);
  min-width: 1700px;

  .top {
    flex: 0 0 103px
  }

  .bottom {
    flex: 0 0 50px;
    background: #F2F2F7;
    border: 1px solid #D4D4D4;
  }

  .body {
    display: flex;
    flex: 1;

    .left {
      flex: 0 1 292px;
      border: 1px solid #D5D5DF;
    }

    .middle {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .right {
      flex: 0 1 292px;
      border: 1px solid #D5D5DF;
    }
  }
}
</style>
<style lang="less">
.layout_standrad {
  >img {
    -webkit-user-drag: none;
    user-drag: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  >div {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
}
</style>
