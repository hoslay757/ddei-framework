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
              @click="createCircle()"
              style="width:120px;height:30px;margin-top:10px">圆型</button>
      <button type="button"
                @click="createDiamond()"
                style="width:120px;height:30px;margin-top:10px">菱形</button>
      <button type="button"
                  @click="createImg(1)"
                  style="width:120px;height:30px;margin-top:10px">矩形图片</button>
      <button type="button"
                @click="createImg(2)"
                style="width:120px;height:30px;margin-top:10px">圆形图片</button>
      <button type="button"
                @click="createImg(3)"
                style="width:120px;height:30px;margin-top:10px">菱形图片</button>
      <button type="button"
              @click="createContainer()"
              style="width:120px;height:30px;margin-top:10px">容器</button>
    </div>
    <div class="middle">
      <FrameWorkTest />
    </div>
    <div class="right"></div>
    <div class="bottom">

      <button type="button"
              v-for="(item,i) in layers"
              @click="changeLayer(i)"
              style="width:120px;height:30px;margin-top:10px">{{item.id}}</button>
      <button type="button"
              @click="createLayer()"
              style="width:120px;height:30px;margin-top:10px">图层+</button>
      <button type="button"
              @click="removeLayer()"
              style="width:120px;height:30px;margin-top:10px">图层-</button>
      <button type="button"
              @click="displayLayer()"
              style="width:120px;height:30px;margin-top:10px">显示图层</button>
      <button type="button"
              @click="hiddenLayer()"
              style="width:120px;height:30px;margin-top:10px">隐藏图层</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">放大</button>
      <button type="button"
              style="width:120px;height:30px;margin-top:10px">缩小</button>

    </div>
  </div>
</template>
<script lang="ts">
import FrameWorkTest from "./components/FrameWorkTest.vue";
import DDeiConfig from "./components/framework/js/config";
import DDei from "./components/framework/js/ddei";
import DDeiRectangle from "./components/framework/js/models/rectangle";
import DDeiCircle from "./components/framework/js/models/circle";
import DDeiDiamond from "./components/framework/js/models/diamond";
import DDeiRectContainer from "./components/framework/js/models/rect-container";

export default {
  name: "APP",
  extends: null,
  mixins: [],
  props: {},
  //注册组件
  components: {
    FrameWorkTest,
  },
  data() {
    return {
      layers: [],
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
    this.layers = ddInstance.stage.layers;
  },
  methods: {
   //创建方形图片
    createImg(type:number = 1) {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      //创建一个矩形
      let rect: DDeiRectangle = null;
      if(type == 1){
        rect = DDeiRectangle.initByJSON({
          id: "rect_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 160,
          height: 80,
          img:"/test_img.jpg",
          text:
            "测试图片" +
            ddInstance.stage.idIdx,
        });
      } else if (type == 2) {
        rect = DDeiCircle.initByJSON({
          id: "circle_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 160,
          height: 80,
          img: "/test_img.jpg",
          text:
            "测试图片" +
            ddInstance.stage.idIdx,
        });
      } else if (type == 3) {
        rect = DDeiDiamond.initByJSON({
          id: "dia_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 160,
          height: 80,
          img: "/test_img.jpg",
          text:
            "测试图片" +
            ddInstance.stage.idIdx,
        });
      }
      //下标自增1
      ddInstance.stage.idIdx++;
      //添加模型到图层
      ddInstance.stage.addModel(rect);
      //绑定并初始化渲染器
      DDeiConfig.bindRender(rect);
      rect.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
    //创建矩形
    createRectangle() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      //获取当前选择的控件，如果是一个容器则添加到容器中
      let models =
        ddInstance.stage.layers[
          ddInstance.stage.layerIndex
        ].getSelectedModels();
      //创建一个矩形
      let rect: DDeiRectangle = DDeiRectangle.initByJSON({
        id: "rect_" + ddInstance.stage.idIdx,
        x: 100,
        y: 100,
        width: 160,
        height: 80,
        text:
          "    示 . 例    矩形1示例矩形2222示例矩33形3示例33矩形4示例矩形5示例矩形6示例矩形7呀哈哈示例矩形1示例矩形2222示例矩33形3示例33矩形4示例矩形5示例矩形6示例矩形7呀哈哈" +
          ddInstance.stage.idIdx,
      });
      //下标自增1
      ddInstance.stage.idIdx++;
      if (models && models.size > 0) {
        let md = Array.from(models.values())[0];
        if (md.modelType == "DDeiRectContainer") {
          //下标自增1
          ddInstance.stage.idIdx++;
          md.addModel(rect);
          //绑定并初始化渲染器
          DDeiConfig.bindRender(rect);
          rect.render.init();
          //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
          ddInstance.stage.render.drawShape();
          return;
        }
      }
      //添加模型到图层
      ddInstance.stage.addModel(rect);
      //绑定并初始化渲染器
      DDeiConfig.bindRender(rect);
      rect.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
    //创建圆型
    createCircle() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      //创建一个矩形
      let circle: DDeiCircle = DDeiCircle.initByJSON({
        id: "circle_" + ddInstance.stage.idIdx,
        x: 100,
        y: 100,
        width: 160,
        height: 80,
        text:
          "示例圆型1示例圆型2示例圆型3示例圆型4示例圆型5示例圆型6" +
          ddInstance.stage.idIdx,
      });
      //下标自增1
      ddInstance.stage.idIdx++;
      //添加模型到图层
      ddInstance.stage.addModel(circle);
      //绑定并初始化渲染器
      DDeiConfig.bindRender(circle);
      circle.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
    //创建菱形
    createDiamond() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      //创建一个矩形
      let diamond: DDeiDiamond = DDeiDiamond.initByJSON({
        id: "diamond_" + ddInstance.stage.idIdx,
        x: 100,
        y: 100,
        width: 160,
        height: 80,
        text:
          "示例圆型1示例圆型2示例圆型3示例圆型4示例圆型5示例圆型6" +
          ddInstance.stage.idIdx,
      });
      //下标自增1
      ddInstance.stage.idIdx++;
      //添加模型到图层
      ddInstance.stage.addModel(diamond);
      //绑定并初始化渲染器
      DDeiConfig.bindRender(diamond);
      diamond.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },

    //创建容器
    createContainer() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      //创建一个矩形
      let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
        id: "container_" + ddInstance.stage.idIdx,
        x: 100,
        y: 100,
        width: 500,
        height: 500,
      });
      //下标自增1
      ddInstance.stage.idIdx++;
      //获取当前选择的控件，如果是一个容器则添加到容器中
      let models =
        ddInstance.stage.layers[
          ddInstance.stage.layerIndex
        ].getSelectedModels();
      if (models && models.size > 0) {
        let md = Array.from(models.values())[0];
        if (md.modelType == "DDeiRectContainer") {
          //下标自增1
          ddInstance.stage.idIdx++;
          md.addModel(container);
          //绑定并初始化渲染器
          DDeiConfig.bindRender(container);
          container.render.init();
          //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
          ddInstance.stage.render.drawShape();
          return;
        }
      }
      //添加模型到图层
      ddInstance.stage.addModel(container);
      //绑定并初始化渲染器
      DDeiConfig.bindRender(container);
      container.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },

    //创建图层
    createLayer() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      let layer = ddInstance.stage.addLayer();
      //绑定并初始化渲染器
      DDeiConfig.bindRender(layer);
      layer.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
      this.$forceUpdate();
    },

    //销毁当前图层
    removeLayer() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      let layer = ddInstance.stage.removeLayer();
      if (layer) {
        //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
        ddInstance.stage.render.drawShape();
        this.$forceUpdate();
      }
    },

    //修改图层
    changeLayer(index) {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      ddInstance.stage.cancelSelectModels();
      //根据选中图形的状态更新选择器
      if (ddInstance.stage.render.selector) {
        ddInstance.stage.render.selector.updatedBoundsBySelectedModels();
      }
      ddInstance.stage.changeLayer(index);
      ddInstance.stage.displayLayer(null, true);

      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },

    //隐藏图层
    hiddenLayer() {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      ddInstance.stage.hiddenLayer();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },

    //显示图层
    displayLayer() {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_demo"];
      ddInstance.stage.displayLayer(null, true);
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
  },
};
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
