<template>
  <div :class="{ 'ddei_pv_editor_text': true, 'ddei_pv_editor_text_disabled': attrDefine.readonly }">
      <input type="input" v-model="attrDefine.value" :disabled="attrDefine.readonly" :placeholder="attrDefine.defaultValue"/>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash';
import DDeiEditorArrtibute from '../../js/attribute/editor-attribute';
import DDeiEditor from '../../js/editor';
import DDeiEnumBusCommandType from '../../../framework/js/enums/bus-command-type';
import DDeiAbstractArrtibuteParser from '../../../framework/js/models/attribute/parser/attribute-parser';

export default {
  name: "DDei-Editor-PV-Text-Editor",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type:DDeiEditorArrtibute,
      default:null
    },
  },
  data() {
    return {
      //当前编辑器
      editor:null,
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
    valueChange(evt) {
      //获取属性路径
      let paths = [];
      this.attrDefine?.mapping?.forEach(element => {
        paths.push(element);
      });
      if(!(paths?.length > 0)){
        paths = [this.attrDefine.code]
      }
      
      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let value = parser.parseValue(this.attrDefine.value);
      this.editor.ddInstance.stage.selectedModels.forEach(element => {
        //推送信息进入总线
        this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: value }, evt,true);
      });
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape,null, evt);
      this.editor.bus.executeAll();
    }
  }
};
</script>

<style scoped>

/**以下为text属性编辑器 */
.ddei_pv_editor_text{
  border-radius: 4px;
  border: 0.5px solid rgb(210,210,210);
  height: 24px;
  margin-right:10px;
  padding:0 5px;
}
.ddei_pv_editor_text_disabled{
  background-color:rgb(210,210,210) !important;
}
.ddei_pv_editor_text_disabled:hover{
  border: 1px solid grey !important;
}

.ddei_pv_editor_text:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_editor_text input{
  height:20px;
  width:100%;
  border: transparent;
  outline: none;
  font-size: 13px;
  margin: 1px 0;
  background: transparent;
}
</style>
