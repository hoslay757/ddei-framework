<template>
  <div id="ddei_editor_propertyview" class="ddei_editor_propertyview" @mousedown="changeEditorFocus">
    <div class="ddei_editor_pv_group_view">
      <div class="ddei_editor_pv_group_view_expandbox" @click="hidOrShowPV">
        <img class="ddei_editor_pv_group_view_expandbox_img"
          :src="editor?.rightWidth > 38 ? expandRightImg : expandLeftImg" />
      </div>
      <div class="ddei_editor_pv_group_view_items">
        <div
          :class="topGroup.selected ? 'ddei_editor_pv_group_view_items_item_selected' : 'ddei_editor_pv_group_view_items_item'"
          v-for="topGroup in topGroups" v-show="!topGroup?.empty" @click="changeTopGroup(topGroup)"
          :title="topGroup.name">
          <img class="img" :src="topGroup.img" />
        </div>
      </div>
    </div>

    <div class="ddei_editor_pv_subgroup_view" v-show="editor?.rightWidth > 38">
      <div class="ddei_editor_pv_subgroup_view_tab_title">
        <div
          :class="currentTopGroup?.groups.length > 1 && subGroup.selected ? 'ddei_editor_pv_subgroup_view_tab_title_item_selected' : 'ddei_editor_pv_subgroup_view_tab_title_item'"
          v-for="subGroup in currentTopGroup?.groups" :title="subGroup.name" @mouseup="changeSubGroup(subGroup)">{{
            subGroup.name }}</div>
      </div>
      <div class="ddei_editor_pv_subgroup_view_tab_panel"
        :style="{ height: 'calc(100vh - ' + (editor?.topHeight + editor?.bottomHeight + 40) + 'px' }">
        <div
          :class="{ 'ddei_editor_pv_subgroup_view_tab_panel_editors_column': attrDefine.display == 'column', 'ddei_editor_pv_subgroup_view_tab_panel_editors_row': attrDefine.display != 'column', 'empty_value': attrDefine.value ? false : true }"
          v-for="attrDefine in currentSubGroup?.children" :title="attrDefine.desc">  
          <div class="title" v-if="!attrDefine.hiddenTitle && attrDefine?.visiable != false">{{ attrDefine.name }}<span v-if="attrDefine.notNull">*</span>：
          </div>
          <div class="editor" v-if="attrDefine.visiable != false">
            <PVTextEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh  && attrDefine?.visiable != false && attrDefine.controlType == 'text'"></PVTextEditor>
            <PVRangeEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'range'"></PVRangeEditor>
            <PVColorEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'color'"></PVColorEditor>
            <PVRadioEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'radio'"></PVRadioEditor>
            <PVFontSizeEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'font-size'">
            </PVFontSizeEditor>
            <PVAlignTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'align-type'">
            </PVAlignTypeEditor>
            <PVComboxEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'combox'">
            </PVComboxEditor>
            <PVBorderTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'border-type'">
              </PVBorderTypeEditor>
            <PVFillTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'fill-type'">
            </PVFillTypeEditor>
            <PVExCheckboxEditor :controlDefine="controlDefine" :attrDefine="attrDefine" v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'ex-checkbox'">
            </PVExCheckboxEditor>
            
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
import DDeiEditorState from '../js/enums/editor-state';
import PVTextEditor from './editors/PVTextEditor.vue'
import PVRangeEditor from './editors/PVRangeEditor.vue'
import PVColorEditor from './editors/PVColorEditor.vue'
import PVRadioEditor from './editors/PVRadioEditor.vue'
import PVFontSizeEditor from './editors/PVFontSizeEditor.vue'
import PVAlignTypeEditor from './editors/PVAlignTypeEditor.vue'
import PVComboxEditor from './editors/PVComboxEditor.vue'
import PVBorderTypeEditor from './editors/PVBorderTypeEditor.vue'
import PVFillTypeEditor from './editors/PVFillTypeEditor.vue'
import PVExCheckboxEditor from './editors/PVExCheckboxEditor.vue'
import ICONS from "../js/icon"
export default {
  name: "DDei-Editor-PropertyView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      expandLeftImg: ICONS['icon-expand-left'].default,
      expandRightImg: ICONS['icon-expand-right'].default,
      //当前被选中控件的引用
      selectedModels: null,
      //属性定义的引用
      controlDefine: null,
      //当前的顶级group
      topGroups: null,
      currentTopGroup: null,
      currentSubGroup: null,
      reFresh: true
    };
  },
  computed: {

  },
  watch: {
    currentSubGroup() {
      this.reFresh = false
      this.$nextTick(() => {
        this.reFresh = true
      })
    }
  },
  components: {
    PVTextEditor,
    PVRangeEditor,
    PVColorEditor,
    PVRadioEditor,
    PVFontSizeEditor,
    PVAlignTypeEditor,
    PVComboxEditor,
    PVBorderTypeEditor,
    PVFillTypeEditor,
    PVExCheckboxEditor
  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.ddInstance.stage.selectedModels', function (newVal, oldVal) {
      this.selectedModels = newVal;
      let models: DDeiAbstractShape[] = null;
      let firstModel: DDeiAbstractShape = null;
      if (this.selectedModels?.size > 0) {
        //获取当前所有组件的公共属性定义
        models = Array.from(this.selectedModels.values());
        firstModel = cloneDeep(models[0]);
      } else {
        //获取当前所有组件的公共属性定义
        models = [this.editor.ddInstance.stage];
        firstModel = models[0];
        this.selectedModels = models;
      }
      let firstControlDefine = cloneDeep(controlOriginDefinies.get(firstModel?.modelCode));
      //获取第一个组件及其定义
      if (firstControlDefine) {
        //如果同时有多个组件被选中，则以第一个组件为基准，对属性定义进行过滤，属性值相同则采用相同值，属性值不同采用空值
        let removeKeys = [];
        for (let i = 0; i < models.length; i++) {
          let curModel: DDeiAbstractShape = models[i];
          let curDefine = controlOriginDefinies.get(curModel.modelCode);

          firstControlDefine.attrDefineMap.forEach((firstAttrDefine, attrKey) => {
            //key不存在
            if (!curDefine.attrDefineMap.has(attrKey)) {
              removeKeys.push(attrKey);
            }
            //隐藏
            else if (!firstAttrDefine.visiable) {
              removeKeys.push(attrKey);
            }
            //key存在，进一步比较值
            else {
              //当前属性的定义
              let curAttrDefine = curDefine.attrDefineMap.get(attrKey)
              //记录属性值
              if (i == 0) {
                firstAttrDefine.value = DDeiUtil.getDataByPathList(firstModel, curAttrDefine.code, curAttrDefine.mapping);
                firstAttrDefine.model = firstModel;
              }
              //根据属性定义，从model获取值
              let curAttrValue = DDeiUtil.getDataByPathList(curModel, curAttrDefine.code, curAttrDefine.mapping);
              if (firstAttrDefine.value != curAttrValue) {
                //记录备选值
                firstAttrDefine.diffValues.push(curAttrValue);
              }
            }

          });
        }
        //清除不同的属性
        this.deleteAttrDefineByKeys(firstControlDefine, removeKeys);
        //同步引用关系
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.styles);
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.datas);
        this.syncAttrsToGroup(firstControlDefine, firstControlDefine.events);
        let layerTopGroup = { name: "图层", img: ICONS['icon-layers'].default, groups: [{}] };
        firstControlDefine.styles.img = ICONS['icon-fill'].default;
        firstControlDefine.datas.img = ICONS['icon-data'].default;
        firstControlDefine.events.img = ICONS['icon-event'].default;
        let topGroups = [firstControlDefine?.styles, firstControlDefine?.datas, firstControlDefine?.events, layerTopGroup];
        //上一次编辑的名称
        let upName = this.currentTopGroup?.name;
        let currentTopGroup = null;
        if (upName) {
          if (!firstControlDefine?.styles?.empty && upName == firstControlDefine?.styles?.name) {
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
        if (!currentTopGroup) {
          if (!firstControlDefine?.styles?.empty) {
            firstControlDefine.styles.selected = true;
            currentTopGroup = firstControlDefine.styles
          } else if (!firstControlDefine?.datas?.empty) {
            firstControlDefine.datas.selected = true;
            currentTopGroup = firstControlDefine.datas
          } else if (!firstControlDefine?.events?.empty) {
            firstControlDefine.events.selected = true;
            currentTopGroup = firstControlDefine.events
          } else if (!layerTopGroup.empty) {
            layerTopGroup.selected = true;
            currentTopGroup = layerTopGroup
          }
        }
        this.currentTopGroup = currentTopGroup;
        this.controlDefine = firstControlDefine;
        this.topGroups = topGroups;
        //上一次编辑的名称
        let upSubGroupName = this.currentSubGroup?.name;
        let currentSubGroup = null;
        if (upSubGroupName) {
          for (let sgi = 0; sgi < currentTopGroup?.groups.length; sgi++) {
            if (!currentTopGroup?.groups[sgi]?.empty && upSubGroupName == currentTopGroup?.groups[sgi]?.name) {
              currentSubGroup = currentTopGroup?.groups[sgi];
              break;
            }
          }
        }
        if (!currentSubGroup) {
          for (let sgi = 0; sgi < currentTopGroup?.groups.length; sgi++) {
            if (!currentTopGroup?.groups[sgi]?.empty) {
              currentSubGroup = currentTopGroup?.groups[sgi];
              break;
            }
          }
        }
        this.changeSubGroup(currentSubGroup);
      } else {
        //清除信息
        this.controlDefine = null;
        this.topGroups = null;
        this.currentTopGroup = null;
        this.currentSubGroup = null;
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

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
        //上一次编辑的名称
        let upSubGroupName = this.currentSubGroup?.name;
        let currentSubGroup = null;
        if (upSubGroupName) {
          for (let sgi = 0; sgi < pData?.groups.length; sgi++) {
            if (!pData?.groups[sgi]?.empty && upSubGroupName == pData?.groups[sgi]?.name) {
              currentSubGroup = pData?.groups[sgi];
              break;
            }
          }
        }
        if (!currentSubGroup) {
          for (let sgi = 0; sgi < pData?.groups.length; sgi++) {
            if (!pData?.groups[sgi]?.empty) {
              currentSubGroup = pData?.groups[sgi];
              break;
            }
          }
        }
        this.changeSubGroup(currentSubGroup);
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
      setTimeout(() => {
        this.$forceUpdate();
      }, 100);

    },

    /**
     * 移除属性定义中的属性
     * @param firstControlDefine 
     * @param removeKeys 
     */
    deleteAttrDefineByKeys(firstControlDefine: object, removeKeys: string[]) {
      //移除属性
      removeKeys.forEach(item => {
        firstControlDefine.attrDefineMap.delete(item)
        this.deleteGroupAttrsByKey(firstControlDefine.styles, item);
        this.deleteGroupAttrsByKey(firstControlDefine.datas, item);
        this.deleteGroupAttrsByKey(firstControlDefine.events, item);
      })

    },

    deleteGroupAttrsByKey(pData: object, key: string): void {
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


    syncAttrsToGroup(firstControlDefine: object, pData: object): void {
      let newChildren = []
      if (pData?.groups?.length > 0) {
        pData?.groups?.forEach(group => {
          let newGroupChildren = [];
          group.children?.forEach((curAttr: DDeiEditorArrtibute) => {
            let mapObj = firstControlDefine?.attrDefineMap?.get(curAttr.code)
            if (mapObj) {
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
      if (newChildren.length == 0) {
        pData.empty = true;
      }

    },

    /**
     * 隐藏or展示属性编辑器
     */
    hidOrShowPV() {
      let rightWidth = this.editor.rightWidth;
      if (rightWidth > 38) {
        let deltaX = this.editor.rightWidth - 38;
        let frameRightElement = document.getElementById("ddei_editor_frame_right");
        this.editor.rightWidth = 38;
        frameRightElement.style.flexBasis = "38px";
        //重新设置画布大小
        this.editor.middleWidth += deltaX;
      } else {
        let deltaX = 237;
        let frameRightElement = document.getElementById("ddei_editor_frame_right");
        this.editor.rightWidth = 275;
        frameRightElement.style.flexBasis = "275px";
        //重新设置画布大小
        this.editor.middleWidth -= deltaX;
      }
      this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)

      this.editor.ddInstance.render.drawShape()
    },

    /**
    * 焦点进入当前区域
    */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
    },
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

.ddei_editor_propertyview .empty_value {
  filter: opacity(50%);
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
  color: black;
  font-size: 13px;
  font-family: "Microsoft YaHei";
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

.ddei_editor_pv_subgroup_view_tab_panel_editors_column {
  display: flex;
  flex-flow: column;
  margin-top: 10px;
  margin-bottom: 10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .title {
  background: rgb(254, 254, 255);
  text-align: left;
  padding-left: 10px;
  margin: auto 0;
  margin-bottom: 5px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .editor {
  text-align: left;
  padding-left: 10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row {
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .title {
  text-align: left;
  padding-left: 10px;
  flex: 0 0 100px;
  white-space: nowrap;
  /*文字不换行*/
  overflow: hidden;
  /*超出部分隐藏*/
  text-overflow: ellipsis;
  /*溢出部分用省略号表示*/
  margin: auto 0;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .editor {
  text-align: center;
  flex: 1;
}


.ddei_editor_pv_subgroup_view_tab_panel span {
  color: red;
}</style>
