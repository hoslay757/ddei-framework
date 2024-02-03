<template>
  <div class="ddei_home_dir_tree">
    <div v-for="folder in folders"
         :key="folder.id"
         class="ddei_home_dir_tree_node">
      <div :class="{'ddei_home_dir_tree_node_content':true, 'selected':folder.isCurrent}"
           :style="{paddingLeft: `${folder.level * 25}px`}"
           v-show="folder.isShow">
        <img class="ddei_home_dir_tree_node_icon"
             v-show="folder.hasChildren"
             :src="folder.expaned?icons['toolbox-expanded'] :icons['icon-tree-unexpaned']"
             @click="expandTree(folder)" />
        <span @click="setCurrentFolder(folder)">{{folder.name}}</span>
        <div class="
             ddei_home_dir_tree_node_buttons"
             v-show="folder.isCurrent">
          <img src="../../components/editor/icons/icon-plus-circle.png"
               title="新建子目录"
               @click="showFolderDialog(folder,1)" />
          <img src="../../components/editor/icons/icon-style-line.png"
               title="重命名"
               @click="showFolderDialog(folder,2)"
               v-show="folder.id != '0'" />
          <img src="../../components/editor/icons/icon-trash.png"
               title="移入回收站"
               @click="showDelFolderDialog(folder)"
               v-show="folder.id != '0'" />
        </div>
      </div>
    </div>
  </div>
  <div class="create_folder_dialog"
       v-show="folderDialogShow">
    <div class="content">
      <div class="title">
        {{mod == 1 ? '创建' : '修改'}}目录
      </div>
      <div class="msg">
        {{cf.validMsg?.name}}
      </div>
      <input v-model="cf.name"
             id="create_folder_input_id"
             type="text"
             class="content_input"
             placeholder="目录名称" />
      <div class="buttons">
        <div class="button_ok"
             style="margin-top:20px;"
             @click="sumbitFolder()">
          <span>确定</span>
        </div>
        <div class="button_cancel"
             style="margin-top:20px;"
             @click="showFolderDialog">
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>

  <div class="create_folder_dialog"
       v-show="delFolderDialogShow">
    <div class="content">
      <div class="title">
        删除目录
      </div>
      <div style="margin-top:10px;padding:10px;">
        是否删除：【{{curFolder?.name}}】？
      </div>
      <div class="buttons">
        <div class="button_ok"
             style="margin-top:20px;"
             @click="deleteFolder()">
          <span>确定</span>
        </div>
        <div class="button_cancel"
             style="margin-top:20px;"
             @click="showDelFolderDialog(null)">
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="ts">
import { loadfolder, createfolder, removefolder, renamefolder } from "@/lib/api/folder";
import ICONS from '../../components/editor/js/icon';

export default {
  name: 'DDei-Home-Dir-Tree',
  props: {

  },
  data () {
    return {
      folders: [],
      folderDialogShow: false,
      delFolderDialogShow: false,
      cf: {},
      icons: ICONS
    }
  },
  created () { },
  mounted () {

  },
  methods: {

    async deleteFolder () {
      if (this.curFolder) {
        let folderData = await removefolder({ id: this.curFolder.id })
        if (folderData.status == 200) {
          //获取成功
          if (folderData.data?.code == 0) {
            this.loadFolder();
            this.delFolderDialogShow = false;
          }
        }

      }
    },

    expandTree (pf) {
      //关闭
      pf.expaned = !pf.expaned;
      let index = this.folders.indexOf(pf);
      //找到当前目录的所有子目录的最后一个
      let level = pf.level;
      for (let i = index + 1; i < this.folders.length; i++) {
        if (this.folders[i].level <= level) {
          break;
        }
        this.folders[i].expaned = pf.expaned
        this.folders[i].isShow = pf.expaned;
      }


    },

    getCurrentFolder () {
      let folder = null
      this.folders.forEach(f => {
        if (f.isCurrent) {
          folder = f
        }
      })
      return folder
    },

    /**
     * 设置当前目录
     */
    setCurrentFolder (folder) {
      this.folders.forEach(f => {
        f.isCurrent = false
      })
      folder.isCurrent = true
      this.$parent.forceRefreshFileList();
    },

    /**
     * 弹出新文件夹的弹出框
     */
    showFolderDialog (folder, mod) {

      this.folderDialogShow = !this.folderDialogShow;
      if (mod == 1) {
        this.mod = mod
        this.cf.name = "";
      } else if (mod == 2) {
        this.mod = mod
        this.cf.name = folder.name;
      }
      this.curFolder = folder;
      this.cf.parentId = folder?.id ? folder.id : "0"
      this.cf.validMsg = {};
      if (this.folderDialogShow) {
        setTimeout(() => {
          document.getElementById("create_folder_input_id").focus();
        }, 20);
      }
    },

    /**
    * 删除文件夹
    */
    showDelFolderDialog (folder) {
      this.delFolderDialogShow = !this.delFolderDialogShow;
      this.curFolder = folder;
    },
    /**
     * 创建/更新目录
     */
    async sumbitFolder () {
      //校验
      this.cf.validMsg = {};
      if (!this.cf.name) {
        this.cf.validMsg.name = "请输入目录名";
      } else {
        let uPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,15}$/;
        if (!uPattern.test(this.cf.name)) {
          this.cf.validMsg.name = "目录名为1至15位中文、字母、数字下划线组合";
        }
      }
      if (JSON.stringify(this.cf.validMsg) == "{}") {
        if (this.mod == 1) {
          let folderData = await createfolder(this.cf)
          if (folderData.status == 200) {
            //获取成功
            if (folderData.data?.code == 0) {
              let index = this.folders.indexOf(this.curFolder);
              //找到当前目录的所有子目录的最后一个
              let level = this.curFolder.level;
              if (isNaN(level)) {
                level = -1;
              }
              this.curFolder.hasChildren = true;
              this.curFolder.expaned = true;
              let iIndex = -1;
              for (let i = index + 1; i < this.folders.length; i++) {
                if (this.folders[i].level <= level) {
                  iIndex = i;
                  break;
                }
                this.folders[i].isShow = true;
              }
              let folder = folderData.data.data;

              folder.level = level + 1;
              folder.expaned = false
              folder.hasChildren = false;
              folder.isShow = true;
              if (iIndex != -1) {
                this.folders.splice(iIndex, 0, folder);
              } else {
                this.folders.push(folder);
              }
              this.folderDialogShow = false;
            }
          }
        } else if (this.mod == 2) {
          this.cf.id = this.curFolder.id
          let folderData = await renamefolder(this.cf)
          if (folderData.status == 200) {
            //获取成功
            if (folderData.data?.code == 0) {
              this.curFolder.name = this.cf.name
              this.folderDialogShow = false;
            }
          }
        }
      }
    },

    /**
     * 加载目录
     */
    async loadFolder () {
      let folderData = await loadfolder()
      if (folderData.status == 200) {
        //获取成功
        if (folderData.data?.code == 0) {
          let folderList = folderData.data.data
          let folders = []
          this.folderToTree(folders, folderList, 0);
          //遍历生成树的层级为列表，简易输出
          let fl = [{ name: "全部", id: "0", isShow: true }]
          this.treeToList(fl, folders)
          this.folders = fl;

        }
      }

    },

    /**
     * 将folderList转换为树结构，并返回
     */
    folderToTree (folders, folderList, parentId) {
      folderList.forEach(folder => {
        if (folder.parent_id == parentId) {
          folders.push(folder)
          folder.children = []

          this.folderToTree(folder.children, folderList, folder.id)
        }
      });
    },

    /**
    * 将folderList转换为树结构，并返回
    */
    treeToList (folderList, folders, level = 0) {
      folders.forEach(folder => {
        folder.level = level;
        folder.expaned = false;
        if (level == 0) {
          folder.isShow = true;
        } else {
          folder.isShow = false;
        }
        folderList.push(folder);
        if (folder.children?.length > 0) {
          folder.hasChildren = true;
          this.treeToList(folderList, folder.children, level + 1);
        }
      })
    }
  },
  mounted () {
    //加载用户根目录
    this.loadFolder()
  }
}
</script>

<style lang='less' scoped>
.ddei_home_dir_tree {
  flex: 1;
  overflow: auto;
  height: calc(100vh - 55px);
  background-color: #F9FAFB;
  border: 1px solid #E0E3E9;
  border-top: 0px;
  border-radius: 0 0 4px 4px;
  font-size: 14px;
  cursor: pointer;
}

.ddei_home_dir_tree_node {
  width: 100%;
  padding-left: 20px;
  text-align: left;
}

.ddei_home_dir_tree_node_content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ddei_home_dir_tree_node_content.selected {
  background: #E4E7EC;
}

.ddei_home_dir_tree_node_buttons {
  display: none;
  height: 20px;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  flex: 0 0 60px;
}

.ddei_home_dir_tree_node_buttons img {
  width: 14px;
  height: 14px;
  margin-top: 3px;
}

.ddei_home_dir_tree_node_buttons img:hover {
  filter: brightness(200%);
}

.ddei_home_dir_tree_node_content.selected .ddei_home_dir_tree_node_buttons {
  display: grid;
}

.ddei_home_dir_tree span {
  margin: 4px auto;
  flex: 1;
}

.ddei_home_dir_tree_node_icon {
  height: 12px;
  margin-right: 5px;
  flex: 0 0 12px;
  cursor: pointer;
}

.ddei_home_dir_tree_node_icon:hover {
  filter: brightness(200%);
}

.ddei_home_dir_tree span:hover {
  color: white;
  background: #E4E7EC;
}

/* .创建目录弹框 */
.create_folder_dialog {
  z-index: 99;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: calc(100vh);
  .content {
    position: absolute;
    width: 300px;
    height: 180px;
    left: calc(30% - 150px);
    top: calc(30% - 90px);
    background: #fff;
    border-radius: 10px;
    text-align: center;
    font-size: 17px;
    color: black;
    .title {
      width: 100%;
      font-size: 20px;
      color: #3662ec;
      text-align: center;
      margin-top: 15px;
    }
    .content_input {
      width: 80%;
      height: 30px;
      font-size: 18px;
    }
    .msg {
      width: 100%;
      height: 20px;
      font-size: 12px;
      color: red;
      text-align: right;
      padding-right: 30px;
    }
    .buttons {
      width: 80%;
      display: block;
      margin: auto;
      > div {
        width: 45%;
        height: 40px;
        cursor: pointer;
        cursor: pointer;
        border-radius: 2px;
        text-align: center;
        padding-top: 6px;
        > span {
          font-size: 15px;
          color: white;
          text-align: center;
          pointer-events: none;
        }
      }
      .button_ok {
        background-color: #3662ec;
        border-color: #3662ec;
        float: left;
      }

      .button_cancel {
        background-color: rgb(210, 210, 210);
        border-color: rgb(210, 210, 210);
        float: right;
      }
    }
  }
}
.content_right_reg_form_input_required {
  font-size: 19px;
  color: red;
  text-align: center;
  pointer-events: none;
}

.content_right_reg_form_input {
  width: 80%;
  height: 40px;
  font-size: 14px;
  margin-left: 40px;
}
</style>