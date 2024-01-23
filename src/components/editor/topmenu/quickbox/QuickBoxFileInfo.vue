<template>
  <div class="ddei_editor_file_info">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div class="button-v" @click="newFile" title="新建">
          <span class="iconfont icon-a-ziyuan193"></span>
          <div class="text">新建</div>
        </div>
      </div>
      <div class="part">
        <div class="button-h">
          <div class="button" @click="openFile" title="打开">
            <span class="iconfont icon-a-ziyuan133"></span>
            <div class="text">打开</div>
          </div>
          <div class="button" title="导入">
            <span class="iconfont icon-a-ziyuan120"></span>
            <div class="text">导入</div>
          </div>
        </div>
      </div>
      <div class="part">
        <div class="button-v" @click="save" title="保存">
          <span class="iconfont icon-a-ziyuan178"></span>
          <div class="text">保存</div>
        </div>
      </div>
    </div>
    <div class="tail">
      文件
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
      file: {},
      fileNameEditing: false,
      fileDescEditing: false,
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.file = this.editor?.files[this.editor?.currentFileIndex];
  },
  methods: {
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
                    ddInstance.bus.push(
                      DDeiEditorEnumBusCommandType.RefreshEditorParts,
                      { parts: ["bottommenu", "topmenu"] }
                    );
                    ddInstance?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
                    ddInstance?.bus?.executeAll();
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
          ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
          ddInstance.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
            parts: ["bottommenu", "topmenu"],
          });

          this.editor.changeState(DDeiEditorState.DESIGNING);
          ddInstance?.bus?.executeAll();
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_file_info {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;
  text-align: center;

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #E2E2EB;
    padding: 0px 4px;

    .part {
      padding: 0px 2px;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;

      .button-v {
        flex: 1;
        height: 50px;
        display: flex;
        flex-direction: column;


        .text {
          white-space: nowrap;
          flex: 0 0 13px;
          font-size: 14px;
          font-family: "Microsoft YaHei";
          font-weight: 400;
          color: #000000;
        }
      }

      .button-v:hover {
        cursor: pointer;
        background-color: #e6e6e6;
      }

      .button-h {
        flex: 1;

        display: flex;
        flex-direction: column;

        .button {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 4px;


          .iconfont {
            flex: 1;
          }

          .text {
            white-space: nowrap;
            flex: 0 0 25px;
            font-size: 14px;
            font-family: "Microsoft YaHei";
            font-weight: 400;
            color: #000000;
          }
        }

        .button:hover {

          cursor: pointer;
          background-color: #e6e6e6;
        }

      }
    }
  }

  .tail {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
    border-right: 1px solid #E2E2EB;
  }
}
</style>
