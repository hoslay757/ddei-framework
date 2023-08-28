<template>
  <div id="ddei_editor_propertyview" class="ddei_editor_propertyview">
    <div class="ddei_editor_pv_group_view">
      <div class="ddei_editor_pv_group_view_expandbox">
        <img class="ddei_editor_pv_group_view_expandbox_img" src="../icons/icon-expand-right.png" />
      </div>
      <div class="ddei_editor_pv_group_view_items">
        <div class="ddei_editor_pv_group_view_items_item" title="样式">
          <img draggable="false" class="img" src="../icons/icon-fill.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item_selected" title="数据">
          <img draggable="false" class="img" src="../icons/icon-data.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item" title="事件">
          <img draggable="false" class="img" src="../icons/icon-event.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item" title="图层">
          <img draggable="false" class="img" src="../icons/icon-layers.png" />
        </div>
      </div>
    </div>

    <div class="ddei_editor_pv_subgroup_view">
      <div class="ddei_editor_pv_subgroup_view_tab_title">
        <div class="ddei_editor_pv_subgroup_view_tab_title_item_selected" title="填充颜色">填充</div>
        <div class="ddei_editor_pv_subgroup_view_tab_title_item" title="线条">线条</div>
        <div class="ddei_editor_pv_subgroup_view_tab_title_item" title="文本">文本</div>
      </div>
      <div class="ddei_editor_pv_subgroup_view_tab_panel">
        <div class="ddei_editor_pv_subgroup_view_tab_panel_editors">
          <div class="ddei_editor_pv_subgroup_view_tab_panel_editors_item">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../js/editor';

export default {
  name: "DDei-Editor-PropertyView",
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
.ddei_editor_propertyview {
  flex: 1;
  text-align: center;
  background: rgb(254, 254, 255);
  border: 1pt solid rgb(211, 211, 211);
  display: flex;
  user-select: none;
}

.ddei_editor_pv_group_view {
  flex: 0 0 36px;
  display: flex;
  flex-flow: column;
  border-right: 1pt solid rgb(211, 211, 211);
}

.ddei_editor_pv_group_view_expandbox {
  flex: 0 0 30px;
  display: inherit;
}

.ddei_editor_pv_group_view_expandbox:hover {
  background: rgb(211, 211, 211);
  cursor: pointer;
}

.ddei_editor_pv_group_view_expandbox_img {
  width: 34px;
  height: 26px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 1px;
  filter: brightness(60%)
}

.ddei_editor_pv_group_view_items {
  flex: 1;
  display: flex;
  flex-flow: column;
}

.ddei_editor_pv_group_view_items_item {
  flex: 0 0 36px;
  display: inherit;
}




.ddei_editor_pv_group_view_items_item .img {
  width: 32px;
  height: 32px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 3px;
}

.ddei_editor_pv_group_view_items_item_selected {
  flex: 0 0 36px;
  display: inherit;
  background: rgb(1, 126, 255);
}

.ddei_editor_pv_group_view_items_item_selected .img {
  width: 32px;
  height: 32px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 3px;
  filter: brightness(100)
}




.ddei_editor_pv_subgroup_view {
  flex: 1;
  display: flex;
  flex-flow: column;
}

.ddei_editor_pv_subgroup_view_tab_title {
  flex: 0 0 30px;
  display: flex;
  border-bottom: 1pt solid rgb(211, 211, 211);
  color: grey;
}

.ddei_editor_pv_subgroup_view_tab_title_item {
  flex: 1;
  text-align: center;
  line-height: normal;
  font-size: 15px;
  margin: auto;
  font-weight: bold;
}

.ddei_editor_pv_subgroup_view_tab_title_item_selected {
  flex: 1;
  text-align: center;
  line-height: normal;
  font-size: 15px;
  margin: auto;
  font-weight: bold;
  color: rgb(1, 126, 255);
}

.ddei_editor_pv_subgroup_view_tab_title_item:hover {
  color: rgb(1, 126, 255);
  cursor: pointer;
}
</style>
