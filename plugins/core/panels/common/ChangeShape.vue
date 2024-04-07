<template>
  <div class="ddei-core-panel-changeshape">
    <div class="ddei-core-panel-changeshape-item" style="grid-row:1/3">
      <div class="ddei-core-panel-changeshape-item-box">
        <!-- <img width="16px" height="16px" src="../../icons/icon-change-shape.png" />
        <div>替换图形</div>
        <img width="6px" height="6px" src="../../icons/toolbox-expanded.png" /> -->
      </div>
    </div>
    <div class="ddei-core-panel-changeshape-item">
      <div class="ddei-core-panel-changeshape-item-text">
        替换
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "ddei-core-panel-changeshape",
  extends: null,
  mixins: [],
  props: {
    //外部传入的插件扩展参数
    options: {
      type: Object,
      default: null
    }
  },
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

<style lang="less" scoped>
.ddei-core-panel-changeshape {
  width: 80px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
  &-item {
    margin: auto;
    &-text {
      text-align: center;
      font-family: "Microsoft YaHei";
      font-size: 12px;
      color: rgb(120, 120, 120)
    }
    &-box {
      width: 70px;
      height: 50px;
      color: black;
      border-radius: 4px;
      font-size: 13px;
      display: grid;
      grid-template-rows: 25px 25px 10px;
      grid-template-columns: 1fr;

      div {
        margin: auto;
      }
      img {
        filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
        margin: auto;
      }
    
      &:hover {
        background-color: rgb(233, 233, 238);
        border-radius: 4px;
      }
    }

       
  }
}
</style>
