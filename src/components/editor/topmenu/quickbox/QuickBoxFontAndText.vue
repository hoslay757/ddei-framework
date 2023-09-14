<template>
  <div class="ddei_editor_quick_fat">

    <div class="ddei_editor_quick_fat_item" style="grid-column:1/7;">
      <QBTFontFamily></QBTFontFamily>
    </div>
    <div class="ddei_editor_quick_fat_item" style="grid-column:7/10;">
       <QBTFontSize></QBTFontSize>
    </div>

    <div class="ddei_editor_quick_fat_item">
      <div class="ddei_editor_quick_fat_item_box" style="margin-top:1px;">
        <img width="13px" height="13px" src="../../icons/icon-align-left.png" />
      </div>
    </div>

    <div class="ddei_editor_quick_fat_item">
      <QBTEditBox selectedValue="1" attrCode="textStyle.bold" :img="icons['icon-font-bold']"></QBTEditBox>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <QBTEditBox selectedValue="1" attrCode="textStyle.italic" :img="icons['icon-font-italic']"></QBTEditBox>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <QBTEditBox selectedValue="1" attrCode="textStyle.underline" :img="icons['icon-text-underline']"></QBTEditBox>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <QBTEditBox selectedValue="1" attrCode="textStyle.deleteline" :img="icons['icon-text-deleteline']"></QBTEditBox>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <div class="ddei_editor_quick_fat_item_box" style="margin-top:-2px;">
        <img width="18px" height="18px" src="../../icons/icon-text-superscript.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <div class="ddei_editor_quick_fat_item_box" style="margin-top:-1px;">
        <img width="18px" height="18px" src="../../icons/icon-text-subscript.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_fat_item">
       <QBTEditAddFontSize :addValue="1" attrCode="font.size" :img="icons['icon-font-up']"></QBTEditAddFontSize>
    </div>
    <div class="ddei_editor_quick_fat_item">
       <QBTEditAddFontSize :addValue="-1" attrCode="font.size" :img="icons['icon-font-down']"></QBTEditAddFontSize>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <QBTEditColor attrCode="font.bgcolor" :img="icons['icon-font-bgcolor']"></QBTEditColor>
    </div>
    <div class="ddei_editor_quick_fat_item">
      <QBTEditColor attrCode="font.color" :img="icons['icon-font-color']"></QBTEditColor>
    </div>

    <div class="ddei_editor_quick_fat_item" style="grid-column:1/11;">
      <div class="ddei_editor_quick_fat_item_text">
        字体和段落
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import ICONS from "../../js/icon"
import QBTFontFamily from './tools/QBTFontFamily.vue';
import QBTFontSize from './tools/QBTFontSize.vue';
import QBTEditBox from './tools/QBTEditBox.vue';
import QBTEditAddFontSize from './tools/QBTEditAddFontSize.vue';
import QBTEditColor from './tools/QBTEditColor.vue';

export default {
  name: "DDei-Editor-Quick-FontAndText",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      icons:{}
    };
  },
  computed: {},
  components:{
    QBTFontSize,
    QBTFontFamily,
    QBTEditBox,
    QBTEditAddFontSize,
    QBTEditColor
  },
  watch: {},
  created() { },
  mounted() {
    for(let i in ICONS){
      this.icons[i] = ICONS[i].default;
    }
  },
};
</script>

<style scoped>
.ddei_editor_quick_fat {

  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_quick_fat_item {
  margin-top: 3px;
}

.ddei_editor_quick_fat_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
  margin-top: -3px;
}


/*字体大小设置框 */

.ddei_editor_quick_fat_item_fontsize {

  background-color: white;
  border-radius: 4px;
  height: 24px;
}

.ddei_editor_quick_fat_item_fontsize:hover {
  border: 0.5px solid #017fff;
  box-sizing: border-box;
}

.ddei_editor_quick_fat_item_fontsize_input {
  width: calc(100% - 20px);
  border: transparent;
  outline: none;
  font-size: 13px;
  margin-top: 3px;
  background: transparent;
  float: left;
}

.ddei_editor_quick_fat_item_fontsize_combox {
  width: 8px;
  margin-top: 8px;
  margin-right: 4px;
  margin-left: 4px;
  height: 8px;
  float: left;
}







.ddei_editor_quick_fat_item_box {
  width: 25px;
  height: 25px;
  text-align: center;
}

.ddei_editor_quick_fat_item_box img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}

.ddei_editor_quick_fat_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_fat_item_box_selected img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}


.ddei_editor_quick_fat_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
