<template>
  <div class="ddei_editor_quick_fat">
    <div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_fontfamily">
            <img width="16px" height="16px" class="ddei_editor_quick_fat_item_fontfamily_icon" src="../../icons/icon-search.png">
            <input  class="ddei_editor_quick_fat_item_fontfamily_input" value="Microsoft YaHei"/>
            <img width="16px" height="16px" class="ddei_editor_quick_fat_item_fontfamily_combox" src="../../icons/toolbox-expanded.png">
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_fontsize">
            <input class="ddei_editor_quick_fat_item_fontsize_input" value="16"/>
            <img width="16px" height="16px" class="ddei_editor_quick_fat_item_fontsize_combox" src="../../icons/toolbox-expanded.png">
        </div>
      </div>
      
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:1px">
          <img width="13px" height="13px" src="../../icons/icon-align-left.png"/>
        </div>
      </div>
    </div>
    <div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px">
          <img width="13px" height="13px"  src="../../icons/icon-font-bold.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px">
          <img width="13px" height="13px" src="../../icons/icon-font-italic.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:1px;">
          <img width="13px" height="13px" src="../../icons/icon-text-underline.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:0px;">
          <img width="15px" height="15px" src="../../icons/icon-text-deleteline.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:-2px;">
          <img width="18px" height="18px" src="../../icons/icon-text-superscript.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:-1px;">
          <img width="18px" height="18px" src="../../icons/icon-text-subscript.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:-1px;">
          <img width="18px" height="18px" src="../../icons/icon-font-up.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-5px;margin-top:-1px;">
          <img width="18px" height="18px" src="../../icons/icon-font-down.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-left:-4px;margin-top:1px;">
          <img width="16px" height="15px" src="../../icons/icon-font-bgcolor.png"/>
        </div>
      </div>
      <div class="ddei_editor_quick_fat_item">
        <div class="ddei_editor_quick_fat_item_box" style="margin-top:-1px;margin-left:-5px;">
          <img width="18px" height="19x" src="../../icons/icon-font-color.png"/>
        </div>
      </div>
    </div>
    <div class="ddei_editor_quick_fat_item" style="grid-column:1/3;">
      <div class="ddei_editor_quick_fat_item_text">
        剪切板
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-FontAndText",
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
.ddei_editor_quick_fat {
  width: 280px;
  height: 90px;
  padding-top: 3px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  display: grid;
  gap: 4px;
  padding-right: 4px;
  margin-left:5px;
  padding-top:9px;
}

.ddei_editor_quick_fat_item {
  float:left;
  margin-right:7px;
}

.ddei_editor_quick_fat_item_text {
  text-align:center;
  font-family: "Microsoft YaHei";
  font-size:12px;
  color:rgb(150,150,150)
}

/*字体选择框*/

.ddei_editor_quick_fat_item_fontfamily {
  width: 165px;
  background-color:white;
  border-radius: 4px;
  height:24px;
}
.ddei_editor_quick_fat_item_fontfamily:hover {
  border: 0.5px solid #017fff;
  box-sizing:border-box;
}

.ddei_editor_quick_fat_item_fontfamily_icon {
  width:18px;
  height:18px;
  margin:3px;
  float:left;
}

.ddei_editor_quick_fat_item_fontfamily_input {
  width: 122px;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin-top:3px;
  background: transparent;
  float:left;
}

.ddei_editor_quick_fat_item_fontfamily_combox {
  width: 8px;
  margin-top:8px;
  margin-right:4px;
  margin-left:4px;
  height: 8px;
  float:left;
}

/*字体大小设置框 */

.ddei_editor_quick_fat_item_fontsize {
  width: 64px;
  background-color:white;
  border-radius: 4px;
  height:24px;
}
.ddei_editor_quick_fat_item_fontsize:hover {
  border: 0.5px solid #017fff;
  box-sizing:border-box;
}

.ddei_editor_quick_fat_item_fontsize_input {
  width: 46px;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin-top:3px;
  background: transparent;
  float:left;
}

.ddei_editor_quick_fat_item_fontsize_combox {
  width: 8px;
  margin-top:8px;
  margin-right:4px;
  margin-left:4px;
  height: 8px;
  float:left;
}







.ddei_editor_quick_fat_item_box {
  width:25px;
  height:25px;
  text-align:center;
}
.ddei_editor_quick_fat_item_box img{
  margin-top:4px;
  filter:brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}

.ddei_editor_quick_fat_item_box_selected {
  width:25px;
  height:25px;
  text-align:center;
  background-color:rgb(228,228,232);
  border-radius: 4px;
}
.ddei_editor_quick_fat_item_box_selected img{
  margin-top:4px;
  filter:brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}


.ddei_editor_quick_fat_item_box:hover {
  background-color:rgb(233,233,238);
  border-radius: 4px;
}


</style>
