<template>
  <div id="ddei_editor_menu_dialog" class="ddei_editor_menu_dialog">
    <div :class="{ 'ddei_editor_menu_dialog_hr': menu.code == 'split', 'ddei_editor_menu_dialog_item': menu.code != 'split' }" v-for="menu in editor?.currentMenuData">
        <div v-if="menu.code != 'split'" class="ddei_editor_menu_dialog_item_icon">
        </div>
        <div v-if="menu.code != 'split'" class="ddei_editor_menu_dialog_item_content">
              {{ menu.name }}
        </div>
        <div v-if="menu.code != 'split'" class="ddei_editor_menu_dialog_item_desc">
       
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from '../../js/editor';

export default {
  name: "DDei-Editor-Menu-Dialog",
  extends: null,
  mixins: [],
  props: {
  },
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  components: {
  },
  watch: {

  },
  created() {
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    
  },
  methods: {
   
  }
};
</script>

<style scoped>
/**以下为菜单的样式 */
.ddei_editor_menu_dialog {
  width:200px;
  height:400px;
  background-color:white;
  font-size: 14px;
  border: 0.3px solid rgb(240,240,240);
  display: none;
  position: absolute;
  z-index: 999;
  border-radius: 4px;
  box-shadow: -3.0px 3.0px 3.0px hsl(0deg 0% 0% /0.25)
}


.ddei_editor_menu_dialog_item{
  height:34px;
  width:100%; 
  display:flex;
}

.ddei_editor_menu_dialog_item:hover{
  background-color:rgb(240,240,240);
  cursor:pointer;
}

.ddei_editor_menu_dialog_item_icon{
  flex:0 0 34px;
}

.ddei_editor_menu_dialog_item_content{
  flex:1;
  padding-left:5px;
  padding-top:6px;
}


.ddei_editor_menu_dialog_item_desc{
 flex:0 0 34px;
}

.ddei_editor_menu_dialog_hr{
  border: 0.5px solid rgb(240, 240, 240);
  width: 93%;
  margin: 1px auto;
}


</style>
