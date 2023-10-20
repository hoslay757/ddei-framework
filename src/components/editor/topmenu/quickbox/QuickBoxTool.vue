<template>
  <div class="ddei_editor_quick_tool">
    <div class="ddei_editor_quick_tool_item">
      <div :class="{'ddei_editor_quick_tool_item_box_selected':editor?.editMode == 1,'ddei_editor_quick_tool_item_box':editor?.editMode != 1}"
           @click="changeEditMode(1)">
        <img style="width:20px;height:20px;"
             src="../../icons/icon-cursor.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div :class="{'ddei_editor_quick_tool_item_box_selected':editor?.editMode == 2,'ddei_editor_quick_tool_item_box':editor?.editMode != 2}"
           @click="changeEditMode(2)">
        <img style="width:20px;height:20px;"
             src="../../icons/icon-hand.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div :class="{'ddei_editor_quick_tool_item_box_selected':editor?.editMode == 3,'ddei_editor_quick_tool_item_box':editor?.editMode != 3}"
           @click="changeEditMode(3)">
        <img style="width:20px;height:20px;"
             src="../../icons/icon-text.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div :class="{'ddei_editor_quick_tool_item_box_selected':editor?.editMode == 4,'ddei_editor_quick_tool_item_box':editor?.editMode != 4}"
           style="width:33px">
        <img style="width:20px;height:20px;"
             @click="changeEditMode(4)"
             src="../../icons/icon-line-fold.png" />
        <img style="margin-top:10px;width:6px;height:6px;"
             src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item"
         style="grid-column:1/3;">
      <div class="ddei_editor_quick_tool_item_text">
        工具
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
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
  created() {},
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
    },
  },
};
</script>

<style scoped>
.ddei_editor_quick_tool {
  width: 70px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 4px;

  padding-right: 4px;
}

.ddei_editor_quick_tool_item {
  margin: auto;
}

.ddei_editor_quick_tool_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
}

.ddei_editor_quick_tool_item_box {
  width: 25px;
  height: 25px;
  color: black;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
}

.ddei_editor_quick_tool_item_box div {
  float: left;
  margin-left: 2px;
  margin-top: 1px;
}

.ddei_editor_quick_tool_item_box img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_tool_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
  color: black;
  font-size: 14px;
}

.ddei_editor_quick_tool_item_box_selected div {
  float: left;
  margin-left: 2px;
  margin-top: 1px;
}

.ddei_editor_quick_tool_item_box_selected img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_tool_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
