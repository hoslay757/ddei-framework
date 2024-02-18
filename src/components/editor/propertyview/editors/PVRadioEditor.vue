<template>
  <div :class="{ 'ddei_pv_editor_radio': true, 'ddei_pv_editor_radio_disabled': attrDefine.readonly }"
    :style="{ 'pointer-events': attrDefine.readonly ? 'none' : '' }">
    <div class="itembox" v-for="item in dataSource" @click="checkRadioValue(attrDefine, $event)">
      <input type="radio" :disabled="attrDefine.readonly" :name="attrDefine.id" :value="item.value"
        v-model="attrDefine.value" autocomplete="off" />

      <div>{{ item.text }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditorArrtibute from "../../js/attribute/editor-attribute";
import DDeiEditor from "../../js/editor";
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiAbstractArrtibuteParser from "../../../framework/js/models/attribute/parser/attribute-parser";
import DDeiEditorUtil from "../../js/util/editor-util";
import DDeiEditorEnumBusCommandType from "../../js/enums/editor-command-type";
import DDeiUtil from "../../../framework/js/util";
import DDeiEnumOperateType from "../../../framework/js/enums/operate-type";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";

export default {
  name: "DDei-Editor-PV-Radio-Editor",
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
      dataSource: null,
      editBefore: null,
      editAfter: null,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("attrDefine.value", function (newVal, oldVal) {
      this.valueChange();
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.getDataSource(this.attrDefine);

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
    /**
     * 选中radio
     */
    checkRadioValue(attrDefine, evt: Event) {
      let targetElement = evt.target;
      if (
        targetElement.tagName == "DIV" &&
        targetElement.className == "itembox"
      ) {
        targetElement = targetElement.children[0];
      } else if (targetElement.tagName == "DIV") {
        targetElement = targetElement.parentElement.children[0];
      }
      if (attrDefine.value == targetElement.value) {
        attrDefine.value = null;
      } else {
        attrDefine.value = targetElement.value;
      }
    },

    /**
     * 获取数据源数据
     */
    getDataSource(attrDefine) {
      let dataSources = DDeiEditorUtil.getDataSource(this.attrDefine);
      this.dataSource = dataSources;
      return this.dataSource;
    },

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

      DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, value);
      this.attrDefine.doCascadeDisplayByValue();
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
/**以下为radio属性编辑器 */
.ddei_pv_editor_radio {
  border-radius: 4px;
  margin-right: 10px;
}

.ddei_pv_editor_radio_disabled {
  background-color: rgb(210, 210, 210) !important;
}

.ddei_pv_editor_radio .itembox {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 24px;
  outline: none;
  font-size: 15px;
  margin: 0;
  padding-top: 2px;
  background: transparent;
}

.ddei_pv_editor_radio .itembox input {
  width: 16px;
  height: 16px;
}

.ddei_pv_editor_radio .itembox div {
  margin-left: 15px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .itembox {
  float: left;
  margin-right: 10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_column .itembox {
  margin-top: 10px;
}

.ddei_editor_pv_subgroup_view_tab_panel_editors_row .itembox div {
  float: left;
  margin-left: 5px;
}
</style>
