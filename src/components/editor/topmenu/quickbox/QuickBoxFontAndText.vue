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
          <QBTEditAddFontSize :addValue="1" attrCode="font.size" img="iconfont icon-a-ziyuan310"></QBTEditAddFontSize>
        </div>
        <div>
          <QBTEditAddFontSize :addValue="-1" attrCode="font.size" img="iconfont icon-a-ziyuan210"></QBTEditAddFontSize>
        </div>

        <div>
          <QBTEditBox selectedValue="1" :supportQuickEdit="false" attrCode="textStyle.align"
            img="iconfont icon-a-ziyuan93">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="2" :supportQuickEdit="false" attrCode="textStyle.align"
            img="iconfont icon-a-ziyuan90">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="3" :supportQuickEdit="false" attrCode="textStyle.align"
            img="iconfont icon-a-ziyuan92">
          </QBTEditBox>
        </div>



      </div>
      <div class="buttons">
        <div>
          <QBTEditBox selectedValue="1" attrCode="textStyle.bold" img="iconfont icon-a-ziyuan51">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="1" attrCode="textStyle.italic" img="iconfont icon-a-ziyuan47">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="1" attrCode="textStyle.underline" img="iconfont icon-a-ziyuan46">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="1" attrCode="textStyle.deleteline" img="iconfont icon-a-ziyuan45">
          </QBTEditBox>
        </div>

        <div>
          <QBTEditBox selectedValue="1" :onlyQuickEdit="true" attrCode="textStyle.subtype"
            img="iconfont icon-shangbiao-01-01">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="2" :onlyQuickEdit="true" attrCode="textStyle.subtype"
            img="iconfont icon-zhongbiao-01">
          </QBTEditBox>
        </div>
        <div class="b4">
          <QBTEditBox selectedValue="3" :onlyQuickEdit="true" attrCode="textStyle.subtype" img="iconfont icon-xiabiao-01">
          </QBTEditBox>
        </div>
        <div class="b5">
          <QBTEditColor attrCode="textStyle.bgcolor" img="iconfont icon-tianse-01"></QBTEditColor>
        </div>
        <div class="b6">
          <QBTEditColor attrCode="font.color" img="iconfont icon-a-ziyuan55"></QBTEditColor>
        </div>


        <div>
          <QBTEditBox selectedValue="1" :supportQuickEdit="false" attrCode="textStyle.valign"
            img="iconfont icon-a-ziyuan88">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="2" :supportQuickEdit="false" attrCode="textStyle.valign"
            img="iconfont icon-a-ziyuan88">
          </QBTEditBox>
        </div>
        <div>
          <QBTEditBox selectedValue="3" :supportQuickEdit="false" attrCode="textStyle.valign"
            img="iconfont icon-a-ziyuan89">
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
    padding-right: 16px;
    border-right: 1px solid #E2E2EB;

    .buttons {
      flex: 1;

      >div {
        float: left;
        margin-right: 14px;
      }

      .b1 {
        width: 152px;
        margin-right: 0px;
      }

      .b2 {
        width: 59px;
      }

      .b4 {
        margin-right: 34px;
      }

      .b5 {
        margin-top: 0px;
        margin-right: 13px;
      }

      .b6 {
        margin-top: 0px
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
