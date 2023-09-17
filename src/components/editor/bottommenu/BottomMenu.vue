<template>
  <div id="ddei_editor_bottommenu" class="ddei_editor_bottommenu">
    <div class="ddei_editor_bottommenu_preview">
      <div>
        <img width="25px" height="25px" src="../icons/icon-view.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_pagepreview">
      <div>
        <span>
          页-1
        </span>
        <img width="8px" height="8px" src="../icons/toolbox-expanded.png" />
      </div>
    </div>

    <div class="ddei_editor_bottommenu_addpage" @click="newSheet">
      <div>
        <img src="../icons/icon-add.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_pages">
      <div @click="changeSheet(index)" v-show="index >= openIndex && index < openIndex + maxOpenSize"
        :class="{ 'ddei_editor_bottommenu_page': sheet.active == 0, 'ddei_editor_bottommenu_page_selected': sheet.active == 1 }"
        :title="sheet.desc" v-for="(sheet, index) in  editor?.files[editor?.currentFileIndex]?.sheets ">
        {{ sheet.name }}
      </div>
      <div class="ddei_editor_bottommenu_pages_movebox"
        v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize" @click="moveItem(-1)">
        <img src="../icons/icon-left.png" />
      </div>
      <div class="ddei_editor_bottommenu_pages_movebox"
        v-show="editor?.files[editor?.currentFileIndex]?.sheets?.length > maxOpenSize" @click="moveItem(1)">
        <img src="../icons/icon-right.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_shapecount">
      <div>
        形状数:32
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
        <div class="ddei_editor_bottommenu_other_changesize_combox">
          <span>
            100%
          </span>
          <img style="width:8px;height:8px;margin-top:9px;" width="8px" height="8px"
            src="../icons/toolbox-expanded.png" />
        </div>
        <div>
          <img src="../icons/icon-reduce.png" />
        </div>
        <input type="range" min="0" max="400" value="100" />
        <div>
          <img src="../icons/icon-add.png" />
        </div>
        <div>
          <img src="../icons/icon-screen-full.png" />
        </div>
        <div>
          <img src="../icons/icon-screen-width.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiStage from '@/components/framework/js/models/stage';
import DDeiEditor from '../js/editor';
import DDeiActiveType from '../js/enums/active-type';
import DDeiSheet from '../js/sheet';

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
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.middleWidth', function (newVal, oldVal) {
      let size = parseInt((document.body.offsetWidth - 770) / 67);
      if (size > this.maxOpenSize && this.openIndex > 0) {
        this.openIndex--;
      }
      this.maxOpenSize = size;
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;

  },
  methods: {
    /**
   * 在存在显示隐藏的情况下移动tab
   */
    moveItem(index: number = 0) {
      if (index != 0) {
        let file = this.editor?.files[this.editor?.currentFileIndex];
        let sheets = file?.sheets;
        this.openIndex += index
        if (this.openIndex > sheets.length - this.maxOpenSize) {
          this.openIndex = sheets.length - this.maxOpenSize
        } else if (this.openIndex < 0) {
          this.openIndex = 0
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
        sheets.forEach(sheet => {
          sheet.active = DDeiActiveType.NONE;
        });
        let stage = DDeiStage.initByJSON({ id: 'stage' }, { currentDdInstance: ddInstance });
        sheets.push(new DDeiSheet({ name: "页面-" + i, desc: "页面-" + i, stage: stage, active: DDeiActiveType.ACTIVE }));
        //刷新页面
        ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
        ddInstance.render.drawShape();

        //打开新文件
        let activeIndex = sheets.length - 1;
        this.openIndex = activeIndex + 1 - this.maxOpenSize
        if (this.openIndex < 0) {
          this.openIndex = 0;
        }
      }
    },

    changeSheet(index) {
      let file = this.editor?.files[this.editor?.currentFileIndex];
      let sheets = file?.sheets;
      let ddInstance = this.editor?.ddInstance;
      if (file && sheets && ddInstance && (index >= 0 || index < sheets.length)) {
        for (let i = 0; i < sheets.length; i++) {
          sheets[i].active = (i == index ? DDeiActiveType.ACTIVE : DDeiActiveType.NONE)
        }
        let stage = sheets[index].stage;//DDeiStage.loadFromJSON(sheets[index].stage, { currentDdInstance: ddInstance });
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
  }
};
</script>

<style scoped>
.ddei_editor_bottommenu {
  background: rgb(225, 225, 225);
  display: flex;
  color: black;
}


.ddei_editor_bottommenu_preview {
  flex: 0 0 40px;
  height: 35px;
  padding-top: 5px;
}



.ddei_editor_bottommenu_preview div {
  height: 24px;
  margin-left: 15px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235)
}

.ddei_editor_bottommenu_preview img:hover {
  background-color: rgb(235, 235, 235);
  cursor: pointer;
}

.ddei_editor_bottommenu_preview img {
  width: 24px;
  height: 24px;
}


.ddei_editor_bottommenu_pagepreview {
  flex: 0 0 120px;
  height: 35px;
  padding-top: 5px;

}

.ddei_editor_bottommenu_pagepreview div {
  height: 24px;
  width: 100%;
  margin-left: 5px;
  padding-right: 5px;
  color: black;
  float: left;
  border-right: 1px solid rgb(235, 235, 235)
}


.ddei_editor_bottommenu_pagepreview span {

  padding-right: 5px;
  color: black;
  float: left;
}

.ddei_editor_bottommenu_pagepreview div:hover {
  background-color: rgb(235, 235, 235);
  cursor: pointer;
}

.ddei_editor_bottommenu_pagepreview img {
  float: right;
  width: 24px;
  height: 24px;
  width: 6px;
  height: 6px;
  margin-top: 9px;
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
  border-right: 1px solid rgb(235, 235, 235)
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
  border-right: 1px solid rgb(235, 235, 235)
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
  flex: 0 0 330px;
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
</style>
