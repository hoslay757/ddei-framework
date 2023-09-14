<template>
  <div :class="{ 'ddei_pv_editor_bordertype': true, 'ddei_pv_editor_bordertype_disabled': attrDefine.readonly }">
    <div class="itembox" v-for="item in dataSource" @click="checkRadioValue(attrDefine, $event)">
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
import DDeiEditorUtil from '../../js/util/editor-util';
import DDeiUtil from '../../../framework/js/util';
import DDeiEditorEnumBusCommandType from '../../js/enums/editor-command-type';

export default {
  name: "DDei-Editor-PV-BorderType-Editor",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type: DDeiEditorArrtibute,
      default: null
    },
    //当前控件定义
    controlDefine: {
      type: Object,
      default: null
    },
  },
  data() {
    return {
      //当前编辑器
      editor: null,
      dataSource:null
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
    this.getDataSource(this.attrDefine);
    let type = this.getTypeValue();
    if(type){
      this.attrDefine.value = type.value
    }
  },
  methods: {

    /**
     * 根据值获取选项定义
     * @param value 值
     */
    getDataDefine(value) {
      if (this.dataSource && value) {
        for (let i = 0; i < this.dataSource.length; i++) {
          if (this.dataSource[i].value.toString() == value.toString()) {
            return this.dataSource[i];
          }
        };
      }
      return { text: "" };
    },
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
      let dataSources = DDeiEditorUtil.getDataSource(this.attrDefine);
      this.dataSource = dataSources;
      return this.dataSource;
    },

    getTypeValue() {
      //获取属性路径
      let paths = [];
      this.attrDefine?.exmapping?.forEach(element => {
        paths.push(element);
      });
      if (!(paths?.length > 0)) {
        paths = [this.attrDefine.code]
      }

      //通过解析器获取有效值
      let value = DDeiUtil.getDataByPathList(this.attrDefine.model, paths);
      if(!value){
       return { value:'1' };
      }else if(value == 'true' || value == true){
        return {  value: '0' };
      }
      return { isDefault: true, value: this.attrDefine.getParser().getDefaultValue() };
    },


    valueChange(evt) {

      //获取属性路径
      let paths = [];
      this.attrDefine?.exmapping?.forEach(element => {
        paths.push(element);
      });
      if (!(paths?.length > 0)) {
        paths = [this.attrDefine.code]
      }

      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let value = parser.parseValue(this.attrDefine.value);
      //显示隐藏其他属性
      if (value == '0') {
      }else if (value == '1') {
        DDeiEditorArrtibute.showAttributesByCode(this.controlDefine.styles, "borderColor", "borderOpacity", "borderWidth", "borderDash", "borderRound");
      }     
      //设置当前编辑器控件的临时属性值
      this.editor.ddInstance.stage.selectedModels.forEach(element => {
        if (value == '0') {
          //推送信息进入总线
          this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: true }, evt, true);
          //根据code以及mapping设置属性值
          DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, true)
        }
        //处理实线
        else if (value == '1') {
          //推送信息进入总线
          this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: false }, evt, true);
           //根据code以及mapping设置属性值
          DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, false)
        }
        
      });
      this.editor.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts, null, evt);
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
      
    }
  }
};
</script>

<style scoped>
/**以下为radio属性编辑器 */
.ddei_pv_editor_bordertype {
  border-radius: 4px;
  margin-right: 10px;
}

.ddei_pv_editor_bordertype_disabled {
  background-color: rgb(210, 210, 210) !important;
}

.ddei_pv_editor_bordertype .itembox {
  height: 24px;
  outline: none;
  font-size: 13px;
  margin: 0;
  padding-top: 2px;
  background: transparent;
}





.ddei_pv_editor_bordertype .itembox input {
  float: left;
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.ddei_pv_editor_bordertype .itembox div {
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
