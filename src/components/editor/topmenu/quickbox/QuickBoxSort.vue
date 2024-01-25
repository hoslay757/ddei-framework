<template>
  <div class="ddei_editor_quick_sort">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_position_dialog', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showPositionDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan1"></use>
          </svg>
          <div class="text">位置</div>
          <span class="iconfont icon-zhankai-01"></span>
        </div>
      </div>
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(2), 'button-v-selected': isButtonEnable(2) && dialogShow == 'ddei_editor_quick_sort_align_dialog', 'button-v': isButtonEnable(2) }"
          @click="isButtonEnable(2) && showAlignDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan7"></use>
          </svg>
          <div class="text">对齐</div>
          <span class="iconfont icon-zhankai-01"></span>
        </div>
      </div>
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_merge_dialog', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showMergeDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan28"></use>
          </svg>
          <div class="text">组合</div>
          <span class="iconfont icon-zhankai-01"></span>
        </div>
      </div>

      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_rotate_dialog', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showRotateDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan101"></use>
          </svg>
          <div class="text">翻转</div>
          <span class="iconfont icon-zhankai-01"></span>
        </div>
      </div>
    </div>
    <div class="tail">排列</div>
  </div>
</template>
<script lang="ts">
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiUtil from "../../../framework/js/util";
import DDeiEditor from "../../js/editor";
import DDeiEditorUtil from "../../js/util/editor-util";
export default {
  name: "DDei-Editor-Quick-Sort",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      dialogShow: "",
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {
    /**
     * 显示弹出框
     */
    showPositionDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("position_dialog", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)

    },
    showAlignDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("align_dialog", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)
    },
    showMergeDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("mergecompose_dialog", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)
    },
    showRotateDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("rotate_dialog", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)
    },

    /**
     * 对齐按钮是否显示
     */
    isButtonEnable(num: number = 1) {
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size >= num) {
        return true;
      }
      return false;
    },

  },
};
</script>

<style lang="less" scoped>
.ddei_editor_quick_sort {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;
  text-align: center;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 4px;
    border-right: 1px solid #E2E2EB;

    .part {
      flex: 1;
      padding: 0px 2px;
      display: flex;
      justify-content: center;
      align-items: center;

      .button-v {
        flex: 1;
        height: 50px;
        border-radius: 4px;
        margin-top: 10px;


      }

      .button-v:hover {
        cursor: pointer;
        background-color: #e6e6e6;
      }

      .button-v-selected {
        flex: 1;
        height: 50px;
        background-color: #e6e6e6;
        border-radius: 4px;
        margin-top: 10px;

      }

      .button-v-disabled {
        flex: 1;
        height: 50px;
        margin-top: 10px;
        cursor: not-allowed;

        >span {
          color: #bcbcbc;
        }

        .icon {
          filter: grayscale(1);
          opacity: 40%;
        }

        .text {
          color: #bcbcbc;
        }
      }

      .icon {
        height: 20px;
      }

      .iconfont {
        display: block;
        margin-top: -10px;
      }

      .text {
        height: 20px;
        font-size: 14px;
        white-space: nowrap;
        font-family: "Microsoft YaHei";
        font-weight: 400;
        color: #000000;
      }
    }
  }

  .tail {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
    border-right: 1px solid #E2E2EB;
  }
}
</style>
