<template>
  <div class="ddei_editor_quick_tool">
    <div class="ddei_editor_quick_tool_item">
      <div class="ddei_editor_quick_tool_item_box_selected">
        <img width="20px" height="20px" src="../../icons/icon-cursor.png" />
        <div>选择</div>
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div class="ddei_editor_quick_tool_item_box">
        <img width="20px" height="20px" src="../../icons/toolbox-shape-rect.png" />
        <div>形状</div>
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div class="ddei_editor_quick_tool_item_box">
        <img width="20px" height="20px" src="../../icons/icon-text.png" />
        <div>文本</div>
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item">
      <div class="ddei_editor_quick_tool_item_box">
        <img width="20px" height="20px" src="../../icons/icon-line-fold.png" />
        <div>线段</div>
      </div>
    </div>
    <div class="ddei_editor_quick_tool_item" style="grid-column:1/3;">
      <div class="ddei_editor_quick_tool_item_text">
        工具
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-Tool",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {

  },
};
</script>

<style scoped>
.ddei_editor_quick_tool {
  width: 180px;
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
  color: rgb(150, 150, 150)
}



.ddei_editor_quick_tool_item_box {
  width: 70px;
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
  width: 70px;
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
