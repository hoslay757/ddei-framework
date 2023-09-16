<template>
  <div id="ddei_editor_ofsview" class="ddei_editor_ofsview">
    <div v-show="this.editor?.leftWidth == 0" class="ddei_editor_ofsview_expandbox" @click="expandToolBox">
      <img width="25" height="16" src="../icons/icon-expand-right.png" />
    </div>
    <div
      :class="item.state == 1 ? 'ddei_editor_ofsview_item ddei_editor_ofsview_item_selected' : 'ddei_editor_ofsview_item'"
      @click="changeInstance(item)" v-for="(item, i) in editor?.files"
      v-show="i >= openIndex && ((i - openIndex + 1) * 160 + 40) <= editor?.middleWidth" :title="item.name">
      <img src="../icons/icon-file.png" />
      <span>{{ item.name }}</span>
      <div>
        <img src="../icons/toolbox-close.png" />
      </div>
    </div>
    <div style="flex:1 1 1px"></div>
    <div class="ddei_editor_ofsview_movebox" v-show="editors?.files?.length > maxOpenSize" @click="moveItem(-1)">
      <img width="16" height="16" src="../icons/icon-left.png" />
    </div>
    <div class="ddei_editor_ofsview_movebox" v-show="editors?.files?.length > maxOpenSize" @click="moveItem(1)">
      <img width="16" height="16" src="../icons/icon-right.png" />
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../js/editor';
import DDeiActiveType from '../js/enums/active-type';
import DDeiEditorState from '../js/enums/editor-state';
import DDeiFileState from '../js/enums/file-state';

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
    };
  },
  computed: {},
  watch: {

  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('editor.middleWidth', function (newVal, oldVal) {
      let size = parseInt((newVal - 40) / 160);
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
     * 变更实例
     * @param instance 
     */
    changeInstance(instance) {
      this.editor.files.forEach(item => {
        item.active = DDeiActiveType.NONE
      });
      instance.active = DDeiActiveType.ACTIVE
      //TODO 刷新画布
    },
    /**
     * 在存在显示隐藏的情况下移动tab
     */
    moveItem(index: number = 0) {
      if (index != 0) {
        this.openIndex += index
        if (this.openIndex > this.editor.files.length - this.maxOpenSize) {
          this.openIndex = this.editor.files.length - this.maxOpenSize
        } else if (this.openIndex < 0) {
          this.openIndex = 0
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
      this.editor.ddInstance.render.setSize(this.editor.middleWidth, this.editor.middleHeight, 0, 0)
      this.editor.ddInstance.render.drawShape()
    },
    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.DESIGNING);
    },

  }
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
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: black;
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


.ddei_editor_ofsview_item_selected span {
  color: #017fff;
  font-weight: bold !important;
}
</style>
