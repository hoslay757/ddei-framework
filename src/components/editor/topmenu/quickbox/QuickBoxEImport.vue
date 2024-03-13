<template>
  <div class="ddei_editor_eip">
    <div class="header"></div>
    <div class="content">
      <div class="part">
        <div class="button-v" @click="download">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan424"></use>
          </svg>
          <div class="text">下载</div>
        </div>
      </div>
       <div class="part">
        <div class="button-v" @click="showExportDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan423"></use>
          </svg>
          <div class="text">导出</div>
        </div>
      </div>
      <div class="part">
        <div class="button-v" @click="showShareDialog($event)">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan378"></use>
          </svg>
          <div class="text">分享</div>
        </div>
      </div>

      <div class="part">
        <div class="button-v" @click="publish">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan425"></use>
          </svg>
          <div class="text">发布</div>
        </div>
      </div>
    </div>
    <div class="tail">发布</div>
    <div class="ddei_editor_eip_file_dialog">

    </div>
  </div>
</template>
<script lang="ts">
import DDeiUtil from "@/components/framework/js/util";
import DDeiEditor from "../../js/editor";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiEditorState from "../../js/enums/editor-state";
import DDeiEditorUtil from "../../js/util/editor-util";
import Cookies from "js-cookie";
import JsPDF from 'jspdf'
import DDeiModelArrtibuteValue from "@/components/framework/js/models/attribute/attribute-value";
import DDeiConfig from "@/components/framework/js/config";

export default {
  name: "DDei-Editor-Quick-EImport",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      user: null
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let userCookie = Cookies.get("user");
    if (userCookie) {
      this.user = JSON.parse(userCookie)
    }

  },
  methods: {

    showExportDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("export_option_dialog", {
        callback: {
        },
        group: "top-dialog",
        background: "white",
        opacity: "1%",
        event: -1
      }, {}, srcElement)

      if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData && DDeiEditor.ACTIVE_INSTANCE.tempDialogData["export_option_dialog"]) {
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      } else {
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },

    showShareDialog(evt: Event) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("create_share_dialog", {
        callback: {
        },
        group: "top-dialog",
        background: "white",
        opacity: "1%",
        event: -1
      }, {}, srcElement)


      if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData && DDeiEditor.ACTIVE_INSTANCE.tempDialogData["create_share_dialog"]) {
        this.editor.changeState(DDeiEditorState.PROPERTY_EDITING);
      } else {
        this.editor.changeState(DDeiEditorState.DESIGNING);
      }
    },
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

    /**
     * 导出pdf
     */
    async exportFile(){
      let file = this.editor?.files[this.editor?.currentFileIndex];
        if (file) {
          let stage = this.editor?.ddInstance.stage
          //获取纸张信息
          let paperType = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.type", true);
          let paperDirect = DDeiModelArrtibuteValue.getAttrValueByState(stage, "paper.direct", true);
          let paperConfig = DDeiConfig.PAPER[paperType];
          //获取缩放比例
          let paperWidth,paperHeight
          if (paperDirect == 1 || paperDirect == '1') {
            paperWidth = paperConfig.width
            paperHeight = paperConfig.height
          } else {
            paperHeight = paperConfig.width
            paperWidth = paperConfig.height
          }
          let pdf = new JsPDF(paperDirect == 2 || paperDirect == '2' ? 'l':'' , paperConfig.unit, paperConfig.code)
          //剪切成多张图片
          let first = true
          let sheets = file.sheets
          let scaleSize = 2
          for(let i = 0;i < sheets.length;i++){
            let sheet = sheets[i]
            //计算纸张的有效区域大小
            let paperArea = sheet.stage.getPaperArea()
            let stageImages = await DDeiUtil.cutStageToImages(this.editor.ddInstance,sheet.stage, paperArea.unitWidth,paperArea.unitHeight,paperArea.x,paperArea.y,paperArea.x+paperArea.w,paperArea.y+paperArea.h,scaleSize)
            for(let k = 0;k < stageImages.length;k++){
              let imageBase64 = stageImages[k]
              if(imageBase64){
                if(!first){
                  pdf.addPage()
                }
                pdf.addImage(imageBase64, 'PNG', 0, 0, paperWidth,paperHeight)
                first = false
              }
            }
          }

          let exportName = file.name
          if(file.version){
            exportName += "-v"+file.version+".pdf"
          }
          pdf.save(exportName)
        }
    }
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

  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 4px;

    .part {
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
        align-items: center;
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
        align-items: center;
      }

      .button-v-disabled {
        flex: 1;
        height: 50px;
        cursor: not-allowed;
        display: flex;
        flex-direction: column;
        align-items: center;

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

  .tail {
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
