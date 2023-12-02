<template>
  <div :class="{ 'ddei_pv_editor_range': true, 'ddei_pv_editor_range_disabled': attrDefine.readonly }">
    <input type="range"
           :step="attrDefine.step"
           class="range"
           :min="attrDefine.min"
           :max="attrDefine.max"
           v-model="attrDefine.value"
           :disabled="attrDefine.readonly" />
    <div class="textinput">
      <input type="number"
             :step="attrDefine.step"
             :min="attrDefine.min"
             :max="attrDefine.max"
             v-model="attrDefine.value"
             :disabled="attrDefine.readonly"
             :placeholder="attrDefine.defaultValue" />
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import DDeiEditorArrtibute from "../../js/attribute/editor-attribute";
import DDeiEditor from "../../js/editor";
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiAbstractArrtibuteParser from "../../../framework/js/models/attribute/parser/attribute-parser";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiUtil from "../../../framework/js/util";
import { throttle } from "lodash";
import DDeiEnumOperateType from "../../../framework/js/enums/operate-type";
export default {
  name: "DDei-Editor-PV-Range-Editor",
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
    this.valueChange = throttle(this.valueChange, 50);
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
      let mds = Array.from(
        this.editor?.ddInstance?.stage?.selectedModels?.values()
      );
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
      let mds = Array.from(
        this.editor?.ddInstance?.stage?.selectedModels?.values()
      );
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
/**以下为range属性编辑器 */
.ddei_pv_editor_range {
  border-radius: 4px;
  height: 24px;
  margin-right: 10px;
  display: flex;
}

.ddei_pv_editor_range .range {
  height: 6px;
  width: 60%;
  border: transparent;
  outline: none;
  background: transparent;
  flex: 1;
  margin: auto;
}

.ddei_pv_editor_range_disabled .range {
  height: 6px;
  width: 60%;
  border: transparent;
  outline: none;
  background-color: rgb(210, 210, 210) !important;
  flex: 1;
  margin: auto;
}

.ddei_pv_editor_range .textinput {
  flex: 0 0 80px;
  margin-left: 10px;
  padding-left: 5px;
  padding-right: 5px;
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
}

.ddei_pv_editor_range .textinput:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_range_disabled .textinput {
  flex: 0 0 80px;
  margin-left: 10px;
  padding-left: 5px;
  padding-right: 5px;
  background-color: rgb(210, 210, 210);
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
}

.ddei_pv_editor_range_disabled .textinput:hover {
  border: 1px solid grey !important;
  box-sizing: border-box;
}

.ddei_pv_editor_range .textinput input {
  width: 100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: 0px 2%;
  background: transparent;
}
</style>
