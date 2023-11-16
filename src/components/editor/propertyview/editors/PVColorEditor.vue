<template>
  <div :class="{ 'ddei_pv_editor_color': true, 'ddei_pv_editor_color_disabled': attrDefine.readonly }">
    <input type="color"
           :step="attrDefine.step"
           class="color"
           v-model="attrDefine.value"
           :disabled="attrDefine.readonly" />
    <div class="textinput">
      <input type="text"
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
import DDeiUtil from "../../../framework/js/util";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiEnumOperateType from "../../../framework/js/enums/operate-type";

export default {
  name: "DDei-Editor-PV-Color-Editor",
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
    // 监听obj对象中prop属性的变化
    this.$watch("attrDefine.value", function (newVal, oldVal) {
      //控制帧率
      let isExec = true;
      let dt = new Date().getTime();
      if (!window.upTime) {
        window.upTime = dt;
      } else if (dt - window.upTime > 40) {
        window.upTime = dt;
      } else {
        isExec = false;
      }
      if (isExec) {
        this.valueChange();
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //判断当前属性是否可编辑
    let editBefore = DDeiUtil.getConfigValue(
      "EVENT_CONTROL_EDIT_BEFORE",
      this.editor.ddInstance
    );
    if (editBefore) {
      let mds = Array.from(
        this.editor?.ddInstance?.stage?.selectedModels?.values()
      );
      if (this.attrDefine?.model && mds.indexOf(this.attrDefine.model) == -1) {
        mds.push(this.attrDefine.model);
      }
      this.attrDefine.readonly = !editBefore(
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
      this.editor.bus.push(
        DDeiEditorEnumBusCommandType.RefreshEditorParts,
        null,
        evt
      );
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    },
  },
};
</script>

<style scoped>
/**以下为color属性编辑器 */
.ddei_pv_editor_color {
  border-radius: 4px;
  height: 24px;
  margin-right: 10px;
  display: flex;
}

.ddei_pv_editor_color .color {
  height: 32px;

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
  font-size: 13px;
  margin: 0px 2%;
  background: transparent;
}
</style>
