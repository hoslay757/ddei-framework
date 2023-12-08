<template>
  <div>
    <div id="ddei_editor_quick_fat_item_fontsize"
      :class="{ 'ddei_editor_quick_fat_item_fontsize': true, 'ddei_editor_quick_fat_item_fontsize_disabled': !attrDefine }">
      <input class="ddei_editor_quick_fat_item_fontsize_input"
        :readonly="!attrDefine || (attrDefine && (attrDefine.readonly))" v-model="text" @input="inputValue()"
        :placeholder="defaultText" />
      <div class="ddei_editor_quick_fat_item_fontsize_combox" @click="attrDefine && !attrDefine.readonly && showDialog()">
        <img :src="toolboxExpandedIcon">
      </div>

    </div>
    <div id="ddei_editor_quick_fat_item_fontsize_combox_dialog" class="ddei_editor_quick_fat_item_fontsize_combox_dialog">
      <div
        :class="{ 'itembox': true, 'itembox_selected': item.value == attrDefine.value, 'itembox_deleted': item.deleted, 'itembox_disabled': item.disabled, 'itembox_underline': item.underline, 'itembox_bold': item.bold }"
        v-for="item in dataSource" @click="!item.disabled && inputValue(item.value)" :title="item.desc">
        <div class="itembox_text" v-if="item.text" :style="{ 'font-family': item.fontFamily }">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import DDeiEditor from "../../../js/editor";
import ICONS from "../../../js/icon";
import DDeiEditorUtil from "../../../js/util/editor-util";
import DDeiUtil from "../../../../framework/js/util";
import DDeiEnumBusCommandType from "../../../../framework/js/enums/bus-command-type";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiModelArrtibuteValue from "@/components/framework/js/models/attribute/attribute-value";
import DDeiEditorEnumBusCommandType from "@/components/editor/js/enums/editor-command-type";

export default {
  name: "DDei-Editor-QBT-FontSize",
  extends: null,
  mixins: [],
  components: {},
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      toolboxExpandedIcon: ICONS["toolbox-expanded"],
      controlDefine: null,
      attrDefine: null,
      dataSource: null,
      value: null,
      text: null,
      defaultText: null,
      expanded: false,
      canSearch: true,
    };
  },
  computed: {},
  watch: {},
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
    this.refreshEditor();
  },
  methods: {

    refreshEditor() {
      if (this.editor?.currentControlDefine) {
        this.controlDefine = this.editor.currentControlDefine;
        if (this.controlDefine) {
          this.attrDefine = this.controlDefine.attrDefineMap.get("font.size");
        } else {
          this.attrDefine = null;
        }
        if (this.attrDefine) {
          this.getDataSource(this.attrDefine);
          let type = this.getDataValue()

          let define = this.getDataDefine(type.value);
          if (!type.isDefault) {
            this.attrDefine.value = type.value;
            this.text = define.text;
          } else {
            this.defaultText = define.text;
          }
          if (this.attrDefine.value) {
            this.value = this.attrDefine.value;
            this.text = this.attrDefine.value;
          } else {
            this.value = type.value;
          }
        }
      }
    },

    inputValue(value) {
      //过滤dataSource，找到text
      let dialogSet = false;
      if (value) {
        dialogSet = true
        this.attrDefine.value = value;
        let itemDefine = this.getDataDefine(value);
        let text = itemDefine.text;
        this.text = text;
        this.value = value;
      } else {
        value = this.text;
        this.attrDefine.value = value;
        this.value = value;
        let itemDefine = this.getDataDefine(value);
        if (itemDefine?.text) {
          this.text = itemDefine.text;
        }
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
      let parsedValue = parser.parseValue(value);
      parsedValue = isNaN(parsedValue) || parsedValue <= 0 ? null : parsedValue
      parsedValue = parsedValue > 300 ? 300 : parsedValue
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
            if (dialogSet) {
              setTimeout(() => {
                editorText.focus();
              }, 20);
              this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
            }
            hasEditSetted = true;
          }
        }
      }
      if (!hasEditSetted) {
        this.editor.ddInstance.stage.selectedModels.forEach((element) => {
          this.editor.bus.push(
            DDeiEnumBusCommandType.ModelChangeValue,
            { mids: [element.id], paths: paths, value: parsedValue },
            null,
            true
          );
        });
      }
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
      this.editor.bus.executeAll();
    },


    //打开弹出框
    showDialog(show: boolean = false, evt) {
      let dialog = document.getElementById(
        "ddei_editor_quick_fat_item_fontsize_combox_dialog"
      );
      let haveElement = false;
      for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i] == dialog) {
          haveElement = true;
        }
      }
      if (!haveElement) {
        document.body.appendChild(dialog);
      }
      if (dialog.style.display != "grid") {
        dialog.style.display = "grid";
        //获取父级控件绝对坐标
        let attrEditor = document.getElementById(
          "ddei_editor_quick_fat_item_fontsize"
        );
        let position = DDeiUtil.getDomAbsPosition(attrEditor);
        dialog.style.left =
          position.left - dialog.offsetWidth + attrEditor.offsetWidth + "px";
        dialog.style.top = position.top + attrEditor.offsetHeight + "px";
      } else {
        dialog.style.display = "none";
      }
    },
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
        }
      }
      return { text: "" };
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
                return { isDefault: true, value: value };
              } else {
                return { value: value };
              }
            }
          }
        }

        let dataValue = this.attrDefine.value;
        if (!dataValue) {
          dataValue = DDeiUtil.getDataByPathList(
            this.attrDefine.model,
            this.attrDefine.code,
            this.attrDefine.mapping
          );
        }
        if (dataValue) {
          return { value: dataValue };
        }

      }
      //通过解析器获取有效值
      return {
        isDefault: true,
        value: this.attrDefine?.getParser().getDefaultValue(),
      };
    },

    /**
     * 获取数据源数据
     */
    getDataSource(attrDefine) {
      if (this.attrDefine) {
        this.attrDefine.dataSource = [
          { text: "9", value: 9 },
          { text: "10", value: 10 },
          { text: "10.5", value: 10.5 },
          { text: "11", value: 11 },
          { text: "12", value: 12 },
          { text: "13", value: 13 },
          { text: "14", value: 14 },
          { text: "18", value: 18 },
          { text: "24", value: 24 },
          { text: "36", value: 36 },
          { text: "48", value: 48 },
          { text: "64", value: 64 },
          { text: "72", value: 72 },
          { text: "96", value: 96 },
          { text: "144", value: 144 },
          { text: "288", value: 288 },
        ];
        let dataSources = DDeiEditorUtil.getDataSource(
          this.attrDefine,
          this.searchText
        );
        this.dataSource = dataSources;
        return this.dataSource;
      }
    },



    closeDialog(evt) {
      this.expanded = false;
      let dialog = document.getElementById(
        "ddei_editor_quick_fat_item_fontsize"
      );
      dialog.style.display = "none";
    },
  },
};
</script>

<style scoped>
/*字体大小设置框 */

.ddei_editor_quick_fat_item_fontsize {
  background-color: white;
  border-radius: 4px;
  height: 24px;
}

.ddei_editor_quick_fat_item_fontsize:hover {
  border: 0.5px solid #017fff;
  box-sizing: border-box;
}

.ddei_editor_quick_fat_item_fontsize_disabled:hover {
  background-color: transparent !important;
  cursor: not-allowed !important;
}

.ddei_editor_quick_fat_item_fontsize_input {
  width: calc(100% - 20px);
  border: transparent;
  outline: none;
  font-size: 13px;
  margin-top: 3px;
  background: transparent;
  float: left;
}

.ddei_editor_quick_fat_item_fontsize_combox {
  width: 20px;
  height: 20px;
  float: left;
}

.ddei_editor_quick_fat_item_fontsize_combox img {
  width: 8px;
  margin-top: 8px;
  margin-right: 4px;
  margin-left: 4px;
  height: 8px;
  float: left;
}

.ddei_editor_quick_fat_item_box {
  width: 25px;
  height: 25px;
  text-align: center;
}

.ddei_editor_quick_fat_item_box img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}

.ddei_editor_quick_fat_item_box_disabled {
  color: rgb(228, 228, 232);
  filter: brightness(200%) !important;
}

.ddei_editor_quick_fat_item_box_disabled:hover {
  background-color: transparent !important;
  cursor: not-allowed;
}

.ddei_editor_quick_fat_item_box_selected {
  width: 25px;
  height: 25px;
  text-align: center;
  background-color: rgb(228, 228, 232);
  border-radius: 4px;
}

.ddei_editor_quick_fat_item_box_selected img {
  margin-top: 4px;
  filter: brightness(40%) drop-shadow(0.3px 0px 0.3px #000);
}

.ddei_editor_quick_fat_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}

/*以下为弹出框内容*/

.ddei_editor_quick_fat_item_fontsize_combox_dialog {
  border-radius: 4px;
  margin-top: 4px;
  display: none;
  position: absolute;
  background-color: white;
  gap: 4px;
  overflow: auto;
  color: black;
  font-size: 13px;
  width: 170px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 20px 20px 20px 20px 20px;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox {
  outline: none;
  font-size: 13px;
  margin: auto;
  background: transparent;
  display: table;
  border-radius: 4px;
  width: 80px;
  height: 20px;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox:hover {
  background-color: rgb(245, 245, 245);
  cursor: pointer;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox .itembox_text {
  text-align: center;
  display: table-cell;
  width: 100%;
  vertical-align: middle;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_selected {
  background-color: rgb(240, 240, 240) !important;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_deleted {
  text-decoration: line-through;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_disabled {
  color: rgb(210, 210, 210);
  text-decoration: line-through;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_disabled:hover {
  cursor: not-allowed !important;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_underline {
  text-decoration: underline;
}

.ddei_editor_quick_fat_item_fontsize_combox_dialog .itembox_bold .itembox_text {
  font-weight: bold;
}
</style>
