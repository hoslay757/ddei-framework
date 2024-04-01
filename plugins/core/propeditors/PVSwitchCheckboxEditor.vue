<template>
  <div
    :class="{ 'ddei_pv_editor_switch_excheckbox': true, 'ddei_pv_editor_switch_excheckbox_disabled': attrDefine.readonly }"
    @click="doCheck(attrDefine, $event)" :style="{ 'pointer-events': attrDefine.readonly ? 'none' : '' }">
    <div
      :class="{ 'chk_state': attrDefine.value != 1, 'chk_state_checked': attrDefine.value == 1 || (attrDefine.value == null && attrDefine.defaultValue == 1) }">
      <span>{{ attrDefine.value == 1 || (attrDefine.value == null && attrDefine.defaultValue == 1) ? '✓' : '' }}</span>
    </div>
    <div class="title">{{ attrDefine.name }}</div>
  </div>
</template>

<script lang="ts">
import DDeiEditorArrtibute from "@ddei-core/editor/js/attribute/editor-attribute";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiAbstractArrtibuteParser from "@ddei-core/framework/js/models/attribute/parser/attribute-parser";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiEnumOperateType from "@ddei-core/framework/js/enums/operate-type";

export default {
  name: "pv-switch-checkbox",
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
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.attrDefine.doCascadeDisplayByValue();
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
    doCheck(attrDefine, evt: Event) {
      if (attrDefine?.readonly) {
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
      if (attrDefine.value == null) {
        if (attrDefine.defaultValue == 1) {
          attrDefine.value = 0;
        } else {
          attrDefine.value = 1;
        }
      } else if (!attrDefine.value) {
        attrDefine.value = 1;
      } else {
        attrDefine.value = 0;
      }

      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let value = parser.parseValue(this.attrDefine.value);
      DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, value);
      this.attrDefine.doCascadeDisplayByValue();
      this.editor.ddInstance.stage.selectedModels?.forEach((element) => {
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
/**以下为checkbox属性编辑器 */
.ddei_pv_editor_switch_excheckbox {
  border-radius: 4px;
  margin-right: 10px;
}

.ddei_pv_editor_switch_excheckbox_disabled {
  background-color: rgb(210, 210, 210) !important;
}

.ddei_pv_editor_switch_excheckbox .title {
  float: left;
}

.ddei_pv_editor_switch_excheckbox .chk_state {
  border: 1px solid grey;
  width: 15px;
  height: 15px;
  margin-right: 10px;
  margin-top: 5px;
  float: left;
}

.ddei_pv_editor_switch_excheckbox:hover .chk_state {
  background: #017fff;
}

.ddei_pv_editor_switch_excheckbox .chk_state_checked {
  border: 1px solid grey;
  width: 15px;
  height: 15px;
  margin-right: 10px;
  margin-top: 5px;
  float: left;
  background-color: #017fff;
  color: #fff;
}

.ddei_pv_editor_switch_excheckbox .chk_state_checked span {
  margin-top: -4.5px;
  margin-left: 1px;
  display: block;
}
</style>
