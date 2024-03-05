<template>
  <div id="ddei_editor_toolbox" v-show="editor?.leftWidth > 0" @mousedown="changeEditorFocus"
    @mouseup="cancelCreateControl($event)" class="ddei_editor_toolbox">
    <div class="header">
      <div class="header-1"></div>
      <svg class="icon icon1" aria-hidden="true">
        <use xlink:href="#icon-a-ziyuan417"></use>
      </svg>
      <div class="header-3"></div>
      <div class="morecontrol" @click="showChooseDialog($event)">
        <div class="header-4">更多图形</div>
        <div class="header-3"></div>
        <svg class="icon icon2" aria-hidden="true">
          <use xlink:href="#icon-a-ziyuan466"></use>
        </svg>
      </div>
      <div style="flex:1"></div>
      <svg class="icon header-7" aria-hidden="true" @click="hiddenToolBox">
        <use xlink:href="#icon-a-ziyuan475"></use>
      </svg>
    </div>
    <div class="searchbox">
      <div class="group">
        <svg class="icon" aria-hidden="true" @click="searchControl" title="搜索">
          <use xlink:href="#icon-a-ziyuan416"></use>
        </svg>
        <input v-model="searchText" class="input" @keypress="searchInputEnter" placeholder="搜索控件" autocomplete="off"
          name="ddei_toolbox_search_input">
      </div>
    </div>

    <div class="groups" @mousewheel="mousewheel($event)"
      :style="{ height: 'calc(100vh - ' + (editor?.topHeight + editor?.bottomHeight + 90) + 'px' }">
      <div v-for="group in groups" v-show="group.display == true" class="group">
        <div :class="{ 'box': true, 'expanded': group.expand }" @click="groupBoxExpand(group)">
          <span class="title">{{ group.name }}</span>
          <svg v-if="!group.cannotClose" class="icon close" aria-hidden="true" @click="groupBoxClose(group)" title="关闭">
            <use xlink:href="#icon-a-ziyuan422"></use>
          </svg>
        </div>
        <div class="item_panel" v-if="group.expand == true">
          <div class="item" :title="control.desc" @mousedown="createControlPrepare(control, $event)"
            v-for="control in group.controls">
            <img class="icon" :src="icons[control.id]" />
            <div class="text">{{ control.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor";
import DDeiEnumOperateType from "@/components/framework/js/enums/operate-type";
import DDei from "@/components/framework/js/ddei";
import { groupOriginDefinies, controlOriginDefinies } from "../configs/toolgroup";
import DDeiEditorState from "../js/enums/editor-state";
import { cloneDeep, trim } from "lodash";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiEditorUtil from "../js/util/editor-util";
import DDeiEnumControlState from "../../framework/js/enums/control-state";
import { Matrix3 } from "three";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";
import DDeiUtil from "../../framework/js/util";
import DDeiRectContainer from "@/components/framework/js/models/rect-container";
import DDeiLineLink from "@/components/framework/js/models/linelink";
import DDeiEnumBusCommandType from "@/components/framework/js/enums/bus-command-type";
import { clone } from 'lodash'

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
      searchText: "",
      //当前编辑器
      editor: null,
      //用于缓存动态引入的控件
      controlCls: {},
      icons: {}
    };
  },
  computed: {},
  watch: {},
  created() { },
  emits: ["createControlPrepare"],
  mounted() {
    //动态加载控件
    const control_ctx = import.meta.glob(
      "@/components/framework/js/models/*.ts"
    )
    let loadArray = []
    for (const path in control_ctx) {
      loadArray.push(control_ctx[path]().then(value => {
        let cls = value.default;
        this.controlCls[cls.ClsName] = cls;
      }))
    }
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.toolBarViewer = this;
    //加载工具栏
    DDeiEditorUtil.readRecentlyToolGroups()
    let hisGroups = DDeiEditorUtil.recentlyToolGroups;
    if (hisGroups?.length > 0) {
      let groups = []
      hisGroups.forEach(hg => {
        let group = null;
        for (let i = 0; i < groupOriginDefinies.length; i++) {
          if (groupOriginDefinies[i].id == hg.id) {
            group = groupOriginDefinies[i]
            break;
          }
        }
        if (group) {
          group.expand = hg.expand
          groups.push(group)
        }
      })
      this.groups = groups;
    } else {
      this.groups = clone(groupOriginDefinies)
      DDeiEditorUtil.whiteRecentlyToolGroups(this.groups)
    }
    this.searchOriginGroups = this.groups;
    Promise.all(loadArray).then(x => {
      this.generateControlIcons();
    })
    let ddInstance: DDei = this.editor.ddInstance;
    if (ddInstance) {
      let modeName = DDeiUtil.getConfigValue("MODE_NAME", ddInstance);
      let accessCreate = DDeiUtil.isAccess(
        DDeiEnumOperateType.CREATE, null, null, modeName,
        ddInstance
      );
      this.editor.editorViewer.toolboxShow = accessCreate

    }
  },
  methods: {
    cancelCreateControl(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControls) {
          let ddInstance: DDei = this.editor.ddInstance;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          //从layer中移除控件
          layer.removeModels(this.editor.creatingControls);

          //清除临时变量
          this.editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
          //渲染图形
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, e);
        }
        this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        this.editor.changeState(DDeiEditorState.TOOLBOX_ACTIVE);
        this.editor.bus.executeAll();
        e.preventDefault()
        e.cancelBubble = true
      }

    },

    mousewheel(evt) {
      if (Math.abs(evt.deltaY) < Math.abs(evt.deltaX) || Math.abs(evt.deltaY) <= 1) {
        evt.preventDefault();
        return false
      } else {
        evt.stopPropagation();
        return true;
      }
    },
    /**
     * 弹出选择控件Dialog
     */
    showChooseDialog(evt) {
      let srcElement = evt.currentTarget;
      let selectGroups = []
      this.groups.forEach(group => {
        if (group.display) {
          selectGroups.push(group.id)
        }
      });
      DDeiEditorUtil.showOrCloseDialog("choose_control_group_dialog", {
        selectGroups: selectGroups,
        callback: {
          select: this.groupBoxChoose
        },
        group: "toolbox-dialog"
      }, { type: 4 }, srcElement)

    },

    /**
     * 生成控件的小图标
     */
    async generateControlIcons() {
      if (DDeiUtil.ICONS) {
        this.icons = DDeiUtil.ICONS
      } else {
        if (this.editor.ddInstance) {
          let promiseArr = []
          let ddInstance = this.editor.ddInstance
          DDeiUtil.ICONS = {}
          this.groups?.forEach((group, key) => {
            group.controls.forEach(controlDefine => {
              let cacheData = localStorage.getItem("ICON-CACHE-" + controlDefine.id)
              if (cacheData) {
                DDeiUtil.ICONS[controlDefine.id] = cacheData
                return;
              } else {
                promiseArr.push(new Promise((resolve, reject) => {
                  try {
                    let canvas = document.createElement('canvas');
                    //获取缩放比例
                    let rat1 = ddInstance.render.ratio;
                    ddInstance.render.tempCanvas = canvas;
                    //创建图形对象
                    let models = this.createControl(controlDefine)
                    let iconPos = controlDefine?.define?.iconPos;
                    let outRect = DDeiAbstractShape.getOutRectByPV(models);
                    outRect.width += (iconPos?.dw ? iconPos.dw : 0)
                    outRect.height += (iconPos?.dh ? iconPos.dh : 0)
                    //基准大小
                    let baseWidth = 50
                    let baseHeight = 50

                    //按高度缩放
                    if (outRect.width > 0 && outRect.height > 0) {
                      if (outRect.width > outRect.height) {
                        baseWidth *= outRect.width / outRect.height
                      } else {
                        baseHeight *= outRect.height / outRect.width
                      }

                      //构建缩放矩阵，缩放到基准大小
                      let scaleMatrix = new Matrix3(
                        baseWidth / outRect.width, 0, 0,
                        0, baseHeight / outRect.height, 0,
                        0, 0, 1);
                      models.forEach(model => {
                        model.transVectors(scaleMatrix)
                      });

                      outRect = DDeiAbstractShape.getOutRectByPV(models);
                    }
                    if (!outRect.height) {
                      outRect.height = baseHeight
                    }
                    if (!outRect.width) {
                      outRect.width = baseWidth
                    }
                    outRect.width += (iconPos?.dw ? iconPos.dw : 0)
                    outRect.height += (iconPos?.dh ? iconPos.dh : 0)
                    let width = (outRect.width + 4) * rat1
                    let height = (outRect.height + 4) * rat1

                    canvas.setAttribute("width", width)
                    canvas.setAttribute("height", height)
                    canvas.style.width = width + 'px';
                    canvas.style.height = height + 'px';
                    //获得 2d 上下文对象

                    let ctx = canvas.getContext('2d', { willReadFrequently: true });

                    ctx.translate(width / 2 + (iconPos?.dx ? iconPos.dx : 0), height / 2 + (iconPos?.dy ? iconPos.dy : 0))
                    models.forEach(model => {
                      model.initRender()
                      model.render.drawShape({ weight: 3, border: { width: 1.5 } })
                    })
                    let dataURL = canvas.toDataURL("image/png");
                    localStorage.setItem("ICON-CACHE-" + controlDefine.id, dataURL)
                    DDeiUtil.ICONS[controlDefine.id] = dataURL
                  } catch (e) { console.error(e) }
                  resolve()
                }));
              }
            });

          });
          Promise.all(promiseArr).then(all => {
            this.icons = DDeiUtil.ICONS
            ddInstance.render.tempCanvas = null;
          })
        }
      }
    },

    /**
     * 隐藏工具栏
     */
    hiddenToolBox() {
      let deltaX = this.editor.leftWidth;
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      window.leftWidth = this.editor.leftWidth
      this.editor.leftWidth = 0;
      frameLeftElement.style.flexBasis = "0px";
      //重新设置画布大小
      this.editor.middleWidth += deltaX;
      this.editor.ddInstance.render.setSize(
        this.editor.middleWidth,
        this.editor.middleHeight,
        0,
        0
      );
      this.editor.ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape)
      this.editor.ddInstance.bus.executeAll()
      this.editor.changeState(DDeiEditorState.DESIGNING);

    },

    /**
     * 展开或收折groupbox
     */
    groupBoxExpand(group: object) {
      if (group) {
        group.expand = !group.expand;
        DDeiEditorUtil.whiteRecentlyToolGroups(this.groups)
      }
    },

    /**
     * 关闭groupbox
     */
    groupBoxClose(group: object) {
      if (group) {
        group.display = false;
        if (this.groups.indexOf(group) != -1) {
          this.groups.splice(this.groups.indexOf(group), 1)
        }
        DDeiEditorUtil.whiteRecentlyToolGroups(this.groups)
      }
    },
    /**
   * 关闭groupbox
   */
    groupBoxOpen(group: object) {
      if (group) {
        group.display = true;
        if (this.groups.indexOf(group) == -1) {
          this.groups.push(group)
        }
        DDeiEditorUtil.whiteRecentlyToolGroups(this.groups)
      }
    },

    /**
     * 选择groupBox
     */
    groupBoxChoose(groupid: object, choose: boolean) {
      let group = null
      for (let i = 0; i < groupOriginDefinies.length; i++) {
        if (groupOriginDefinies[i].id == groupid) {
          group = groupOriginDefinies[i]
          break;
        }
      }
      if (choose) {
        this.groupBoxOpen(group)
      } else {
        this.groupBoxClose(group)
      }
    },

    /**
     * 搜索按钮按下时，检测是否按下enter，按下后执行搜索
     * @param evt
     */
    searchInputEnter(evt) {
      if (evt.keyCode == 13) {
        this.searchControl();
      }
    },

    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.TOOLBOX_ACTIVE);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
    },

    /**
     * 准备创建
     */
    createControlPrepare(control, e) {
      //获取当前实例
      let ddInstance: DDei = this.editor.ddInstance;
      ddInstance.render.inEdge = 0;
      let stage = ddInstance.stage;
      let layer = stage.layers[stage.layerIndex];
      if ((layer.display == 0 && !layer.tempDisplay) || layer.lock) {
        return;
      }

      //创建并初始化控件以及关系
      let models = this.createControl(control)

      //加载事件的配置
      let createBefore = DDeiUtil.getConfigValue(
        "EVENT_CONTROL_CREATE_BEFORE",
        ddInstance
      );
      //选中前
      if (
        !createBefore ||
        createBefore(DDeiEnumOperateType.CREATE, models, null, ddInstance)
      ) {
        let stageRatio = stage.getStageRatio();
        let moveMatrix = new Matrix3(
          1,
          0,
          -stage.wpv.x * stageRatio,
          0,
          1,
          -stage.wpv.y * stageRatio,
          0,
          0,
          1
        );
        models.forEach(model => {
          model.transVectors(moveMatrix);
          model.setState(DDeiEnumControlState.CREATING);
        })

        this.$emit("createControlPrepare", models);
        e.preventDefault()
        e.cancelBubble = true
      }
    },

    /**
     * 创建控件
     */
    createControl(control) {
      let ddInstance: DDei = this.editor.ddInstance;
      ddInstance.render.inEdge = 0;
      let stage = ddInstance.stage;
      let layer = stage.layers[stage.layerIndex];
      let models = []


      let cc = control


      //根据control的定义，初始化临时控件，并推送至上层Editor
      let searchPaths = [
        "width",
        "height",
        "text",
        "subcontrol",
        "layout",
      ];
      let configAtrs = DDeiEditorUtil.getAttrValueByConfig(
        cc,
        searchPaths
      );

      stage.idIdx++
      let dataJson = {
        id: cc.code + "_" + (stage.idIdx),
        modelCode: cc.id,
      };


      //设置配置的属性值
      searchPaths.forEach((key) => {
        if (configAtrs.get(key)) {
          dataJson[key] = configAtrs.get(key).data;
        }
        if (cc[key] != undefined && cc[key] != null) {
          dataJson[key] = cc[key];
        }
      });
      if (cc.img) {
        dataJson.fill = { type: 2, image: cc.img };
      }
      for (let i in cc?.define) {
        dataJson[i] = cc.define[i];
      }
      //如果有from则根据from读取属性
      delete dataJson.ovs
      let model: DDeiAbstractShape = this.controlCls[cc.type].initByJSON(
        dataJson,
        { currentStage: stage, currentLayer: layer }
      );
      models.push(model)
      //处理others
      control.others?.forEach(oc => {
        let otherModels = this.createControl(oc)
        if (otherModels?.length > 0) {
          models = models.concat(otherModels);
        }
      });


      //处理merge和create=false
      if (control?.define?.create == false) {
        models.splice(0, 1)
      }

      //添加初始linkModels以及控件关联
      if (control?.define?.iLinkModels) {
        for (let ilk in control?.define?.iLinkModels) {
          let linkData = control?.define?.iLinkModels[ilk]
          let cIndex = parseInt(ilk)
          if (cIndex != -1) {
            cIndex++
            let linkControl = models[cIndex]
            let lineLink = new DDeiLineLink({
              line: cc,
              type: linkData.type,
              dm: linkControl,
              dx: linkData.dx,
              dy: linkData.dy,
            })
            models[0].linkModels.set(linkControl.id, lineLink);
          }
        }
      }
      //添加初始merge
      if (control?.define?.initMerges) {

        let mergeControls = [models[0]]
        for (let m in control?.define?.initMerges) {
          let mIndex = control?.define?.initMerges[m];
          if (mIndex != -1) {
            mIndex++
            let mControl = models[mIndex]
            if (mergeControls.indexOf(mControl) == -1) {
              mergeControls.push(mControl)
            }
          }
        }
        //执行控件合并
        if (mergeControls.length > 1) {
          let ddInstance: DDei = this.editor.ddInstance;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          let stageRatio = ddInstance.stage?.getStageRatio()
          //获取选中图形的外接矩形
          let outRect = DDeiAbstractShape.getOutRectByPV(mergeControls);
          //创建一个容器，添加到画布,其坐标等于外接矩形
          let container: DDeiRectContainer = DDeiRectContainer.initByJSON({
            id: "comp_" + ddInstance.stage.idIdx,
            initCPV: {
              x: outRect.x + outRect.width / 2,
              y: outRect.y + outRect.height / 2,
              z: 1
            },
            layout: "compose",
            modelCode: "100202",
            fill: {
              type: 0
            },
            border: {
              top: { disabled: true }
            },
            width: outRect.width / stageRatio,
            height: outRect.height / stageRatio
          },
            {
              currentLayer: layer,
              currentStage: ddInstance.stage,
              currentContainer: layer
            });

          mergeControls.forEach(mc => {
            if (mc) {
              container.addModel(mc)
              mc.pModel = container
            }
          })
          //更新新容器大小
          container?.changeParentsBounds()
          //下标自增1
          ddInstance.stage.idIdx++;
          //返回合并后的控件
          models.splice(0, mergeControls.length, container);
        }
      }
      return models;

    },


    /**
     * 搜索控件
     */
    searchControl() {
      //如果清空搜索框则还原
      let text = trim(this.searchText);
      if (text == "") {
        this.groups = this.searchOriginGroups;
      }
      //如果搜索框有内容则搜索
      else {
        let searchControls = [];
        let gp = {};
        gp.name = "搜索结果";
        this.searchOriginGroups.forEach((group) => {
          if (group.controls) {
            group.controls.forEach((control) => {
              if (
                control.code.indexOf(text) != -1 ||
                control.name.indexOf(text) != -1
              ) {
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
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_toolbox {
  user-select: none;
  text-align: center;
  background: rgb(254, 254, 255);
  display: flex;
  flex-flow: column;
  height: 100%;

  /**以下为收折框 */
  .header {
    background: #F5F6F7;
    border-bottom: 1px solid #D5D5DF;
    flex: 0 0 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 8px;

    .morecontrol {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 0 1 100px;

      .header-3 {
        flex: 0 1 8px
      }

      .header-4 {
        font-size: 16px;
        flex: 0 1 70px;
        font-weight: bold;
        color: #000000;
      }


    }

    .morecontrol:hover {
      background-color: #e6e6e6;
      cursor: pointer;
    }


    .header-1 {
      flex: 0 1 17px
    }

    .header-2 {
      font-size: 14px;
    }



    .header-7 {
      font-size: 18px;
    }

    .icon1 {
      font-size: 23px;
    }

    .icon2 {
      font-size: 16px;
    }
  }

  .searchbox {
    flex: 0 0 52px;
    display: flex;
    justify-content: center;
    align-items: center;

    .group {
      flex: 1;
      margin: 0 25px;
      height: 32px;
      background: #F4F5F6;
      border: 1px solid #D4D4D4;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        font-size: 24px;
        margin: 0 6px;
      }

      .input {
        flex: 1 1 140px;
        height: 28px;
        width: 100%;
        border: transparent;
        outline: none;
        background: transparent;
        font-size: 16px;
        font-weight: 400;
        color: black;

        &::placeholder {
          /* Chrome, Firefox, Opera, Safari 10.1+ */
          color: #B8B8B8;
        }

        &::-webkit-input-placeholder {
          /* WebKit browsers，webkit内核浏览器 */
          color: #B8B8B8
        }

        &:-moz-placeholder {
          /* Mozilla Firefox 4 to 18 */
          color: #B8B8B8
        }

        &::-moz-placeholder {
          /* Mozilla Firefox 19+ */
          color: #B8B8B8
        }

        &:-ms-input-placeholder {
          /* Internet Explorer 10-11 */
          color: #B8B8B8
        }

        &::-ms-input-placeholder {
          /* Microsoft Edge */
          color: #B8B8B8
        }
      }

      .button {
        flex: 0 0 42px;
        height: 23px;
        background-color: #017fff;
        font-size: 16px;
        color: white;
        margin: auto 7px auto 5px;
        border-radius: 4px;
      }

      .button:hover {
        background-color: #0177f0;
      }
    }
  }
}

/**以下为分割线 */
.ddei_editor_toolbox hr {
  border: 0.5px solid rgb(240, 240, 240);
  width: 93%;
  margin: auto 4px 5px 7px;

}



/**以下为控件分组以及控件框 */

.ddei_editor_toolbox .groups {
  text-align: center;
  background: rgb(254, 254, 255);
  overflow-y: auto;
  display: flex;
  flex-flow: column;
  flex: 1 1 auto;
}

.ddei_editor_toolbox .groups::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/*正常情况下滑块的样式*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*鼠标悬浮在该类指向的控件上时滑块的样式*/
.ddei_editor_toolbox .groups:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*鼠标悬浮在滑块上时滑块的样式*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: inset1px1px0rgba(0, 0, 0, 0.1);
}

/*正常时候的主干部分*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-track {
  border-radius: 6px;
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0);
  background-color: white;
}

/*鼠标悬浮在滚动条上的主干部分*/
.ddei_editor_toolbox .groups::-webkit-scrollbar-track:hover {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.4);
  background-color: rgba(0, 0, 0, 0.01);
}

.ddei_editor_toolbox .groups .group {
  text-align: center;
  margin-bottom: 1px;
}

.ddei_editor_toolbox .groups .group .box {
  display: flex;
  height: 35px;
  background: #F5F6F7;
  user-select: none;
  justify-content: center;
  align-items: center;
}

.ddei_editor_toolbox .groups .group .expanded {
  background-color: #F5F6F7;
}

.ddei_editor_toolbox .groups .group .box:hover {
  background-color: #F5F6F7;
}

.ddei_editor_toolbox .groups .group .box:active {
  background-color: #F5F6F7;
}


.ddei_editor_toolbox .groups .group .box .title {
  flex: 1;
  color: black;
  text-align: left;
  margin-left: 25px;
  font-size: 16px;
  font-weight: bold;
}

.ddei_editor_toolbox .groups .group .box .close {
  margin-right: 10px;
  font-size: 18px;
}

.ddei_editor_toolbox .groups .group .box .close:hover {
  color: rgb(200, 200, 200);
  cursor: pointer;
}

.ddei_editor_toolbox .groups .group .item_panel {
  display: flex;
  flex-flow: row wrap;
  background: white;
  padding: 15px 15px 15px 15px;
}

.ddei_editor_toolbox .groups .group .item_panel .item {
  flex: 0 0 62px !important;
  height: 60px;
  margin: 15px 0px;
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  flex-flow: column;
}

.ddei_editor_toolbox .groups .group .item_panel .item:hover {
  background: #EDEFFF;
  outline: 2px solid #BED0EF;
  cursor: all-scroll;
}

.ddei_editor_toolbox .groups .group .item_panel .item .text {
  white-space: nowrap;
  text-align: center;
  font-size: 13px;
  font-weight: 400;
  color: #000000;
}

.ddei_editor_toolbox .groups .group .item_panel .item .icon {
  width: 90%;
  height: 90%;
  object-fit: contain;
}
</style>
