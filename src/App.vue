<script setup>
import FrameWorkTest from './components/FrameWorkTest.vue'
import DDeiConfig from "./components/framework/js/config"
import DDeiStage from "./components/framework/js/models/stage"
import DDeiLayer from "./components/framework/js/models/layer"
import DDeiRectangle from "./components/framework/js/models/rectangle"
</script>

<template>
  <div class="main">
    <div class="top">
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">新建</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">打开</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">保存</button>
    </div>
    <div class="left">
      <button type="button"
              @click="createRectangle()"
              style="width:120px;height:30px;margin-top:10px">矩形</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">圆型</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">菱形</button>
    </div>
    <div class="middle">
      <FrameWorkTest />
    </div>
    <div class="right"></div>
    <div class="bottom">

      <button type="button"
              style="width:120px;height:30px;margin-top:10px">图层1</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">图层2</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">图层+</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">图层-</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">放大</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">缩小</button>

    </div>
  </div>
</template>
<script>
export default {
  name: 'APP',
  extends: null,
  mixins: [],
  props: {},
  data () {
    return {

    }
  },
  computed: {

  },
  watch: {

  },
  created () {
  },
  mounted () {
  },
  methods: {

    //创建矩形
    createRectangle () {
      //TODO 这里是否应该直接封装一个方法维护关系？
      //获取当前实例
      let ddInstance = DDei.INSTANCE_POOL["ddei_demo"];
      //创建一个矩形
      let rect = DDeiRectangle.initByJSON({
        id: "rect_" + ddInstance.stage.idIdx,
        x: 10 + (ddInstance.stage.idIdx * 100),
        y: 10 + (ddInstance.stage.idIdx * 100),
        width: 160,
        height: 80,
        text: "示例矩形" + ddInstance.stage.idIdx
      });
      rect.stage = ddInstance.stage;
      //下标自增1
      ddInstance.stage.idIdx++;
      //将矩形添加进图层
      ddInstance.stage.layers[ddInstance.stage.layerIndex].models[rect.id] = rect
      rect.layer = ddInstance.stage.layers[ddInstance.stage.layerIndex]
      rect.pModel = rect.layer
      //绑定并初始化渲染器
      DDeiConfig.bindRender(rect);
      rect.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
  }
}
</script>

<style>
body {
  display: block;
}
#app {
  padding: 0;
  margin: 0;
  display: block;
  max-width: 100%;
}
.main {
  width: 100%;
  height: calc(100vh);
}
.top {
  float: left;
  background: grey;
  width: 100%;
  height: 175px;
}
.left {
  text-align: center;
  float: left;
  background: green;
  width: 200px;
  height: calc(100vh - 235px);
}
.middle {
  float: left;
  background: green;
  width: calc(100% - 470px);
  height: calc(100vh - 235px);
}
.right {
  float: left;
  background: red;
  width: 270px;
  height: calc(100vh - 235px);
}
.bottom {
  float: left;
  background: blue;
  width: 100%;
  height: 60px;
}
</style>
