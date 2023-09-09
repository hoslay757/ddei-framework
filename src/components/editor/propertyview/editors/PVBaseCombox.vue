<template>
  <div :id="getEditorId(attrDefine.code)"
    :class="{ 'ddei_pv_base_combox': true, 'ddei_pv_base_combox_disabled': attrDefine.readonly }">
    <div :class="{ 'textinput': true, 'textinput_expanded': expanded }">
      <input type="text" :readonly="attrDefine.readonly || !canSearch" v-model="text"
        :placeholder="attrDefine.defaultValue" @click="!canSearch && showDialog()" />
      <div> <img style="width:8px;height:8px;margin:auto" src="../../icons/toolbox-expanded.png" @click="showDialog" />
      </div>
    </div>
    <div :id="getShowDialogId(attrDefine.code)" :class="{ 'ddei_combox_show_dialog': true }">
      <div class="ddei_combox_show_dialog_content">
        <slot>测试</slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash';
import DDeiEditorArrtibute from '../../js/attribute/editor-attribute';
import DDeiEditor from '../../js/editor';
import DDeiEnumBusCommandType from '../../../framework/js/enums/bus-command-type';
import DDeiAbstractArrtibuteParser from '../../../framework/js/models/attribute/parser/attribute-parser';
import DDeiUtil from '../../../framework/js/util';
export default {
  name: "DDei-Editor-PV-Base-Combox",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type: DDeiEditorArrtibute,
      default: null
    },
    canSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //当前编辑器
      editor: null,
      //是否展开
      expanded: false,
      //值
      value: null,
      //文本
      text: null,
    };
  },
  computed: {},
  watch: {

  },
  created() {

  },
  mounted() {
    this.destroyDialog();
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    getShowDialogId(id) {
      return "ddei_attr_editor_dialog_" + id;
    },

    getEditorId(id) {
      return "ddei_attr_editor_" + id;
    },

    //打开弹出框
    showDialog(evt) {
      let dialog = document.getElementById(this.getShowDialogId(this.attrDefine.code));
      if (!this.expanded) {
        let haveElement = false;
        for (let i = 0; i < document.body.children.length; i++) {
          if (document.body.children[i] == dialog) {
            haveElement = true;
          }
        }
        if (!haveElement) {
          dialog.remove();
          document.body.appendChild(dialog);
        }
        dialog.style.display = "block";
        //获取父级控件绝对坐标
        let attrEditor = document.getElementById(this.getEditorId(this.attrDefine.code));
        let position = DDeiUtil.getDomAbsPosition(attrEditor);
        dialog.style.left = (position.left - dialog.offsetWidth + attrEditor.offsetWidth - 9.5) + "px";
        dialog.style.top = (position.top + attrEditor.offsetHeight) + "px";

        this.expanded = true;
      } else {
        dialog.style.display = "none";
        this.expanded = false;
      }
    },

    //移除弹出框
    destroyDialog() {
      let dialog = null;
      for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i].className == "ddei_combox_show_dialog") {
          dialog = document.body.children[i];
        }
      }
      if (dialog) {
        dialog.remove();
      }
    },

    closeDialog(evt) {
      this.expanded = false;
      let dialog = document.getElementById(this.getShowDialogId(this.attrDefine.code));
      dialog.style.display = "none";
    },


  },

};
</script>

<style scoped>
/**以下为range属性编辑器 */
.ddei_pv_base_combox {
  height: 24px;
  padding-right: 10px;
}


.ddei_pv_base_combox .textinput {
  width: 100%;
  padding-right: 5px;
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
  display: inline-block;
  padding-left: 5px;

}

.ddei_pv_base_combox .textinput:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}


.ddei_pv_base_combox .textinput input {
  float: left;
  width: calc(100% - 10px);
  border: transparent;
  outline: none;
  font-size: 13px;
  background: transparent;
  margin-top: 1px;
}

.ddei_pv_base_combox .textinput div {
  float: left;
  width: 10px;
  height: 20px;
}


.ddei_combox_show_dialog {
  font-size: 13px;
  background: white;
  display: none;
  position: absolute;
  z-index: 999;
  border-radius: 4px;

}

.ddei_combox_show_dialog_content {
  width: 100%;
  height: 100%;
  background: white;
  padding: 10px;
  box-shadow: 4.0px 4.0px 4.0px hsl(0deg 0% 0% /0.25)
}
</style>
