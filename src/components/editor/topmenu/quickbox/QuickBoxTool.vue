<template>
  <div class="ddei_editor_quick_tool">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div :class="{ 'button-v-selected': editor?.editMode == 1, 'button-v': editor?.editMode != 1 }" title="选择"
          @click="changeEditMode(1)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan432"></use>
          </svg>
          <div class="text">选择</div>
        </div>
      </div>
      <div class="part">
        <div :class="{ 'button-v-selected': editor?.editMode == 2, 'button-v': editor?.editMode != 2 }" title="平移画布"
          @click="changeEditMode(2)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan431"></use>
          </svg>
          <div class="text">平移画布</div>
        </div>
      </div>
      <div class="part">
        <div :class="{ 'button-v-selected': editor?.editMode == 4, 'button-v': editor?.editMode != 4 }" title="连接线"
          @click="changeEditMode(4)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan430"></use>
          </svg>
          <div class="text">连接线</div>
        </div>
      </div>
    </div>
    <div class="tail">
      工具
    </div>

  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiEditorState from "../../js/enums/editor-state";
export default {
  name: "DDei-Editor-Quick-Tool",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
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
     * 修改当前编辑器的编辑模式
     */
    changeEditMode(mode) {
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ChangeEditMode, {
        mode: mode,
      });
      this.editor.bus.executeAll();
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_quick_tool {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;
  text-align: center;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #E2E2EB;
    padding: 0px 4px;

    .part {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0px 2px;

      .button-v {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 50px;
        border-radius: 4px;
        align-items: center;
      }

      .button-v:hover {
        cursor: pointer;
        background-color: #e6e6e6;
      }

      .button-v-selected {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 50px;
        background-color: #e6e6e6;
        border-radius: 4px;
        align-items: center;
      }

      .button-v-disabled {

        flex: 1;
        display: flex;
        flex-direction: column;
        height: 50px;
        cursor: not-allowed;
        align-items: center;

        >span {
          color: #bcbcbc;
        }

        .text {
          color: #bcbcbc;
        }
      }

      .text {
        flex: 0 0 13px;
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
