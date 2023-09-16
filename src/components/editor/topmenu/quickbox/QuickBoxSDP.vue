<template>
  <div class="ddei_editor_sdp">
    <div class="ddei_editor_sdp_item" style="grid-row:1/3">
      <div class="ddei_editor_sdp_item_box" @click="newFile">
        <img width="16px" height="16px" :src="icons['icon-file']" />
        <div>新建</div>
      </div>
      <div class="ddei_editor_sdp_item_box" @click="save">
        <img width="16px" height="16px" :src="icons['icon-save']" />
        <div>保存</div>
      </div>
      <div class="ddei_editor_sdp_item_box" @click="openFile">
        <img width="16px" height="16px" :src="icons['icon-open']" />
        <div>打开</div>
      </div>
      <div class="ddei_editor_sdp_item_box">
        <img width="16px" height="16px" :src="icons['icon-download']" />
        <div>下载</div>
      </div>
    </div>
    <div class="ddei_editor_sdp_item">
      <div class="ddei_editor_sdp_item_text">
        保存
      </div>
    </div>
    <div class="ddei_editor_sdp_file_dialog">

    </div>
  </div>
</template>
<script lang="ts">
import DDeiStoreLocal from '@/components/framework/js/store/local-store';
import DDeiEditor from '../../js/editor';
import ICONS from '../../js/icon';
import DDei from '../../../framework/js/ddei';
import DDeiStage from '../../../framework/js/models/stage';
import DDeiActiveType from '../../js/enums/active-type';
import DDeiFile from '../../js/file';



export default {
  name: "DDei-Editor-Quick-SDP",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      icons: {}
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    for (let i in ICONS) {
      this.icons[i] = ICONS[i].default;
    }
  },
  methods: {

    /**
     * 新建文件
     * @param evt 
     */
    newFile(evt) {
      if (this.editor?.ddInstance) {
        let stage = DDeiStage.initByJSON({ id: "stage_1" });
        let ddInstance = this.editor.ddInstance;
        //加载恢复画布
        ddInstance.stage = stage;
        stage.ddInstance = ddInstance;
        stage.initRender();
        ddInstance.render.drawShape();
      }
    },

    /**
     * 保存
     * @param evt 
     */
    save(evt) {
      if (this.editor?.ddInstance?.stage) {
        //获取json信息
        let file = this.editor?.files[this.editor?.currentFileIndex];
        if (file) {
          let json = file.toJSON();
          if (json) {
            //执行保存
            let storeIns = new DDeiStoreLocal();

            storeIns.save(file.id, json).then((data) => {
              //回写ID
              if (!file.id) {
                file.id = data;
              }
            });
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
            let findId = null;
            for (let j = 0; j < this.editor.files.length; j++) {
              if (this.editor.files[j].id != datas[i].id) {
                findId = datas[i].id
                break;
              }
            }
            if (findId) {
              let storeIns = new DDeiStoreLocal();

              storeIns.load(findId).then((rowData) => {
                //存在数据，执行修改
                if (rowData) {
                  let ddInstance = this.editor?.ddInstance;
                  let file = DDeiFile.loadFromJSON(JSON.parse(rowData.data), { currentDdInstance: ddInstance });
                  this.editor.addFile(file);
                  this.editor.currentFileIndex = this.editor.files.length - 1;
                  let sheets = file?.sheets;

                  if (file && sheets && ddInstance) {
                    for (let i = 0; i < sheets.length; i++) {
                      sheets[i].active = (i == 0 ? DDeiActiveType.ACTIVE : DDeiActiveType.NONE)
                    }
                    let stage = sheets[0].stage;
                    stage.ddInstance = ddInstance;
                    //刷新页面
                    ddInstance.stage = stage;
                    //加载场景渲染器
                    stage.initRender();
                    setTimeout(() => {
                      ddInstance.render.drawShape();
                    }, 100);
                  }
                }
              });
              return;
            }
          }
        }

      });
    },
  }
};
</script>

<style scoped>
.ddei_editor_sdp {
  width: 150px;
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
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;

}

.ddei_editor_sdp_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  grid-column: 1/5;
  color: rgb(120, 120, 120)
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
