<template>
  <div :class="{ 'ddei_pv_editor_radio': true, 'ddei_pv_editor_radio_disabled': attrDefine.readonly }">
    <div class="itembox" v-for="item in getDataSource(attrDefine)" @click="checkRadioValue(attrDefine, $event)">
      <input type="radio" :disabled="attrDefine.readonly" :name="attrDefine.id" :value="item.value"
        v-model="attrDefine.value" />
      <div>{{ item.text }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditorArrtibute from '../../js/attribute/editor-attribute';
import DDeiEditor from '../../js/editor';
import DDeiEnumBusCommandType from '../../../framework/js/enums/bus-command-type';
import DDeiAbstractArrtibuteParser from '../../../framework/js/models/attribute/parser/attribute-parser';

export default {
  name: "DDei-Editor-PV-Radio-Editor",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type: DDeiEditorArrtibute,
      default: null
    },
  },
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  watch: {

  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch('attrDefine.value', function (newVal, oldVal) {
      this.valueChange();
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    /**
     * 选中radio
     */
    checkRadioValue(attrDefine, evt: Event) {
      let targetElement = evt.target;
      if (targetElement.tagName == "DIV" && targetElement.className == 'itembox') {
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
      if (attrDefine.dataSource) {
        return attrDefine.dataSource
      }
      return [];
    },


    valueChange(evt) {

      //获取属性路径
      let paths = [];
      this.attrDefine?.mapping?.forEach(element => {
        paths.push(element);
      });
      if (!(paths?.length > 0)) {
        paths = [this.attrDefine.code]
      }

      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let value = parser.parseValue(this.attrDefine.value);
      this.editor.ddInstance.stage.selectedModels.forEach(element => {
        //推送信息进入总线
        this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: value }, evt, true);
      });
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    }
  }
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
  height: 24px;
  outline: none;
  font-size: 13px;
  margin: 0;
  padding-top: 2px;
  background: transparent;
}





.ddei_pv_editor_radio .itembox input {
  float: left;
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.ddei_pv_editor_radio .itembox div {
  float: left;
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
