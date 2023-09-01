<template>
  <div id="ddei_editor_topmenu" class="ddei_editor_topmenu">
    <div id="ddei_editor_topmenu_quickbox" class="ddei_editor_topmenu_quickbox">
       <div class="ddei_editor_topmenu_quickbox_group">
          <QuickBoxOperate></QuickBoxOperate>
        </div>
        <div class="ddei_editor_topmenu_quickbox_group">
          <QuickBoxFontAndText></QuickBoxFontAndText>
        </div>
    </div>
   
  </div>
</template>
<script lang="ts">
import QuickBoxOperate from './quickbox/QuickBoxOperate.vue';
import QuickBoxFontAndText from './quickbox/QuickBoxFontAndText.vue';

export default {
  name: "DDei-Editor-TopMenu",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {};
  },
  //注册组件
  components: {
   QuickBoxOperate,
   QuickBoxFontAndText
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {

  },
};
</script>

<style scoped>
.ddei_editor_topmenu {
  background: rgb(225,225,225);
  width: 100%;
}
.ddei_editor_topmenu_quickbox{
  background-color: #F2F2F7;
  width : 100%;
  height: 100px;
  display: flex;
}
.ddei_editor_topmenu_quickbox_group{
  flex: 0;
  margin:auto 0;
  margin-right:5px;
  margin-left:5px;
}

</style>
