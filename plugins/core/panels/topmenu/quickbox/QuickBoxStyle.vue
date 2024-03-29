<template>
  <div class="ddei_editor_quick_style">
    <div class="ddei_editor_quick_style_item" style="grid-column: 1/14;grid-row:1/4;">
      <div class="ddei_editor_quick_style_item_box_template">
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_item">
          Abc
        </div>
        <div class="ddei_editor_quick_style_item_box_template_icon">
          <!-- <img width="16px" height="16px" src="../../icons/icon-to-up.png" />
          <img width="16px" height="16px" src="../../icons/icon-to-down.png" />
          <img width="11px" height="11px" style="margin-left:10px;" src="../../icons/icon-to-down-double.png" /> -->
        </div>
      </div>
    </div>
    <div class="ddei_editor_quick_style_item" style="grid-column: 14/16;">
      <div class="ddei_editor_quick_style_item_box">
        <!-- <img width="14px" height="14px" src="../../icons/icon-fill.png" />
        <div>填充</div>
        <img width="6px" height="6px" style="margin-top:8px" src="../../icons/toolbox-expanded.png" /> -->
      </div>
    </div>
    <div class="ddei_editor_quick_style_item" style="grid-column: 14/16;">
      <div class="ddei_editor_quick_style_item_box">
        <!-- <img width="14px" height="14px" src="../../icons/icon-style-line.png" />
        <div>线条</div>
        <img width="6px" height="6px" style="margin-top:8px" src="../../icons/toolbox-expanded.png" /> -->
      </div>
    </div>
    <div class="ddei_editor_quick_style_item" style="grid-column: 14/16">
      <div class="ddei_editor_quick_style_item_box">
        <!-- <img width="14px" height="14px" src="../../icons/icon-style-shadow.png" />
        <div>阴影</div>
        <img width="6px" height="6px" style="margin-top:8px" src="../../icons/toolbox-expanded.png" /> -->
      </div>
    </div>
    <div class="ddei_editor_quick_style_item" style="grid-column:1/16;">
      <div class="ddei_editor_quick_style_item_text">
        样式
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-Style",
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
.ddei_editor_quick_style {
  width: 430px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 20px 20px 20px 20px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  display: grid;
  padding-right: 10px;
}

.ddei_editor_quick_style_item {
  margin: auto;
}

.ddei_editor_quick_style_item_box_template {
  width: 350px;
  height: 55px;
  margin-top: 4px;
  border-radius: 4px;
  padding-left: 5px;
  background: white;
  display: flex;
}


.ddei_editor_quick_style_item_box_template_item {
  height: 34px;
  margin: auto;
  flex: 0 0 34px;
  color: black;
  border-radius: 4px;
  border: 1px solid black;
  text-align: center;
  padding-top: 3px;
}

.ddei_editor_quick_style_item_box_template_item:hover {
  outline: 0.5px solid #017fff;
  box-sizing: border-box;
  outline-offset: 3px;
}

.ddei_editor_quick_style_item_box_template_icon {
  width: 20px;
  grid-template-rows: 17px 17px 17px;
  grid-template-columns: 1fr;
  margin: auto;
  display: grid;
  margin-top: -2px;
  margin-right: 5px;
}

.ddei_editor_quick_style_item_box_template_icon img {
  margin-top: 5px;
  margin-left: 8px;
  filter: brightness(80%) drop-shadow(0.1px 0px 0.1px #000);
}

.ddei_editor_quick_style_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
  margin-top: 8px;
}



.ddei_editor_quick_style_item_box {
  width: 60px;
  height: 20px;
  color: black;
  text-align: center;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 2px;
}

.ddei_editor_quick_style_item_box img {
  margin-top: 3px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-left: 2px;
}

.ddei_editor_quick_style_item_box div {
  float: left;
  margin-left: 3px;
}



.ddei_editor_quick_style_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_style_item_box_selected img {
  margin-top: 4px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
}


.ddei_editor_quick_style_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
