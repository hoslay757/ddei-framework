<template>
  <div :class="{ 'ddei_editor_quick_fat_item_box': true, 'ddei_editor_quick_fat_item_box_disabled': !attrDefine }"
    @click="attrDefine && valueChange($event)">
    <span :class="img"></span>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../../../js/editor';
import DDeiUtil from '../../../../framework/js/util';
import DDeiEnumBusCommandType from '../../../../framework/js/enums/bus-command-type';
import DDeiEnumOperateState from '@/components/framework/js/enums/operate-state';
import DDeiModelArrtibuteValue from '@/components/framework/js/models/attribute/attribute-value';

export default {
  name: "DDei-Editor-QBT-AddFontSize",
  extends: null,
  mixins: [],
  components: {
  },
  props: {
    attrCode: {
      type: String,
      default: null
    },
    addValue: {
      type: Number,
      default: null
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
      controlDefine: null,
      attrDefine: null,
      value: 0
    };
  },
  computed: {},
  watch: {

  },
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.textEditorSelectedChange", function (newVal, oldVal) {
      if (newVal) {
        this.refreshEditor();
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.refreshEditor()
  },
  methods: {

    refreshEditor() {
      this.value = 0;
      if (this.editor?.currentControlDefine) {
        this.controlDefine = this.editor.currentControlDefine;
        if (this.controlDefine) {
          this.attrDefine = this.controlDefine.attrDefineMap.get(this.attrCode);
          let valueDefine = this.getDataValue();

          if (valueDefine) {
            this.value = valueDefine.value;
          }
        } else {
          this.attrDefine = null
        }
      }
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
              //增加特殊样式
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


    valueChange(evt) {
      let value = this.value + this.addValue;
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
          this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeValue, { mids: [element.id], paths: paths, value: parsedValue }, evt, true);
        });
      }
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
    }
  }
};
</script>

<style lang="less" scoped>
.ddei_editor_quick_fat_item_box {
  width: 13px;
  height: 13px;
  display: flex;
  text-align: center;

  .iconfont {
    font-size: 13px;
  }
}
</style>
