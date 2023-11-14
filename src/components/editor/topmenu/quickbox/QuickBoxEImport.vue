<template>
  <div class="ddei_editor_eip">
    <div class="ddei_editor_eip_item"
         style="grid-row:1/3">
      <div class="ddei_editor_eip_item_box"
           @click="openFile">
        <img width="16px"
             height="16px"
             :src="icons['icon-export']" />
        <div>导出</div>
      </div>
      <div class="ddei_editor_eip_item_box"
           @click="download">
        <img width="16px"
             height="16px"
             :src="icons['icon-download']" />
        <div>下载</div>
      </div>
      <div class="ddei_editor_eip_item_box"
           @click="publish">
        <img width="16px"
             height="16px"
             :src="icons['icon-publish-1']" />
        <div>发布</div>
      </div>
    </div>
    <div class="ddei_editor_eip_item">
      <div class="ddei_editor_eip_item_text">
        发布
      </div>
    </div>
    <div class="ddei_editor_eip_file_dialog">

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
     * 发布
     * @param evt
     */
    publish(evt) {
      this.editor.changeState(DDeiEditorState.DESIGNING);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.SaveFile, {
        publish: 1,
      });
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
  },
};
</script>

<style scoped>
.ddei_editor_eip {
  width: 110px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_eip_item {
  margin: auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.ddei_editor_eip_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  grid-column: 1/4;
  color: rgb(120, 120, 120);
}

.ddei_editor_eip_item_box {
  width: 30px;
  height: 60px;
  color: black;
  border-radius: 4px;
  font-size: 12px;
  display: grid;
  grid-template-rows: 25px 25px 10px;
  grid-template-columns: 1fr;
}

.ddei_editor_eip_item_box div {
  margin: auto;
}

.ddei_editor_eip_item_box img {
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  width: 16px;
  height: 16px;
  margin: auto;
}

.ddei_editor_eip_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
