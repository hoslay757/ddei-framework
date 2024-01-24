<template>
  <div id="ddei_editor_bottommenu" class="ddei_editor_bottommenu">
    <div class="ddei_editor_bottommenu_addpage" @click="newSheet" v-if="allowOpenMultSheets">
      <span class="iconfont icon-a-ziyuan148"></span>
    </div>
    <div class="ddei_editor_bottommenu_pages">
      <div class="ddei_editor_bottommenu_page" v-if="!editor">
        <span></span>
      </div>
      <div draggable="true" v-if="allowOpenMultSheets" @dragstart="sheetDragStart(null, $event)"
        @click.left="changeSheet(index)" @click.right="showMenu(sheet, $event)" @dragover="sheetDragOver($event)"
        @drop="sheetDragDrop($event)" @dragleave="sheetDragCancel($event)" @dblclick="startChangeSheetName(sheet, $event)"
        v-show="index >= openIndex && index < openIndex + maxOpenSize"
        :class="{ 'ddei_editor_bottommenu_page': sheet.active == 0, 'ddei_editor_bottommenu_page_selected': sheet.active == 1 }"
        :title="sheet.name" v-for="(sheet, index) in  editor?.files[editor?.currentFileIndex]?.sheets ">
        <span>{{ sheet.name }}</span>
      </div>

      <div class="ddei_editor_bottommenu_pages_movebox"
        v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize" @click="moveItem(-1)">
        <span class="iconfont icon-a-ziyuan74"></span>
      </div>
      <div class="ddei_editor_bottommenu_pages_movebox"
        v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize" @click="moveItem(1)">
        <span class="iconfont icon-a-ziyuan73"></span>
      </div>
    </div>

    <div class="ddei_editor_bottommenu_shapecount">
      形状数: {{ editor?.files[editor?.currentFileIndex]?.modelNumber }}
    </div>

    <div class="ddei_editor_bottommenu_layers" v-if="allowOpenMultLayers" @click="showLayersDialog($event)">
      <span class="iconfont icon-a-ziyuan58"></span>
    </div>

    <div class="ddei_editor_bottommenu_other_play">
      <span class="iconfont icon-a-ziyuan117"></span>
    </div>


    <div class="ddei_editor_bottommenu_other_changesize" v-if="allowStageRatio">
      <div class="ddei_editor_bottommenu_other_changesize_combox" @click="showChangeRatioDialog($event)">
        <span>
          {{ parseInt(currentStage?.ratio * 100) }}%
        </span>
        <span class="iconfont icon-zhankai-01"></span>
      </div>
      <div @click="addRatio(-0.05)">
        <span class="iconfont icon-a---01"></span>
      </div>
      <input type="range" min="0.1" max="4" step="0.1" v-model="stageRatio" />
      <div @click="addRatio(0.05)">
        <span class="iconfont icon-a--01"></span>
      </div>
    </div>

    <div class="ddei_editor_bottommenu_all_page_ratio" v-if="allowStageRatio" @click="autoRatio(1)" title="整页">
      <span class="iconfont icon-a-ziyuan182"></span>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiEditor from "../js/editor";
import DDeiSheet from "../js/sheet";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";
import DDeiUtil from "../../framework/js/util";
import DDeiEditorState from "../js/enums/editor-state";
import DDeiAbstractShape from "../../framework/js/models/shape";
import DDeiModelArrtibuteValue from "../../framework/js/models/attribute/attribute-value";
import DDeiEnumOperateType from "../../framework/js/enums/operate-type";
import DDeiEditorUtil from "../js/util/editor-util";

export default {
  name: "DDei-Editor-BottomMenu",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      //当前打开的页的开始下标
      openIndex: 0,
      //最大可以打开的数量
      maxOpenSize: 1,
      //当前stage
      currentStage: {},
      ratioInputValue: 0,
      stageRatio: 1,
      allowOpenMultSheets: true,
      allowOpenMultLayers: true,
      allowStageRatio: true,
      allowAddLayer: true,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.middleWidth", function (newVal, oldVal) {
      //获取单个tab大小
      let pageEles = document.getElementsByClassName("ddei_editor_bottommenu_page")
      let width = 0;

      if (pageEles.length > 0) {
        width = pageEles[0].clientWidth
      }
      if (!width) {
        width = 70
      }
      let size = parseInt(newVal / width);
      if (size > this.maxOpenSize && this.openIndex > 0) {
        this.openIndex--;
      }
      this.maxOpenSize = size;
    });

    // 监听obj对象中prop属性的变化
    this.$watch("currentStage.ratio", function (newVal, oldVal) {
      if (
        DDeiEditorUtil.getConfigValue("GLOBAL_ALLOW_STAGE_RATIO", this.editor)
      ) {
        if (!this.changeCurrentStage) {
          this.ratioInputValue = parseFloat(newVal) * 100;
          this.stageRatio = newVal;
          this.changeRatio();
        } else {
          this.changeCurrentStage = false;
        }
      }
    });
    this.$watch("stageRatio", function (newVal, oldVal) {
      if (
        DDeiEditorUtil.getConfigValue("GLOBAL_ALLOW_STAGE_RATIO", this.editor)
      ) {
        this.setRatio(newVal);
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.bottomMenuViewer = this;
    let file = this.editor?.files[this.editor?.currentFileIndex];
    let sheet = file?.sheets[file?.currentSheetIndex];
    this.changeCurrentStage = true;
    this.currentStage = sheet?.stage;
    this.allowOpenMultSheets = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_OPEN_MULT_SHEETS",
      this.editor
    );
    this.allowOpenMultLayers = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_OPEN_MULT_LAYERS",
      this.editor
    );

    //获取权限
    this.allowAddLayer = DDeiUtil.isAccess(
      DDeiEnumOperateType.CREATE,
      { modelType: "DDeiLayer" },
      DDeiUtil.getConfigValue("MODE_NAME", this.editor.ddInstance),
      this.editor.ddInstance
    );
    this.allowStageRatio = DDeiEditorUtil.getConfigValue(
      "GLOBAL_ALLOW_STAGE_RATIO",
      this.editor
    );
  },
  methods: {

    /**
     * sheet开始拖拽移动
     */
    sheetDragStart(sheetEle, evt) {
      this.dragSheetEle = evt.target;
    },

    /**
     * 拖拽元素移动
     */
    sheetDragOver(e) {
      let parentDiv = this.dragSheetEle.parentElement;
      let sourceIndex = -1;
      let targetIndex = -1;
      let children = parentDiv.children;
      for (let i = 0; i < children.length - 2; i++) {
        children[i].style.borderLeft = "";
        children[i].style.borderRight = "";
        if (children[i] == this.dragSheetEle) {
          sourceIndex = i;
        } else if (e.target == children[i]) {
          targetIndex = i;
        }
      }
      if (sourceIndex != -1 && targetIndex != -1) {
        this.sourceSheetIndex = sourceIndex;
        if (targetIndex == children.length - 3) {
          let pos = DDeiUtil.getDomAbsPosition(children[targetIndex]);
          let halfPos = pos.left + children[targetIndex].offsetWidth / 2;
          if (
            halfPos <= e.clientX &&
            e.clientX <= pos.left + children[targetIndex].offsetWidth
          ) {
            this.changeSheetIndex = targetIndex;
            children[targetIndex].style.borderRight = "2px solid #017fff";
          } else {
            this.changeSheetIndex = targetIndex - 1;
            children[targetIndex].style.borderLeft = "2px solid #017fff";
          }
        } else {
          this.changeSheetIndex = targetIndex - 1;
          children[targetIndex].style.borderLeft = "2px solid #017fff";
        }
      }

      e.preventDefault();
    },

    /**
     * 拖拽元素放开
     */
    sheetDragDrop(e) {
      if (
        (this.sourceSheetIndex || this.sourceSheetIndex == 0) &&
        (this.changeSheetIndex || this.changeSheetIndex == 0)
      ) {
        //修改sheet位置
        let file = this.editor.files[this.editor.currentFileIndex];
        let sheet = file.sheets[this.sourceSheetIndex];
        let currentSheet = file.sheets[file.currentSheetIndex];
        file.sheets[this.sourceSheetIndex] = null;
        file.sheets.splice(this.changeSheetIndex + 1, 0, sheet);
        for (let j = file.sheets.length; j >= 0; j--) {
          if (file.sheets[j] == null) {
            file.sheets.splice(j, 1);
          }
        }
        for (let j = file.sheets.length; j >= 0; j--) {
          if (currentSheet == file.sheets[j]) {
            file.currentSheetIndex = j;
          }
        }
        //刷新当前画布
        this.dragSheetEle = null;
        this.sourceSheetIndex = null;
        this.changeSheetIndex = null;

        this.editor.editorViewer?.changeFileModifyDirty();
        this.editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        this.editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
          parts: ["bottommenu"],
        });
        this.editor.bus.executeAll();
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },

    /**
     * 拖拽元素离开，清空元素
     */
    sheetDragCancel(e) {
      if (this.dragSheetEle) {
        //还原样式
        let children = this.dragSheetEle.parentElement.children;
        for (let i = 0; i < children.length - 2; i++) {
          children[i].style.borderLeft = "";
          children[i].style.borderRight = "";
        }
        //刷新当前画布
        this.sourceSheetIndex = null;
        this.changeSheetIndex = null;
      }
    },



    /**
     * 开始修改页标题
     */
    startChangeSheetName(sheet, evt) {
      let ele = evt.target;
      let domPos = DDeiUtil.getDomAbsPosition(ele);
      let input = document.getElementById("change_sheet_name_input");
      if (!input) {
        input = document.createElement("input");
        input.setAttribute("id", "change_sheet_name_input");
        input.style.position = "absolute";
        document.body.appendChild(input);
        input.onblur = function () {
          //设置属性值
          if (input.value) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let file = editor?.files[editor?.currentFileIndex];
            let sheet = file?.sheets[file?.currentSheetIndex];
            if (input.value != sheet.name) {
              sheet.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
                parts: ["bottommenu"],
              });
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
            }
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
          }
        };
        input.onkeydown = function (e) {
          //回车
          if (e.keyCode == 13) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let file = editor?.files[editor?.currentFileIndex];
            let sheet = file?.sheets[file?.currentSheetIndex];
            if (input.value != sheet.name) {
              sheet.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
                parts: ["bottommenu"],
              });
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
            }
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
          } else if (e.keyCode == 27) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            input.style.display = "none";
            input.style.left = "0px";
            input.style.top = "0px";
            input.value = "";
            editor.changeState(DDeiEditorState.DESIGNING);
          }
        };
      }
      input.style.width = ele.offsetWidth + "px";
      input.style.height = ele.offsetHeight + "px";
      input.style.left = domPos.left + "px";
      input.style.top = domPos.top + "px";
      input.style.outline = "1px solid #017fff";
      input.style.border = "none";
      input.style.borderRadius = "1px";
      input.value = sheet.name;
      input.style.display = "block";
      input.selectionStart = 0; // 选中开始位置
      input.selectionEnd = input.value.length; // 获取输入框里的长度。
      input.focus();
      //修改编辑器状态为快捷编辑中
      this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
    },



    /**
     * 修改当前的全局缩放比率
     */
    changeRatio() {
      if (this.currentStage.ratio || this.currentStage.ratio == 0) {
        if (this.currentStage.oldRatio || this.currentStage.oldRatio == 0) {
          this.editor?.bus?.push(
            DDeiEnumBusCommandType.ChangeStageRatio,
            {
              oldValue: this.currentStage.oldRatio,
              newValue: this.currentStage.ratio,
            },
            null
          );
          this.editor?.bus?.executeAll();
        }
      }
    },

    /**
     * 自动设置页面模式，
     */
    autoRatio(type: number) {
      //整页模式，确保所有的控件都能够显示到页面上
      if (type == 1) {
        //所有控件的外接大小
        let maxOutRect = DDeiAbstractShape.getOutRectByPV(
          this.editor.ddInstance.stage.getLayerModels()
        );
        if (maxOutRect.width > 0 && maxOutRect.height > 0) {
          //获取canvas窗体大小
          let canvas = this.editor.ddInstance.render.canvas;
          let rat1 = this.editor.ddInstance.render.ratio;
          let stageRatio = this.currentStage.getStageRatio();
          let hscrollWeight = 0;
          let vscrollWeight = 0;
          if (this.editor.ddInstance.stage.render.hScroll) {
            hscrollWeight = 15;
          }
          if (this.editor.ddInstance.stage.render.vScroll) {
            vscrollWeight = 15;
          }
          let ruleDisplay = DDeiModelArrtibuteValue.getAttrValueByState(
            this.editor.ddInstance.stage,
            "ruler.display",
            true
          );
          let ruleWeight = 0;
          if (ruleDisplay == 1 || ruleDisplay == "1") {
            ruleWeight = 16;
          }
          let cWidth = canvas.width / rat1 - ruleWeight - vscrollWeight;
          let cHeight = canvas.height / rat1 - ruleWeight - hscrollWeight;
          //比例
          let wScale = maxOutRect.width / cWidth;
          let hScale = maxOutRect.height / cHeight;
          let scale = wScale;
          if (wScale < hScale) {
            scale = hScale;
          }
          let sc = stageRatio / scale;

          this.setRatio(sc);
          setTimeout(() => {
            this.editor?.bus?.push(DDeiEnumBusCommandType.CenterStageWPV);
            this.editor?.bus?.executeAll(100);
          }, 10);
        }
      }
    },
    /**
     * 增加缩放比率
     */
    addRatio(deltaRatio: number) {
      let ratio = this.currentStage.getStageRatio();
      let newRatio = parseFloat((ratio + deltaRatio).toFixed(2));
      if (newRatio < 0.25) {
        newRatio = 0.25;
      } else if (newRatio > 10) {
        newRatio = 10;
      }
      this.currentStage.setStageRatio(newRatio);
      this.stageRatio = this.currentStage.ratio;
    },

    /**
     * 设置缩放比率
     */
    setRatio(ratio: number) {
      if (ratio < 0.25) {
        ratio = 0.25;
      } else if (ratio > 10) {
        ratio = 10;
      }
      this.currentStage.setStageRatio(ratio);
      this.stageRatio = this.currentStage.ratio;
    },



    /**
     * 在存在显示隐藏的情况下移动tab
     */
    moveItem(index: number = 0) {
      if (index != 0) {
        let file = this.editor?.files[this.editor?.currentFileIndex];
        let sheets = file?.sheets;
        this.openIndex += index;
        if (this.openIndex > sheets.length - this.maxOpenSize) {
          this.openIndex = sheets.length - this.maxOpenSize;
        } else if (this.openIndex < 0) {
          this.openIndex = 0;
        }
        this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        this.editor.bus.executeAll();
      }
    },

    /**
     * 创建一个sheet
     */
    newSheet() {
      let file = this.editor?.files[this.editor?.currentFileIndex];
      let sheets = file?.sheets;
      let ddInstance = this.editor?.ddInstance;
      if (file && sheets && ddInstance) {
        let i = sheets.length + 1;

        let stage = DDeiStage.initByJSON(
          { id: "stage" },
          { currentDdInstance: ddInstance }
        );
        sheets.push(
          new DDeiSheet({
            name: "页面-" + i,
            desc: "页面-" + i,
            stage: stage,
          })
        );
        file.changeSheet(sheets.length - 1);
        //刷新页面
        ddInstance.stage = stage;
        this.currentStage = stage;
        //加载场景渲染器
        stage.initRender();
        //设置视窗位置到中央
        if (!stage.wpv) {
          //缺省定位在画布中心点位置
          stage.wpv = {
            x: -(stage.width - ddInstance.render.container.clientWidth) / 2,
            y: -(stage.height - ddInstance.render.container.clientHeight) / 2,
            z: 0,
          };
        }
        ddInstance.bus?.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        ddInstance.bus?.push(DDeiEnumBusCommandType.RefreshShape);
        ddInstance.bus?.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        ddInstance.bus?.executeAll();

        //打开新文件
        let activeIndex = sheets.length - 1;
        this.openIndex = activeIndex + 1 - this.maxOpenSize;
        if (this.openIndex < 0) {
          this.openIndex = 0;
        }
      }
    },

    /**
     * 切换sheet
     */
    showMenu(sheet, evt) {
      DDeiUtil.showContextMenu(sheet, evt);

      evt.preventDefault();
      return false;
    },

    /**
     * 切换sheet
     */
    changeSheet(index) {
      let file = this.editor?.files[this.editor?.currentFileIndex];
      let sheets = file?.sheets;
      let ddInstance = this.editor?.ddInstance;
      if (
        file &&
        sheets &&
        ddInstance &&
        (index >= 0 || index < sheets.length)
      ) {
        file.changeSheet(index);
        let stage = sheets[index].stage;
        stage.ddInstance = ddInstance;
        //刷新页面
        ddInstance.stage = stage;
        this.currentStage = stage;
        //加载场景渲染器
        stage.initRender();
        this.editor.changeState(DDeiEditorState.DESIGNING);
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
        ddInstance.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        ddInstance.bus.executeAll();
      }
    },


    showChangeRatioDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("changeratio_dialog", {
        ratio: this.currentStage?.ratio,
        callback: {
          ok: this.setRatio,
        },
        group: "bottom-dialog"
      }, { type: 2 }, srcElement)
      if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData && DDeiEditor.ACTIVE_INSTANCE.tempDialogData["changeratio_dialog"]) {
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      } else {
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }

    },

    showLayersDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("managelayers_dialog", {
        group: "bottom-dialog"
      }, { type: 3 }, srcElement)
      if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData && DDeiEditor.ACTIVE_INSTANCE.tempDialogData["managelayers_dialog"]) {
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      } else {
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }

    },
  },
};
</script>

<style scoped>
.iconfont {
  font-size: 16px;
}

.ddei_editor_bottommenu {
  height: 50px;
  display: flex;
  color: black;
  justify-content: center;
  align-items: center;
  font-size: 16px;
}

.ddei_editor_bottommenu_addpage {
  flex: 0 0 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_pages {
  flex: 1;
  display: block;
  text-align: center;
}

.ddei_editor_bottommenu_pages_movebox {
  width: 25px;
  float: left;
  text-align: center;
}

.ddei_editor_bottommenu_pages_movebox:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_bottommenu_page {
  float: left;
  height: 27px;
  border-right: 1px solid #CACAD5;
  padding: 0 10px;
  text-align: center;
}

.ddei_editor_bottommenu_page span {
  height: 27px;
  width: 80px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
}

.ddei_editor_bottommenu_page span:hover {
  color: #1F72FF;
  cursor: pointer;
  background: #EBEBF5;
}

.ddei_editor_bottommenu_page_selected {
  float: left;
  height: 27px;
  border-right: 1px solid #CACAD5;
  padding: 0 10px;
  text-align: center;
}

.ddei_editor_bottommenu_page_selected span {
  height: 27px;
  width: 80px;
  background: #EBEBF5;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #1F72FF;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
}

.ddei_editor_bottommenu_shapecount {
  flex: 0 0 100px;
  display: block;
  text-align: center;
}

.ddei_editor_bottommenu_layers {
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ddei_editor_bottommenu_other_play {
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ddei_editor_bottommenu_all_page_ratio {
  flex: 0 0 50px;
  display: flex;
  align-items: center;
  justify-content: center;

}

.ddei_editor_bottommenu_other_changesize {
  flex: 0 0 157px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_editor_bottommenu_other_changesize span {
  float: left;
  margin-left: 5px;
  margin-right: 5px;
}

.ddei_editor_bottommenu_other_changesize div {
  float: left;
  padding-left: 5px;
  padding-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ddei_editor_bottommenu_other_changesize_combox {
  float: left;
  padding-left: 5px;
  padding-right: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_editor_bottommenu_other_changesize_combox:hover {
  background-color: rgb(235, 235, 235);
  cursor: pointer;
}


.ddei_editor_bottommenu_other_changesize input {
  float: left;
  width: 100px;
  border-radius: 4px;
}
</style>
