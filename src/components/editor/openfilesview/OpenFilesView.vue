<template>
  <div id="ddei_editor_ofsview"
       @mousedown="changeEditorFocus()"
       class="ddei_editor_ofsview">
    <div v-show="this.editor?.leftWidth == 0"
         class="ddei_editor_ofsview_expandbox"
         @click="expandToolBox">
      <img width="25"
           height="16"
           src="../icons/icon-expand-right.png" />
    </div>
    <div :class="item.active == 1 ? 'ddei_editor_ofsview_item ddei_editor_ofsview_item_selected' : 'ddei_editor_ofsview_item'"
         @click="changeFile(item)"
         draggable="true"
         @dragstart="fileDragStart(index, $event)"
         @dragover="fileDragOver($event)"
         @drop="fileDragDrop($event)"
         @dragleave="fileDragCancel($event)"
         v-for="(item, i) in editor?.files"
         v-show="i >= openIndex && ((i - openIndex + 1) * 160 + 40) <= editor?.middleWidth"
         :title="item.name">
      <img src="../icons/icon-file.png" />
      <span>
        <div class="text"
             @dblclick="startChangeFileName(item,$event)">{{ item.name }}</div>
        <div class="dirty"
             v-show="item.state != 0">ꔷ</div>
      </span>
      <div @click.prevent.stop="closeFile(item, $event)">
        <img src="../icons/toolbox-close.png" />
      </div>
    </div>
    <div style="flex:1 1 1px"></div>
    <div class="ddei_editor_ofsview_movebox"
         v-show="editor?.files?.length > maxOpenSize"
         @click="moveItem(-1)">
      <img width="16"
           height="16"
           src="../icons/icon-left.png" />
    </div>
    <div class="ddei_editor_ofsview_movebox"
         v-show="editor?.files?.length > maxOpenSize"
         @click="moveItem(1)">
      <img width="16"
           height="16"
           src="../icons/icon-right.png" />
    </div>
    <div id="close_file_confirm_dialog"
         class="close_file_confirm_dialog">
      <div class="close_file_confirm_dialog_content">
        当前文件已经被修改，是否保存？
      </div>
      <div class="close_file_confirm_dialog_button">
        <div class="button"
             style="color:white;background-color: #017fff;"
             @click="saveAndCloseFileConfirmDialog">保 存
        </div>
        <div class="button"
             style="border-left:0.1px solid grey;border-right:0.1px solid grey;"
             @click="abortAndCloseFileConfirmDialog">放 弃
        </div>
        <div class="button"
             @click="cancelCloseFileConfirmDialog">取 消</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditor from "../js/editor";
import DDeiActiveType from "../js/enums/active-type";
import DDeiEditorState from "../js/enums/editor-state";
import DDeiFileState from "../js/enums/file-state";
import DDeiFile from "../js/file";
import DDeiEditorUtil from "../js/util/editor-util";
import DDeiStoreLocal from "@/components/framework/js/store/local-store";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";

export default {
  name: "DDei-Editor-OpenFielsView",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      //当前打开的页的开始下标
      openIndex: 0,
      //最大可以打开的数量
      maxOpenSize: 1,
      tempFile: null,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.middleWidth", function (newVal, oldVal) {
      let size = parseInt((newVal - 40) / 160);
      if (size > this.maxOpenSize && this.openIndex > 0) {
        this.openIndex--;
      }
      this.maxOpenSize = size;
    });
    // 监听文件列表大小变化
    this.$watch("editor.files.length", function (newVal, oldVal) {
      //打开新文件
      let activeIndex = -1;
      for (let i = 0; i < this.editor.files.length; i++) {
        if (this.editor.files[i].active == DDeiActiveType.ACTIVE) {
          activeIndex = i;
          break;
        }
      }

      this.openIndex = activeIndex + 1 - this.maxOpenSize;
      if (this.openIndex < 0) {
        this.openIndex = 0;
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.editor.openFilesViewer = this;
  },
  methods: {
    /**
     * 修改文件标题
     */
    startChangeFileName(file, evt) {
      let ele = evt.target;
      let domPos = DDeiUtil.getDomAbsPosition(ele);
      let input = document.getElementById("change_file_name_input");
      if (!input) {
        input = document.createElement("input");
        input.setAttribute("id", "change_file_name_input");
        input.style.position = "absolute";
        document.body.appendChild(input);
        input.onblur = function () {
          //设置属性值
          if (input.value) {
            let editor = DDeiEditor.ACTIVE_INSTANCE;
            let file = editor?.files[editor?.currentFileIndex];
            if (input.value != file.name) {
              file.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
              editor.editorViewer?.forceRefreshOpenFilesView();
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
            if (input.value != file.name) {
              file.name = input.value;
              editor.editorViewer?.changeFileModifyDirty();
              editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
              editor.bus.executeAll();
              editor.changeState(DDeiEditorState.DESIGNING);
              editor.editorViewer?.forceRefreshOpenFilesView();
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
      input.style.height = ele.offsetHeight - 3 + "px";
      input.style.left = domPos.left + "px";
      input.style.top = domPos.top + "px";
      input.style.border = "none";
      input.style.outline = "none";
      input.style.borderBottom = "2px solid #017fff";
      input.style.borderRadius = "1px";
      input.value = file.name;
      input.style.display = "block";
      input.selectionStart = 0; // 选中开始位置
      input.selectionEnd = input.value.length; // 获取输入框里的长度。
      input.focus();
      //修改编辑器状态为快捷编辑中
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
      this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
    },

    /**
     * file开始拖拽移动
     */
    fileDragStart(fileEle, evt) {
      this.dragFileEle = evt.target;
    },

    /**
     * 拖拽元素移动
     */
    fileDragOver(e) {
      if (this.dragFileEle) {
        if (e.target.className == "text") {
          let parentDiv = this.dragFileEle.parentElement;
          let sourceIndex = -1;
          let targetIndex = -1;
          let children = parentDiv.children;
          for (let i = 1; i < children.length - 4; i++) {
            children[i].style.borderLeft = "";
            children[i].style.borderRight = "";
            if (children[i] == this.dragFileEle) {
              sourceIndex = i;
            } else if (e.target.parentElement.parentElement == children[i]) {
              targetIndex = i;
            }
          }
          if (sourceIndex != -1 && targetIndex != -1) {
            this.sourceFileIndex = sourceIndex - 1;
            if (targetIndex == children.length - 5) {
              let pos = DDeiUtil.getDomAbsPosition(children[targetIndex]);
              let halfPos = pos.left + children[targetIndex].offsetWidth / 2;
              if (
                halfPos <= e.clientX &&
                e.clientX <= pos.left + children[targetIndex].offsetWidth
              ) {
                this.changeFileIndex = targetIndex;
                children[targetIndex].style.borderRight = "2px solid #017fff";
              } else {
                this.changeFileIndex = targetIndex - 1;
                children[targetIndex].style.borderLeft = "2px solid #017fff";
              }
            } else {
              this.changeFileIndex = targetIndex - 1;
              children[targetIndex].style.borderLeft = "2px solid #017fff";
            }
          }

          e.preventDefault();
        }
      }
    },

    /**
     * 拖拽元素放开
     */
    fileDragDrop(e) {
      if (
        (this.sourceFileIndex || this.sourceFileIndex == 0) &&
        (this.changeFileIndex || this.changeFileIndex == 0)
      ) {
        //修改file位置
        let files = this.editor.files;
        let sourceFile = this.editor.files[this.sourceFileIndex];
        let currentFile = this.editor.files[this.editor.currentFileIndex];
        files[this.sourceFileIndex] = null;
        files.splice(this.changeFileIndex, 0, sourceFile);
        for (let j = files.length; j >= 0; j--) {
          if (files[j] == null) {
            files.splice(j, 1);
          }
        }
        for (let j = files.length; j >= 0; j--) {
          if (currentFile == files[j]) {
            this.editor.currentFileIndex = j;
          }
        }
        //刷新当前画布
        this.dragFileEle = null;
        this.sourceFileIndex = null;
        this.changeFileIndex = null;

        this.editor.editorViewer?.forceRefreshOpenFilesView();
      }
    },

    /**
     * 拖拽元素离开，清空元素
     */
    fileDragCancel(e) {
      if (this.dragFileEle) {
        let parentDiv = this.dragFileEle.parentElement;
        let children = parentDiv.children;
        for (let i = 1; i < children.length - 4; i++) {
          children[i].style.borderLeft = "";
          children[i].style.borderRight = "";
        }
        //刷新当前画布
        this.dragFileEle = null;
        this.sourceFileIndex = null;
        this.changeFileIndex = null;
      }
    },

    /**
     * 变更实例
     * @param instance
     */
    changeFile(file) {
      if (file.active != DDeiActiveType.ACTIVE) {
        this.editor.files.forEach((item) => {
          item.active = DDeiActiveType.NONE;
        });
        file.active = DDeiActiveType.ACTIVE;
        //刷新画布
        this.editor.currentFileIndex = this.editor?.files?.indexOf(file);
        let sheets = file?.sheets;
        let ddInstance = this.editor?.ddInstance;
        if (file && sheets && ddInstance) {
          let stage = sheets[file.currentSheetIndex].stage;
          stage.ddInstance = ddInstance;
          //刷新页面
          ddInstance.stage = stage;
          //加载场景渲染器
          stage.initRender();
          ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
          ddInstance?.bus?.executeAll();
          this.editor.editorViewer?.forceRefreshBottomMenu();
          this.editor.editorViewer?.forceRefreshTopMenuView();
        }
      }
    },

    /**
     * 关闭确认弹框
     */
    cancelCloseFileConfirmDialog() {
      let confirmDialog = document.getElementById("close_file_confirm_dialog");
      confirmDialog.style.display = "none";
    },

    /**
     * 放弃并关闭确认弹框
     */
    abortAndCloseFileConfirmDialog() {
      this.tempFile.state = DDeiFileState.NONE;
      let confirmDialog = document.getElementById("close_file_confirm_dialog");
      confirmDialog.style.display = "none";
      this.closeFile(this.tempFile);
    },

    /**
     * 保存
     * @param evt
     */
    saveAndCloseFileConfirmDialog() {
      if (this.tempFile) {
        //获取json信息
        let file = this.tempFile;
        if (file) {
          let json = file.toJSON();
          if (json) {
            //执行保存
            let storeIns = new DDeiStoreLocal();
            json.state = DDeiFileState.NONE;
            storeIns.save(file.id, json).then((data) => {
              //回写ID
              file.id = data;
              file.state = DDeiFileState.NONE;
              let confirmDialog = document.getElementById(
                "close_file_confirm_dialog"
              );
              confirmDialog.style.display = "none";
              this.closeFile(this.tempFile);
            });
          }
        }
      }
    },

    /**
     * 关闭文件
     * @param instance
     */
    closeFile(file, evt) {
      //如果文件为脏状态，询问是否保存，放弃，或取消
      if (
        file.state == DDeiFileState.NEW ||
        file.state == DDeiFileState.MODIFY
      ) {
        let confirmDialog = document.getElementById(
          "close_file_confirm_dialog"
        );
        confirmDialog.style.display = "block";

        let pos = DDeiUtil.getDomAbsPosition(evt.target);
        confirmDialog.style.left = pos.left + 5 + "px";
        confirmDialog.style.top = pos.top + 15 + "px";
        this.tempFile = file;
      } else {
        //刷新画布
        let index = this.editor.files.indexOf(file);
        this.editor.removeFile(file);
        if (index < this.editor.currentFileIndex) {
          this.editor.currentFileIndex--;
        } else if (index == this.editor.currentFileIndex) {
          if (index > 0) {
            this.changeFile(
              this.editor.files[this.editor.currentFileIndex - 1]
            );
          } else if (this.editor.files.length > 0) {
            this.changeFile(this.editor.files[0]);
          }
        }
        if (this.editor.files.length == 0) {
          this.editor.currentFileIndex = -1;
        }
        if (index > this.openIndex) {
          this.openIndex--;
          if (this.openIndex < 0) {
            this.openIndex = 0;
          }
        }
      }
    },
    /**
     * 在存在显示隐藏的情况下移动tab
     */
    moveItem(index: number = 0) {
      if (index != 0) {
        this.openIndex += index;
        if (this.openIndex > this.editor.files.length - this.maxOpenSize) {
          this.openIndex = this.editor.files.length - this.maxOpenSize;
        } else if (this.openIndex < 0) {
          this.openIndex = 0;
        }
      }
    },

    /**
     * 展开工具栏
     */
    expandToolBox() {
      let deltaX = 220;
      let frameLeftElement = document.getElementById("ddei_editor_frame_left");
      this.editor.leftWidth = 220;
      frameLeftElement.style.flexBasis = "220px";
      //重新设置画布大小
      this.editor.middleWidth -= deltaX;
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
      this.editor.changeState(DDeiEditorState.DESIGNING);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
    },
  },
};
</script>

<style scoped>
.ddei_editor_ofsview {
  flex: 0 0 25px;
  height: 25px;
  background: rgb(254, 254, 254);
  border-top: 1px solid rgb(235, 235, 239);
  border-bottom: 1px solid rgb(235, 235, 239);
  display: flex;
  user-select: none;
}

.ddei_editor_ofsview_expandbox {
  flex: 0 0 30px;
  height: 25px;
  text-align: center;
}

.ddei_editor_ofsview_expandbox:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_ofsview_expandbox img {
  filter: brightness(60%);
  margin-top: 3px;
}

.ddei_editor_ofsview_movebox {
  flex: 0 0 25px;
  height: 25px;
  text-align: center;
}

.ddei_editor_ofsview_movebox:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_ofsview_movebox img {
  filter: brightness(60%);
  margin-top: 4px;
}

.ddei_editor_ofsview_item {
  flex: 0 0 160px;
  height: 25px;
  display: flex;
}

.ddei_editor_ofsview_item img {
  padding: 3px;
  flex: 0 0 25px;
}

.ddei_editor_ofsview_item span {
  font-size: 13px;
  margin-top: 1px;
  flex: 0 0 110px;
  width: 110px;

  display: flex;
}

.ddei_editor_ofsview_item span .text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: black;
  flex: 1;
}

.ddei_editor_ofsview_item span .dirty {
  color: red;
  width: 10px;
  flex: 0 0 10px;
  font-size: 16px;
  margin-top: -2.5px;
}

.ddei_editor_ofsview_item div {
  height: 25px;
  flex: 0 0 25px;
  margin: auto;
}

.ddei_editor_ofsview_item div img {
  width: 12px;
  height: 12px;
  margin: auto;
  padding: 0px;
}

.ddei_editor_ofsview_item div img:hover {
  background: rgb(200, 200, 200);
  cursor: pointer;
}

.ddei_editor_ofsview_item:hover {
  background: rgb(247, 247, 247);
}

.ddei_editor_ofsview_item_selected span .text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  flex: 1;
  color: #017fff;
  font-weight: bold !important;
}

.ddei_editor_ofsview_item_selected span .dirty {
  color: red;
  width: 10px;
  flex: 0 0 10px;
  font-size: 16px;
  margin-top: -2.5px;
}

/**以下为询问框的样式 */
.close_file_confirm_dialog {
  width: 250px;
  height: 120px;
  background-color: white;
  display: none;
  position: absolute;
  border: 1px solid #017fff;
  border-radius: 6px;
  overflow: hidden;
  z-index: 999;
}

.close_file_confirm_dialog_content {
  width: 100%;
  height: 90px;
  padding-top: 35px;
  border-bottom: 0.3px solid grey;
  color: black;
  font-size: 15px;
  font-weight: bold;
  text-align: center;
}

.close_file_confirm_dialog_button {
  width: 100%;
  height: 30px;
  color: black;
  font-size: 15px;

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.close_file_confirm_dialog_button div {
  width: 100%;
  height: 30px;
  text-align: center;
  padding-top: 1px;
  margin: auto;
}

.close_file_confirm_dialog_button div:hover {
  font-weight: bolder;
  cursor: pointer;
}
</style>
