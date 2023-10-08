<template>
  <div id="ddei_editor_toolbox"
       v-show="editor?.leftWidth > 0"
       @mousedown="changeEditorFocus"
       class="ddei_editor_toolbox">
    <div class="expandbox">
      <img class="img"
           :src="expandLeftImg"
           @click="hiddenToolBox" />
    </div>
    <div class="searchbox">
      <div class="group">
        <input v-model="searchText"
               class="input"
               @keypress="searchInputEnter"
               placeholder="搜索控件">
        <div class="button"
             @click="searchControl">搜索</div>
      </div>
    </div>
    <hr />
    <div class="groups"
         :style="{ height: 'calc(100vh - ' + (editor?.topHeight + editor?.bottomHeight + 90) + 'px' }">
      <div v-for="group in groups"
           v-show="group.display == true"
           class="group">
        <div :class="{ 'box': true, 'expanded': group.expand }"
             @click="groupBoxExpand(group)">
          <img class="expand"
               v-show="!group.expand"
               src="../icons/toolbox-unexpanded.png" />
          <img class="expand"
               v-show="group.expand"
               src="../icons/toolbox-expanded.png" />
          <span class="title">{{ group.name }}</span>
          <img v-if="!group.cannotClose"
               class="close"
               src="../icons/toolbox-close.png"
               @click="groupBoxClose(group)" />
        </div>
        <div class="item_panel"
             v-if="group.expand == true">
          <div class="item"
               :title="control.desc"
               draggable="true"
               @dragstart="createControlPrepare(control, $event)"
               v-for="control in group.controls">
            <img class="icon"
                 :src="control.icon" />
            <div class="text">{{ control.name }}</div>
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
import { loadToolGroups, controlOriginDefinies } from "../configs/toolgroup";
import DDeiEditorState from "../js/enums/editor-state";
import { cloneDeep, trim } from "lodash";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiEditorUtil from "../js/util/editor-util";
import DDeiEnumControlState from "../../framework/js/enums/control-state";
import ICONS from "../js/icon";

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
      //创建时的图片
      creatingImg: new Image(),
      //展开的图片
      expandLeftImg: ICONS["icon-expand-left"],
    };
  },
  computed: {},
  watch: {},
  created() {},
  emits: ["createControlPrepare"],
  mounted() {
    //空图片
    this.creatingImg.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    this.creatingImg.style.visibility = "hidden";
    //动态加载控件
    const control_ctx = import.meta.glob(
      "@/components/framework/js/models/*.ts"
    );
    for (const path in control_ctx) {
      control_ctx[path]().then((module) => {
        let cls = module.default;
        this.controlCls[cls.ClsName] = cls;
      });
    }
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //加载工具栏
    loadToolGroups().then((module) => {
      //遍历module，加上display、expand两个属性，来控制在本组件内是否展开、和关闭
      module.forEach((item, index) => {
        item.display = true;
        //缺省第一个展开
        if (index == 0) {
          item.expand = true;
        } else {
          item.expand = false;
        }
        //处理control的图标
        item.controls.forEach((control) => {
          if (control.icon) {
            control.icon = ICONS[control.icon];
          }
        });
      });
      this.groups = module;
      this.searchOriginGroups = this.groups;
    });
  },
  methods: {
    /**
     * 隐藏工具栏
     */
    hiddenToolBox() {
      let deltaX = this.editor.leftWidth;
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
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
      this.editor.ddInstance.render.drawShape();
    },

    /**
     * 展开或收折groupbox
     */
    groupBoxExpand(group: object) {
      if (group) {
        group.expand = !group.expand;
      }
    },

    /**
     * 关闭groupbox
     */
    groupBoxClose(group: object) {
      if (group) {
        group.display = false;
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
    },

    /**
     * 准备创建
     */
    createControlPrepare(control, e) {
      //获取当前实例
      let ddInstance: DDei = this.editor.ddInstance;
      //根据control的定义，初始化临时控件，并推送至上层Editor
      let searchPaths = [
        "width",
        "height",
        "img",
        "text",
        "linkChild",
        "linkSelf",
        "subcontrol",
        "layout",
      ];
      let configAtrs = DDeiEditorUtil.getAttrValueByConfig(
        control,
        searchPaths
      );
      let dataJson = {
        id: control.code + "_" + ddInstance.stage.idIdx,
        modelCode: control.id,
        x: 0,
        y: 0,
      };
      //设置配置的属性值
      searchPaths.forEach((key) => {
        if (configAtrs.get(key)) {
          dataJson[key] = configAtrs.get(key).data;
        }
        if (control[key] != undefined && control[key] != null) {
          dataJson[key] = control[key];
        }
      });
      let model: DDeiAbstractShape =
        this.controlCls[control.type].initByJSON(dataJson);
      model.setState(DDeiEnumControlState.CREATING);

      e.dataTransfer.setDragImage(this.creatingImg, 0, 0);

      this.$emit("createControlPrepare", model);
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

    //创建图层
    createLayer() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      let layer = ddInstance.stage.addLayer();
      //绑定并初始化渲染器
      DDeiConfig.bindRender(layer);
      layer.render.init();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.render.drawShape();
      this.$forceUpdate();
    },

    //销毁当前图层
    removeLayer() {
      //获取当前实例
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      let layer = ddInstance.stage.removeLayer();
      if (layer) {
        //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
        ddInstance.render.drawShape();
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
      ddInstance.render.drawShape();
    },

    //隐藏图层
    hiddenLayer() {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      ddInstance.stage.hiddenLayer();
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.render.drawShape();
    },

    //显示图层
    displayLayer() {
      let ddInstance: DDei = DDei.INSTANCE_POOL["ddei_editor_view"];
      ddInstance.stage.displayLayer(null, true);
      //重新绘制图形,TODO 这里应该调模型的方法，还是调用render的方法？
      ddInstance.render.drawShape();
    },
  },
};
</script>

<style scoped>
.ddei_editor_toolbox {
  user-select: none;
  text-align: center;
  background: rgb(254, 254, 255);
  border: 1pt solid rgb(235, 235, 239);
  display: flex;
  flex-flow: column;
  height: 100%;
}

/**以下为分割线 */
.ddei_editor_toolbox hr {
  border: 0.5px solid rgb(240, 240, 240);
  width: 93%;
  margin: auto 4px 5px 7px;
}

/**以下为收折框 */
.ddei_editor_toolbox .expandbox {
  flex: 0 0 38px;
  height: 38px;
  text-align: right;
}

.ddei_editor_toolbox .expandbox .img {
  width: 30px;
  height: 24px;
  padding: 4px 4px;
  margin-top: 6px;
  margin-right: 2px;
  border-radius: 4px;
}

.ddei_editor_toolbox .expandbox .img:hover {
  background-color: rgb(244, 244, 244);
  cursor: pointer;
}

/**以下为搜索框 */
.ddei_editor_toolbox .searchbox {
  flex: 0 0 38px;
  height: 38px;
}

.ddei_editor_toolbox .searchbox .group {
  background-color: #f2f2f7;
  width: 93%;
  margin: auto 4px auto 7px;
  display: flex;
  height: 32px;
  border-radius: 4px;
}

.ddei_editor_toolbox .searchbox .group .input {
  flex: 1 1 140px;
  height: 28px;
  width: 100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: auto 0px auto 5px;
  background: transparent;
}

.ddei_editor_toolbox .searchbox .group .button {
  flex: 0 0 42px;
  height: 23px;
  background-color: #017fff;
  font-size: 14px;
  color: white;
  margin: auto 7px auto 5px;
  border-radius: 4px;
}

.ddei_editor_toolbox .searchbox .group .button:hover {
  background-color: #0177f0;
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
}

.ddei_editor_toolbox .groups .group .box {
  display: flex;
  height: 40px;
  background-color: rgb(254, 254, 254);
  user-select: none;
  border-radius: 4px;
}

.ddei_editor_toolbox .groups .group .expanded {
  background-color: rgb(240, 240, 240);
}

.ddei_editor_toolbox .groups .group .box:hover {
  background-color: rgb(244, 244, 244);
}

.ddei_editor_toolbox .groups .group .box:active {
  background-color: rgb(240, 240, 240);
}

.ddei_editor_toolbox .groups .group .box .expand {
  flex: 0 0 9px;
  margin: auto 7px auto 7px;
  width: 9px;
  height: 9px;
}

.ddei_editor_toolbox .groups .group .box .title {
  flex: 1;
  font-size: 13px;
  text-align: left;
  margin: auto;
  color: black;
}

.ddei_editor_toolbox .groups .group .box .close {
  flex: 0 0 12px;
  margin: auto;
  width: 12px;
  height: 12px;
  margin: auto 7px auto 7px;
}

.ddei_editor_toolbox .groups .group .box .close:hover {
  background-color: rgb(200, 200, 200);
}

.ddei_editor_toolbox .groups .group .item_panel {
  display: flex;
  flex-flow: row wrap;
  background: rgb(254, 254, 254);
  margin-bottom: 5px;
}

.ddei_editor_toolbox .groups .group .item_panel .item {
  flex: 0 0 60px !important;
  height: 66px;
  width: 60px;
  margin-top: 10px;
  display: flex;
  flex-flow: column;
  border-radius: 4px;
}

.ddei_editor_toolbox .groups .group .item_panel .item:hover {
  background-color: rgb(244, 244, 244);
  cursor: all-scroll;
}

.ddei_editor_toolbox .groups .group .item_panel .item .text {
  color: black;
  font-size: 12px;
  transform: scale(0.8);
  margin-top: -5px;
  white-space: nowrap;
  text-align: center;
}

.ddei_editor_toolbox .groups .group .item_panel .item .icon {
  width: 50px;
  white-space: nowrap;
  margin: auto;
  object-fit: none;
}
</style>
