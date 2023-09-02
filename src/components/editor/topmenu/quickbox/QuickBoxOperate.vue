<template>
  <div class="ddei_editor_quick_operate">
    <div class="ddei_editor_quick_operate_item">
      <div class="ddei_editor_quick_operate_item_box_selected">
        <img width="16px" height="16px" src="../../icons/icon-shear.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item">
      <div class="ddei_editor_quick_operate_item_box">
        <img width="16px" height="16px" src="../../icons/icon-brush.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item">
      <div class="ddei_editor_quick_operate_item_box">
        <img width="16px" height="16px" src="../../icons/icon-copy.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item">
      <div class="ddei_editor_quick_operate_item_box">
        <img width="16px" height="16px" src="../../icons/icon-paste.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_operate_item" style="grid-column:1/3;">
      <div class="ddei_editor_quick_operate_item_text">
        剪切板
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-Operate",
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
.ddei_editor_quick_operate {
  width: 70px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_quick_operate_item {
  margin: auto;

}

.ddei_editor_quick_operate_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120)
}



.ddei_editor_quick_operate_item_box {
  width: 25px;
  height: 25px;
  text-align: center;
}

.ddei_editor_quick_operate_item_box img {
  margin-top: 4px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_operate_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_operate_item_box_selected img {
  margin-top: 4px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
}


.ddei_editor_quick_operate_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
