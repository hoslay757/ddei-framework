<template>
  <div @click="attrDefine && showDialog($event)"
    :class="{ 'ddei_pv_line_type_combox': true, 'ddei_pv_line_type_combox_disabled': !attrDefine || attrDefine.readonly }">
    <svg :class="'icon ' + (extcls ? extcls : '')" aria-hidden="true">
      <use :xlink:href="'#' + img"></use>
    </svg>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../../../js/editor';
import DDeiUtil from '../../../../framework/js/util';
import DDeiEnumBusCommandType from '../../../../framework/js/enums/bus-command-type';
import { debounce } from 'lodash';
import DDeiEnumOperateState from '@/components/framework/js/enums/operate-state';
import DDeiModelArrtibuteValue from '@/components/framework/js/models/attribute/attribute-value';
import DDeiEditorUtil from '@/components/editor/js/util/editor-util';
export default {
  name: "DDei-Editor-QBT-Border-Dash",
  extends: null,
  mixins: [],
  components: {
  },
  props: {
    attrCode: {
      type: String,
      default: null
    },
    
    extcls: {
      type: String,
      default: null,
    },
    img: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      //当前编辑器
      editor: null,
      controlDefine: null,
      attrDefine: null,
      value: null
    };
  },
  computed: {},
  watch: {

  },
  created() {
    
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.refreshEditor();
  },
  methods: {
    refreshEditor() {
      if (this.editor?.currentControlDefine) {
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

    //打开弹出框
    showDialog(evt) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("line_type_dialog", {

        value: this.attrDefine.value,
        dataSource: this.attrDefine.dataSource,
        callback: {
          ok: this.valueChange
        },
        group: "property-dialog"
      }, { type: 5 }, srcElement,false,true)
    },

    //获取数据值
    getDataValue() {
      if (this.attrDefine) {
        //文本编辑状态
        if (this.editor.ddInstance.stage.render.operateState == DDeiEnumOperateState.QUICK_EDITING) {
          //读取文本的一部分修改其样式
          let shadowControl = this.editor.ddInstance.stage.render.editorShadowControl
          if (shadowControl?.render.isEditoring) {
            let editorText = DDeiUtil.getEditorText();
            //开始光标与结束光标
            let curSIdx = -1
            let curEIdx = -1
            if (editorText) {
              curSIdx = editorText.selectionStart
              curEIdx = editorText.selectionEnd
            }
            //获取光标范围内的特殊样式，如果有且相同，则返回值，否则不返回值
            if (curSIdx != -1 && curEIdx != -1 && curSIdx <= curSIdx) {
              //获取特殊样式
              //获取属性路径
              let paths = [];
              this.attrDefine?.mapping?.forEach((element) => {
                paths.push(element);
              });
              if (!(paths?.length > 0)) {
                paths = [this.attrDefine.code];
              }
              let value = shadowControl.getSptStyle(curSIdx, curEIdx, paths)
              if (value === undefined) {
                value = DDeiModelArrtibuteValue.getAttrValueByState(shadowControl, paths[0], true);
              }
              return { value: value };
            }
          }
        }
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


    valueChange(value) {

      this.value = value;
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
      let hasEditSetted = false;
      //文本编辑状态
      if (this.editor.ddInstance.stage.render.operateState == DDeiEnumOperateState.QUICK_EDITING) {
        //读取文本的一部分修改其样式
        let shadowControl = this.editor.ddInstance.stage.render.editorShadowControl
        if (shadowControl?.render.isEditoring) {
          let editorText = DDeiUtil.getEditorText();
          //开始光标与结束光标
          let curSIdx = -1
          let curEIdx = -1
          if (editorText) {
            curSIdx = editorText.selectionStart
            curEIdx = editorText.selectionEnd
          }
          if (curSIdx != -1 && curEIdx != -1 && curSIdx <= curSIdx) {
            //增加特殊样式
            shadowControl.setSptStyle(curSIdx, curEIdx, paths, parsedValue)
            this.editor.bus.push(DDeiEnumBusCommandType.TextEditorChangeSelectPos);
            setTimeout(() => {
              editorText.focus();
            }, 20);
            hasEditSetted = true;
          }
        }
      }
      if (!hasEditSetted) {
        this.editor.ddInstance.stage.selectedModels.forEach(element => {
          this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: parsedValue }, null, true);
        });
      }
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
    }
  }
};
</script>

<style lang="less" scoped>
.ddei_pv_line_type_combox {
  width: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}


.ddei_pv_line_type_combox:hover {
  cursor: pointer;
  background-color: #e6e6e6;
}

.ddei_pv_line_type_combox_selected {
  background-color: #e6e6e6;
}

.ddei_pv_line_type_combox_disabled {
  pointer-events: none;
  color: #e6e6e6;
  cursor: not-allowed;
}



</style>
