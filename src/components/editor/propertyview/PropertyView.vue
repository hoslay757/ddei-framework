<template>
  <div id="ddei_editor_propertyview" class="ddei_editor_propertyview">
    <div class="ddei_editor_pv_group_view">
      <div class="ddei_editor_pv_group_view_expandbox" @click="hidOrShowPV" >
        <img class="ddei_editor_pv_group_view_expandbox_img" :src="editor?.rightWidth > 38 ? expandRightImg : expandLeftImg" />
      </div>
      <div class="ddei_editor_pv_group_view_items" >
        <div :class="topGroup.selected ? 'ddei_editor_pv_group_view_items_item_selected':'ddei_editor_pv_group_view_items_item'" v-for="topGroup in topGroups" v-show="!topGroup?.empty" @click="changeTopGroup(topGroup)" :title="topGroup.name">
          <img class="img" :src="topGroup.img" />
        </div>
      </div>
    </div>

    <div class="ddei_editor_pv_subgroup_view" v-show="editor?.rightWidth > 38">
      <div class="ddei_editor_pv_subgroup_view_tab_title">
        <div :class="currentTopGroup?.groups.length > 1 && subGroup.selected? 'ddei_editor_pv_subgroup_view_tab_title_item_selected' : 'ddei_editor_pv_subgroup_view_tab_title_item'" 
          v-for="subGroup in currentTopGroup?.groups" :title="subGroup.name" 
          @click="changeSubGroup(subGroup)">{{ subGroup.name }}</div>
      </div>
      <div class="ddei_editor_pv_subgroup_view_tab_panel" :style="{ height: 'calc(100vh - ' + (editor?.topHeight + editor?.bottomHeight + 40) + 'px' }">
        <div :class="attrDefine.display == 'column' ? 'ddei_editor_pv_subgroup_view_tab_panel_editors_column' : 'ddei_editor_pv_subgroup_view_tab_panel_editors_row'"
         v-for="attrDefine in currentSubGroup?.children" :title="attrDefine.desc">
          <div class="title" v-if="!attrDefine.hiddenTitle">{{ attrDefine.name }}<span v-if="attrDefine.notNull">*</span>：</div>
          <div class="editor">
            <div v-if="attrDefine.controlType == 'text'"  :class="{ 'ddei_pv_editor_text': true, 'ddei_pv_editor_text_disabled': attrDefine.readonly }">
                <input type="input" v-model="attrDefine.value" :disabled="attrDefine.readonly" :placeholder="attrDefine.defaultValue"/>
            </div>
            <div v-if="attrDefine.controlType == 'range'"  :class="{ 'ddei_pv_editor_range': true, 'ddei_pv_editor_range_disabled': attrDefine.readonly }">
              <input type="range" :step="attrDefine.step" class="range" :min="attrDefine.min" :max="attrDefine.max" v-model="attrDefine.value" :disabled="attrDefine.readonly"/>
              <div class="textinput">
                <input type="number"  :step="attrDefine.step" :min="attrDefine.min" :max="attrDefine.max" v-model="attrDefine.value" :disabled="attrDefine.readonly" :placeholder="attrDefine.defaultValue"/>
              </div>
            </div>
            <div v-if="attrDefine.controlType == 'color'"  :class="{ 'ddei_pv_editor_color': true, 'ddei_pv_editor_color_disabled': attrDefine.readonly }">
              <input type="color" :step="attrDefine.step" class="color" v-model="attrDefine.value" :disabled="attrDefine.readonly"/>
              <div class="textinput">
                <input type="text" v-model="attrDefine.value" :disabled="attrDefine.readonly" :placeholder="attrDefine.defaultValue"/>
              </div>
            </div>
            <div v-if="attrDefine.controlType == 'radio'"  :class="{ 'ddei_pv_editor_radio': true, 'ddei_pv_editor_radio_disabled': attrDefine.readonly }">
              <div class="itembox" v-for="item in getDataSource(attrDefine)" @click="checkRadioValue($event)">
                <input type="radio" :disabled="attrDefine.readonly" :name="attrDefine.id" :value="item.value" :checked="item.value == attrDefine.value"/><div>{{ item.text }}</div>
              </div>
            </div>
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
import DDeiEditorArrtibute from '../js/attribute/editor-attribute'
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
      selectedModels:null,
      //属性定义的引用
      controlDefine :null,
      //当前的顶级group
      topGroups:null,
      currentTopGroup: null,
      currentSubGroup: null,
      //当前存在的解析后的数据源
      cacheDataSource:null
    };
  },
  computed: {
    
  },
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.ddInstance.stage.selectedModels', function (newVal, oldVal) {
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
                //记录备选值
                firstAttrDefine.diffValues.push(curAttrValue);
              }
            }
            
          });
        }
        //清除不同的属性
        this.deleteAttrDefineByKeys(firstControlDefine,removeKeys);
        //同步引用关系
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.styles);
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.datas);
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.events);
        let layerTopGroup = {name:"图层",img: new URL('../icons/icon-layers.png', import.meta.url).href,groups:[{}]};
        firstControlDefine.styles.img = new URL('../icons/icon-fill.png', import.meta.url).href;
        firstControlDefine.datas.img = new URL('../icons/icon-data.png', import.meta.url).href;
        firstControlDefine.events.img = new URL('../icons/icon-event.png', import.meta.url).href;
        let topGroups = [firstControlDefine?.styles, firstControlDefine?.datas, firstControlDefine?.events, layerTopGroup];
        //上一次编辑的名称
        let upName = this.currentTopGroup?.name;
        let currentTopGroup = null;
        if(upName){
          if(!firstControlDefine?.styles?.empty && upName == firstControlDefine?.styles?.name){
            firstControlDefine.styles.selected = true;
            currentTopGroup = firstControlDefine.styles
          } else if (!firstControlDefine?.datas?.empty && upName == firstControlDefine?.datas?.name) {
            firstControlDefine.datas.selected = true;
            currentTopGroup = firstControlDefine.datas
          } else if (!firstControlDefine?.events?.empty && upName == firstControlDefine?.events?.name) {
            firstControlDefine.events.selected = true;
            currentTopGroup = firstControlDefine.events
          } else if (!layerTopGroup?.empty && upName == layerTopGroup?.name) {
            layerTopGroup.selected = true;
            currentTopGroup = layerTopGroup
          }
        }
        if(!currentTopGroup){
          if(!firstControlDefine?.styles?.empty){
            firstControlDefine.styles.selected = true;
           currentTopGroup = firstControlDefine.styles
          }else if (!firstControlDefine?.datas?.empty) {
            firstControlDefine.datas.selected = true;
            currentTopGroup = firstControlDefine.datas
          }else if (!firstControlDefine?.events?.empty) {
            firstControlDefine.events.selected = true;
            currentTopGroup = firstControlDefine.events
          }else if(!layerTopGroup.empty){
            layerTopGroup.selected = true;
            currentTopGroup = layerTopGroup
          }
        }
        this.currentTopGroup = currentTopGroup;
        this.controlDefine = firstControlDefine;
        this.topGroups = topGroups;
      }
    });
   },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    /**
     * 选中radio
     */
    checkRadioValue(evt:Event){
      let targetElement = evt.target;
      if(targetElement.tagName == 'INPUT'){
        targetElement.checked = true;
      }else if(targetElement.tagName == "DIV" && targetElement.className == 'itembox'){
        targetElement.children[0].checked = true;
      } else if (targetElement.tagName == "DIV") {
        targetElement.parentElement.children[0].checked = true;
      }
    },
    /**
     * 获取数据源数据
     */
    getDataSource(attrDefine) {
      if(attrDefine.dataSource){
        return attrDefine.dataSource
      }
      return [];
    },
    /**
     * 展开顶级属性，收起其他顶级层级
     */
    changeTopGroup(pData) {
      if (this.currentTopGroup != pData) {
        this.topGroups.forEach(group => {
          if (group != pData) {
            group.selected = false;
          }
        });

        pData.selected = true;
        this.currentTopGroup = pData;
      }
    },

    /**
     * 展开次级属性，收起其他次级层级
     */
    changeSubGroup(pData) {
      if (this.currentSubGroup != pData) {
        this.currentTopGroup.groups.forEach(group => {
          if (group != pData) {
            group.selected = false;
          }
        });

        pData.selected = true;
        this.currentSubGroup = pData;
      }
    },

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

    deleteGroupAttrsByKey(pData:object,key:string):void{
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


    syncAttrsToGroup(firstControlDefine: object,pData:object):void {
      let newChildren = []
      if (pData?.groups?.length > 0) {
         pData?.groups?.forEach(group => {
          let newGroupChildren = [];
           group.children?.forEach((curAttr:DDeiEditorArrtibute) => {
            let mapObj = firstControlDefine?.attrDefineMap?.get(curAttr.code)
            if(mapObj){
              newGroupChildren.push(mapObj);
              newChildren.push(mapObj);
            }
           });
           group.children = newGroupChildren;
           if (newGroupChildren.length == 0) {
            group.empty = true;
          }
        });
      }
      pData.children = newChildren;
      if(newChildren.length == 0){
        pData.empty = true;
      }
      
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


/**以下为属性编辑器 */

.ddei_editor_pv_subgroup_view_tab_panel {
  text-align: center;
  background: rgb(254, 254, 255);
  overflow-y: auto;
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
  color:black;
  font-size:13px;
  font-family:"Microsoft YaHei";
}

.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/*正常情况下滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, .05);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, .1);
}

/*鼠标悬浮在该类指向的控件上时滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, .2);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, .1);
}

/*鼠标悬浮在滑块上时滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, .4);
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, .1);
}

/*正常时候的主干部分*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-track {
  border-radius: 6px;
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0);
  background-color: white;
}

/*鼠标悬浮在滚动条上的主干部分*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-track:hover {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, .4);
  background-color: rgba(0, 0, 0, .01);
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column{
  display:flex;
  flex-flow: column;
  margin-top:10px;
  margin-bottom:10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .title{
  background: rgb(254, 254, 255);
  text-align:left;
  padding-left:10px;
  margin:auto 0;
  margin-bottom:5px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .editor{
  text-align:left;
  padding-left:10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row{
  display:flex;
  margin-top:10px;
  margin-bottom:10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .title{
  text-align:left;
  padding-left:10px;
  flex: 0 0 100px;
  white-space: nowrap; /*文字不换行*/
  overflow: hidden; /*超出部分隐藏*/
  text-overflow: ellipsis; /*溢出部分用省略号表示*/
  margin:auto 0;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .editor{
  text-align:center;
  flex:1;
}


.ddei_editor_pv_subgroup_view_tab_panel span{
  color:red;
}

/**以下为text属性编辑器 */
.ddei_pv_editor_text{
  border-radius: 4px;
  border: 0.5px solid rgb(210,210,210);
  height: 24px;
  margin-right:10px;
  padding:0 5px;
}
.ddei_pv_editor_text_disabled{
  background-color:rgb(210,210,210) !important;
}
.ddei_pv_editor_text_disabled:hover{
  border: 1px solid grey !important;
}

.ddei_pv_editor_text:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_text input{
  height:20px;
  width:100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: 1px 0;
  background: transparent;
}



/**以下为range属性编辑器 */
.ddei_pv_editor_range{
  border-radius: 4px;
  height: 24px;
  margin-right:10px;
  display:flex;
}

.ddei_pv_editor_range .range{
  height:6px;
  width:60%;
  border: transparent;
  outline: none;
  background: transparent;
  flex:1;
  margin:auto;
}

.ddei_pv_editor_range_disabled .range{
  height:6px;
  width:60%;
  border: transparent;
  outline: none;
  background-color:rgb(210,210,210) !important;
  flex:1;
  margin:auto;
}

.ddei_pv_editor_range .textinput{
  flex:0 0 70px;
  margin-left:10px;
  padding-left:5px;
  padding-right:5px;
  border: 0.5px solid rgb(210,210,210);
  border-radius: 4px;
}

.ddei_pv_editor_range .textinput:hover{
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_range_disabled .textinput{
  flex:0 0 70px;
  margin-left:10px;
  padding-left:5px;
  padding-right:5px;
  background-color: rgb(210,210,210);
  border: 0.5px solid rgb(210,210,210);
  border-radius: 4px;
}

.ddei_pv_editor_range_disabled .textinput:hover{
  border: 1px solid grey !important;
  box-sizing: border-box;
}


.ddei_pv_editor_range .textinput input{
  width:100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: 0px 2%;
  background: transparent;
  
}


/**以下为color属性编辑器 */
.ddei_pv_editor_color{
  border-radius: 4px;
  height: 24px;
  margin-right:10px;
  display:flex;
}

.ddei_pv_editor_color .color{
  height:24px;
  width:60%;
  border: transparent;
  outline: none;
  background: transparent;
  flex:1;
  margin:auto;
}


.ddei_pv_editor_color_disabled .color{
  height:24px;
  width:60%;
  border: transparent;
  outline: none;
  background-color:rgb(210,210,210) !important;
  flex:1;
  margin:auto;
}

.ddei_pv_editor_color .textinput{
  flex:0 0 70px;
  margin-left:10px;
  padding-left:5px;
  padding-right:5px;
  border: 0.5px solid rgb(210,210,210);
  border-radius: 4px;
}

.ddei_pv_editor_color .textinput:hover{
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_color_disabled .textinput{
  flex:0 0 70px;
  margin-left:10px;
  padding-left:5px;
  padding-right:5px;
  background-color: rgb(210,210,210);
  border: 0.5px solid rgb(210,210,210);
  border-radius: 4px;
}

.ddei_pv_editor_color_disabled .textinput:hover{
  border: 1px solid grey !important;
  box-sizing: border-box;
}


.ddei_pv_editor_color .textinput input{
  width:100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: 0px 2%;
  background: transparent;
  
}



/**以下为radio属性编辑器 */
.ddei_pv_editor_radio{
  border-radius: 4px;
  margin-right:10px;
}
.ddei_pv_editor_radio_disabled{
  background-color:rgb(210,210,210) !important;
}

.ddei_pv_editor_radio .itembox{
  height:24px;
  outline: none;
  font-size: 13px;
  margin: 0;
  padding-top:2px;
  background: transparent;
}





.ddei_pv_editor_radio .itembox input{
  float:left;
  width:14px;
  height:14px;
  margin-top:3px;
}

.ddei_pv_editor_radio .itembox div{
  float:left;
  margin-left:15px;
}


.ddei_editor_pv_subgroup_view_tab_panel_editors_row .itembox{
  float:left;
  margin-right:10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .itembox{
  margin-top:10px;
}



.ddei_editor_pv_subgroup_view_tab_panel_editors_row .itembox div{
  float:left;
  margin-left:5px;
}


</style>
