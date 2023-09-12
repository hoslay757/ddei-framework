<template>
  <div class="ddei_pv_editor_aligntype">
    <PVBaseCombox :attrDefine="attrDefine" ref="combox" :canSearch="false">
      <div class="ddei_pv_editor_aligntype_items">
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 1 }"
          style="text-align:left" @click="valueChange(1, $event)">
          <div style="vertical-align: top;">左上</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 2 }"
          style="text-align:center" @click="valueChange(2, $event)">
          <div style="vertical-align: top;">中上</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 3 }"
          style="text-align:right" @click="valueChange(3, $event)">
          <div style="vertical-align: top;">右上</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 4 }"
          style="text-align:left" @click="valueChange(4, $event)">
          <div style="vertical-align: middle;">左中</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 5 }"
          style="text-align:center" @click="valueChange(5, $event)">
          <div style="vertical-align: middle;">正中</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 6 }"
          style="text-align:right" @click="valueChange(6, $event)">
          <div style="vertical-align: middle;">右中</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 7 }"
          style="text-align:left" @click="valueChange(7, $event)">
          <div style="vertical-align: bottom;">左下</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 8 }"
          style="text-align:center" @click="valueChange(8, $event)">
          <div style="vertical-align: bottom;">中下</div>
        </div>
        <div :class="{ 'ddei_pv_editor_aligntype_item': true, 'ddei_pv_editor_aligntype_item_selected': value == 9 }"
          style="text-align:right" @click="valueChange(9, $event)">
          <div style="vertical-align: bottom;">右下</div>
        </div>
      </div>
    </PVBaseCombox>
  </div>
</template>

<script lang="ts">
import DDeiEditorArrtibute from '../../js/attribute/editor-attribute';
import DDeiEditor from '../../js/editor';
import DDeiEnumBusCommandType from '../../../framework/js/enums/bus-command-type';
import DDeiAbstractArrtibuteParser from '../../../framework/js/models/attribute/parser/attribute-parser';
import PVBaseCombox from './PVBaseCombox.vue';
import DDeiUtil from '@/components/framework/js/util';

export default {
  name: "DDei-Editor-PV-Align-Type",
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
      //临时选择的值
      value: null,
    };
  },
  computed: {},
  components: {
    PVBaseCombox
  },
  watch: {

  },
  created() {

  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    let type = this.getTypeValue();
    let text = this.getTypeText(type.value);

    if (!type.isDefault) {
      this.attrDefine.value = type.value;
    }

    this.$refs.combox.text = text;
    this.$refs.combox.value = type.value;
    this.value = type.value;
  },
  methods: {
    getTypeText(type) {
      switch (type) {
        case 1: return "左上";
        case 2: return "中上";
        case 3: return "右上";
        case 4: return "左中";
        case 5: return "正中";
        case 6: return "右中";
        case 7: return "右下";
        case 8: return "中下";
        case 9: return "右下";
      }
    },

    getTypeValue() {
      //通过解析器获取有效值
      let align = DDeiUtil.getDataByPathList(this.attrDefine.model, "textStyle.align");
      let valign = DDeiUtil.getDataByPathList(this.attrDefine.model, "textStyle.valign");
      if (align == 1 && valign == 1) {
        return { value: 1 };
      } else if (align == 2 && valign == 1) {
        return { value: 2 };
      } else if (align == 3 && valign == 1) {
        return { value: 3 };
      } else if (align == 1 && valign == 2) {
        return { value: 4 };
      } else if (align == 2 && valign == 2) {
        return { value: 5 };
      } else if (align == 3 && valign == 2) {
        return { value: 6 };
      } else if (align == 1 && valign == 3) {
        return { value: 7 };
      } else if (align == 2 && valign == 3) {
        return { value: 8 };
      } else if (align == 3 && valign == 3) {
        return { value: 9 };
      }
      return { isDefault: true, value: 5 };
    },



    valueChange(type, evt) {
      let align = 2;
      let valign = 2;
      switch (type) {
        case 1: align = 1; valign = 1; break;
        case 2: align = 2; valign = 1; break;
        case 3: align = 3; valign = 1; break;
        case 4: align = 1; valign = 2; break;
        case 5: align = 2; valign = 2; break;
        case 6: align = 3; valign = 2; break;
        case 7: align = 1; valign = 3; break;
        case 8: align = 2; valign = 3; break;
        case 9: align = 3; valign = 3; break;
      }
      this.attrDefine.value = type;
      let text = this.getTypeText(type);
      this.$refs.combox.text = text;
      this.$refs.combox.value = type;
      this.value = type;
      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let alignValue = parser.parseValue(align);
      let valignValue = parser.parseValue(valign);
      this.editor.ddInstance.stage.selectedModels.forEach(element => {
        //推送信息进入总线
        this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: ["textStyle.align"], value: alignValue }, evt, true);
        this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: ["textStyle.valign"], value: valignValue }, evt, true);
        //根据code以及mapping设置属性值
        DDeiUtil.setAttrValueByPath(this.attrDefine.model, ["textStyle.align"], alignValue)
        //根据code以及mapping设置属性值
        DDeiUtil.setAttrValueByPath(this.attrDefine.model, ["textStyle.valign"], valignValue)
      });
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    }
  }
};
</script>

<style scoped>
/**以下为aligntype属性编辑器 */
.ddei_pv_editor_aligntype {
  margin-top: 4px;
}

.ddei_pv_editor_aligntype_items {
  width: 200px;
  height: 150px;
  display: grid;
  padding: 2%;
  grid-template-rows: 30% 30% 30%;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
}

.ddei_pv_editor_aligntype_item {
  text-align: center;
  font-size: 12px;
  display: table;
  color: black;
  border: 0.5px solid grey;
  padding: 5px;
}

.ddei_pv_editor_aligntype_item div {
  display: table-cell;

}

.ddei_pv_editor_aligntype_item:hover {
  border: 1px solid #017fff;
  cursor: pointer;
}

.ddei_pv_editor_aligntype_item_selected {
  border: 1px solid #017fff;
}
</style>
