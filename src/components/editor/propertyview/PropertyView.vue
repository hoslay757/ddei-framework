<template>
  <div id="ddei_editor_propertyview"
    :class="{ 'ddei_editor_propertyview': true, 'ddei_editor_propertyview_disabled': propertyDisabled }"
    @mousedown="changeEditorFocus">
    <div class="header">
      <span class="iconfont icon-a-ziyuan68 header-7"></span>
      <div style="flex:1"></div>
      <span class="iconfont icon-a-ziyuan130 header-7" style="color:red"></span>
      <div class="header-1"></div>
      <span class="iconfont icon-a-ziyuan67 header-7"></span>
    </div>
    <div class="content">
      <div class="ddei_editor_pv_subgroup_view" v-show="editor?.rightWidth > 38">
        <div class="ddei_editor_pv_subgroup_view_tab_title">
          <div
            :class="currentTopGroup?.subGroups.length > 1 && subGroup.selected ? 'ddei_editor_pv_subgroup_view_tab_title_item_selected' : 'ddei_editor_pv_subgroup_view_tab_title_item'"
            v-show="!subGroup.empty" v-for="subGroup in currentTopGroup?.subGroups" :title="subGroup.name"
            @mouseup="changeSubGroup(subGroup)">{{
              subGroup.name }}</div>
        </div>
        <div class="ddei_editor_pv_subgroup_view_tab_panel" :style="panelStyle">
          <div
            :class="{ 'ddei_editor_pv_subgroup_view_tab_panel_editors_column': attrDefine.display == 'column', 'ddei_editor_pv_subgroup_view_tab_panel_editors_row': attrDefine.display != 'column', 'empty_value': attrDefine.value ? false : true }"
            v-for="attrDefine in currentSubGroup?.children" :title="attrDefine.desc"
            v-show="attrDefine?.visiable && !attrDefine?.forceHidden">
            <div class="title" v-if="!attrDefine.hiddenTitle && attrDefine?.visiable != false">{{ attrDefine.name }}<span
                v-if="attrDefine.notNull">*</span>：
            </div>
            <div class="editor" v-if="attrDefine.visiable != false">
              <PVTextEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'text'">
              </PVTextEditor>
              <PVTextAreaEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'textarea'">
              </PVTextAreaEditor>
              <PVRangeEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'range'"></PVRangeEditor>
              <PVColorEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'color'"></PVColorEditor>
              <PVRadioEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'radio'"></PVRadioEditor>
              <PVFontSizeEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'font-size'">
              </PVFontSizeEditor>
              <PVAlignTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'align-type'">
              </PVAlignTypeEditor>
              <PVComboxEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'combox'">
              </PVComboxEditor>
              <PVBorderTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'border-type'">
              </PVBorderTypeEditor>
              <PVFillTypeEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'fill-type'">
              </PVFillTypeEditor>
              <PVExCheckboxEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'ex-checkbox'">
              </PVExCheckboxEditor>
              <PVSwitchCheckboxEditor :controlDefine="controlDefine" :attrDefine="attrDefine"
                v-if="reFresh && attrDefine?.visiable != false && attrDefine.controlType == 'switch-checkbox'">
              </PVSwitchCheckboxEditor>
            </div>
          </div>
        </div>
      </div>
      <div class="ddei_editor_pv_group_view">
        <div class="ddei_editor_pv_group_view_items">
          <div
            :class="topGroup.selected ? 'ddei_editor_pv_group_view_items_item_selected' : 'ddei_editor_pv_group_view_items_item'"
            v-for="topGroup in topGroups" v-show="!topGroup?.empty" @click="changeTopGroup(topGroup)"
            :title="topGroup.name">
            <span :class="'iconfont ' + 'img ' + topGroup.img"></span>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor";
import { controlOriginDefinies } from "../configs/toolgroup";
import { cloneDeep } from "lodash";
import DDeiUtil from "../../framework/js/util";
import DDeiAbstractShape from "../../framework/js/models/shape";
import DDeiEditorArrtibute from "../js/attribute/editor-attribute";
import DDeiEditorState from "../js/enums/editor-state";
import PVTextEditor from "./editors/PVTextEditor.vue";
import PVTextAreaEditor from "./editors/PVTextAreaEditor.vue";
import PVRangeEditor from "./editors/PVRangeEditor.vue";
import PVColorEditor from "./editors/PVColorEditor.vue";
import PVRadioEditor from "./editors/PVRadioEditor.vue";
import PVFontSizeEditor from "./editors/PVFontSizeEditor.vue";
import PVAlignTypeEditor from "./editors/PVAlignTypeEditor.vue";
import PVComboxEditor from "./editors/PVComboxEditor.vue";
import PVBorderTypeEditor from "./editors/PVBorderTypeEditor.vue";
import PVFillTypeEditor from "./editors/PVFillTypeEditor.vue";
import PVExCheckboxEditor from "./editors/PVExCheckboxEditor.vue";
import PVSwitchCheckboxEditor from "./editors/PVSwitchCheckboxEditor.vue";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";
import DDeiEnumOperateType from "../../framework/js/enums/operate-type";
export default {
  name: "DDei-Editor-PropertyView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      //当前被选中控件的引用
      selectedModels: null,
      //属性定义的引用
      controlDefine: null,
      //当前的顶级group
      topGroups: null,
      currentTopGroup: null,
      currentSubGroup: null,
      reFresh: true,
      propertyDisabled: false,
      panelStyle: "height:calc(100vh - 202px)"
    };
  },
  computed: {},
  watch: {
    currentSubGroup() {
      this.forceRefresh();
    },
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
    PVExCheckboxEditor,
    PVTextAreaEditor,
    PVSwitchCheckboxEditor,
  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.ddInstance.stage.selectedModels", this.refreshAttrs);
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.properyViewer = this;
    this.refreshAttrs();
  },
  methods: {
    forceRefresh() {
      this.reFresh = false;
      this.propertyDisabled = false
      this.$nextTick(() => {
        this.propertyDisabled = (this.editor.state == DDeiEditorState.QUICK_EDITING)
        this.reFresh = true;
      });
    },

    refreshAttrs(newVal, oldVal) {
      this.selectedModels = this.editor.ddInstance.stage.selectedModels;
      let models: DDeiAbstractShape[] = null;
      let firstModel: DDeiAbstractShape = null;
      if (this.selectedModels?.size > 0) {
        //获取当前所有组件的公共属性定义
        models = Array.from(this.selectedModels.values());
        firstModel = models[0];
      } else {
        //获取当前所有组件的公共属性定义
        models = [this.editor.ddInstance.stage];
        firstModel = models[0];
        this.selectedModels = models;
      }

      let firstControlDefine = cloneDeep(
        controlOriginDefinies.get(firstModel?.modelCode)
      );
      //获取第一个组件及其定义
      if (firstControlDefine) {

        // if (!firstControlDefine.attrDefineMapAll) {
        //   firstControlDefine.attrDefineMapAll = new Map();
        //   firstControlDefine.attrDefineMap.forEach((d, attrKey) => {
        //     firstControlDefine.attrDefineMapAll.set(attrKey, d);
        //   });
        // }
        //如果同时有多个组件被选中，则以第一个组件为基准，对属性定义进行过滤，属性值相同则采用相同值，属性值不同采用空值
        let removeKeys = [];
        for (let i = 0; i < models.length; i++) {
          let curModel: DDeiAbstractShape = models[i];
          let curDefine = controlOriginDefinies.get(curModel.modelCode);

          firstControlDefine.attrDefineMap.forEach(
            (firstAttrDefine, attrKey) => {
              //key不存在
              if (!curDefine.attrDefineMap.has(attrKey)) {
                removeKeys.push(attrKey);
                firstAttrDefine.model = curModel;
              }
              //隐藏
              else if (!firstAttrDefine.visiable) {
                removeKeys.push(attrKey);
                firstAttrDefine.model = curModel;
              }
              //key存在，进一步比较值
              else {
                //当前属性的定义
                let curAttrDefine = curDefine.attrDefineMap.get(attrKey);
                //记录属性值
                if (i == 0) {
                  firstAttrDefine.value = DDeiUtil.getDataByPathList(
                    firstModel,
                    curAttrDefine.code,
                    curAttrDefine.mapping
                  );
                  firstAttrDefine.model = firstModel;
                }
                //根据属性定义，从model获取值
                let curAttrValue = DDeiUtil.getDataByPathList(
                  curModel,
                  curAttrDefine.code,
                  curAttrDefine.mapping
                );
                if (firstAttrDefine.value != curAttrValue) {
                  //记录备选值
                  firstAttrDefine.diffValues.push(curAttrValue);
                }
              }
            }
          );
        }
        //清除不同的属性
        this.deleteAttrDefineByKeys(firstControlDefine, removeKeys);
        let topGroups = null;
        if (firstControlDefine.type == "DDeiStage") {
          //加载layer的配置
          let layerControlDefine = cloneDeep(
            controlOriginDefinies.get("DDeiLayer")
          );
          let layer = firstModel.layers[firstModel.layerIndex];
          layerControlDefine.attrDefineMap.forEach((attrDefine, attrKey) => {
            //当前属性的定义
            attrDefine.value = DDeiUtil.getDataByPathList(
              layer,
              attrDefine.code,
              attrDefine.mapping
            );
            attrDefine.model = layer;
          });
          firstControlDefine.groups.forEach(topGroup => {
            topGroup.img = topGroup.icon
          });
          layerControlDefine.groups.forEach(topGroup => {
            topGroup.img = topGroup.icon
          });
          topGroups = layerControlDefine.groups.concat(firstControlDefine.groups)

        }
        else {
          //同步引用关系
          firstControlDefine.groups.forEach(topGroup => {
            topGroup.img = topGroup.icon
          });
          topGroups = firstControlDefine.groups
        }
        if (topGroups?.length > 0) {
          //上一次编辑的名称
          let upName = this.currentTopGroup?.name;
          let currentTopGroup = null;
          if (upName) {
            for (let x = 0; x < firstControlDefine.groups.length; x++) {
              let topGroup = topGroups[x];
              if (!topGroup.empty &&
                upName == topGroup.name) {
                topGroup.selected = true;
                currentTopGroup = topGroup;
                break;
              }
            }
          }
          if (!currentTopGroup) {
            topGroups[0].selected = true
            currentTopGroup = topGroups[0]
          }
          this.currentTopGroup = currentTopGroup;
          this.controlDefine = firstControlDefine;
          this.topGroups = topGroups;
          //上一次编辑的名称
          let upSubGroupName = this.currentSubGroup?.name;
          let currentSubGroup = null;
          if (upSubGroupName) {
            for (let sgi = 0; sgi < currentTopGroup?.subGroups.length; sgi++) {
              if (
                !currentTopGroup?.subGroups[sgi]?.empty &&
                upSubGroupName == currentTopGroup?.subGroups[sgi]?.name
              ) {
                currentSubGroup = currentTopGroup?.subGroups[sgi];
                break;
              }
            }
          }
          if (!currentSubGroup) {
            for (let sgi = 0; sgi < currentTopGroup?.subGroups.length; sgi++) {
              if (!currentTopGroup?.subGroups[sgi]?.empty) {
                currentSubGroup = currentTopGroup?.subGroups[sgi];
                break;
              }
            }
          }
          this.changeSubGroup(currentSubGroup);
          this.editor.currentControlDefine = this.controlDefine;
        } else {
          //清除信息
          this.controlDefine = null;
          this.topGroups = null;
          if (this.currentTopGroup) {
            this.currentTopGroup.subGroups = null;
          }
          if (this.currentSubGroup) {
            this.currentSubGroup.children = null;
          }
          this.editor.currentControlDefine = null;
        }


      } else {
        //清除信息
        this.controlDefine = null;
        this.topGroups = null;
        if (this.currentTopGroup) {
          this.currentTopGroup.subGroups = null;
        }
        if (this.currentSubGroup) {
          this.currentSubGroup.children = null;
        }
        this.editor.currentControlDefine = null;
      }
      setTimeout(() => {
        let e1 = document.getElementById("ddei_editor_frame_top")
        let e2 = document.getElementById("ddei_editor_frame_bottom")
        let e3 = document.getElementsByClassName("ddei_editor_ofsview")[0]
        let e4 = document.getElementsByClassName("ddei_editor_pv_subgroup_view_tab_title")[0]

        this.panelStyle = "height:calc(100vh - " + (e1.clientHeight + e2.clientHeight + e3.clientHeight + e4.clientHeight + 5) + "px"
      }, 10);

    },

    getFirstChildAttrsGroup(control) {
      if (control.models?.size > 0) {
        let firstControl = control.models.get(control.midList[0])
        let curDefine = controlOriginDefinies.get(firstControl.modelCode);
        if (curDefine.groups?.length > 0) {
          let returnGroups = curDefine.groups;
          returnGroups.forEach(group => {
            group?.subGroups.forEach(subGroup => {
              subGroup.children?.forEach(attrDefine => {
                attrDefine.value = DDeiUtil.getDataByPathList(
                  firstControl,
                  attrDefine.code,
                  attrDefine.mapping
                );
                attrDefine.model = firstControl
              });
            });
          });
          return returnGroups;
        } else if (firstControl.baseModelType == 'DDeiContainer' && firstControl.layout == 'compose') {
          return this.getFirstChildAttrsGroup(firstControl)
        }
      }
      return null
    },

    /**
     * 展开顶级属性，收起其他顶级层级
     */
    changeTopGroup(pData) {
      if (this.currentTopGroup != pData) {
        this.topGroups.forEach((group) => {
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
          for (let sgi = 0; sgi < pData?.subGroups.length; sgi++) {
            if (
              !pData?.subGroups[sgi]?.empty &&
              upSubGroupName == pData?.subGroups[sgi]?.name
            ) {
              currentSubGroup = pData?.subGroups[sgi];
              break;
            }
          }
        }
        if (!currentSubGroup) {
          for (let sgi = 0; sgi < pData?.subGroups.length; sgi++) {
            if (!pData?.subGroups[sgi]?.empty) {
              currentSubGroup = pData?.subGroups[sgi];
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
        this.currentTopGroup.subGroups.forEach((group) => {
          if (group != pData) {
            group.selected = false;
          }
        });

        pData.selected = true;
        this.selectedModels = this.editor.ddInstance.stage.selectedModels;
        let models: DDeiAbstractShape[] = null;
        if (this.selectedModels?.size > 0) {
          //获取当前所有组件的公共属性定义
          models = Array.from(this.selectedModels.values());
        } else {
          //获取当前所有组件的公共属性定义
          models = [this.editor.ddInstance.stage];
        }
        pData?.children?.forEach((attd) => {
          //判断当前属性是否可编辑
          let viewBefore = DDeiUtil.getConfigValue(
            "EVENT_CONTROL_VIEW_BEFORE",
            this.editor.ddInstance
          );
          if (
            viewBefore &&
            !viewBefore(
              DDeiEnumOperateType.VIEW,
              models,
              attd?.code,
              this.editor.ddInstance,
              null
            )
          ) {
            attd.forceHidden = true;
          } else {
            attd.forceHidden = false;
          }
        });
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
      removeKeys.forEach((item) => {
        firstControlDefine.attrDefineMap.delete(item);
        this.deleteGroupAttrsByKey(firstControlDefine.styles, item);
        this.deleteGroupAttrsByKey(firstControlDefine.datas, item);
        this.deleteGroupAttrsByKey(firstControlDefine.events, item);
      });
    },

    deleteGroupAttrsByKey(pData: object, key: string): void {
      let rmglist = [];
      pData.groups.forEach((group) => {
        let rmlist = [];
        for (let gci = 0; gci < group.children.length; gci++) {
          if (group.children[gci].code == key) {
            rmlist.push(group.children[gci]);
          }
        }
        rmlist.forEach((rm) => {
          let index = group.children.indexOf(rm);
          if (index > -1) {
            group.children.splice(index, 1);
          }
        });
        //如果group被清空，则删除group
        if (group.children.length == 0) {
          rmglist.push(group);
        }
      });
      rmglist.forEach((rmg) => {
        let index = pData.groups.indexOf(rmg);
        if (index > -1) {
          pData.groups.splice(index, 1);
        }
      });
    },

    syncAttrsToGroup(firstControlDefine: object, pData: object): void {
      let newChildren = [];
      if (pData?.groups?.length > 0) {
        pData?.groups?.forEach((group) => {
          let newGroupChildren = [];
          group.children?.forEach((curAttr: DDeiEditorArrtibute) => {
            let mapObj = firstControlDefine?.attrDefineMap?.get(curAttr.code);
            if (mapObj && mapObj.visiable != false) {
              mapObj.topGroup = pData;
              mapObj.modelCode = firstControlDefine.type;
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
        let frameRightElement = document.getElementById(
          "ddei_editor_frame_right"
        );
        this.editor.rightWidth = 38;
        frameRightElement.style.flexBasis = "38px";
        //重新设置画布大小
        this.editor.middleWidth += deltaX;
      } else {
        let deltaX = 292;
        let frameRightElement = document.getElementById(
          "ddei_editor_frame_right"
        );
        this.editor.rightWidth = 330;
        frameRightElement.style.flexBasis = "330px";
        //重新设置画布大小
        this.editor.middleWidth -= deltaX;
      }
      this.editor.ddInstance.render.setSize(
        this.editor.middleWidth,
        this.editor.middleHeight,
        0,
        0
      );

      this.editor.ddInstance.render.drawShape();
    },

    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      if (this.editor.state != DDeiEditorState.PROPERTY_EDITING && this.editor.state != DDeiEditorState.QUICK_EDITING) {
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      }
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();

    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_propertyview {
  display: flex;
  flex-direction: column;
  background: rgb(254, 254, 255);
  display: flex;
  user-select: none;

  .header {
    background: #F5F6F7;
    border-bottom: 1px solid #D5D5DF;
    flex: 0 0 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 8px;

    .header-1 {
      flex: 0 1 8px
    }

    .header-7 {
      font-size: 13px;
    }

  }

  .content {
    flex: 1;
    display: flex;
  }
}

.ddei_editor_propertyview_disabled {
  pointer-events: none !important;
  user-select: none !important;
  filter: opacity(70%);
}

.ddei_editor_propertyview .empty_value {
  filter: opacity(50%);
}

.ddei_editor_pv_group_view {
  flex: 0 0 28px;
  display: flex;
  flex-flow: column;
  border-left: 1px solid #E0E3E9;
}

.ddei_editor_pv_group_view_items {
  flex: 1;
  display: flex;
  flex-flow: column;

  .ddei_editor_pv_group_view_items_item {
    flex: 0 0 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
  }

  .ddei_editor_pv_group_view_items_item_selected {
    flex: 0 0 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;

    >span {
      color: #1F72FF;
    }
  }
}



.ddei_editor_pv_subgroup_view {
  flex: 1;
  display: flex;
  flex-flow: column;
}

.ddei_editor_pv_subgroup_view_tab_title {
  flex: 0 0 46px;
  display: flex;
  border-bottom: 1pt solid rgb(235, 235, 239);
  color: grey;
}

.ddei_editor_pv_subgroup_view_tab_title_item {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 400;
  color: #8D8D8D;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_editor_pv_subgroup_view_tab_title_item_selected {
  flex: 1;
  text-align: center;
  font-size: 16px;
  background-color: #F5F6F7;
  font-weight: 400;
  color: #1F72FF;
  border-bottom: 4px solid #1F72FF;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_editor_pv_subgroup_view_tab_title_item:hover {
  color: #1F72FF;
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
  font-size: 15px;
  font-family: "Microsoft YaHei";
}

.ddei_editor_propertyview_disabled .ddei_editor_pv_subgroup_view_tab_panel {
  pointer-events: none !important;
  user-select: none !important;
  filter: opacity(70%) !important;
}

.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/*正常情况下滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*鼠标悬浮在该类指向的控件上时滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*鼠标悬浮在滑块上时滑块的样式*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*正常时候的主干部分*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-track {
  border-radius: 6px;
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0);
  background-color: white;
}

/*鼠标悬浮在滚动条上的主干部分*/
.ddei_editor_pv_subgroup_view_tab_panel::-webkit-scrollbar-track:hover {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.01);
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
  font-size: 15px;
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
  font-size: 15px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .editor {
  text-align: center;
  flex: 1;
}

.ddei_editor_pv_subgroup_view_tab_panel span {
  color: red;
}
</style>
