<template>
  <div class="ddei_editor_quick_sort">
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box_selected">
        <img width="20px" height="20px" src="../../icons/icon-push-up.png" />
        <div>位置</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box">
        <img width="20px" height="20px" src="../../icons/icon-compose.png" />
        <div>组合</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box">
        <img width="20px" height="20px" src="../../icons/icon-turn-right.png" />
        <div>翻转</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box">
        <img width="20px" height="20px" src="../../icons/icon-align-left.png" />
        <div>对齐</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box">
        <img width="20px" height="20px" src="../../icons/icon-change-size.png" />
        <div>大小</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div class="ddei_editor_quick_sort_item_box">
        <img width="20px" height="20px" src="../../icons/icon-lock.png" />
        <div>锁定</div>
        <img width="6px" height="6px" style="margin-top:10px" src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item" style="grid-column:1/4;">
      <div class="ddei_editor_quick_sort_item_text">
        排列
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-Sort",
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
.ddei_editor_quick_sort {
  width: 250px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_quick_sort_item {
  margin: auto;

}

.ddei_editor_quick_sort_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120)
}



.ddei_editor_quick_sort_item_box {
  width: 70px;
  height: 25px;
  color: black;
  text-align: center;
  border-radius: 4px;
  font-size: 13px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_item_box div {
  float: left;
  margin-left: 3px;
  margin-top: 2px;

}

.ddei_editor_quick_sort_item_box img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_selected {
  width: 70px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
  color: black;
  font-size: 13px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_item_box_selected div {
  float: left;
  margin-left: 3px;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_selected img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}


.ddei_editor_quick_sort_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
