<template>
  <div id="ddei_editor_bottommenu"
       class="ddei_editor_bottommenu">
    <div class="ddei_editor_bottommenu_addpage"
         @click="newSheet">
      <div>
        <img src="../icons/icon-add.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_pages">
      <div @click.left="changeSheet(index)"
           draggable="true"
           @dragstart="sheetDragStart(index, $event)"
           @click.right="showMenu(sheet,$event)"
           @dragover="sheetDragOver($event)"
           @drop="sheetDragDrop($event)"
           @dragleave="sheetDragCancel($event)"
           @dblclick="startChangeSheetName(sheet,$event)"
           v-show="index >= openIndex && index < openIndex + maxOpenSize"
           :class="{ 'ddei_editor_bottommenu_page': sheet.active == 0, 'ddei_editor_bottommenu_page_selected': sheet.active == 1 }"
           :title="sheet.name"
           v-for="(sheet, index) in  editor?.files[editor?.currentFileIndex]?.sheets ">
        {{ sheet.name }}
      </div>

      <div class="ddei_editor_bottommenu_pages_movebox"
           v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize"
           @click="moveItem(-1)">
        <img src="../icons/icon-left.png" />
      </div>
      <div class="ddei_editor_bottommenu_pages_movebox"
           v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize"
           @click="moveItem(1)">
        <img src="../icons/icon-right.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_shapecount">
      <div>
        形状数: {{ editor?.files[editor?.currentFileIndex]?.modelNumber }}
      </div>
    </div>
    <div class="ddei_editor_bottommenu_layers">
      <div>
        <img src="../icons/icon-layers.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_other">
      <div class="ddei_editor_bottommenu_other_play">
        <div>
          <img src="../icons/icon-play.png" />
        </div>
      </div>
      <div class="ddei_editor_bottommenu_other_changesize">
        <div class="ddei_editor_bottommenu_other_changesize_combox"
             @click="showDialog('ddei_editor_bottommenu_other_changesize_dialog', $event)">
          <span>
            {{ parseInt(currentStage?.ratio * 100) }}%
          </span>
          <img style="width:8px;height:8px;margin-top:9px;"
               width="8px"
               height="8px"
               src="../icons/toolbox-expanded.png" />
        </div>
        <div @click="addRatio(-0.05)">
          <img src="../icons/icon-reduce.png" />
        </div>
        <input type="range"
               min="0.1"
               max="4"
               step="0.1"
               v-model="stageRatio" />
        <div>
          <img src="../icons/icon-add.png"
               @click="addRatio(0.05)" />
        </div>
        <div>
          <img src="../icons/icon-screen-width.png"
               title="整页"
               @click="autoRatio(1)" />
        </div>
      </div>
    </div>
    <div id="ddei_editor_bottommenu_other_changesize_dialog"
         class="ddei_editor_bottommenu_other_changesize_dialog"
         v-show="dialogShow == 'ddei_editor_bottommenu_other_changesize_dialog'">
      <div class="ddei_editor_bottommenu_other_changesize_dialog_title">缩放</div>
      <hr />
      <div class="ddei_editor_bottommenu_other_changesize_dialog_group">
        <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content">
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(4)">
            400%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(2)">
            200%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(1.5)">
            150%
          </div>

          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(1.25)">
            125%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(1)">
            100%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(0.75)">
            75%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(0.5)">
            50%
          </div>
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item"
               @click="setRatio(0.25)">
            25%
          </div>
          <hr />
          <div class="ddei_editor_bottommenu_other_changesize_dialog_group_content_item">
            百分比：<input type="number"
                   min="25"
                   max="1000"
                   v-model="ratioInputValue"
                   @blur="ratioInputChange() && showDialog('ddei_editor_bottommenu_other_changesize_dialog')" />%
          </div>
        </div>
      </div>
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
      dialogShow: "",
      ratioInputValue: 0,
      stageRatio: 1,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.middleWidth", function (newVal, oldVal) {
      let size = parseInt((document.body.offsetWidth - 770) / 67);
      if (size > this.maxOpenSize && this.openIndex > 0) {
        this.openIndex--;
      }
      this.maxOpenSize = size;
    });
    // 监听obj对象中prop属性的变化
    this.$watch("currentStage.ratio", function (newVal, oldVal) {
      this.ratioInputValue = parseFloat(newVal) * 100;
      this.stageRatio = newVal;
      this.changeRatio();
    });
    this.$watch("stageRatio", function (newVal, oldVal) {
      this.setRatio(newVal);
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let file = this.editor?.files[this.editor?.currentFileIndex];
    let sheet = file?.sheets[file?.currentSheetIndex];
    this.currentStage = sheet.stage;
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
      if (this.dragSheetEle) {
        if (this.dragSheetEle.innerHTML != e.target.innerHTML) {
          //寻找当前元素在拖拽元素的位置
          let children = this.dragSheetEle.parentElement.children;
          for (let i = 0; i < children.length - 2; i++) {
            children[i].style.borderLeft = "";
            children[i].style.borderRight = "";
          }
          for (let i = 0; i < children.length - 2; i++) {
            if (children[i] == e.target && i == children.length - 3) {
              let pos = DDeiUtil.getDomAbsPosition(children[i]);
              let halfPos = pos.left + children[i].offsetWidth / 2;
              //最后一个元素的右半部分
              if (
                halfPos <= e.clientX &&
                e.clientX <= pos.left + children[i].offsetWidth
              ) {
                children[i].style.borderRight = "2px solid #017fff";
                this.changeSheetIndex = i + 1;
              } else if (children[i - 1] != this.dragSheetEle) {
                children[i].style.borderLeft = "2px solid #017fff";
                this.changeSheetIndex = i;
              }
            } else if (
              children[i] == e.target &&
              children[i - 1] != this.dragSheetEle
            ) {
              children[i].style.borderLeft = "2px solid #017fff";
              this.changeSheetIndex = i;
            } else if (children[i].innerHTML == this.dragSheetEle.innerHTML) {
              this.sourceSheetIndex = i;
            }
          }
          e.preventDefault();
        }
      }
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
        file.sheets.splice(this.changeSheetIndex, 0, sheet);
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

        this.editor.viewEditor?.changeFileModifyDirty();
        this.editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        this.editor.bus.executeAll();
        this.editor.changeState(DDeiEditorState.DESIGNING);
        this.editor.viewEditor?.forceRefreshBottomMenu();
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
              editor.viewEditor?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
              editor.viewEditor?.forceRefreshBottomMenu();
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
              editor.viewEditor?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
              editor.viewEditor?.forceRefreshBottomMenu();
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
          this.editor.changeState(DDeiEditorState.DESIGNING);
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
      this.dialogShow = "";
      this.stageRatio = this.currentStage.ratio;
    },

    ratioInputChange(evt: Event) {
      if (this.ratioInputValue >= 1000) {
        this.ratioInputValue = 1000;
      }
      this.currentStage.setStageRatio(this.ratioInputValue / 100);
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
        ddInstance?.bus?.push(
          DDeiEditorEnumBusCommandType.AddFileHistroy,
          null,
          null
        );
        ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        ddInstance?.bus?.executeAll();

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
        ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape, null, null);
        ddInstance?.bus?.executeAll();
      }
    },

    /**
     * 显示弹出框
     */
    showDialog(id, evt: Event) {
      if (this.dialogShow == id) {
        this.dialogShow = "";
        this.editor.changeState(DDeiEditorState.DESIGNING);
      } else {
        this.dialogShow = id;
        let dialogEle = document.getElementById(id);
        let srcElement = evt.target;
        if (srcElement.className != "ddei_editor_quick_sort_item_box") {
          srcElement = srcElement.parentElement;
        }
        //获取绝对坐标
        let absPos = DDeiUtil.getDomAbsPosition(srcElement);
        dialogEle.style.left = absPos.left - srcElement.offsetWidth + "px";
        dialogEle.style.bottom = "35px";
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      }
    },
  },
};
</script>

<style scoped>
.ddei_editor_bottommenu {
  background: rgb(225, 225, 225);
  display: flex;
  color: black;
}

.ddei_editor_bottommenu_addpage {
  flex: 0 0 40px;
  height: 35px;
  padding-top: 5px;
}

.ddei_editor_bottommenu_addpage div {
  height: 24px;
  margin-left: 12px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_addpage img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_editor_bottommenu_addpage img {
  filter: brightness(60%);
  margin-top: 3px;
  width: 18px;
  height: 18px;
}

.ddei_editor_bottommenu_pages {
  flex: 1;
  height: 35px;
  padding-top: 5px;
  display: block;
  font-size: 13px;
  text-align: center;
}

.ddei_editor_bottommenu_pages_movebox {
  width: 25px;
  height: 25px;
  float: left;
  text-align: center;
}

.ddei_editor_bottommenu_pages_movebox:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_bottommenu_pages_movebox img {
  filter: brightness(60%);
  margin-top: 4px;
  width: 16px;
  height: 16px;
}

.ddei_editor_bottommenu_page {
  float: left;
  height: 24px;
  margin-left: 5px;
  padding-right: 5px;
  padding-left: 5px;
  border-right: 1px solid rgb(235, 235, 235);
  padding-top: 2px;
  width: 65px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ddei_editor_bottommenu_page:hover {
  color: #017fff;
  cursor: pointer;
}

.ddei_editor_bottommenu_page_selected {
  float: left;
  height: 24px;
  margin-left: 5px;
  padding-right: 5px;
  padding-left: 5px;
  color: #017fff;
  font-weight: bold;
  border-right: 1px solid rgb(235, 235, 235);
  padding-top: 2px;
  width: 65px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.ddei_editor_bottommenu_shapecount {
  flex: 0 0 100px;
  height: 35px;
  padding-top: 5px;
  display: block;
  font-size: 14px;
  text-align: center;
}

.ddei_editor_bottommenu_shapecount div {
  height: 24px;
  padding-top: 1px;
  border-right: 1px solid rgb(235, 235, 235);
  border-left: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_layers {
  flex: 0 0 35px;
  height: 35px;
  padding-top: 5px;
}

.ddei_editor_bottommenu_layers div {
  height: 24px;
  margin-left: 5px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_layers img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_editor_bottommenu_layers img {
  margin-top: 2px;
  width: 22px;
  height: 22px;
}

.ddei_editor_bottommenu_other {
  flex: 0 0 300px;
  height: 35px;
  padding-top: 5px;
}

.ddei_editor_bottommenu_other_play {
  float: left;
}

.ddei_editor_bottommenu_other_play div {
  float: left;
  height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  border-right: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_other_play img:hover {
  filter: brightness(20%);
  cursor: pointer;
}

.ddei_editor_bottommenu_other_play img {
  filter: brightness(40%);
  width: 20px;
  height: 20px;
}

.ddei_editor_bottommenu_other_changesize {
  float: left;
}

.ddei_editor_bottommenu_other_changesize span {
  float: left;
}

.ddei_editor_bottommenu_other_changesize div {
  float: left;
  padding-left: 5px;
  padding-right: 5px;
}

.ddei_editor_bottommenu_other_changesize_combox {
  width: 60px;
}

.ddei_editor_bottommenu_other_changesize_combox:hover {
  background-color: rgb(235, 235, 235);
  float: left;

  padding-left: 5px;
  padding-right: 5px;
  cursor: pointer;
}

.ddei_editor_bottommenu_other_changesize input {
  float: left;
  width: 100px;
  margin-top: 4px;
  border-radius: 4px;
}

.ddei_editor_bottommenu_other_changesize img {
  filter: brightness(40%);
  width: 20px;
  height: 20px;
  float: left;
  margin-top: 2px;
}

.ddei_editor_bottommenu_other_changesize img:hover {
  filter: brightness(20%);
  cursor: pointer;
}

/**以下是翻转按钮的弹出框 */
.ddei_editor_bottommenu_other_changesize_dialog {
  width: 170px;
  position: absolute;
  background-color: white;
  height: 310px;
  border-radius: 4px;
  border: 0.5px solid rgb(220, 220, 220);
  z-index: 999;
  box-shadow: 3px 3px 3px hsl(0deg 0% 0% /0.25);
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.ddei_editor_bottommenu_other_changesize_dialog_title {
  color: black;
  font-weight: bold;
  flex: 0 0 30px;
  padding-top: 5px;
  padding-left: 7px;
}

.ddei_editor_bottommenu_other_changesize_dialog hr {
  border: 0.5px solid rgb(240, 240, 240);
  flex: 0 0 1px;
}

.ddei_editor_bottommenu_other_changesize_dialog_group {
  color: black;
  flex: 1 1 40px;
  padding-left: 5px;
}

.ddei_editor_bottommenu_other_changesize_dialog_group_title {
  padding-left: 10px;
}

.ddei_editor_bottommenu_other_changesize_dialog_group_content {
  width: 100%;
  height: 280px;
  display: flex;
  padding-left: 15px;
  padding-right: 15px;
  flex-direction: column;
}

.ddei_editor_bottommenu_other_changesize_dialog_group_content_item {
  flex: 0 0 30px;
  padding-top: 5px;
  cursor: pointer;
}

.ddei_editor_bottommenu_other_changesize_dialog_group_content_item input {
  border: none;
  outline: none;
}

.ddei_editor_bottommenu_other_changesize_dialog_group_content_item:hover {
  border-radius: 4px;
  background-color: rgb(233, 233, 238);
}
</style>
