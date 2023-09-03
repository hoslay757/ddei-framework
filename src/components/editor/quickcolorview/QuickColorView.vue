<template>
  <div id="ddei_editor_qcview" class="ddei_editor_qcview">
    <div class="ddei_editor_qcview_type">
      <img width="15px" height="15px" style="width:15px;height:15px;" src="../icons/icon-fill.png" />
      <img width="6px" height="6px" style="width:6px;height:6px;margin-top:4px;" src="../icons/toolbox-expanded.png" />
    </div>
    <div class="ddei_editor_qcview_color" v-for="color in  colors " :style="{ 'background-color': '' + color }">
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "DDei-Editor-QuickColorMenu",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      colors: []
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.colors = [
      "#FFB6C1", "#FFC0CB", "#DC143C", "#FF0F5", "#DB7093", "#FF69B4", "#FF1493", "#C71585", "#DA70D6", "#D8BFD8",
      "#DDA0DD", "#EE82EE", "#FF00FF", "#FF00FF", "#8B008B", "#800080", "#BA55D3", "#9400D3", "#9932CC", "#4B0082",
      "#8A2BE2", "#9370DB", "#7B68EE", "#6A5ACD", "#483D8B", "#E6E6FA", "#F8F8FF", "#0000FF", "#0000FF", "#0000CD",
      "#191970", "#00008B", "#000080", "#4169E1", "#6495ED", "#B0C4DE", "#778899", "#708090", "#1E90FF", "#F0F8FF",
      "#4682B4", "#87CEFA", "#87CEEB", "#00BFFF", "#ADD8E6", "#B0E0E6", "#5F9EA0", "#F0FFFF", "#E1FFFF", "#AFEEEE",
      "#00FFFF", "#00FFFF", "#00CED1", "#2F4F4F", "#008B8B", "#008080", "#48D1CC", "#20B2AA", "#40E0D0", "#7FFFAA",
      "#00FA9A", "#00FF7F", "#F5FFFA", "#3CB371", "#2E8B57", "#F0FFF0", "#90EE90", "#98FB98", "#8FBC8F", "#32CD32",
      "#00FF00", "#228B22", "#008000", "#006400", "#7FFF00", "#7CFC00", "#ADFF2F", "#556B2F", "#F5F5DC", "#FAFAD2",
      "#FFFFF0", "#FFFFE0", "#FFFF00", "#808000", "#BDB76B", "#FFFACD", "#EEE8AA", "#F0E68C", "#FFD700", "#FFF8DC"
    ];
  },
};
</script>

<style scoped>
.ddei_editor_qcview {
  height: 16px;
  background: rgb(245, 245, 245);
  border: 0.5pt solid rgb(235, 235, 239);
  display: flex;
}

.ddei_editor_qcview_type {
  flex: 0 0 30px;
  height: 14px;
  width: 20px;
  padding-left: 5px;
}

.ddei_editor_qcview_type:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_qcview_type img {
  display: block;
  float: left;
}

.ddei_editor_qcview_color {
  flex: 1 1 15px;
  height: 13px;
  margin-left: 2px;
  margin-top: 1px;

}

.ddei_editor_qcview_color:hover {
  outline: 0.5px solid #017fff;
  box-sizing: border-box;
  outline-offset: 0.5px;
}
</style>
