
<template>
  <div v-show="selectedModels?.size > 0" :id="dialogId" class="canvas_quick_dialog">
    <div v-if="operateState==50" class="content">
      快捷编辑
    </div>
    <div v-if="operateState!=50 && allLine" class="content">
      全是线
    </div>
     <div v-if="operateState!=50 && !allLine && selectedModels?.size == 1" class="content">
      <div class="panel1">
        <div class="panel1-content-1">
          <QBTFontFamily></QBTFontFamily>
        </div>
        <div class="panel1-content-2">
          <QBTFontSize></QBTFontSize>
        </div>
        <div class="panel1-content-3">
          <QBTEditBox selectedValue="1" attrCode="textStyle.bold" img="icon-a-ziyuan461">
          </QBTEditBox>
        </div>
         <div class="panel1-content-3">
          <QBTEditBox selectedValue="1" attrCode="textStyle.italic" img="icon-a-ziyuan459">
          </QBTEditBox>
         </div>
        <div class="panel1-content-3">
            <QBTEditBox selectedValue="1" :supportQuickEdit="false" attrCode="textStyle.align" img="icon-a-ziyuan440"
             :unSelectValue="2">
          </QBTEditBox>
        </div>
        <div class="panel1-split-3 panel1-content-4 panel1-split-4">
          <QBTEditColor attrCode="textStyle.bgcolor" img="icon-a-ziyuan452"></QBTEditColor>
        </div>
        <div class="panel1-content-4 ">
           <QBTEditColor attrCode="font.color" img="icon-a-ziyuan463"></QBTEditColor>
        </div>
      </div>
      <div class="panel2"
          title="格式刷" @click="execBrushAction($event)">
        <div class="panel2-content">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan485"></use>
          </svg>
          <div class="text">格式刷</div>
        </div>
      </div>
      <div class="panel3">
         <div class="panel3-content i1">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan94"></use>
            </svg>
            <div class="text">样式</div>
         </div>
         <div class="panel3-content i2">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan419"></use>
            </svg>
            <div class="text">填充</div>
         </div>
         <div class="panel3-content i3">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-border-pencil"></use>
            </svg>
            <div class="text">线条</div>
         </div>
      </div>
      <div class="panel4">
         <div class="panel4-content" @click="doPush('top')">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan435"></use>
            </svg>
            <div class="text">置于顶层</div>
         </div>
         <div class="panel4-content" @click="doPush('bottom')">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan436"></use>
            </svg>
            <div class="text">置于底层</div>
         </div>
         
      </div>
    </div>
    <div v-if="operateState!=50 && !allLine && selectedModels?.size > 1" class="content">
      多个控件
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import QBTFontFamily from "../topmenu/quickbox/tools/QBTFontFamily.vue";
import QBTFontSize from"../topmenu/quickbox/tools/QBTFontSize.vue";
import QBTEditBox from"../topmenu/quickbox/tools/QBTEditBox.vue";
import QBTEditColor from"../topmenu/quickbox/tools/QBTEditColor.vue";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type.js";
import DDeiEnumKeyActionInst from "../js/enums/key-action-inst.js";

export default {
  name: "DDei-Editor-Canvas-Quick-Pop",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'canvas_quick_dialog',
      //当前编辑器
      editor: null,
      //当前选中的控件
      selectedModels:null,
      //当前操作
      operateState:null,
      //全部都是线条
      allLine:false
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let stage = this.editor.ddInstance.stage
    if(stage){
      this.selectedModels = stage.selectedModels
      this.operateState = stage.render.operateState
      if(this.selectedModels?.size > 0){
        let allLine = true
        this.selectedModels.forEach(model => {
          if(model.baseModelType != 'DDeiLine'){
            allLine = false
          }
        });
        this.allLine = allLine
      }
    }
  },
  methods: {
    //修改图形层次
    doPush(v) {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      let stageRender = stage?.render;
      let optContainer = stageRender?.currentOperateContainer;
      if (optContainer) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelPush, {
          container: optContainer,
          type: v,
        });
        //渲染图形
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
      }
    },

     /**
     * 执行格式刷
     */
    execBrushAction(evt: Event) {
      DDeiEnumKeyActionInst.BrushData.action(evt, this.editor.ddInstance, this.editor);
    },
  }
};
</script>

<style lang="less" scoped>
/**以下是快捷样式编辑的弹出框 */
.canvas_quick_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  position: absolute;
  background-color: white;
  height: 80px;
  z-index: 999;
  user-select: none;
  color:black;

  .content {
    width: 100%;
    max-height: 70px;
    overflow-y: hidden;
    display:flex;
    justify-content: start;
    align-items: center;
    

    .panel1{
      margin-top:20px;
      width:170px;
      height:70px;
      border-right:1px solid grey;

      .panel1-content-1{
        width:100px;
        margin-left:10px;
        float:left;
      }
      .panel1-content-2{
        width:50px;
        float:left;
      }
      .panel1-content-3{
        width:30px;
        padding-left:10px;
        margin-top:10px;
        float:left;
      }
      .panel1-split-3{
        margin-left:15px;
      }

      .panel1-content-4{
        padding:0px 5px;
        margin-top:12px;
        float:left;
        border-radius: 2px;
      }
      .panel1-split-4{
        margin-right:5px;
      }
      .panel1-content-4:hover{
        background-color: #e6e6e6;
        cursor:pointer
      }
    }

    .panel2{
      margin-top: 10px;
      width:60px;
      height:60px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-right:1px solid grey;
      
      .panel2-content{
        flex:1;
        border-radius: 4px;
      }
      .panel2-content:hover{
        background-color: #e6e6e6;
        cursor:pointer
      }
    }

    .panel3{
      margin-top: 10px;
      width:150px;
      height:60px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-right:1px solid grey;

      .panel3-content{
        flex:1;
        border-radius: 4px;
      }
      .panel3-content:hover{
        background-color: #e6e6e6;
        cursor:pointer
      }

      .i1{
        .icon{
          font-size:20px;
          margin-top:5px;
          margin-bottom:2px;
        }
      }

      .i2{
        .icon{
          margin-top:1px;
          margin-bottom:2px;
        }
      }
      .i3{
        .icon{
          margin-top:-2px;
          font-size:32px;
        }
      }
    }

    .panel4{
      margin-top: 10px;
      width:150px;
      height:60px;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      .panel4-content{
        flex:1;
        .icon{
          margin-top:2px;
          margin-bottom:1px;
        }

        border-radius: 4px;
      }


      .panel4-content:hover{
        background-color: #e6e6e6;
        cursor:pointer
      }
      
    }

  }
}
</style>
