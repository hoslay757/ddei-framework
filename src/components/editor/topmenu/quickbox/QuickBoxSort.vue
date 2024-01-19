<template>
  <div class="ddei_editor_quick_sort">
    <header></header>
    <content>
      <part>
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_position_dialog', 'button-v': isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_position_dialog' }"
          @click="isButtonEnable() && showDialog('ddei_editor_quick_sort_position_dialog', $event)">
          <span class="iconfont icon-a-ziyuan34"></span>
          <div class="text">位置</div>
          <span class="iconfont iconfont-small icon-a-ziyuan71"></span>
        </div>
      </part>
      <part>
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(2), 'button-v-selected': isButtonEnable(2) && dialogShow == 'ddei_editor_quick_sort_align_dialog', 'button-v': isButtonEnable(2) && dialogShow != 'ddei_editor_quick_sort_align_dialog' }"
          @click="isButtonEnable(2) && showDialog('ddei_editor_quick_sort_align_dialog', $event)">
          <span class="iconfont  icon-a-ziyuan7"></span>
          <div class="text">对齐</div>
          <span class="iconfont iconfont-small icon-a-ziyuan71"></span>
        </div>
      </part>
      <part>
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_merge_dialog', 'button-v': isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_merge_dialog' }"
          @click="isButtonEnable() && showDialog('ddei_editor_quick_sort_merge_dialog', $event)">
          <span class="iconfont icon-a-ziyuan28"></span>
          <div class="text">组合</div>
          <span class="iconfont iconfont-small icon-a-ziyuan71"></span>
        </div>
      </part>

      <part>
        <div
          :class="{ 'button-v-disabled': !isButtonEnable(), 'button-v-selected': isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_rotate_dialog', 'button-v': isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_rotate_dialog' }"
          @click="isButtonEnable() && showDialog('ddei_editor_quick_sort_rotate_dialog', $event)">
          <span class="iconfont icon-a-ziyuan101"></span>
          <div class="text">翻转</div>
          <span class="iconfont iconfont-small icon-a-ziyuan71"></span>
        </div>
      </part>
    </content>
    <tail>排列</tail>


  </div>
  <div id="ddei_editor_quick_sort_align_dialog" class="ddei_editor_quick_sort_align_dialog"
    v-show="dialogShow == 'ddei_editor_quick_sort_align_dialog'">
    <div class="ddei_editor_quick_sort_align_dialog_title">对齐</div>
    <hr />
    <div class="ddei_editor_quick_sort_align_dialog_group">
      <div class="ddei_editor_quick_sort_align_dialog_group_title">对齐:</div>
      <div class="ddei_editor_quick_sort_align_dialog_group_content">
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('left')">
          <img src="../../icons/control-align-left.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('center')">
          <img src="../../icons/control-align-center.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('right')">
          <img src="../../icons/control-align-right.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('top')">
          <img src="../../icons/control-valign-top.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('middle')">
          <img src="../../icons/control-valign-middle.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="changeAlign('bottom')">
          <img src="../../icons/control-valign-bottom.png" />
        </div>
      </div>
    </div>
    <hr />
    <div class="ddei_editor_quick_sort_align_dialog_group">
      <div class="ddei_editor_quick_sort_align_dialog_group_title">等距分布:</div>
      <div class="ddei_editor_quick_sort_align_dialog_group_content">
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="doAutoPos(2)">
          <img src="../../icons/control-auto-pos-1.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item" @click="doAutoPos(1)">
          <img src="../../icons/control-auto-pos-2.png" />
        </div>
      </div>
    </div>

  </div>
  <div id="ddei_editor_quick_sort_merge_dialog" class="ddei_editor_quick_sort_merge_dialog"
    v-show="dialogShow == 'ddei_editor_quick_sort_merge_dialog'">
    <div
      :class="{ 'ddei_editor_quick_sort_merge_dialog_item_disabled': !canMerge(), 'ddei_editor_quick_sort_merge_dialog_item': canMerge() }"
      @click="canMerge() && doMerge()">
      <img src="../../icons/icon-compose.png" />
      <div>组合</div>
    </div>
    <div
      :class="{ 'ddei_editor_quick_sort_merge_dialog_item_disabled': !canCancelMerge(), 'ddei_editor_quick_sort_merge_dialog_item': canCancelMerge() }"
      @click="canCancelMerge() && doCancelMerge()">
      <img src="../../icons/icon-cancel-compose.png" style="width:19px;height:19px" />
      <div>取消组合</div>
    </div>
  </div>
  <div id="ddei_editor_quick_sort_position_dialog" class="ddei_editor_quick_sort_position_dialog"
    v-show="dialogShow == 'ddei_editor_quick_sort_position_dialog'">
    <div class="ddei_editor_quick_sort_position_dialog_title">位置</div>
    <hr />
    <div
      :class="{ 'ddei_editor_quick_sort_position_dialog_item_disabled': !canPush('top'), 'ddei_editor_quick_sort_position_dialog_item': canPush('top') }"
      @click="canPush('top') && doPush('top')">
      <img src="../../icons/control-push-top.png" />
      <div>置于顶层</div>
    </div>
    <div
      :class="{ 'ddei_editor_quick_sort_position_dialog_item_disabled': !canPush('bottom'), 'ddei_editor_quick_sort_position_dialog_item': canPush('bottom') }"
      @click="canPush('top') && doPush('bottom')">
      <img src="../../icons/control-push-bottom.png" />
      <div>置于底层</div>
    </div>
    <div
      :class="{ 'ddei_editor_quick_sort_position_dialog_item_disabled': !canPush('up'), 'ddei_editor_quick_sort_position_dialog_item': canPush('up') }"
      @click="canPush('up') && doPush('up')">
      <img src="../../icons/control-push-up.png" />
      <div>上移一层</div>
    </div>
    <div
      :class="{ 'ddei_editor_quick_sort_position_dialog_item_disabled': !canPush('down'), 'ddei_editor_quick_sort_position_dialog_item': canPush('down') }"
      @click="canPush('down') && doPush('down')">
      <img src="../../icons/control-push-down.png" />
      <div>下移一层</div>
    </div>
  </div>

  <div id="ddei_editor_quick_sort_rotate_dialog" class="ddei_editor_quick_sort_rotate_dialog"
    v-show="dialogShow == 'ddei_editor_quick_sort_rotate_dialog'">
    <div class="ddei_editor_quick_sort_rotate_dialog_title">翻转</div>
    <hr />
    <div class="ddei_editor_quick_sort_rotate_dialog_group">
      <div class="ddei_editor_quick_sort_rotate_dialog_group_title">镜像:</div>
      <div class="ddei_editor_quick_sort_rotate_dialog_group_content">
        <div
          :class="{ 'ddei_editor_quick_sort_rotate_dialog_group_content_item': canMirror(), 'ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled': !canMirror() }"
          @click="canMirror() && doMirror()">
          <img src="../../icons/control-mirror-1.png" />
        </div>
        <div
          :class="{ 'ddei_editor_quick_sort_rotate_dialog_group_content_item': canMirror(), 'ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled': !canMirror() }"
          @click="canMirror() && doMirror()">
          <img src="../../icons/control-mirror-2.png" />
        </div>
      </div>
      <hr />
      <div class="ddei_editor_quick_sort_rotate_dialog_group_title">旋转:</div>
      <div class="ddei_editor_quick_sort_rotate_dialog_group_content">
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item" @click="doRotate(90)">
          <img src="../../icons/control-rotate-90.png" />
        </div>
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item" @click="doRotate(-90)">
          <img src="../../icons/control-rotate--90.png" />
        </div>
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item" @click="doRotate(-1)">
          <img src="../../icons/control-rotate-0.png" />
        </div>
      </div>
    </div>

  </div>
</template>
<script lang="ts">
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiUtil from "../../../framework/js/util";
import DDeiEditor from "../../js/editor";
export default {
  name: "DDei-Editor-Quick-Sort",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      dialogShow: "",
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {
    /**
     * 显示弹出框
     */
    showDialog(id, evt: Event) {
      if (this.dialogShow == id) {
        this.dialogShow = "";
      } else {
        this.dialogShow = id;
        let dialogEle = document.getElementById(id);
        let srcElement = evt.target;
        if (srcElement.className != "ddei_editor_quick_sort_item_box") {
          srcElement = srcElement.parentElement;
        }
        //获取绝对坐标
        let absPos = DDeiUtil.getDomAbsPosition(srcElement);
        dialogEle.style.left = absPos.left + "px";
        dialogEle.style.top = absPos.top + srcElement.offsetHeight + 5 + "px";
      }
    },

    /**
     * 对齐按钮是否显示
     */
    isButtonEnable(num: number = 1) {
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size >= num) {
        return true;
      }
      return false;
    },

    /**
     * 修改对齐方式
     */
    changeAlign(v) {
      //获取当前选择控件
      let file = this.editor.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelAlign, {
          models: Array.from(stage.selectedModels.values()),
          value: v,
        });
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
      }
    },

    //是否可以组合
    canMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 1) {
        return true;
      }
      return false;
    },

    //是否可以镜像
    canMirror() {
      return false;
    },

    //是否可以取消组合
    canCancelMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        return true;
      }
      return false;
    },

    //是否置于上层
    canPush(type) {
      return true;
    },

    //修改图形层次
    doPush(v) {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      let stageRender = stage?.render;
      let optContainer = stageRender?.currentOperateContainer;
      if (optContainer) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelPush, {
          container: optContainer,
          type: v,
        });
        //渲染图形
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
      }
    },

    /**
     * 自动分布
     */
    doAutoPos(type) {
      //获取当前选择控件
      let file = this.editor.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelAutoPos, {
          models: Array.from(stage.selectedModels.values()),
          value: type,
        });
        this.editor.bus.executeAll();
      }
    },

    doRotate(rotate) {
      let file = this.editor.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        stage.selectedModels.forEach((model) => {
          if (rotate != -1) {
            if (model.rotate) {
              model.rotate = model.rotate + rotate;
            } else {
              model.rotate = rotate;
            }
          } else {
            delete model.rotate;
          }
        });
        this.editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
        this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
      }
    },

    /**
     * 执行组合
     */
    doMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 1) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelMerge);
        this.editor.bus.executeAll();
      }
    },

    /**
     * 执行取消组合
     */
    doCancelMerge() {
      //获取当前选择控件
      let file = this.editor?.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelCancelMerge);
        this.editor.bus.executeAll();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_quick_sort {
  height: 103px;
  display: grid;
  grid-template-rows: 23px 57px 23px;
  grid-template-columns: 1fr;
  text-align: center;

  >content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0px 4px;
    border-right: 1px solid #E2E2EB;

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
        font-size: 12px;
        white-space: nowrap;
        font-family: "Microsoft YaHei";
        font-weight: 400;
        color: #000000;
      }
    }
  }

  >tail {
    font-size: 12px;
    font-family: "Microsoft YaHei";
    font-weight: 400;
    color: #9D9D9D;
    border-right: 1px solid #E2E2EB;
  }
}
</style>
