<template>
  <div class="ddei_editor_quick_sort">
    <div class="ddei_editor_quick_sort_item">
      <div :class="{'ddei_editor_quick_sort_item_box_disabled':!isButtonEnable(),'ddei_editor_quick_sort_item_box_selected':isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_position_dialog','ddei_editor_quick_sort_item_box':isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_position_dialog'}"
           @click="isButtonEnable() && showDialog('ddei_editor_quick_sort_position_dialog',$event)">
        <img style="width:20px;height:20px"
             src="../../icons/icon-push-up.png" />
        <div>位置</div>
        <img style="width:6px;height:6px;margin-top:10px"
             src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div :class="{'ddei_editor_quick_sort_item_box_disabled':!isButtonEnable(),'ddei_editor_quick_sort_item_box_selected':isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_merge_dialog','ddei_editor_quick_sort_item_box':isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_merge_dialog'}"
           @click="isButtonEnable() && showDialog('ddei_editor_quick_sort_merge_dialog',$event)">
        <img style="width:20px;height:20px"
             src="../../icons/icon-compose.png" />
        <div>组合</div>
        <img style="width:6px;height:6px;margin-top:10px"
             src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div :class="{'ddei_editor_quick_sort_item_box_disabled':!isButtonEnable(2),'ddei_editor_quick_sort_item_box_selected':isButtonEnable(2) && dialogShow == 'ddei_editor_quick_sort_align_dialog','ddei_editor_quick_sort_item_box':isButtonEnable(2) && dialogShow != 'ddei_editor_quick_sort_align_dialog'}"
           @click="isButtonEnable(2) && showDialog('ddei_editor_quick_sort_align_dialog',$event)">
        <img style="width:24px;height:24px;margin-top:0px;margin-left:-2px"
             src="../../icons/control-align-left.png" />
        <div>对齐</div>
        <img style="width:6px;height:6px;margin-top:10px"
             src="../../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_quick_sort_item">
      <div :class="{'ddei_editor_quick_sort_item_box_disabled':!isButtonEnable(),'ddei_editor_quick_sort_item_box_selected':isButtonEnable() && dialogShow == 'ddei_editor_quick_sort_rotate_dialog','ddei_editor_quick_sort_item_box':isButtonEnable() && dialogShow != 'ddei_editor_quick_sort_rotate_dialog'}"
           @click="isButtonEnable()&& showDialog('ddei_editor_quick_sort_rotate_dialog',$event)">
        <img style="width:20px;height:20px"
             src="../../icons/icon-turn-right.png" />
        <div>翻转</div>
        <img style="width:6px;height:6px;margin-top:10px"
             src="../../icons/toolbox-expanded.png" />
      </div>
    </div>

    <div class="ddei_editor_quick_sort_item"
         style="grid-column:1/3;">
      <div class="ddei_editor_quick_sort_item_text">
        排列
      </div>
    </div>

  </div>
  <div id="ddei_editor_quick_sort_align_dialog"
       class="ddei_editor_quick_sort_align_dialog"
       v-show="dialogShow == 'ddei_editor_quick_sort_align_dialog'">
    <div class="ddei_editor_quick_sort_align_dialog_title">对齐</div>
    <hr />
    <div class="ddei_editor_quick_sort_align_dialog_group">
      <div class="ddei_editor_quick_sort_align_dialog_group_title">对齐:</div>
      <div class="ddei_editor_quick_sort_align_dialog_group_content">
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('left')">
          <img src="../../icons/control-align-left.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('center')">
          <img src="../../icons/control-align-center.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('right')">
          <img src="../../icons/control-align-right.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('top')">
          <img src="../../icons/control-valign-top.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('middle')">
          <img src="../../icons/control-valign-middle.png" />
        </div>
        <div class="ddei_editor_quick_sort_align_dialog_group_content_item"
             @click="changeAlign('bottom')">
          <img src="../../icons/control-valign-bottom.png" />
        </div>
      </div>
    </div>

  </div>
  <div id="ddei_editor_quick_sort_merge_dialog"
       class="ddei_editor_quick_sort_merge_dialog"
       v-show="dialogShow == 'ddei_editor_quick_sort_merge_dialog'">
    <div :class="{'ddei_editor_quick_sort_merge_dialog_item_disabled':!canMerge(),'ddei_editor_quick_sort_merge_dialog_item':canMerge()}"
         @click="canMerge() && doMerge()">
      <img src="../../icons/icon-compose.png" />
      <div>组合</div>
    </div>
    <div :class="{'ddei_editor_quick_sort_merge_dialog_item_disabled':!canCancelMerge(),'ddei_editor_quick_sort_merge_dialog_item':canCancelMerge()}"
         @click="canCancelMerge() && doCancelMerge()">
      <img src="../../icons/icon-cancel-compose.png"
           style="width:19px;height:19px" />
      <div>取消组合</div>
    </div>
  </div>
  <div id="ddei_editor_quick_sort_position_dialog"
       class="ddei_editor_quick_sort_position_dialog"
       v-show="dialogShow == 'ddei_editor_quick_sort_position_dialog'">
    <div class="ddei_editor_quick_sort_position_dialog_title">位置</div>
    <hr />
    <div :class="{'ddei_editor_quick_sort_position_dialog_item_disabled':!canPush('top'),'ddei_editor_quick_sort_position_dialog_item':canPush('top')}"
         @click="canPush('top') && doPush('top')">
      <img src="../../icons/control-push-top.png" />
      <div>置于顶层</div>
    </div>
    <div :class="{'ddei_editor_quick_sort_position_dialog_item_disabled':!canPush('bottom'),'ddei_editor_quick_sort_position_dialog_item':canPush('bottom')}"
         @click="canPush('top') && doPush('bottom')">
      <img src="../../icons/control-push-bottom.png" />
      <div>置于底层</div>
    </div>
    <div :class="{'ddei_editor_quick_sort_position_dialog_item_disabled':!canPush('up'),'ddei_editor_quick_sort_position_dialog_item':canPush('up')}"
         @click="canPush('up') && doPush('up')">
      <img src="../../icons/control-push-up.png" />
      <div>上移一层</div>
    </div>
    <div :class="{'ddei_editor_quick_sort_position_dialog_item_disabled':!canPush('down'),'ddei_editor_quick_sort_position_dialog_item':canPush('down')}"
         @click="canPush('down') && doPush('down')">
      <img src="../../icons/control-push-down.png" />
      <div>下移一层</div>
    </div>
  </div>

  <div id="ddei_editor_quick_sort_rotate_dialog"
       class="ddei_editor_quick_sort_rotate_dialog"
       v-show="dialogShow == 'ddei_editor_quick_sort_rotate_dialog'">
    <div class="ddei_editor_quick_sort_rotate_dialog_title">翻转</div>
    <hr />
    <div class="ddei_editor_quick_sort_rotate_dialog_group">
      <div class="ddei_editor_quick_sort_rotate_dialog_group_title">镜像:</div>
      <div class="ddei_editor_quick_sort_rotate_dialog_group_content">
        <div :class="{'ddei_editor_quick_sort_rotate_dialog_group_content_item':canMirror(),'ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled':!canMirror()}"
             @click="canMirror() && doMirror()">
          <img src="../../icons/control-mirror-1.png" />
        </div>
        <div :class="{'ddei_editor_quick_sort_rotate_dialog_group_content_item':canMirror(),'ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled':!canMirror()}"
             @click="canMirror() && doMirror()">
          <img src="../../icons/control-mirror-2.png" />
        </div>
      </div>
      <hr />
      <div class="ddei_editor_quick_sort_rotate_dialog_group_title">旋转:</div>
      <div class="ddei_editor_quick_sort_rotate_dialog_group_content">
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item"
             @click="doRotate(90)">
          <img src="../../icons/control-rotate-90.png" />
        </div>
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item"
             @click="doRotate(-90)">
          <img src="../../icons/control-rotate--90.png" />
        </div>
        <div class="ddei_editor_quick_sort_rotate_dialog_group_content_item"
             @click="doRotate(-1)">
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
  created() {},
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

<style scoped>
.ddei_editor_quick_sort {
  width: 180px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_quick_sort_item {
  margin: auto;
}

.ddei_editor_quick_sort_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  color: rgb(120, 120, 120);
}

.ddei_editor_quick_sort_item_box {
  width: 70px;
  height: 25px;
  color: black;
  text-align: center;
  border-radius: 4px;
  font-size: 13px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_item_box div {
  float: left;
  margin-left: 3px;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_disabled {
  width: 70px;
  height: 25px;
  color: grey;
  text-align: center;
  border-radius: 4px;
  font-size: 13px;
  padding-left: 5px;
  cursor: not-allowed;
}

.ddei_editor_quick_sort_item_box_disabled div {
  float: left;
  margin-left: 3px;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_disabled img {
  margin-left: 2px;
  filter: brightness(100%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_selected {
  width: 70px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
  color: black;
  font-size: 13px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_item_box_selected div {
  float: left;
  margin-left: 3px;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box_selected img {
  margin-left: 2px;
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  float: left;
  margin-top: 2px;
}

.ddei_editor_quick_sort_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}

/**以下是对齐按钮的弹出框 */
.ddei_editor_quick_sort_align_dialog {
  width: 160px;
  position: absolute;
  background-color: white;
  height: 120px;
  border-radius: 4px;
  border: 0.5px solid rgb(220, 220, 220);
  z-index: 999;
  box-shadow: 3px 3px 3px hsl(0deg 0% 0% /0.25);
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.ddei_editor_quick_sort_align_dialog_title {
  color: black;
  font-weight: bold;
  flex: 0 0 30px;
  padding-top: 5px;
  padding-left: 7px;
}

.ddei_editor_quick_sort_align_dialog hr {
  border: 0.5px solid rgb(240, 240, 240);
  flex: 0 0 1px;
}

.ddei_editor_quick_sort_align_dialog_group {
  color: black;
  flex: 1 1 80px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_align_dialog_group_title {
  padding-left: 10px;
}

.ddei_editor_quick_sort_align_dialog_group_content {
  width: 100%;
  height: 60px;
  display: grid;
  padding-left: 15px;
  padding-right: 15px;
  grid-template-rows: 50% 50%;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}
.ddei_editor_quick_sort_align_dialog_group_content_item {
  width: 30px;
  height: 30px;
  padding: 5px;
}
.ddei_editor_quick_sort_align_dialog_group_content_item img {
  width: 24px;
  height: 24px;
  filter: brightness(50%);
  cursor: pointer;
}

.ddei_editor_quick_sort_align_dialog_group_content_item:hover {
  border-radius: 4px;
  background-color: rgb(233, 233, 238);
}

/**以下是组合按钮的弹出框 */
.ddei_editor_quick_sort_merge_dialog {
  width: 110px;
  position: absolute;
  background-color: white;
  height: 80px;
  border-radius: 4px;
  border: 0.5px solid rgb(220, 220, 220);
  z-index: 999;
  box-shadow: 3px 3px 3px hsl(0deg 0% 0% /0.25);
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.ddei_editor_quick_sort_merge_dialog_item {
  flex: 1;
  cursor: pointer;
}

.ddei_editor_quick_sort_merge_dialog_item img {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  width: 18px;
  height: 18px;
  filter: brightness(40%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_sort_merge_dialog_item div {
  color: black;
  float: left;
  margin-top: 9px;
  margin-left: 10px;
  width: 60px;
  height: 24px;
}

.ddei_editor_quick_sort_merge_dialog_item_disabled {
  flex: 1;
  cursor: not-allowed;
}

.ddei_editor_quick_sort_merge_dialog_item_disabled img {
  float: left;
  margin-top: 10px;
  margin-left: 10px;
  width: 18px;
  height: 18px;
  filter: brightness(100%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_sort_merge_dialog_item_disabled div {
  color: grey;
  float: left;
  margin-top: 9px;
  margin-left: 10px;
  width: 60px;
  height: 24px;
}

.ddei_editor_quick_sort_merge_dialog_item:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}

/**以下是位置按钮的弹出框 */
.ddei_editor_quick_sort_position_dialog {
  width: 120px;
  position: absolute;
  background-color: white;
  height: 160px;
  border-radius: 4px;
  border: 0.5px solid rgb(220, 220, 220);
  z-index: 999;
  box-shadow: 3px 3px 3px hsl(0deg 0% 0% /0.25);
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.ddei_editor_quick_sort_position_dialog_title {
  color: black;
  font-weight: bold;
  flex: 0 0 30px;
  padding-top: 5px;
  padding-left: 7px;
}

.ddei_editor_quick_sort_position_dialog hr {
  border: 0.5px solid rgb(240, 240, 240);
  flex: 0 0 1px;
}

.ddei_editor_quick_sort_position_dialog_item {
  flex: 1;
  cursor: pointer;
}

.ddei_editor_quick_sort_position_dialog_item img {
  float: left;
  margin-top: 5px;
  margin-left: 20px;
  width: 18px;
  height: 18px;
  filter: brightness(20%);
}

.ddei_editor_quick_sort_position_dialog_item div {
  color: black;
  float: left;
  margin-top: 4px;
  margin-left: 10px;
  width: 60px;
  height: 24px;
}

.ddei_editor_quick_sort_position_dialog_item_disabled {
  flex: 1;
  cursor: not-allowed;
}

.ddei_editor_quick_sort_position_dialog_item_disabled img {
  float: left;
  margin-top: 5px;
  margin-left: 20px;
  width: 18px;
  height: 18px;
  filter: brightness(100%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_sort_position_dialog_item_disabled div {
  color: grey;
  float: left;
  margin-top: 4px;
  margin-left: 10px;
  width: 60px;
  height: 24px;
}

.ddei_editor_quick_sort_position_dialog_item:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}

/**以下是翻转按钮的弹出框 */
.ddei_editor_quick_sort_rotate_dialog {
  width: 180px;
  position: absolute;
  background-color: white;
  height: 145px;
  border-radius: 4px;
  border: 0.5px solid rgb(220, 220, 220);
  z-index: 999;
  box-shadow: 3px 3px 3px hsl(0deg 0% 0% /0.25);
  display: flex;
  flex-direction: column;
  font-size: 13px;
}

.ddei_editor_quick_sort_rotate_dialog_title {
  color: black;
  font-weight: bold;
  flex: 0 0 30px;
  padding-top: 5px;
  padding-left: 7px;
}

.ddei_editor_quick_sort_rotate_dialog hr {
  border: 0.5px solid rgb(240, 240, 240);
  flex: 0 0 1px;
}

.ddei_editor_quick_sort_rotate_dialog_group {
  color: black;
  flex: 1 1 40px;
  padding-left: 5px;
}

.ddei_editor_quick_sort_rotate_dialog_group_title {
  padding-left: 10px;
}

.ddei_editor_quick_sort_rotate_dialog_group_content {
  width: 100%;
  height: 35px;
  display: grid;
  padding-left: 15px;
  padding-right: 15px;
  grid-template-rows: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}
.ddei_editor_quick_sort_rotate_dialog_group_content_item {
  width: 30px;
  height: 30px;
  padding: 5px;
  cursor: pointer;
}
.ddei_editor_quick_sort_rotate_dialog_group_content_item img {
  width: 20px;
  height: 20px;
  filter: brightness(50%);
}

.ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled {
  width: 30px;
  height: 30px;
  padding: 5px;
  cursor: not-allowed;
}
.ddei_editor_quick_sort_rotate_dialog_group_content_item_disabled img {
  width: 20px;
  height: 20px;
  filter: brightness(100%) drop-shadow(0.2px 0px 0.2px #000);
}

.ddei_editor_quick_sort_rotate_dialog_group_content_item:hover {
  border-radius: 4px;
  background-color: rgb(233, 233, 238);
}
</style>
