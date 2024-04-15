<template>
  <div :id="getEditorId(attrDefine?.code)"
    :class="{ 'ddei_pv_base_combox': true, 'ddei_pv_base_combox_disabled': !attrDefine || attrDefine.readonly }">
    <div
      :class="{ 'textinput': true, 'textinput_expanded': expanded, 'display_img': img && attrDefine?.itemStyle?.display == 'img', 'display_img_text': img && attrDefine?.itemStyle?.display == 'img-text' }">
      <span :class="img"
        v-if="img && (attrDefine?.itemStyle?.display == 'img-text' || attrDefine?.itemStyle?.display == 'img')"
        @click="attrDefine && !attrDefine.readonly && !canSearch && showDialog()"></span>
      <input type="text" autocomplete="off"
        v-if="!attrDefine?.itemStyle?.display || attrDefine?.itemStyle?.display == 'img-text' || attrDefine?.itemStyle?.display == 'text'"
        :readonly="attrDefine && (attrDefine.readonly || !canSearch)" v-model="text" :placeholder="defaultText"
        @click="attrDefine && !attrDefine.readonly && !canSearch && showDialog()" @keydown="search($event)" />
      <div style="display:flex;justify-content: center;align-items: center;"
        @click="attrDefine && !attrDefine.readonly && showDialog()">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-a-ziyuan466"></use>
        </svg>
      </div>
    </div>
    <div :id="getShowDialogId(attrDefine?.code)" :class="{ 'ddei-combox-show-dialog': true }">
      <div class="ddei-combox-show-dialog_content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from "lodash";
import DDeiEditorArrtibute from "@ddei-core/editor/js/attribute/editor-attribute";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiUtil from "@ddei-core/framework/js/util";
export default {
  name: "pv-basecombox",
  extends: null,
  mixins: [],
  props: {
    //当前属性定义
    attrDefine: {
      type: DDeiEditorArrtibute,
      default: null,
    },
    canSearch: {
      type: Boolean,
      default: false,
    },
    searchMethod: {
      type: Function,
      defaut: null,
    },
    //当前控件定义
    controlDefine: {
      type: Object,
      default: null,
    },
    options: {
      type: Object,
      default: null
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
      //图片
      img: null,
      defaultText: "",
    };
  },
  computed: {},
  watch: {},
  created() {
    // 搜索框防抖
    this.search = debounce(this.search, 200);
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

    search(evt) {
      if (this.searchMethod) {
        this.searchMethod(this.text, evt);
      }
    },

    //打开弹出框
    showDialog(show: boolean = false, evt: Event) {
      let dialogId = this.getShowDialogId(this.attrDefine.code)
      let dialog = document.getElementById(dialogId);
      let haveElement = false;
      for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i] == dialog) {
          haveElement = true;
        }
      }
      if (!haveElement) {
        //dialog.remove();
        document.body.appendChild(dialog);
      }
      if (!this.expanded || haveElement) {
        dialog.style.display = "block";
        //获取父级控件绝对坐标
        let attrEditor = document.getElementById(
          this.getEditorId(this.attrDefine.code)
        );
        let position = DDeiUtil.getDomAbsPosition(attrEditor);
        dialog.style.left =
          position.left -
          dialog.offsetWidth +
          attrEditor.offsetWidth -
          9.5 +
          "px";
        dialog.style.top = position.top + attrEditor.offsetHeight + "px";

        this.expanded = true;
        if (!DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
          DDeiEditor.ACTIVE_INSTANCE.tempDialogData = {}
        }
        //记录临时变量
        DDeiEditor.ACTIVE_INSTANCE.tempDialogData[dialogId] = { group: "property-dialog" }
      } else {
        dialog.style.display = "none";
        this.expanded = false;
        if (DDeiEditor.ACTIVE_INSTANCE.tempDialogData) {
          DDeiEditor.ACTIVE_INSTANCE.tempDialogData[dialogId] = null
        }
      }
    },

    //移除弹出框
    destroyDialog() {
      let dialogs = [];
      for (let i = 0; i < document.body.children.length; i++) {
        if (document.body.children[i].className == "ddei-combox-show-dialog") {
          dialogs.push(document.body.children[i]);
        }
      }
      dialogs.forEach((dialog) => {
        dialog.remove();
      });
    },

    closeDialog(evt) {
      this.expanded = false;
      let dialog = document.getElementById(
        this.getShowDialogId(this.attrDefine.code)
      );
      dialog.style.display = "none";
    },
  },
};
</script>

<style scoped>
/**以下为range属性编辑器 */
.ddei_pv_base_combox {
  height: 28px;
  padding-right: 10px;
}

.ddei_pv_base_combox_disabled .textinput {
  background-color: rgb(210, 210, 210);
  height: 28px;
}

.ddei_pv_base_combox .textinput {
  width: 100%;
  padding-right: 5px;
  border: 0.5px solid rgb(210, 210, 210);
  border-radius: 4px;
  display: flex;
  padding-left: 5px;
  height: 28px;
}

.ddei_pv_base_combox .textinput:hover {
  border: 1px solid #017fff;
  box-sizing: border-box;
}

.ddei_pv_base_combox .textinput input {
  flex: 1 1 calc(100% - 10px);
  width: calc(100% - 10px);
  border: transparent;
  outline: none;
  font-size: 15px;
  background: transparent;
  margin-top: 1px;
}

.ddei_pv_base_combox .textinput div {
  flex: 0 0 20px;
}

.ddei_pv_base_combox .display_img input {
  display: none;
}

.ddei_pv_base_combox .display_img img {
  width: 20px;
  height: 20px;
}

.ddei_pv_base_combox .display_img_text input {
  width: calc(100% - 30px);
}

.ddei_pv_base_combox .display_img_text img {
  float: left;
  width: 20px;
  height: 20px;
}

.ddei-combox-show-dialog {
  font-size: 13px;
  background: white;
  display: none;
  position: absolute;
  z-index: 999;
  border-radius: 4px;
}

.ddei-combox-show-dialog_content {
  width: 100%;
  height: 100%;
  background: white;
  padding: 10px;
  box-shadow: 4px 4px 4px hsl(0deg 0% 0% /0.25);
}

.icon {
  font-size: 16px
}
</style>
