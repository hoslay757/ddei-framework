<template>
  <div id="line_type_dialog" class="line_type_dialog">
    <div class="content">
      <div class="title">线段类型</div>
      <div class="group">
        <div class="group_content">
          <div :class="{'item':true,'selected':value == 1}" @click="changeType(1)" @dblclick="ok(1)">
            直线
          </div>
          <div :class="{'item':true,'selected':value == 2}" @click="changeType(2)" @dblclick="ok(2)">
            折线
          </div>
          <div :class="{'item':true,'selected':value == 3}" @click="changeType(3)" @dblclick="ok(3)">
            曲线
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
  name: "DDei-Editor-Dialog-LineType",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'line_type_dialog',
      //当前编辑器
      editor: null,
      value:1,//当前选中值
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let value = 1
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]) {
      value = this.editor?.tempDialogData[this.dialogId].value
    }
    this.value = value;
  },
  methods: {
    /**
     * 修改文本对齐方式
     */
    changeType(v) {
      this.value = v
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
        this.editor?.tempDialogData[this.dialogId]?.callback?.ok(this.value);
      }
    },

    /**
     * 修改文本对齐方式
     */
    ok(v) {
      this.changeType(v)
      DDeiEditorUtil.closeDialog("line_type_dialog")
    },

  }
};
</script>

<style lang="less" scoped>
.line_type_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 240px;
  position: absolute;
  background-color: white;
  height: 90px;
  z-index: 999;

  .content {
    width: 100%;
    max-height: 90px;
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
