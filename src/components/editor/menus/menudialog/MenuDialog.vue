<template>
  <div id="ddei_editor_menu_dialog"
       class="ddei_editor_menu_dialog">
    <div v-show="isVisiable(menu)"
         :class="{ 'ddei_editor_menu_dialog_hr': menu.code == 'split', 'ddei_editor_menu_dialog_item': menu.code != 'split' }"
         v-for="menu in editor?.currentMenuData"
         @click="execMenuAction(menu,$event)">
      <div v-if="menu.code != 'split'"
           class="ddei_editor_menu_dialog_item_icon">
        <img v-if="menu.icon"
             :src="icons[menu.icon]" />
      </div>
      <div v-if="menu.code != 'split'"
           class="ddei_editor_menu_dialog_item_content">
        {{ menu.name }}
      </div>
      <div v-if="menu.code != 'split'"
           class="ddei_editor_menu_dialog_item_desc">
        {{ menu.desc }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../../js/editor";
import ICONS from "../../js/icon";
import DDeiEditorConfig from "../../js/config";
import DDeiEnumBusCommandType from "../../../framework/js/enums/bus-command-type";
import DDeiEnumOperateState from "../../../framework/js/enums/operate-state";
export default {
  name: "DDei-Editor-Menu-Dialog",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      //当前编辑器
      editor: null,
      icons: ICONS,
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() {},
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {
    /**
     * 执行菜单的Action
     */
    execMenuAction(menu, evt: Event) {
      let stage = this.editor?.ddInstance?.stage;
      let menuAction = DDeiEditorConfig.MENUS[menu.code];
      if (menuAction && stage) {
        let menuShape = stage.render?.currentMenuShape;
        menuAction.action(menuShape, evt);
      }
      //关闭dialog
      document.getElementById("ddei_editor_menu_dialog").style.display = "none";
      //刷新
      stage.render.operateState = DDeiEnumOperateState.NONE;
      this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
      this.editor.bus.executeAll();
    },

    /**
     * 判断菜单是否显示
     */
    isVisiable(menu) {
      try {
        let stage = this.editor?.ddInstance?.stage;
        let menuAction = DDeiEditorConfig.MENUS[menu.code];
        if (menuAction && stage) {
          let menuShape = stage.render?.currentMenuShape;
          return menuAction.isVisiable(menuShape);
        }
      } catch (e) {
        console.error(e);
      }
      return false;
    },
  },
};
</script>

<style scoped>
/**以下为菜单的样式 */
.ddei_editor_menu_dialog {
  width: 200px;
  background-color: white;
  font-size: 13px;
  color: black;
  border: 0.3px solid rgb(240, 240, 240);
  display: none;
  position: absolute;
  font-weight: bolder;
  z-index: 999;
  border-radius: 4px;
  box-shadow: -3px 3px 3px hsl(0deg 0% 0% /0.25);
}

.ddei_editor_menu_dialog_item {
  height: 34px;
  width: 100%;
  display: flex;
}

.ddei_editor_menu_dialog_item:hover {
  background-color: rgb(240, 240, 240);
  cursor: pointer;
}

.ddei_editor_menu_dialog_item_icon {
  flex: 0 0 34px;
}
.ddei_editor_menu_dialog_item_icon img {
  width: 24px;
  height: 24px;
  margin: 4px 3px 4px 3px;
  filter: brightness(60%);
}

.ddei_editor_menu_dialog_item_content {
  flex: 1;
  padding-top: 6px;
}

.ddei_editor_menu_dialog_item_desc {
  flex: 0 0 34px;
}

.ddei_editor_menu_dialog_hr {
  border: 0.5px solid rgb(240, 240, 240);
  width: 93%;
  margin: 1px auto;
}
</style>
