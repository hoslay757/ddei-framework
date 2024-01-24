<template>
  <div id="mergecompose_dialog" class="mergecompose_dialog">
    <div class="content">
      <div class="title">组合</div>
      <div class="group">
        <div class="group_content">
          <div :class="{ 'item_disabled': !canMerge(), 'item': canMerge() }" @click="canMerge() && doMerge()">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan27"></use>
            </svg>
            <div class="text">组合</div>
          </div>
          <div :class="{ 'item_disabled': !canCancelMerge(), 'item': canCancelMerge() }"
            @click="canCancelMerge() && doCancelMerge()">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan32"></use>
            </svg>
            <div class="text">取消组合</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor";
import DDeiEditorUtil from "../js/util/editor-util";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";

export default {
  name: "DDei-Editor-Dialog-ChangePosition",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'mergecompose_dialog',
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


    //是否可以取消组合
    canCancelMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        return true;
      }
      return false;
    },
    //是否可以组合
    canMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 1) {
        return true;
      }
      return false;
    },

    /**
   * 执行组合
   */
    doMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 1) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelMerge);
        this.editor.bus.executeAll();
      }
    },

    /**
     * 执行取消组合
     */
    doCancelMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelCancelMerge);
        this.editor.bus.executeAll();

      }
    },
  }
};
</script>

<style lang="less" scoped>
.mergecompose_dialog {
  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 140px;
  position: absolute;
  background-color: white;
  height: 110px;
  z-index: 999;

  .content {
    width: 100%;
    max-height: 110px;
    overflow-y: auto;
    user-select: none;

    .title {
      color: black;
      font-weight: bold;
      flex: 0 0 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 17px;
      border-bottom: 1px solid rgb(240, 240, 240);
    }

    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;

      .group_content {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .item {
          outline: none;
          font-size: 16px;
          background: transparent;
          border-radius: 4px;
          width: 100%;
          flex: 0 0 36px;
          display: flex;
          justify-content: start;
          align-items: center;
          padding: 0px 10px;
          cursor: pointer;
        }

        .item_disabled {
          outline: none;
          font-size: 16px;
          background: transparent;
          border-radius: 4px;
          width: 100%;
          flex: 0 0 36px;
          display: flex;
          justify-content: start;
          align-items: center;
          padding: 0px 10px;
          color: rgb(210, 210, 210);
          text-decoration: line-through;
        }

        .item_disabled:hover {
          cursor: not-allowed !important;
        }

        .item:hover {
          background-color: rgb(233, 233, 238);
        }

        .text {
          flex: 1;
          text-align: left;
          padding-left: 15px;
          white-space: nowrap;
          width: 100%;
        }

        .icon {
          font-size: 16px;
        }

      }
    }
  }

}
</style>
