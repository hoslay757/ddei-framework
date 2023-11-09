<template>
  <div class="ddei_editor_file_info">
    <div class="ddei_editor_file_info_content">
      <div class="ddei_editor_file_info_gohome">
        <img :src="icons['icon-go-left']">
      </div>
      <div class="ddei_editor_file_info_icon">
        <img :src="icons['icon-basic-shape']">
        <div v-show="file?.state == 0"
             class="ddei_editor_file_info_item_filename_state">✓</div>
      </div>
      <div class="ddei_editor_file_info_basic">
        <div class="ddei_editor_file_info_item_filename"
             :title="file?.name"
             v-show="!fileNameEditing"
             @click="startFileNameEditing()">
          {{file?.name}}
        </div>
        <div class="ddei_editor_file_info_item_filename"
             :title="file?.name"
             v-show="fileNameEditing">
          <input id="ddei_change_filename_input"
                 class="ddei_change_filename_input"
                 @blur="fileNameEditing && enterFileName(1,$event)"
                 @keyup="fileNameEditing && enterFileName(0,$event)">
        </div>
        <div class="ddei_editor_file_info_item_buttons">
          <div class="ddei_editor_file_info_item_button"
               @click="newFile"
               title="新建">
            <img :src="icons['icon-file']" />
          </div>
          <div class="ddei_editor_file_info_item_button"
               @click="openFile"
               title="打开">
            <img :src="icons['icon-open']" />
          </div>
          <div class="ddei_editor_file_info_item_button"
               title="导入">
            <img :src="icons['icon-download']" />
          </div>
          <div class="ddei_editor_file_info_item_button"
               @click="save"
               title="保存">
            <img :src="icons['icon-save']" />
          </div>

        </div>

        <div class="ddei_editor_file_info_item_filedesc"
             :title="file?.desc"
             v-show="!fileDescEditing"
             @click="startFileDescEditing">
          {{file?.desc ? file?.desc : '点击添加备注'}}
        </div>
        <div class="ddei_editor_file_info_item_filedesc"
             :title="file?.desc"
             v-show="fileDescEditing">
          <textarea id="ddei_change_filedesc_input"
                    class="ddei_change_filedesc_input"
                    @blur="fileDescEditing && enterFileDesc(1,$event)"
                    @keyup="fileDescEditing && enterFileDesc(0,$event)"></textarea>
        </div>
        <div class="ddei_editor_file_info_item_filestate">
          <div class="ddei_editor_file_info_item_filestate_msg"
               v-if="file?.state == 1">
            新建
          </div>
          <div class="ddei_editor_file_info_item_filestate_msg"
               v-if="file?.state == 0">
            已保存
          </div>
          <div class="ddei_editor_file_info_item_filestate_msg"
               v-if="file?.state == 2">
            已修改，未保存
          </div>
          <div class="ddei_editor_file_info_item_filestate_msg"
               v-if="file?.state == 3">
            已删除
          </div>
          <div class="ddei_editor_file_info_item_filestate_msg"
               v-if="file?.state == 4">
            正在保存
          </div>
          <div class="ddei_editor_file_info_item_filestate_time">{{file?.lastUpdateTime}}</div>
        </div>
      </div>
    </div>
    <div style="margin:auto">
      <div class="ddei_editor_file_info_desc">
        文件
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import DDeiStoreLocal from "@/components/framework/js/store/local-store";
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiEditor from "../../js/editor";
import DDeiActiveType from "../../js/enums/active-type";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiEditorState from "../../js/enums/editor-state";
import DDeiFileState from "../../js/enums/file-state";
import DDeiFile from "../../js/file";
import ICONS from "../../js/icon";
import DDei from "../../../framework/js/ddei";
import DDeiStage from "../../../framework/js/models/stage";
import DDeiSheet from "../../js/sheet";

export default {
  name: "DDei-Editor-File-Info",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      icons: ICONS,
      file: {},
      fileNameEditing: false,
      fileDescEditing: false,
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.file = this.editor?.files[this.editor?.currentFileIndex];
  },
  methods: {
    /**
     * 开始编辑文件名
     */
    startFileNameEditing() {
      this.fileNameEditing = true;
      let input = document.getElementById("ddei_change_filename_input");
      input.value = this.file.name;
      setTimeout(() => {
        input.selectionStart = 0; // 选中开始位置
        input.selectionEnd = input.value.length; // 获取输入框里的长度。
        input.focus();
      }, 20);
    },

    /**
     * 确定修改文件名
     * type 1 确认 0交由事件处理
     */
    enterFileName(type: number, evt) {
      let input = document.getElementById("ddei_change_filename_input");
      if (type == 1 || evt.keyCode == 13) {
        this.file.name = input.value;
        this.fileNameEditing = false;
        input.value = "";
        this.editor.editorViewer?.changeFileModifyDirty();
        this.editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        this.editor.bus.executeAll();
        this.editor.changeState(DDeiEditorState.DESIGNING);
        this.editor.editorViewer?.forceRefreshOpenFilesView();
      } else if (evt.keyCode == 27) {
        this.fileNameEditing = false;
        input.value = "";
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },

    /**
     * 开始编辑文件备注
     */
    startFileDescEditing() {
      this.fileDescEditing = true;
      let input = document.getElementById("ddei_change_filedesc_input");
      input.value = this.file.desc;

      setTimeout(() => {
        input.selectionStart = 0; // 选中开始位置
        input.selectionEnd = input.value.length; // 获取输入框里的长度。
        input.focus();
      }, 20);
    },

    /**
     * 确定修改备注
     * type 1 确认 0交由事件处理
     */
    enterFileDesc(type: number, evt) {
      let input = document.getElementById("ddei_change_filedesc_input");
      if (type == 1 || evt.keyCode == 13) {
        this.file.desc = input.value;
        input.value = "";
        this.fileDescEditing = false;
        this.editor.editorViewer?.changeFileModifyDirty();
        this.editor.bus.push(DDeiEditorEnumBusCommandType.AddFileHistroy);
        this.editor.bus.executeAll();
        this.editor.changeState(DDeiEditorState.DESIGNING);
        this.editor.editorViewer?.forceRefreshOpenFilesView();
      } else if (evt.keyCode == 27) {
        input.value = "";
        this.fileDescEditing = false;
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },

    /**
     * 保存
     * @param evt
     */
    save(evt) {
      this.editor.changeState(DDeiEditorState.DESIGNING);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.SaveFile, {}, evt);
      this.editor.bus.executeAll();
    },

    /**
     * 打开文件
     * @param evt
     */
    openFile(evt) {
      //执行保存
      let storeIns = new DDeiStoreLocal();
      storeIns.find("").then((datas) => {
        //找到第一个没有打开的文件，执行打开 TODO
        if (datas) {
          for (let i = 0; i < datas.length; i++) {
            let finded = false;
            for (let j = 0; j < this.editor.files.length; j++) {
              if (this.editor.files[j].id == datas[i].id) {
                finded = true;
                break;
              }
            }
            if (!finded) {
              let storeIns = new DDeiStoreLocal();

              storeIns.load(datas[i].id).then((rowData) => {
                //存在数据，执行修改
                if (rowData) {
                  let ddInstance = this.editor?.ddInstance;
                  let file = DDeiFile.loadFromJSON(JSON.parse(rowData.data), {
                    currentDdInstance: ddInstance,
                  });
                  this.editor.addFile(file);
                  for (let x = 0; x < this.editor.files.length; x++) {
                    this.editor.files[x].active = DDeiActiveType.NONE;
                  }
                  this.editor.currentFileIndex = this.editor.files.length - 1;
                  file.state = DDeiFileState.NONE;
                  file.active = DDeiActiveType.ACTIVE;
                  let sheets = file?.sheets;

                  if (file && sheets && ddInstance) {
                    file.changeSheet(file.currentSheetIndex);

                    let stage = sheets[file.currentSheetIndex].stage;
                    stage.ddInstance = ddInstance;
                    //记录文件初始日志
                    file.initHistroy();
                    file.histroy[0].isNew = true;
                    //刷新页面
                    ddInstance.stage = stage;
                    //加载场景渲染器
                    stage.initRender();
                    //设置视窗位置到中央
                    if (!stage.wpv) {
                      //缺省定位在画布中心点位置
                      stage.wpv = {
                        x:
                          -(
                            stage.width -
                            ddInstance.render.container.clientWidth
                          ) / 2,
                        y:
                          -(
                            stage.height -
                            ddInstance.render.container.clientHeight
                          ) / 2,
                        z: 0,
                      };
                    }
                    this.editor.changeState(DDeiEditorState.DESIGNING);
                    ddInstance.bus.push(
                      DDeiEditorEnumBusCommandType.ClearTemplateUI
                    );
                    ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
                    ddInstance?.bus?.executeAll();
                    this.editor.editorViewer?.forceRefreshBottomMenu();
                    this.editor.editorViewer?.forceRefreshTopMenuView();
                  }
                }
              });
              return;
            }
          }
        }
      });
    },

    /**
     * 新建文件
     * @param evt
     */
    newFile(evt) {
      if (this.editor?.ddInstance) {
        let ddInstance = this.editor.ddInstance;
        let file = DDeiFile.loadFromJSON(
          {
            name: "新建文件_NEW",
            path: "/新建文件_NEW",
            sheets: [
              new DDeiSheet({
                name: "页面-1",
                desc: "页面-1",
                stage: DDeiStage.initByJSON({ id: "stage_1" }),
                active: DDeiActiveType.ACTIVE,
              }),
            ],
            currentSheetIndex: 0,
            state: DDeiFileState.NEW,
            active: DDeiActiveType.ACTIVE,
          },
          { currentDdInstance: ddInstance }
        );
        //添加文件
        if (this.editor.currentFileIndex != -1) {
          this.editor.files[this.editor.currentFileIndex].active =
            DDeiActiveType.NONE;
        }
        this.editor.addFile(file);
        this.editor.currentFileIndex = this.editor.files.length - 1;
        let sheets = file?.sheets;
        if (file && sheets && ddInstance) {
          let stage = sheets[0].stage;
          stage.ddInstance = ddInstance;
          //刷新页面
          ddInstance.stage = stage;
          //记录文件初始日志
          file.initHistroy();
          //设置视窗位置到中央
          if (!stage.wpv) {
            //缺省定位在画布中心点位置
            stage.wpv = {
              x: -(stage.width - ddInstance.render.container.clientWidth) / 2,
              y: -(stage.height - ddInstance.render.container.clientHeight) / 2,
              z: 0,
            };
          }
          //加载场景渲染器
          stage.initRender();
          ddInstance.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
          ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
          this.editor.changeState(DDeiEditorState.DESIGNING);
          ddInstance?.bus?.executeAll();
          this.editor.editorViewer?.forceRefreshBottomMenu();
          this.editor.editorViewer?.forceRefreshTopMenuView();
        }
      }
    },
  },
};
</script>

<style scoped>
.ddei_editor_file_info {
  width: 350px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  display: grid;
  grid-template-rows: 64px 20px;
  grid-template-columns: 1fr;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_file_info_content {
  display: flex;
}

.ddei_editor_file_info_gohome {
  flex: 0 0 32px;
}
.ddei_editor_file_info_gohome img {
  width: 32px;
  height: 32px;
  margin-top: 5px;
}
.ddei_editor_file_info_gohome img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_editor_file_info_icon {
  flex: 0 0 54px;
}

.ddei_editor_file_info_icon img {
  width: 44px;
  height: 44px;
  margin-top: 5px;
  border: 1px solid rgb(230, 230, 230);
}
.ddei_editor_file_info_basic {
  flex: 1;
  display: grid;
  grid-template-rows: 26px 38px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
}

.ddei_editor_file_info_item_filename {
  font-size: 16px;
  grid-column: 1/6;
  color: black;
  margin-right: 5px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 142px;
  overflow: hidden;
  font-weight: bold;
}

.ddei_editor_file_info_item_filename:hover {
  cursor: pointer;
}

.ddei_editor_file_info_item_filename_state {
  position: relative;
  width: 12px;
  font-size: 12px;
  color: green;
  left: 33px;
  top: -55px;
}

.ddei_editor_file_info_item_filestate {
  font-size: 12px;
  grid-column: 6/9;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  padding-top: 4px;
  text-align: center;
  color: rgb(110, 110, 110);
}

.ddei_editor_file_info_item_buttons {
  grid-column: 6/9;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

.ddei_editor_file_info_item_button img {
  width: 16px;
  height: 16px;
  filter: brightness(40%);
  margin-top: 4px;
  margin-left: 4px;
}

.ddei_editor_file_info_item_button:hover {
  background: rgb(210, 210, 210);
  cursor: pointer;
  border-radius: 4px;
}

.ddei_editor_file_info_item_filedesc {
  font-size: 13px;
  grid-column: 1/6;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(110, 110, 110);
  overflow: hidden;
}

.ddei_editor_file_info_item_filedesc:hover {
  font-weight: bold;
  cursor: pointer;
}

.ddei_editor_file_info_desc {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
}

.ddei_change_filedesc_input {
  width: 100%;
  height: 100%;
  border-width: 0.5px;
  border-radius: 4px;
  resize: none;
}

.ddei_change_filename_input {
  width: 100%;
  height: 100%;
  border-width: 0.5px;
  border-radius: 4px;
}
</style>
