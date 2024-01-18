<template>
  <div class="ddei_editor_cut">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div
          :class="{ 'button-v-selected': editor?.ddInstance?.stage?.copyMode == 'cut', 'button-v': editor?.ddInstance?.stage?.selectedModels?.size > 0, 'button-v-disabled': editor?.ddInstance?.stage?.selectedModels?.size == 0 || !editor?.ddInstance?.stage?.selectedModels }"
          title="剪切" @click="editor?.ddInstance?.stage?.selectedModels?.size > 0 && execShearAction($event)">
          <span class="iconfont icon-a-ziyuan57"></span>
          <div class="text">剪切</div>
        </div>
      </div>

      <div class="part">
        <div
          :class="{ 'button-v-selected': editor?.ddInstance?.stage?.copyMode == 'copy', 'button-v': editor?.ddInstance?.stage?.selectedModels?.size > 0, 'button-v-disabled': editor?.ddInstance?.stage?.selectedModels?.size == 0 || !editor?.ddInstance?.stage?.selectedModels }"
          title="复制" @click="editor?.ddInstance?.stage?.selectedModels?.size > 0 && execCopyAction($event)">
          <span class="iconfont icon-a-ziyuan10"></span>
          <div class="text">复制</div>
        </div>
      </div>
      <div class="part">
        <div :class="{ 'button-v': hasClipData, 'button-v-disabled': !hasClipData }" title="粘贴">
          <span class="iconfont icon-a-ziyuan39"></span>
          <div class="text">粘贴</div>
        </div>
      </div>
      <div class="part">
        <div
          :class="{ 'button-v-selected': editor?.ddInstance?.stage?.brushData, 'button-v': displayBrush, 'button-v-disabled': !displayBrush }"
          title="格式刷" @click="editor?.ddInstance?.stage?.selectedModels?.size == 1 && execBrushAction($event)">
          <span class="iconfont icon-a-ziyuan85"></span>
          <div class="text">格式刷</div>
        </div>
      </div>
    </div>
    <div class="tail">
      剪切板
    </div>
  </div>
</template>
<script lang="ts">
import DDeiConfig from "@/components/framework/js/config";
import DDeiUtil from "../../../framework/js/util";
import DDeiEditor from "../../js/editor";
import DDeiEnumKeyActionInst from "../../js/enums/key-action-inst";

export default {
  name: "DDei-Editor-Quick-CUT",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      hasClipData: false,
      displayBrush: false,
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.hasClipboard();
    this.isDisplayBrush();
  },
  methods: {
    /**
     * 执行剪切
     */
    execShearAction(evt: Event) {
      DDeiEnumKeyActionInst.CUT.action(evt, this.editor.ddInstance);
    },

    /**
     * 执行复制
     */
    execCopyAction(evt: Event) {
      DDeiEnumKeyActionInst.Copy.action(evt, this.editor.ddInstance);
    },

    /**
     * 执行格式刷
     */
    execBrushAction(evt: Event) {
      DDeiEnumKeyActionInst.BrushData.action(evt, this.editor.ddInstance);
    },

    /**
     * 判定是否显示格式刷
     */
    isDisplayBrush() {
      this.displayBrush = false;
      if (this.editor?.ddInstance?.stage?.selectedModels?.size == 1) {
        let model = Array.from(
          this.editor?.ddInstance?.stage?.selectedModels?.values()
        )[0];
        if (model.baseModelType == "DDeiTable") {
          let selectedCells = model.getSelectedCells();
          if (selectedCells?.length > 0) {
            this.displayBrush = true;
          }
        } else {
          this.displayBrush = true;
        }
      }
    },
    /**
     * 检查剪切板中是否有内容
     */
    async hasClipboard() {
      this.hasClipData = false;
      if (this.editor?.ddInstance?.stage?.copyMode) {
        this.hasClipData = true;
      } else {
        let hasFocus = document.hasFocus();
        if (hasFocus) {
          // 判断是否Safari浏览器
          if (!DDeiUtil.isSafari()) {
            if (DDeiConfig.ALLOW_CLIPBOARD) {
              let items = await navigator.clipboard.read();
              if (items?.length > 0) {
                this.hasClipData = true;
              }
            }
          }
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_cut {
  width: 234px;
  height: 103px;
  display: grid;
  grid-template-rows: 23px 57px 23px;
  grid-template-columns: 1fr;
  text-align: center;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #E2E2EB;

    .part {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      .button-v {
        flex: 0 0 36px;
        height: 48px;
        border-radius: 4px;
      }

      .button-v:hover {
        cursor: pointer;
        background-color: #e6e6e6;
      }

      .button-v-selected {
        flex: 0 0 36px;
        height: 48px;
        background-color: #e6e6e6;
        border-radius: 4px;
      }

      .button-v-disabled {
        flex: 0 0 36px;
        height: 48px;
        cursor: not-allowed;

        >span {
          color: #bcbcbc;
        }

        .text {
          color: #bcbcbc;
        }
      }

      .text {
        height: 13px;
        font-size: 12px;
        font-family: "Microsoft YaHei";
        font-weight: 400;
        color: #000000;
      }
    }
  }

  .tail {
    font-size: 12px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
    border-right: 1px solid #E2E2EB;
  }
}
</style>
