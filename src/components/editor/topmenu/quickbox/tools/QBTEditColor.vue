<template>
  <div :class="{'ddei_editor_quick_fat_item_box':true,'ddei_editor_quick_fat_item_box_disabled':!attrDefine}" @click="attrDefine && showColor($el,$event)">
    <img style="width:13px;height:13px" :src="img" />
    <div :style="{'background-color':value,'width':'13px','height':'10px','margin':'-2px auto'}"></div>
    <input type="color" v-model="value" @input="attrDefine && valueChange($el,$event)" style="width:1px;height:1px;display:block;margin-top:1px"/>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../../../js/editor';
import DDeiUtil from '../../../../framework/js/util';
import DDeiEnumBusCommandType from '../../../../framework/js/enums/bus-command-type';
import { debounce } from 'lodash';
export default {
  name: "DDei-Editor-QBT-Color",
  extends: null,
  mixins: [],
  components:{
  },
  props: {
    attrCode:{
      type:String,
      default:null
    },
    img: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      //当前编辑器
      editor: null,
      controlDefine:null,
      attrDefine:null,
      value:null
    };
  },
  computed: {},
  watch: {

  },
  created() {
    // 搜索框防抖
    this.valueChange = debounce(this.valueChange, 400);
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if(this.editor?.currentControlDefine){
      this.controlDefine = this.editor.currentControlDefine;
      if (this.controlDefine) {
        this.attrDefine = this.controlDefine.attrDefineMap.get(this.attrCode);
        let valueDefine = this.getDataValue();
        if (valueDefine && !valueDefine.isDefault) {
          this.value = valueDefine.value;
        }
      } else {
        this.attrDefine = null
      }
    }
  },
  methods: {

    showColor(element,$event){
      let colorInput = element.children[element.children.length-1];
      colorInput.showPicker()
    },

    //获取数据值
    getDataValue() {
      if (this.attrDefine) {
        let dataValue = this.attrDefine.value;
        if (!dataValue) {
          dataValue = DDeiUtil.getDataByPathList(this.attrDefine.model, this.attrDefine.code, this.attrDefine.mapping);
        }
        if (dataValue) {
          return { value: dataValue }
        }
      }
      //通过解析器获取有效值
      return { isDefault: true, value: this.attrDefine?.getParser().getDefaultValue() };
    },


    valueChange(el,evt) {
      
      let value = this.value;
      this.attrDefine.value = value;
      
      //通过解析器获取有效值
      let parser: DDeiAbstractArrtibuteParser = this.attrDefine.getParser();
      //属性值
      let parsedValue = parser.parseValue(value);
      //获取属性路径
      let paths = [];
      this.attrDefine?.mapping?.forEach(element => {
        paths.push(element);
      });
      if (!(paths?.length > 0)) {
        paths = [this.attrDefine.code]
      }
      this.editor.ddInstance.stage.selectedModels.forEach(element => {
        this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: parsedValue }, evt, true);
      });
      this.editor.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels, null, evt);
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    }
  }
};
</script>

<style scoped>
.ddei_editor_quick_fat_item_box {
  width: 25px;
  height: 25px;
  overflow:hidden;
  text-align: center;
}

.ddei_editor_quick_fat_item_box img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}

.ddei_editor_quick_fat_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_fat_item_box_disabled {
  color: rgb(228, 228, 232);
  filter: brightness(200%) !important;
}

.ddei_editor_quick_fat_item_box_disabled:hover {
  background-color:transparent !important;
  cursor:not-allowed;
}

.ddei_editor_quick_fat_item_box_selected img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}


.ddei_editor_quick_fat_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
