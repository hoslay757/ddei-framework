<template>
  <div class="ddei_editor_quick_sort">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_ddei-core-dialog-changeposition', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showPositionDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan429"></use>
          </svg>
          <div class="text">位置</div>
          <svg class="icon extbtn" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan466"></use>
          </svg>
        </div>
      </div>
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(2), 'button-v-selected': isButtonEnable(2) && dialogShow == 'ddei_editor_quick_sort_align_dialog', 'button-v': isButtonEnable(2) }"
          @click="isButtonEnable(2) && showAlignDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan428"></use>
          </svg>
          <div class="text">对齐</div>
          <svg class="icon extbtn" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan466"></use>
          </svg>
        </div>
      </div>
      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_merge_dialog', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showMergeDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan427"></use>
          </svg>
          <div class="text">组合</div>
          <svg class="icon extbtn" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan466"></use>
          </svg>
        </div>
      </div>

      <div class="part">
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_ddei-core-dialog-changerotate', 'button-v': isButtonEnable() }"
          @click="isButtonEnable() && showRotateDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan426"></use>
          </svg>
          <div class="text">翻转</div>
          <svg class="icon extbtn" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan466"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="tail">排列</div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";
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
      DDeiEditorUtil.showOrCloseDialog("ddei-core-dialog-changeposition", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)

    },
    showAlignDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog('ddei-core-dialog-align', {
        group: "top-dialog"
      }, { type: 5 }, srcElement)
    },
    showMergeDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("ddei-core-dialog-changeposition", {
        group: "top-dialog"
      }, { type: 5 }, srcElement)
    },
    showRotateDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("ddei-core-dialog-changerotate", {
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
      }

      .button-v-disabled {
        flex: 1;
        height: 50px;
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

      .text {
        height: 20px;
        font-size: 14px;
        white-space: nowrap;
        font-family: "Microsoft YaHei";
        font-weight: 400;
        color: #000000;
        margin-top: -3px;
      }

      .extbtn {
        font-size: 12px;
        vertical-align: top;
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
