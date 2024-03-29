<template>
  <div :class="{ 'ddei_pv_editor_color': true, 'ddei_pv_editor_color_disabled': attrDefine.readonly }">
    <input type="color" :step="attrDefine.step" class="color" v-model="attrDefine.value" autocomplete="off"
      :disabled="attrDefine.readonly" />
    <div class="textinput">
      <input type="text" v-model="attrDefine.value" :disabled="attrDefine.readonly" autocomplete="off"
        :placeholder="attrDefine.defaultValue" />
    </div>
  </div>
</template>

<script lang="ts">
import { has, throttle } from "lodash";
import DDeiEditorArrtibute from "@ddei-core/editor/js/attribute/editor-attribute";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiAbstractArrtibuteParser from "@ddei-core/framework/js/models/attribute/parser/attribute-parser";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";
import DDeiEnumOperateType from "@ddei-core/framework/js/enums/operate-type";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";

export default {
  name: "pv-color",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type: DDeiEditorArrtibute,
      default: null,
    },
    //当前控件定义
    controlDefine: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  watch: {},
  created() {
    this.valueChange = throttle(this.valueChange, 40);
    // 监听obj对象中prop属性的变化
    this.$watch("attrDefine.value", function (newVal, oldVal) {
      this.valueChange();
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //判断当前属性是否可编辑
    this.editBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_EDIT_BEFORE",
      this.editor.ddInstance
    );

    if (
      this.editBefore &&
      this.editor?.ddInstance?.stage?.selectedModels?.size > 0
    ) {
      let mds = [];
      if (this.editor?.ddInstance?.stage?.selectedModels?.size > 0) {
        mds = Array.from(
          this.editor?.ddInstance?.stage?.selectedModels?.values()
        );
      }
      if (this.attrDefine?.model && mds.indexOf(this.attrDefine.model) == -1) {
        mds.push(this.attrDefine.model);
      }
      this.attrDefine.readonly = !this.editBefore(
        DDeiEnumOperateType.EDIT,
        mds,
        this.attrDefine?.code,
        this.editor.ddInstance,
        null
      );
    }
  },
  methods: {
    valueChange(evt) {
      if (this.attrDefine?.readonly) {
        return;
      }
      let mds = [];
      if (this.editor?.ddInstance?.stage?.selectedModels?.size > 0) {
        mds = Array.from(
          this.editor?.ddInstance?.stage?.selectedModels?.values()
        );
      }
      if (this.attrDefine?.model && mds.indexOf(this.attrDefine.model) == -1) {
        mds.push(this.attrDefine.model);
      }
      if (
        this.editBefore &&
        !this.editBefore(
          DDeiEnumOperateType.EDIT,
          mds,
          this.attrDefine?.code,
          this.editor.ddInstance,
          null
        )
      ) {
        return;
      }
      //获取属性路径
      let paths = [];
      this.attrDefine?.mapping?.forEach((element) => {
        paths.push(element);
      });
      if (!(paths?.length > 0)) {
        paths = [this.attrDefine.code];
      }

      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let value = parser.parseValue(this.attrDefine.value);
      let hasEditSetted = false;
      //文本编辑状态
      if (this.editor.ddInstance.stage.render.operateState == DDeiEnumOperateState.QUICK_EDITING) {
        //读取文本的一部分修改其样式
        let shadowControl = this.editor.ddInstance.stage.render.editorShadowControl
        if (shadowControl?.render.isEditoring) {
          let editorText = DDeiUtil.getEditorText();
          //开始光标与结束光标
          let curSIdx = -1
          let curEIdx = -1
          if (editorText) {
            curSIdx = editorText.selectionStart
            curEIdx = editorText.selectionEnd
          }
          if (curSIdx != -1 && curEIdx != -1 && curSIdx <= curSIdx) {
            //增加特殊样式
            shadowControl.setSptStyle(curSIdx, curEIdx, paths, value)
            hasEditSetted = true;
          }
        }
      }
      if (!hasEditSetted) {
        DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, value);
        if (
          this.attrDefine.model.modelType == "DDeiStage" ||
          this.attrDefine.model.modelType == "DDeiLayer"
        ) {
          //推送信息进入总线
          this.editor.bus.push(
            DDeiEnumBusCommandType.ModelChangeValue,
            {
              mids: [this.attrDefine.model.modelType],
              paths: paths,
              value: value,
              attrDefine: this.attrDefine,
            },
            evt,
            true
          );
        } else {
          this.editor.ddInstance.stage.selectedModels.forEach((element) => {
            //推送信息进入总线
            this.editor.bus.push(
              DDeiEnumBusCommandType.ModelChangeValue,
              {
                mids: [element.id],
                paths: paths,
                value: value,
                attrDefine: this.attrDefine,
              },
              evt,
              true
            );
          });
        }
      }
      this.editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, {
        parts: ["topmenu"],
      });
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
      //编辑完成后的回调函数
      if (!this.editAfter) {
        this.editAfter = DDeiUtil.getConfigValue(
          "EVENT_CONTROL_EDIT_AFTER",
          this.editor.ddInstance
        );
      }
      if (this.editAfter) {
        this.editAfter(
          DDeiEnumOperateType.EDIT,
          mds,
          this.attrDefine?.code,
          this.editor.ddInstance,
          null
        );
      }
    },
  },
};
</script>

<style scoped>
/**以下为color属性编辑器 */
.ddei_pv_editor_color {
  border-radius: 4px;
  height: 28px;
  margin-right: 10px;
  display: flex;
}

.ddei_pv_editor_color .color {
  height: 36px;

  width: 60%;
  border: transparent;
  outline: none;
  background: transparent;
  flex: 1;
  margin: -4px -4px 0px -4px;
}

.ddei_pv_editor_color_disabled .color {
  height: 32px;

  width: 60%;
  border: transparent;
  outline: none;
  background-color: rgb(210, 210, 210) !important;
  flex: 1;
  margin: -4px -4px 0px -4px;
}

.ddei_pv_editor_color .textinput {
  flex: 0 0 80px;
  margin-left: 10px;
  padding-left: 5px;
  padding-right: 5px;
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
}

.ddei_pv_editor_color .textinput:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_color_disabled .textinput {
  flex: 0 0 80px;
  margin-left: 10px;
  padding-left: 5px;
  padding-right: 5px;
  background-color: rgb(210, 210, 210);
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
}

.ddei_pv_editor_color_disabled .textinput:hover {
  border: 1px solid grey !important;
  box-sizing: border-box;
}

.ddei_pv_editor_color .textinput input {
  width: 100%;
  border: transparent;
  outline: none;
  font-size: 15px;
  margin: 0px 2%;
  background: transparent;
}
</style>
