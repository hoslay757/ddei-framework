<template>
  <div id="text_align_dialog" class="text_align_dialog">
    <div class="content">
      <div class="title">文本对齐</div>
      <div class="group">
        <div class="group_content">
          <div :class="{'item':true,'selected':value == 1}" @click="changeAlign(1)" @dblclick="ok(1)">
            左上
          </div>
          <div :class="{'item':true,'selected':value == 2}" @click="changeAlign(2)" @dblclick="ok(2)">
            中上
          </div>
          <div :class="{'item':true,'selected':value == 3}" @click="changeAlign(3)" @dblclick="ok(3)">
            右上
          </div>
          <div :class="{'item':true,'selected':value == 4}" @click="changeAlign(4)" @dblclick="ok(4)">
            左中
          </div>
          <div :class="{'item':true,'selected':value == 5}" @click="changeAlign(5)" @dblclick="ok(5)">
            正中
          </div>
          <div :class="{'item':true,'selected':value == 6}" @click="changeAlign(6)" @dblclick="ok(6)">
            右中
          </div>
           <div :class="{'item':true,'selected':value ==7}" @click="changeAlign(7)" @dblclick="ok(7)">
            左下
          </div>
          <div :class="{'item':true,'selected':value == 8}" @click="changeAlign(8)" @dblclick="ok(8)">
            中下
          </div>
          <div :class="{'item':true,'selected':value == 9}" @click="changeAlign(9)" @dblclick="ok(9)">
            右下
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorUtil from "../js/util/editor-util.js";

export default {
  name: "DDei-Editor-Dialog-TextAlign",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'text_align_dialog',
      //当前编辑器
      editor: null,
      value:5,//当前选中值
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let align = 2;
    let valign = 2;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]) {
      align = this.editor?.tempDialogData[this.dialogId].align
      valign = this.editor?.tempDialogData[this.dialogId].valign
    }
    let value = 5;
    switch (align) {
        case 1:
          switch (valign) {
            case 1:value = 1;break;
            case 2:value = 4;break;
            case 3:value = 7;break;
          }
          break;
        case 2:
          switch (valign) {
            case 1:value = 2;break;
            case 2:value = 5;break;
            case 3:value = 8;break;
          }
          break;
         case 3:
          switch (valign) {
            case 1:value = 3;break;
            case 2:value = 6;break;
            case 3:value = 9;break;
          }
          break;
      }
      this.value = value;
  },
  methods: {
    /**
     * 修改文本对齐方式
     */
    changeAlign(v) {
      this.value = v
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(this.value);
      }
    },

    /**
     * 修改文本对齐方式
     */
    ok(v) {
      this.changeAlign(v)
      DDeiEditorUtil.closeDialog("text_align_dialog")
    },

  }
};
</script>

<style lang="less" scoped>
.text_align_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 240px;
  position: absolute;
  background-color: white;
  height: 180px;
  z-index: 999;

  .content {
    width: 100%;
    max-height: 240px;
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
    }

    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;
      padding:10px;
      border-top: 1px solid rgb(240, 240, 240);

      .group_content {
        width: 96%;
        display: grid;
        gap: 5px;
        grid-template-columns: 1fr 1fr 1fr;


        .item {
          outline: none;
          width: 70px;
          height: 40px;
          margin: auto;
          background: transparent;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border:1px solid grey;
        }

        .selected{
          background-color: rgb(233, 233, 238);
        }

        

        .item:hover {
          background-color: rgb(233, 233, 238);
        }


        .icon {
          font-size: 28px;
        }

      }
    }
  }
}
</style>
