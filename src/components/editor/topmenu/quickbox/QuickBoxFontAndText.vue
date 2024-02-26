<template>
  <div class="ddei_editor_quick_fat">
    <div class="header"></div>
    <div class="content">
      <div class="buttons">
        <div class="b1">
          <QBTFontFamily></QBTFontFamily>
        </div>
        <div class="b2">
          <QBTFontSize></QBTFontSize>
        </div>
        <div>
          <QBTEditAddFontSize :addValue="1" attrCode="font.size" img="icon-a-ziyuan456" extcls="magtop-2">
          </QBTEditAddFontSize>
        </div>
        <div>
          <QBTEditAddFontSize :addValue="-1" attrCode="font.size" img="icon-a-ziyuan455" extcls="magtop-1">
          </QBTEditAddFontSize>
        </div>

        <div>
          <QBTEditBox selectedValue="1" :supportQuickEdit="false" attrCode="textStyle.align" img="icon-a-ziyuan440"
            extcls="magtop-1" :unSelectValue="2">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="2" :supportQuickEdit="false" attrCode="textStyle.align" img="icon-a-ziyuan437"
            extcls="magtop-1" :unSelectValue="2">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="3" :supportQuickEdit="false" attrCode="textStyle.align" img="icon-a-ziyuan439"
            extcls="magtop-1" :unSelectValue="2">
          </QBTEditBox>
        </div>



      </div>
      <div class="buttons">
        <div class="mg14">
          <QBTEditBox selectedValue="1" attrCode="textStyle.bold" img="icon-a-ziyuan461">
          </QBTEditBox>
        </div>
        <div class="mg16">
          <QBTEditBox selectedValue="1" attrCode="textStyle.italic" img="icon-a-ziyuan459">
          </QBTEditBox>
        </div>
        <div class="mg16">
          <QBTEditBox selectedValue="1" attrCode="textStyle.underline" img="icon-icon-text-underline"
            extcls="ext-underline">
          </QBTEditBox>
        </div>
        <div class="mg165">
          <QBTEditBox selectedValue="1" attrCode="textStyle.deleteline" img="icon-a-ziyuan457">
          </QBTEditBox>
        </div>

        <div class="mg17">
          <QBTEditBox selectedValue="1" :onlyQuickEdit="true" attrCode="textStyle.subtype" img="icon-a-ziyuan394"
            extcls="magtop-1">
          </QBTEditBox>
        </div>
        <div class="mg17">
          <QBTEditBox selectedValue="2" :onlyQuickEdit="true" attrCode="textStyle.subtype" img="icon-a-ziyuan393"
            extcls="magtop-1">
          </QBTEditBox>
        </div>
        <div class="b4">
          <QBTEditBox selectedValue="3" :onlyQuickEdit="true" attrCode="textStyle.subtype" img="icon-a-ziyuan392"
            extcls="magtop-1">
          </QBTEditBox>
        </div>
        <div class="b5">
          <QBTEditColor attrCode="textStyle.bgcolor" img="icon-a-ziyuan452"></QBTEditColor>
        </div>
        <div class="b6">
          <QBTEditColor attrCode="font.color" img="icon-a-ziyuan463"></QBTEditColor>
        </div>


        <div>
          <QBTEditBox selectedValue="1" :supportQuickEdit="false" attrCode="textStyle.valign" img="icon-a-ziyuan440"
            extcls="rotate-90" :unSelectValue="2">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="2" :supportQuickEdit="false" attrCode="textStyle.valign" img="icon-a-ziyuan437"
            extcls="rotate-90" :unSelectValue="2">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="3" :supportQuickEdit="false" attrCode="textStyle.valign" img="icon-a-ziyuan439"
            extcls="rotate-90" :unSelectValue="2">
          </QBTEditBox>
        </div>

      </div>
    </div>
    <div class="tail">
      文本编辑
    </div>
  </div>
</template>
<script lang="ts">
import ICONS from "../../js/icon";
import QBTFontFamily from "./tools/QBTFontFamily.vue";
import QBTFontSize from "./tools/QBTFontSize.vue";
import QBTEditBox from "./tools/QBTEditBox.vue";
import QBTEditAddFontSize from "./tools/QBTEditAddFontSize.vue";
import QBTEditColor from "./tools/QBTEditColor.vue";

export default {
  name: "DDei-Editor-Quick-FontAndText",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      icons: {},
    };
  },
  computed: {},
  components: {
    QBTFontSize,
    QBTFontFamily,
    QBTEditBox,
    QBTEditAddFontSize,
    QBTEditColor,
  },
  watch: {},
  created() { },
  mounted() {
    for (let i in ICONS) {
      this.icons[i] = ICONS[i];
    }
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_quick_fat {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;
  text-align: center;

  .content {
    display: flex;
    flex-direction: column;
    padding-left: 16px;
    border-right: 1px solid #E2E2EB;

    .buttons {
      flex: 1;

      >div {
        float: left;
        margin-right: 10px;

      }



      .mg16 {
        margin-right: 3px;
      }

      .mg165 {
        margin-right: 5px;
      }

      .mg14 {
        margin-right: 3px;
        margin-left: -3px;
      }

      .mg17 {
        margin-right: 8px;
      }

      .b1 {
        width: 152px;
        margin-right: 0px;
      }

      .b2 {
        width: 64px;
      }

      .b4 {
        margin-right: 33px;
      }

      .b5 {
        margin-top: 1px;
        margin-right: 17px;
      }

      .b6 {
        margin-top: 1px;
        margin-right: 15px;
      }
    }
  }

  .tail {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
    border-right: 1px solid #E2E2EB;
  }
}
</style>
