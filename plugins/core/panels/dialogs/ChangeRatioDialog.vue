<template>
  <div :id="dialogId" class="changeratio_dialog">
    <div class="content">
      <div class="title">缩放</div>
      <div class="group">
        <div class="group_content">
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 4 }" @click="ok(4)">
            400%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 2 }" @click="ok(2)">
            200%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 1.5 }" @click="ok(1.5)">
            150%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 1.25 }" @click="ok(1.25)">
            125%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 1 }" @click="ok(1)">
            100%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 0.75 }" @click="ok(0.75)">
            75%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 0.5 }" @click="ok(0.5)">
            50%
          </div>
          <div :class="{ 'item': true, 'item_selected': ratioInputValue / 100 == 0.25 }" @click="ok(0.25)">
            25%
          </div>
          <div class="item" style="flex:1;border-top: 1px solid rgb(240, 240, 240);">
            百分比：<input type="number" min="25" max="1000" v-model="ratioInputValue" @blur="ratioInputChange()"
              autocomplete="off" name="ddei_bottom_input" />%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";

export default {
  name: "ddei-core-component-dialog-changeratio",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'changeratio_dialog',
      //当前编辑器
      editor: null,
      ratioInputValue: 100,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]) {
      this.ratioInputValue = this.editor?.tempDialogData[this.dialogId]?.ratio * 100
    }
  },
  methods: {
    ok(data) {
      if (!data) {
        data = 1
      }
      this.ratioInputValue = data * 100
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(data);
      }

    },

    ratioInputChange() {
      if (this.ratioInputValue >= 1000) {
        this.ratioInputValue = 1000;
      }
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(this.ratioInputValue / 100);
      }
    },

  }
};
</script>

<style lang="less" scoped>
/**以下是设置缩放比例的弹出框 */
.changeratio_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 170px;
  position: absolute;
  background-color: white;
  height: 310px;
  z-index: 999;

  .content {
    width: 170px;
    height: 310px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .title {
      color: black;
      font-weight: bold;
      flex: 0 0 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      border-bottom: 1px solid rgb(240, 240, 240);
    }


    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;

      .group_content {
        width: 100%;
        height: 280px;
        display: flex;
        flex-direction: column;

        .item {
          flex: 0 0 30px;
          padding: 0 10px;
          display: flex;
          justify-content: start;
          align-items: center;
          cursor: pointer;

          >input {
            border: none;
            outline: none;
          }
        }

        .item_selected {
          font-weight: bold;
        }

        .item:hover {
          background-color: rgb(233, 233, 238);
        }
      }
    }
  }
}
</style>
