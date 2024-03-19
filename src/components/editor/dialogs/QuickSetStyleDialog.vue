<template>
  <div id="quick_setstyle_dialog" class="quick_setstyle_dialog">
    <div class="content">
      <div class="title">快捷设置样式</div>
      <div class="group">
        <div class="group_content">
          <div class="item" :style="{'border-radius':data.round?data.round+'px':'','border-color':data.border?data.border:'transparent','background-color':data.fill?data.fill:'transparent'}" v-for="data in ds" @click="select(data)" @dblclick="ok(data)">
            文本
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorUtil from "../js/util/editor-util.js";
import DDeiUtil from "@/components/framework/js/util.js";

export default {
  name: "DDei-Editor-Dialog-SetStyle",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'quick_setstyle_dialog',
      //当前编辑器
      editor: null,
      ds:[
        {border:DDeiUtil.rgb2hex("rgb(78,215,197)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(70,125,254)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(66,185,198)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(255,126,121)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(255,204,83)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},


        {border:DDeiUtil.rgb2hex("rgb(78,215,197)"),fill:DDeiUtil.rgb2hex("rgb(233,248,245)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(70,125,254)"),fill:DDeiUtil.rgb2hex("rgb(233,236,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(66,185,198)"),fill:DDeiUtil.rgb2hex("rgb(232,233,245)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(255,126,121)"),fill:DDeiUtil.rgb2hex("rgb(255,236,236)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(255,204,83)"),fill:DDeiUtil.rgb2hex("rgb(255,246,233)"),round:4},

        {fill:DDeiUtil.rgb2hex("rgb(233,248,245)"),round:4},
        {fill:DDeiUtil.rgb2hex("rgb(233,236,255)"),round:4},
        {fill:DDeiUtil.rgb2hex("rgb(232,233,245)"),round:4},
        {fill:DDeiUtil.rgb2hex("rgb(255,236,236)"),round:4},
        {fill:DDeiUtil.rgb2hex("rgb(255,246,233)"),round:4},

        {border:DDeiUtil.rgb2hex("rgb(68,189,173)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(61,109,224)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(66,74,174)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(225,110,106)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},
        {border:DDeiUtil.rgb2hex("rgb(225,179,72)"),fill:DDeiUtil.rgb2hex("rgb(255,255,255)"),round:4},    
        
      ]
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    
  },
  methods: {
    /**
     * 修改样式
     */
    select(data) {
      if (this.editor.currentControlDefine) {
        let controlDefine = this.editor.currentControlDefine;
        if (controlDefine) {
          let selectedModels = this.editor.ddInstance.stage.selectedModels
          selectedModels?.forEach(model => {
            if(data.border){
              let borderType = controlDefine.attrDefineMap.get("border.type");
              borderType.value = 1
              let borderColor = controlDefine.attrDefineMap.get("border.color");
              borderColor.value = data.border
              let paths = ["border.color"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: data.border },
                null,
                true
              );
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: ["border.type"], value: 1 },
                null,
                true
              );
            }else{
              let borderType = controlDefine.attrDefineMap.get("border.type");
              borderType.value = 0
              let paths = ["border.type"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: 0},
                null,
                true
              );
            }

            if(data.fill){
              let fillType = controlDefine.attrDefineMap.get("fill.type");
              fillType.value = 1
              let fillColor = controlDefine.attrDefineMap.get("fill.color");
              fillColor.value = data.fill
              let paths = ["fill.color"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: data.fill },
                null,
                true
              );
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: ["fill.type"], value: 1 },
                null,
                true
              );
            }else{
              let fillType = controlDefine.attrDefineMap.get("fill.type");
              fillType.value = 0
              let paths = ["fill.type"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: 0},
                null,
                true
              );
            }
            
            if(data.round){
              let borderRound = controlDefine.attrDefineMap.get("borderRound");
              borderRound.value = data.round
              let paths = ["border.round"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: data.round},
                null,
                true
              );
            }else{
              let borderRound = controlDefine.attrDefineMap.get("borderRound");
              borderRound.value = 0
              let paths = ["border.round"]
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeValue,
                { mids: [model.id], paths: paths, value: 0},
                null,
                true
              );
            }
            
         
    
            
          });
             
            
          
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
          this.editor.bus.executeAll();
        }
      }
    },

    /**
     * 修改文本对齐方式
     */
    ok(data) {
      this.select(data)
      DDeiEditorUtil.closeDialog("quick_setstyle_dialog")
    },

  }
};
</script>

<style lang="less" scoped>
.quick_setstyle_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 440px;
  position: absolute;
  background-color: white;
  height: 230px;
  z-index: 999;

  .content {
    width: 100%;
    max-height: 230px;
    overflow-y: auto;
    user-select: none;

    .title {
      color: black;
      font-weight: bold;
      flex: 0 0 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 17px;
    }

    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;
      padding:10px;
      border-top: 1px solid rgb(240, 240, 240);

      .group_content {
        width: 95%;
        display: grid;
        gap: 5px;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;


        .item {
          outline: none;
          width: 80px;
          height: 40px;
          margin: auto;
          background: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border:1px solid black;
        }

       

        .item:hover {
          background-color: rgb(233, 233, 238);
        }

        .text {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          width: 100%;
        }

        .icon {
          font-size: 28px;
        }

      }
    }
  }
}
</style>
