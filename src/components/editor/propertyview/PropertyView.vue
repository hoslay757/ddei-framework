<template>
  <div id="ddei_editor_propertyview" class="ddei_editor_propertyview">
    <div class="ddei_editor_pv_group_view">
      <div class="ddei_editor_pv_group_view_expandbox" @click="hidOrShowPV" >
        <img class="ddei_editor_pv_group_view_expandbox_img" :src="editor?.rightWidth > 38 ? expandRightImg : expandLeftImg" />
      </div>
      <div class="ddei_editor_pv_group_view_items" >
        <div class="ddei_editor_pv_group_view_items_item" title="样式">
          <img draggable="false" class="img" src="../icons/icon-fill.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item_selected" title="数据">
          <img draggable="false" class="img" src="../icons/icon-data.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item" title="事件">
          <img draggable="false" class="img" src="../icons/icon-event.png" />
        </div>
        <div class="ddei_editor_pv_group_view_items_item" title="图层">
          <img draggable="false" class="img" src="../icons/icon-layers.png" />
        </div>
      </div>
    </div>

    <div class="ddei_editor_pv_subgroup_view" v-show="editor?.rightWidth > 38">
      <div class="ddei_editor_pv_subgroup_view_tab_title">
        <div class="ddei_editor_pv_subgroup_view_tab_title_item_selected" title="填充颜色">填充</div>
        <div class="ddei_editor_pv_subgroup_view_tab_title_item" title="线条">线条</div>
        <div class="ddei_editor_pv_subgroup_view_tab_title_item" title="文本">文本</div>
      </div>
      <div class="ddei_editor_pv_subgroup_view_tab_panel">
        <div class="ddei_editor_pv_subgroup_view_tab_panel_editors">
          <div class="ddei_editor_pv_subgroup_view_tab_panel_editors_item">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../js/editor';
import { controlOriginDefinies } from "../configs/toolgroup"
import { cloneDeep } from 'lodash'
import DDeiUtil from '../../framework/js/util';
import DDeiAbstractShape from '../../framework/js/models/shape';
export default {
  name: "DDei-Editor-PropertyView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      expandLeftImg: new URL('../icons/icon-expand-left.png', import.meta.url).href,
      expandRightImg: new URL('../icons/icon-expand-right.png', import.meta.url).href,
      //当前被选中控件的引用
      selectedModels:null
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.ddInstance.stage.selectedModels', function (newVal, oldVal) {
      console.log("触发")
      if(newVal && newVal.size > 0){
        newVal.forEach(element => {
          console.log(element.id)
        });
      }else{
        console.log("没有控件")
      }
      this.selectedModels = newVal;
      if(this.selectedModels?.size > 0){
        //获取当前所有组件的公共属性定义
        let models: DDeiAbstractShape[] = Array.from(this.selectedModels.values());
        //获取第一个组件及其定义
        let firstModel: DDeiAbstractShape = cloneDeep(models[0]);
        let firstControlDefine = cloneDeep(controlOriginDefinies.get(firstModel.modelCode));
        //如果同时有多个组件被选中，则以第一个组件为基准，对属性定义进行过滤，属性值相同则采用相同值，属性值不同采用空值
        let removeKeys = [];
        for(let i = 0;i < models.length;i++){
          let curModel:DDeiAbstractShape = models[i];
          let curDefine = controlOriginDefinies.get(curModel.modelCode);
          
          firstControlDefine.attrDefineMap.forEach((firstAttrDefine,attrKey) => {
            //key不存在
            if(!curDefine.attrDefineMap.has(attrKey)){
              removeKeys.push(attrKey);
            }
            //隐藏
            else if(!firstAttrDefine.visiable){
              removeKeys.push(attrKey);
            }
            //key存在，进一步比较值
            else{
              //当前属性的定义
              let curAttrDefine = curDefine.attrDefineMap.get(attrKey)
              //记录属性值
              if (i == 0) {
                firstAttrDefine.value = DDeiUtil.getDataByPathList(firstModel, curAttrDefine.code, curAttrDefine.mapping);
              }  
              //根据属性定义，从model获取值
              let curAttrValue = DDeiUtil.getDataByPathList(curModel, curAttrDefine.code, curAttrDefine.mapping);
              if(firstAttrDefine.value != curAttrValue){
                //值不相同
                removeKeys.push(attrKey);
                //记录备选值
                firstAttrDefine.diffValues.push(curAttrValue);
              }
            }
            
          });
        }
        //清除不同的属性
        this.deleteAttrDefineByKeys(firstControlDefine,removeKeys);
        //TODO 同步引用关系
      }
    });
   },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    /**
     * 移除属性定义中的属性
     * @param firstControlDefine 
     * @param removeKeys 
     */
    deleteAttrDefineByKeys(firstControlDefine:object,removeKeys:string[]){
      //移除属性
      removeKeys.forEach(item => {
        firstControlDefine.attrDefineMap.delete(item)
        this.deleteGroupAttrsByKey(firstControlDefine.styles, item);
        this.deleteGroupAttrsByKey(firstControlDefine.datas, item);
        this.deleteGroupAttrsByKey(firstControlDefine.events, item);
      })
    },

    deleteGroupAttrsByKey(pData,key:string):void{
      let rmglist = [];
      pData.groups.forEach(group => {
        let rmlist = []
        for (let gci = 0; gci < group.children.length; gci++) {
          if (group.children[gci].code == key) {
            rmlist.push(group.children[gci])
          }
        }
        rmlist.forEach(rm => {
          let index = group.children.indexOf(rm);
          if (index > -1) {
            group.children.splice(index, 1);
          }
        })
        //如果group被清空，则删除group
        if (group.children.length == 0) {
          rmglist.push(group);
        }
      });
      rmglist.forEach(rmg => {
        let index = pData.groups.indexOf(rmg);
        if (index > -1) {
          pData.groups.splice(index, 1);
        }
      })
    },
    /**
     * 隐藏or展示属性编辑器
     */
    hidOrShowPV() {
      let rightWidth = this.editor.rightWidth;
      if(rightWidth > 38){
        let deltaX = this.editor.rightWidth - 38;
        let frameRightElement = document.getElementById("ddei_editor_frame_right");
        this.editor.rightWidth = 38;
        frameRightElement.style.flexBasis = "38px";
        //重新设置画布大小
        this.editor.middleWidth += deltaX;
      }else{
        let deltaX =  237;
        let frameRightElement = document.getElementById("ddei_editor_frame_right");
        this.editor.rightWidth = 275;
        frameRightElement.style.flexBasis = "275px";
        //重新设置画布大小
        this.editor.middleWidth -= deltaX;
      }
      this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
      
      this.editor.ddInstance.render.drawShape()
    }
  }
};
</script>

<style scoped>
.ddei_editor_propertyview {
  flex: 1;
  text-align: center;
  background: rgb(254, 254, 255);
  border: 1pt solid rgb(235, 235, 239);
  display: flex;
  user-select: none;
}

.ddei_editor_pv_group_view {
  flex: 0 0 36px;
  display: flex;
  flex-flow: column;
  border-right: 1pt solid rgb(235, 235, 239);
}

.ddei_editor_pv_group_view_expandbox {
  flex: 0 0 30px;
  display: inherit;
}

.ddei_editor_pv_group_view_expandbox:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_pv_group_view_expandbox_img {
  width: 34px;
  height: 26px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 1px;
  filter: brightness(60%)
}

.ddei_editor_pv_group_view_items {
  flex: 1;
  display: flex;
  flex-flow: column;
}

.ddei_editor_pv_group_view_items_item {
  flex: 0 0 36px;
  display: inherit;
}




.ddei_editor_pv_group_view_items_item .img {
  width: 32px;
  height: 32px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 3px;
}

.ddei_editor_pv_group_view_items_item_selected {
  flex: 0 0 36px;
  display: inherit;
  background: rgb(1, 126, 255);
}

.ddei_editor_pv_group_view_items_item_selected .img {
  width: 32px;
  height: 32px;
  padding: 4px 4px;
  margin-top: 2px;
  margin-left: 3px;
  filter: brightness(100)
}




.ddei_editor_pv_subgroup_view {
  flex: 1;
  display: flex;
  flex-flow: column;
}

.ddei_editor_pv_subgroup_view_tab_title {
  flex: 0 0 30px;
  display: flex;
  border-bottom: 1pt solid rgb(235, 235, 239);
  color: grey;
}

.ddei_editor_pv_subgroup_view_tab_title_item {
  flex: 1;
  text-align: center;
  line-height: normal;
  font-size: 15px;
  margin: auto;
  font-weight: bold;
}

.ddei_editor_pv_subgroup_view_tab_title_item_selected {
  flex: 1;
  text-align: center;
  line-height: normal;
  font-size: 15px;
  margin: auto;
  font-weight: bold;
  color: rgb(1, 126, 255);
}

.ddei_editor_pv_subgroup_view_tab_title_item:hover {
  color: rgb(1, 126, 255);
  cursor: pointer;
}
</style>
