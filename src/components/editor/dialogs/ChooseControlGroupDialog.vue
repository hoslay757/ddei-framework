<template>
  <div id="choose_control_group_dialog" class="choose_control_group_dialog">
    <div class="content">
      <div class="title">选择需要的图形</div>
      <div class="group">
        <div class="item" @mousemove="expandSubMenu('basic', $event)">
          <svg class="icon groupicon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan503"></use>
          </svg>
          <div class="groupname">基本</div>
          <svg class="icon expand" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan465"></use>
          </svg>
        </div>
        <div class="item" @mousemove="expandSubMenu('uml', $event)">
          <svg class="icon groupicon" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan384"></use>
          </svg>
          <div class="groupname">UML</div>
          <svg class="icon expand" aria-hidden="true">
            <use xlink:href="#icon-a-ziyuan465"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="subcontent" id="choose_control_group_dialog_subcontent">
      <div class="group">
        <div class="item" v-for="group in subGroups" @click="chooseGroup(group.id)">
          <input type="checkbox" v-model="group.selected" style="pointer-events: none;" :name="group.id"
            autocomplete="off">
          <div class="groupname">{{ group.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import { groupOriginDefinies } from "../configs/toolgroup";
import DDeiUtil from "@/components/framework/js/util";

export default {
  name: "DDei-Editor-Dialog-ChooseControlGroup",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'choose_control_group_dialog',
      //当前编辑器
      editor: null,
      subGroups: null,
      menuId: null,
      selectGroups: []
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.menuId = null
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.selectGroups) {
      this.selectGroups = this.editor?.tempDialogData[this.dialogId].selectGroups
    }
  },
  methods: {
    expandSubMenu(menuid, evt) {
      if (this.menuId != menuid) {
        let groups = []
        groupOriginDefinies.forEach(group => {
          if (group.subject == menuid) {
            let ginfo = { id: group.id, name: group.name }

            if (this.selectGroups.indexOf(group.id) != -1) {
              ginfo.selected = true;
            } else {
              ginfo.selected = false;
            }
            groups.push(ginfo)
          }
        })
        this.subGroups = groups
        this.menuId = menuid
        let dialogEle = document.getElementById("choose_control_group_dialog");
        let subContentEle = document.getElementById("choose_control_group_dialog_subcontent");
        subContentEle.style.display = "block";
        let srcElement = evt.currentTarget;
        let dialogDomPos = DDeiUtil.getDomAbsPosition(dialogEle)
        let domPos = DDeiUtil.getDomAbsPosition(srcElement)
        subContentEle.style.left = (domPos.left - dialogDomPos.left + srcElement.clientWidth) + "px";
        subContentEle.style.top = (domPos.top - dialogDomPos.top) + "px";
      }
    },

    chooseGroup(groupid) {
      let ginfo = null
      for (let i = 0; i < this.subGroups.length; i++) {
        if (this.subGroups[i].id == groupid) {
          ginfo = this.subGroups[i]
          break;
        }
      }
      if (ginfo) {
        ginfo.selected = !ginfo.selected


        if (ginfo.selected) {
          if (this.selectGroups.indexOf(ginfo.id) == -1) {
            this.selectGroups.push(ginfo.id)
            if (this.editor?.tempDialogData[this.dialogId]?.callback?.select) {
              this.editor?.tempDialogData[this.dialogId]?.callback?.select(ginfo.id, true);
            }
          }
        } else {
          if (this.selectGroups.indexOf(ginfo.id) != -1) {
            this.selectGroups.splice(this.selectGroups.indexOf(ginfo.id), 1)
            if (this.editor?.tempDialogData[this.dialogId]?.callback?.select) {
              this.editor?.tempDialogData[this.dialogId]?.callback?.select(ginfo.id, false);
            }
          }
        }

      }
    }
  }
};
</script>

<style lang="less" scoped>
.choose_control_group_dialog {
  display: none;
  overflow: hidden;
  width: 420px;
  position: absolute;
  height: 400px;
  z-index: 999;

  .content {
    width: 210px;
    border: 1px solid #E6E6E6;
    background-color: white;
    box-shadow: 0px 2px 24px 0px #DBDBDB;
    border-radius: 6px;
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;

    .title {
      color: black;
      height: 36px;
      width: 100%;
      display: flex;
      justify-content: start;
      align-items: center;
      font-size: 16px;
      padding-left: 10px;
      border-bottom: 1px solid #DBDBDB;
    }

    .group {
      color: black;
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;

      .item {
        flex: 0 0 36px;
        width: 210px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        .groupicon {
          width: 34px;
          font-size: 26px;
        }

        .groupname {
          white-space: nowrap;
          flex: 0 1 160px;
          margin: 0 10px;
        }

        .expand {
          font-size: 22px;
        }
      }

      .item:hover {
        background-color: #e6e6e6;
      }
    }
  }

  .subcontent {
    display: none;
    position: absolute;
    width: 160px;
    border: 1px solid #E6E6E6;
    background-color: white;
    box-shadow: 0px 2px 24px 0px #DBDBDB;
    border-radius: 6px;
    max-height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    user-select: none;

    .title {
      color: black;
      height: 36px;
      width: 100%;
      display: flex;
      justify-content: start;
      align-items: center;
      font-size: 16px;
      padding-left: 10px;
    }

    .group {
      color: black;
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;

      .item {
        flex: 0 0 36px;
        width: 160px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        >input {
          flex: 0 0 20px;
        }

        .groupname {
          white-space: nowrap;
          flex: 0 1 120px;
          margin-left: 10px;

        }


      }

      .item:hover {
        background-color: #e6e6e6;
      }
    }
  }
}
</style>
