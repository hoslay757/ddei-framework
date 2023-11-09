<template>
  <div class="ddei_editor_sdp">
    <div class="ddei_editor_sdp_item"
         style="grid-row:1/3">
      <div class="ddei_editor_sdp_item_box"
           @click="openFile">
        <img width="16px"
             height="16px"
             :src="icons['icon-open']" />
        <div>导出</div>
      </div>
      <div class="ddei_editor_sdp_item_box"
           @click="download">
        <img width="16px"
             height="16px"
             :src="icons['icon-download']" />
        <div>下载</div>
      </div>
      <div class="ddei_editor_sdp_item_box"
           @click="download">
        <img width="16px"
             height="16px"
             :src="icons['icon-download']" />
        <div>发布</div>
      </div>
    </div>
    <div class="ddei_editor_sdp_item">
      <div class="ddei_editor_sdp_item_text">
        发布
      </div>
    </div>
    <div class="ddei_editor_sdp_file_dialog">

    </div>
  </div>
</template>
<script lang="ts">
import DDeiStoreLocal from "@/components/framework/js/store/local-store";
import DDeiEditor from "../../js/editor";
import ICONS from "../../js/icon";
import DDei from "../../../framework/js/ddei";
import DDeiStage from "../../../framework/js/models/stage";
import DDeiActiveType from "../../js/enums/active-type";
import DDeiFile from "../../js/file";
import DDeiSheet from "../../js/sheet";
import DDeiFileState from "../../js/enums/file-state";
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiEditorState from "../../js/enums/editor-state";

export default {
  name: "DDei-Editor-Quick-EImport",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      icons: {},
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    for (let i in ICONS) {
      this.icons[i] = ICONS[i];
    }
  },
  methods: {
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
        }
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
     * 下载文件
     */
    download(evt) {
      if (this.editor?.ddInstance?.stage) {
        //获取json信息
        let file = this.editor?.files[this.editor?.currentFileIndex];
        if (file) {
          let json = file.toJSON();
          if (json) {
            // 创建隐藏的可下载链接
            let eleLink = document.createElement("a");
            eleLink.download = file.name + ".dei";
            eleLink.style.display = "none";
            // 字符内容转变成blob地址
            let blob = new Blob([JSON.stringify(json)]);
            eleLink.href = URL.createObjectURL(blob);
            // 触发点击
            document.body.appendChild(eleLink);
            eleLink.click();
            // 然后移除
            document.body.removeChild(eleLink);
            this.editor.changeState(DDeiEditorState.DESIGNING);
          }
        }
      }
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
                  }
                }
              });
              return;
            }
          }
        }
      });
    },
  },
};
</script>

<style scoped>
.ddei_editor_sdp {
  width: 110px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_sdp_item {
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.ddei_editor_sdp_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  grid-column: 1/4;
  color: rgb(120, 120, 120);
}

.ddei_editor_sdp_item_box {
  width: 30px;
  height: 60px;
  color: black;
  border-radius: 4px;
  font-size: 12px;
  display: grid;
  grid-template-rows: 25px 25px 10px;
  grid-template-columns: 1fr;
}

.ddei_editor_sdp_item_box div {
  margin: auto;
}

.ddei_editor_sdp_item_box img {
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  width: 16px;
  height: 16px;
  margin: auto;
}

.ddei_editor_sdp_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
