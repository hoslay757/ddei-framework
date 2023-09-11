<template>
  <div :class="{ 'ddei_pv_editor_combox': true, 'ddei_pv_editor_combox_disabled': attrDefine.readonly }">
    <PVBaseCombox :attrDefine="attrDefine" :searchMethod="doSearch" ref="combox" :canSearch="attrDefine.canSearch">
      <div class="itemboxs"
        :style="{ width: width ? width + 'px' : '', height: height ? height + 'px' : '', 'grid-template-columns': gridTemplateColumns, 'grid-template-rows': gridTemplateRows }">
        <div :style="{ width: attrDefine?.itemStyle?.width + 'px', height: attrDefine?.itemStyle?.height + 'px' }"
          :class="{ 'itembox': true, 'itembox_selected': item.value == attrDefine.value, 'itembox_deleted': item.deleted, 'itembox_disabled': item.disabled, 'itembox_underline': item.underline, 'itembox_bold': item.bold }"
          v-for="item in dataSource" @click="!item.disabled && valueChange(item.value, $event)" :title="item.desc">
          <div v-if="item.img" class="itembox_img">
            <img
              :style="{ width: attrDefine?.itemStyle?.imgWidth + 'px', height: attrDefine?.itemStyle?.imgHeight + 'px' }"
              :src="item.img" />
          </div>
          <div class="itembox_text" v-if="item.text" :style="{'font-family':item.fontFamily }">{{ item.text }}</div>
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
import CONFIGS from "../../js/config"
import ICONS from "../../js/icon"

export default {
  name: "DDei-Editor-PV-Combox",
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
      //临时选择的值
      value: null,
      //已加载的数据源
      dataSource: null,
      width: 0,
      height: 0,
      col: 1,
      gridTemplateColumns: "1fr",
      gridTemplateRows: '',
      searchText: ''
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
    let itemWidth = this.attrDefine?.itemStyle?.width ? this.attrDefine?.itemStyle?.width + 5 : 100;
    let itemCols = this.attrDefine?.itemStyle?.col ? this.attrDefine?.itemStyle?.col : 1;
    let itemHeight = this.attrDefine?.itemStyle?.height ? this.attrDefine?.itemStyle?.height : 30;
    let itemRows = this.attrDefine?.itemStyle?.row ? this.attrDefine?.itemStyle?.row : 0;
    this.width = itemWidth * itemCols + 10;
    this.col = itemCols;
    this.height = itemHeight * itemRows;
    let gridTemplateColumns = this.gridTemplateColumns;
    if (this.col > 1) {
      for (let i = 2; i <= this.col; i++) {
        gridTemplateColumns += " 1fr";
      }
      this.gridTemplateColumns = gridTemplateColumns;
    }
    if (itemRows) {
      let gridTemplateRows = "";
      for (let i = 1; i <= itemRows; i++) {
        gridTemplateRows += itemHeight + "px "
      }
      this.gridTemplateRows = gridTemplateRows;
    }
    this.getDataSource(this.attrDefine)
    let type = this.getDataValue();
    let define = this.getDataDefine(type.value);
    if (!type.isDefault) {
      this.attrDefine.value = type.value;
      this.$refs.combox.text = define.text;
      if(define.img){
        this.$refs.combox.img = define.img;
      }
    } else {
      this.$refs.combox.defaultText = define.text;
      this.$refs.combox.img = define.img;
    }
    this.$refs.combox.value = type.value;
    this.value = type.value;

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
      return {text:""};
    },

    doSearch(text, evt) {
      //过滤dataSource，找到text
      this.searchText = text;
      this.getDataSource(this.attrDefine)
      this.$refs.combox.showDialog(true, evt);
    },

    //获取数据值
    getDataValue() {
      let dataValue = this.attrDefine.value;
      if (!dataValue) {
        dataValue = DDeiUtil.getDataByPathList(this.attrDefine.model, this.attrDefine.code, this.attrDefine.mapping);
      }
      if (dataValue) {
        return { value: dataValue }
      }
      //通过解析器获取有效值
      return { isDefault: true, value: this.attrDefine.getParser().getDefaultValue() };
    },



    valueChange(value, evt) {

      this.attrDefine.value = value;
      let itemDefine = this.getDataDefine(value);
      let text = itemDefine.text;
      this.$refs.combox.text = text;
      if(itemDefine.img){
        this.$refs.combox.img = itemDefine.img;
      }
      this.$refs.combox.value = value;
      this.value = value;
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
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    },
    /**
     * 获取数据源数据
     */
    getDataSource(attrDefine) {
      if (attrDefine.dataSource) {
        let dsDefine = attrDefine.dataSource;
        let dataSource = null;
        if (Array.isArray(dsDefine)) {
          dataSource = dsDefine;
        } else {
          let type = dsDefine.type;
          if (!type || type == 'static') {
            dataSource = dsDefine.data;
          }
          //从配置中获取数据
          else if(type == 'config'){
            dataSource = [];
            let configData = dsDefine.data;
            let data = CONFIGS[configData];
            if(data){
              let textKey = dsDefine.text;
              let valueKey = dsDefine.value;
              let boldKey = dsDefine.bold;
              let descKey = dsDefine.desc;
              let underlineKey = dsDefine.underline;
              let disabledKey = dsDefine.disabled;
              let deletedKey = dsDefine.deleted;
              let searchTextKey = dsDefine.searchText;
              let fontFamilyKey = dsDefine.fontFamily;
              data.forEach(item => {
                let text = item[textKey];
                let value = item[valueKey];
                let bold = item[boldKey];
                let desc = item[descKey];
                let underline = item[underlineKey];
                let disabled = item[disabledKey];
                let deleted = item[deletedKey];
                let searchText = item[searchTextKey];
                let fontFamily = item[fontFamilyKey];
                let rowData = { 'text': text, 'searchText': searchText, 'value': value,
                'bold':bold,'desc':desc,'underline':underline ,'disabled':disabled,'deleted':deleted,'fontFamily': fontFamily
                }
                dataSource.push(rowData);
              });
              dsDefine.type = 'static';     
              dsDefine.data = dataSource;
            }
          }
        }
        //处理图片,处理搜索
        let returnDatas = [];
          if(dataSource){
            dataSource.forEach(item => {
              if (item.img) {
                if (ICONS[item.img]) {
                  item.img = ICONS[item.img].default;
                }
              }
              if (this.searchText) {
                if (item.text.indexOf(this.searchText) != -1 || item.value.indexOf(this.searchText) != -1 || (item.searchText && item.searchText.indexOf(this.searchText) != -1)) {
                  returnDatas.push(item);
                }
              } else {
                returnDatas.push(item);
              }
            });
            this.dataSource = returnDatas;
        }
        //过滤搜索条件
        return this.dataSource
      }
      return [];
    },
  }
};
</script>

<style scoped>
/**以下为combox属性编辑器 */
.ddei_pv_editor_combox {
  margin-top: 4px;
}

.ddei_pv_editor_combox_disabled {}

.ddei_combox_show_dialog_content .itemboxs {
  border-radius: 4px;
  margin-top: 4px;
  display: grid;
  gap: 4px;
  overflow: auto;
  color: black;
  font-size: 13px;
}

.ddei_combox_show_dialog_content .itemboxs .itembox {
  outline: none;
  font-size: 13px;
  margin: auto;
  background: transparent;
  display: table;
  border-radius: 4px;
}



.ddei_combox_show_dialog_content .itemboxs .itembox:hover {
  background-color: rgb(245, 245, 245);
  cursor: pointer;
}

.ddei_combox_show_dialog_content .itemboxs .itembox .itembox_img {
  display: table-cell;
  padding-left: 5px;
  vertical-align: middle;
}

.ddei_combox_show_dialog_content .itemboxs .itembox .itembox_img img {
  text-align: center;
  vertical-align: middle;
}

.ddei_combox_show_dialog_content .itemboxs .itembox .itembox_text {
  text-align: center;
  display: table-cell;
  width: 100%;
  vertical-align: middle;
}


.ddei_combox_show_dialog_content .itembox_selected {
  background-color: rgb(240, 240, 240) !important;
}

.ddei_combox_show_dialog_content .itembox_deleted {
  text-decoration: line-through;
}

.ddei_combox_show_dialog_content .itembox_disabled {
  color: rgb(210, 210, 210);
  text-decoration: line-through;

}

.ddei_combox_show_dialog_content .itembox_disabled:hover {
  cursor:not-allowed !important;

}

.ddei_combox_show_dialog_content .itembox_underline {
  text-decoration: underline;
}

.ddei_combox_show_dialog_content .itembox_bold .itembox_text {
  font-weight: bold;
}
</style>
