<template>
  <div :id="getEditorId(attrDefine?.code)"
    :class="{ 'ddei_pv_border_dash_combox': true, 'ddei_pv_border_dash_combox_disabled': !attrDefine || attrDefine.readonly }">
    <div class="textinput" @click="attrDefine && !attrDefine.readonly && showDialog($event)">
      <svg class="div_input">
        <line x1=0 y1=0 x2="100%" y2=0 stroke="black" fill="white" stroke-width="3"
          :stroke-dasharray="attrDefine.value">
        </line>
      </svg>
      <div style="display:flex;justify-content: center;align-items: center;">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-ziyuan466"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import DDeiEditorArrtibute from "@ddei-core/editor/js/attribute/editor-attribute";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiUtil from "@ddei-core/framework/js/util";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";
import DDeiEnumOperateType from "@ddei-core/framework/js/enums/operate-type";
import DDeiEnumOperateState from "@ddei-core/framework/js/enums/operate-state";
import DDeiEditorEnumBusCommandType from "@ddei-core/editor/js/enums/editor-command-type";
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
export default {
  name: "pv-border-dash",
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
      //值
      value: null,
    };
  },
  computed: {},
  watch: {},
  created() {
  },

  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    getEditorId(id) {
      return "ddei_attr_editor_" + id;
    },

    //打开弹出框
    showDialog(evt) {
      let srcElement = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("ddei-core-dialog-selectborderdash", {

        value: this.attrDefine.value,
        dataSource: this.attrDefine.dataSource,
        callback: {
          ok: this.valueChange
        },
        group: "property-dialog"
      }, { type: 5 }, srcElement)
    },

    valueChange(value) {
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
      this.attrDefine.value = value
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
            shadowControl.setSptStyle(curSIdx, curEIdx, paths, value)
            hasEditSetted = true;
          }
        }
      }
      if (!hasEditSetted) {
        DDeiUtil.setAttrValueByPath(this.attrDefine.model, paths, value);
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
            null,
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
              null,
              true
            );
          });
        }
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
    }

  },
};
</script>

<style lang="less" scoped>
.ddei_pv_border_dash_combox {
  height: 28px;
  padding-right: 10px;
}

.ddei_pv_border_dash_combox_disabled .textinput {
  background-color: rgb(210, 210, 210);
  height: 28px;
  justify-content: center;
  align-items: center;
}

.ddei_pv_border_dash_combox .textinput {
  width: 100%;
  padding-right: 5px;
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 5px;
  height: 28px;
}

.ddei_pv_border_dash_combox .textinput:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_border_dash_combox .textinput {
  .div_input {
    flex: 1 1 calc(100% - 10px);
    width: calc(100% - 10px);
    height: 3px;
  }
}

.ddei_pv_border_dash_combox .textinput div {
  flex: 0 0 20px;
}


.icon {
  font-size: 16px
}
</style>
