<template>
  <div class="ddei_editor_eip">
    <header></header>
    <content>
      <part>
        <div class="button-v" @click="openFile">
          <span class="iconfont icon-a-ziyuan56"></span>
          <div class="text">导出</div>
        </div>
      </part>
      <part>
        <div class="button-v" @click="download">
          <span class="iconfont icon-a-ziyuan66"></span>
          <div class="text">下载</div>
        </div>
      </part>
      <part>
        <div class="button-v" @click="publish">
          <span class="iconfont icon-a-ziyuan116"></span>
          <div class="text">发布</div>
        </div>
      </part>
    </content>
    <tail>发布</tail>
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
  created() { },
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

<style lang="less" scoped>
.ddei_editor_eip {
  height: 103px;
  display: grid;
  grid-template-rows: 20px 57px 26px;
  grid-template-columns: 1fr;
  text-align: center;

  >content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 4px;

    >part {
      flex: 1;
      padding: 0px 2px;
      display: flex;
      justify-content: center;
      align-items: center;

      .button-v {
        flex: 1;
        height: 50px;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
      }

      .button-v:hover {
        cursor: pointer;
        background-color: #e6e6e6;
      }

      .button-v-selected {
        flex: 1;
        height: 50px;
        background-color: #e6e6e6;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
      }

      .button-v-disabled {
        flex: 1;
        height: 50px;
        cursor: not-allowed;
        display: flex;
        flex-direction: column;

        >span {
          color: #bcbcbc;
        }

        .text {

          color: #bcbcbc;
        }
      }

      .text {
        flex: 0 0 20px;
        white-space: nowrap;
        font-size: 14px;
        font-family: "Microsoft YaHei";
        font-weight: 400;
        color: #000000;
      }
    }
  }

  >tail {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
  }
}
</style>
