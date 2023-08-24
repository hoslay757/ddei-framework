<template>
  <div>
    <div id="ddei_editor_toolbox" @mousedown="forceEditorToolBox"
           class="ddei_editor_toolbox">
      <div class="expandbox">
        <img class="img" src="../icons/toolbox-d-left.png"/>
      </div>
      <div class="searchbox">
        <div class="group">
        <input v-model="searchText" class="input" @keypress="searchInputEnter" placeholder="搜索控件">
        <div class="button" @click="searchControl">搜索</div>
        </div>
      </div>
      <hr/>
      <div class="groups">
          <div v-for="(group, groupIndex) in groups" v-show="group.display == true" class="group">
              <div :class="{ 'box': true, 'expanded': group.expand}" @click="groupBoxExpand(group)">
                <img class="expand" v-show="!group.expand" src="../icons/toolbox-unexpanded.png"/>
                <img class="expand" v-show="group.expand" src="../icons/toolbox-expanded.png"/>
                <span class="title">{{ group.name }}</span>
                <img v-if="!group.cannotClose" class="close" src="../icons/toolbox-close.png" @click="groupBoxClose(group)"/>
              </div>
              <div class="item_panel" v-if="group.expand == true">
                <div class="item" :title="control.desc" @click="createImg(1)" v-for="(control, controlIndex) in group.controls">
                  <img class="icon" :src="control.icon"/>
                  <div class="text">{{ control.name }}</div>
                </div>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor";
import DDeiConfig from "@/components/framework/js/config";
import DDei from "@/components/framework/js/ddei";
import DDeiRectangle from "@/components/framework/js/models/rectangle";
import DDeiCircle from "@/components/framework/js/models/circle";
import DDeiDiamond from "@/components/framework/js/models/diamond";
import DDeiRectContainer from "@/components/framework/js/models/rect-container";
import loadToolGroups from "../configs/toolgroup"
import DDeiEditorState from '../js/enums/editor-state';
import { cloneDeep, trim } from 'lodash';

export default {
  name: "DDei-Editor-Toolbox",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //分组数据
      groups: [],
      //用于搜索时保存原始的groups
      searchOriginGroups: null,
      //搜索控件时用的文本
      searchText:"",
      //当前编辑器
      editor:null
    };
  },
  computed: {
  },
  watch: {},
  created() {},
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //加载工具栏
    loadToolGroups().then(module=>{
      //遍历module，加上display、expand两个属性，来控制在本组件内是否展开、和关闭
      module.forEach((item,index)=>{
        item.display = true;
        //缺省第一个展开
        if(index == 0){
          item.expand = true;
        }else{
          item.expand = false;
        }
        //处理control的图标
        item.controls.forEach(control => {
          if(control.icon){
            control.icon = new URL('../icons/' + control.icon, import.meta.url).href;
          }
        });
      });
      this.groups = module;
      this.searchOriginGroups = this.groups;
      
    });
  },
  methods: {

    /**
     * 展开或收折groupbox
     */
    groupBoxExpand(group: object) {
      if (group) {
        group.expand = !group.expand
      }
    },

    /**
    * 关闭groupbox
    */
    groupBoxClose(group: object) {
      if (group) {
        group.display = false
      }
    },

    /**
     * 搜索按钮按下时，检测是否按下enter，按下后执行搜索
     * @param evt 
     */
    searchInputEnter(evt) {
      if(evt.keyCode == 13){
        this.searchControl();
      }
    },

    /**
     * 焦点进入当前区域
     */
    forceEditorToolBox() {
      if(DDeiEditor.ACTIVE_INSTANCE.state != DDeiEditorState.TOOLBOX_ACTIVE){
        DDeiEditor.ACTIVE_INSTANCE.state = DDeiEditorState.TOOLBOX_ACTIVE
      }
    },

    /**
     * 搜索控件
     */
    searchControl() {
      //如果清空搜索框则还原
      let text = trim(this.searchText);
      if(text == ''){
        this.groups = this.searchOriginGroups;
        this.searchOriginGroups = null;
      }
      //如果搜索框有内容则搜索
      else{
        let searchControls = [];
        let gp = {};
        gp.name = "搜索结果"
        this.searchOriginGroups.forEach(group => {
          if(group.controls){
            group.controls.forEach(control => {
              if(control.code.indexOf(text) != -1 || control.name.indexOf(text) != -1 ){
                searchControls.push(control);
              }
            });
          }
        });
        gp.controls = cloneDeep(searchControls);
        gp.display = true;
        gp.expand = true;
        gp.cannotClose = true;
        this.groups = [gp];
      }
    },


    //以下为demo方法，后续会移除
    //创建方形图片
    createImg(type: number = 1) {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      //创建一个矩形
      let rect: DDeiRectangle = null;
      if (type == 1) {
        rect = DDeiRectangle.initByJSON({
          id: "rect_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 160,
          height: 80,
          img: "/test_img.jpg",
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
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
    createContainer(type) {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      //创建一个矩形
      let container: DDeiRectContainer = null;
      if (type == 1) {
        container = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 500,
          height: 500,
          linkChild: false,
          linkSelf: false
        });
      } else if (type == 2) {
        container = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 500,
          height: 500,
          linkChild: true,
          linkSelf: false
        });
      } else if (type == 3) {
        container = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 500,
          height: 500,
          linkChild: false,
          linkSelf: true
        });
      } else if (type == 4) {
        container = DDeiRectContainer.initByJSON({
          id: "container_" + ddInstance.stage.idIdx,
          x: 100,
          y: 100,
          width: 500,
          height: 500,
          linkChild: true,
          linkSelf: true
        });
      }
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      let layer = ddInstance.stage.removeLayer();
      if (layer) {
        //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
        ddInstance.stage.render.drawShape();
        this.$forceUpdate();
      }
    },

    //修改图层
    changeLayer(index) {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
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
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      ddInstance.stage.hiddenLayer();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },

    //显示图层
    displayLayer() {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      ddInstance.stage.displayLayer(null, true);
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.stage.render.drawShape();
    },
  },
};
</script>

<style scoped>
.ddei_editor_toolbox {
  text-align: center;
  background: rgb(254,254,255);
  border:1pt solid rgb(235,235,239);
  display:flex;
  flex-flow:column;
}
/**以下为分割线 */
.ddei_editor_toolbox hr{
  border:0.5px solid rgb(240,240,240);
  width:93%;
  margin:auto 4px 5px 7px;

}

/**以下为收折框 */
.ddei_editor_toolbox .expandbox {
  flex: 0 0 38px;
  height:38px;
  text-align: right;
}
.ddei_editor_toolbox .expandbox .img{
  width:30px;
  height:24px;
  padding:4px 4px;
  margin-top:6px;
  margin-right:2px;
  border-radius: 4px;
}

.ddei_editor_toolbox .expandbox .img:hover{
  background-color:rgb(244,244,244)
}
/**以下为搜索框 */
.ddei_editor_toolbox .searchbox {
  flex: 0 0 38px;
  height:38px;
}

.ddei_editor_toolbox .searchbox .group {
  background-color: #F2F2F7;
  width:93%;
  margin:auto 4px auto 7px;
  display:flex;
  height:32px;
  border-radius: 4px;
}


.ddei_editor_toolbox .searchbox .group .input {
  flex: 1 1 140px;
  height:28px;
  border:transparent;
  outline:none;
  font-size:13px;
  margin:auto 0px auto 5px;
  background:transparent;
}

.ddei_editor_toolbox .searchbox .group .button {
  flex: 0 0 42px;
  height: 23px;
  background-color:#017fff;
  font-size:14px;
  color:white;
  margin:auto 7px auto 5px;
  border-radius: 4px;
}
.ddei_editor_toolbox .searchbox .group .button:hover {
  background-color:#0177f0;
}


/**以下为控件分组以及控件框 */

.ddei_editor_toolbox .groups{
  text-align: center;
  background: rgb(254,254,255);
  height:calc(100vh - 310px);
  overflow-y:auto;
  display:flex;
  flex-flow:column;
}

.ddei_editor_toolbox .groups::-webkit-scrollbar {
  width:6px;
  height:6px;
}
/*正常情况下滑块的样式*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-thumb {
  background-color:rgba(0,0,0,.05);
  border-radius:6px;
  -webkit-box-shadow:inset1px1px0rgba(0,0,0,.1);
}
/*鼠标悬浮在该类指向的控件上时滑块的样式*/
.ddei_editor_toolbox .groups:hover::-webkit-scrollbar-thumb {
  background-color:rgba(0,0,0,.2);
  border-radius:6px;
  -webkit-box-shadow:inset1px1px0rgba(0,0,0,.1);
}
/*鼠标悬浮在滑块上时滑块的样式*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-thumb:hover {
  background-color:rgba(0,0,0,.4);
  -webkit-box-shadow:inset1px1px0rgba(0,0,0,.1);
}
/*正常时候的主干部分*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-track {
  border-radius:6px;
  -webkit-box-shadow:inset006pxrgba(0,0,0,0);
  background-color:white;
}
/*鼠标悬浮在滚动条上的主干部分*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-track:hover {
  -webkit-box-shadow:inset006pxrgba(0,0,0,.4);
  background-color:rgba(0,0,0,.01);
}



.ddei_editor_toolbox .groups .group {
  text-align: center;
}

.ddei_editor_toolbox .groups .group .box{
  display: flex;
  height: 40px;
  background-color:rgb(254,254,254);
  user-select: none;
  border-radius: 4px;
}
.ddei_editor_toolbox .groups .group .expanded{
  background-color:rgb(240,240,240)
}

.ddei_editor_toolbox .groups .group .box:hover{
  background-color:rgb(244,244,244)
}
.ddei_editor_toolbox .groups .group .box:active{
  background-color:rgb(240,240,240)
}

.ddei_editor_toolbox .groups .group .box .expand{
  flex: 0 0 9px;
  margin:auto 7px auto 7px;
  width:9px;
  height:9px;
}


.ddei_editor_toolbox .groups .group .box .title{
  flex: 1;
  font-size: 13px;
  text-align: left;
  margin:auto
}
.ddei_editor_toolbox .groups .group .box .close{
  flex: 0 0 12px;
  margin:auto;
  width:12px;
  height:12px;
  margin:auto 7px auto 7px;
}

.ddei_editor_toolbox .groups .group .box .close:hover{
  background-color:rgb(200,200,200)
}

.ddei_editor_toolbox .groups .group .item_panel{
  display:flex;
  flex-flow:row wrap;
  background: rgb(254,254,254);
  margin-bottom:5px;
}

.ddei_editor_toolbox .groups .group .item_panel .item{
  flex: 0 0 60px !important;
  height: 66px;
  width:60px;
  margin-top: 10px;
  display:flex;
  flex-flow: column;
  border-radius: 4px;
}

.ddei_editor_toolbox .groups .group .item_panel .item:hover{
  background-color:rgb(244,244,244);
  cursor:all-scroll
}

.ddei_editor_toolbox .groups .group .item_panel .item .text{
  font-size:12px;
  transform: scale(0.8);
  margin-top: -5px;
  white-space: nowrap;
  text-align: center;
}

.ddei_editor_toolbox .groups .group .item_panel .item .icon{
  width:50px;
  white-space: nowrap;
  margin:auto;
  object-fit:none;
}

</style>
