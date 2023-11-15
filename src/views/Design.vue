<template>
  <DDeiEditor :config="ddeiConfig"></DDeiEditor>

  <div class="publish_file_dialog"
       v-show="publishFileDialogShow">
    <div class="content">
      <div class="title">
        发布文件
      </div>
      <div style="margin-top:10px;padding:10px;">
        是否发布：【{{ publishPostData?.name+" V"+publishPostData?.version }}】？
      </div>
      <div class="buttons">
        <div class="button_ok"
             style="margin-top:20px;"
             @click="submitPublishFile()">
          <span>确定</span>
        </div>
        <div class="button_cancel"
             style="margin-top:20px;"
             @click="showPublishFileDialog()">
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { userinfo } from "@/lib/api/login/index.js";
import { loadfile, savefile, publishfile } from "@/lib/api/file";
import Cookies from "js-cookie";
import DDeiEditor from "../components/editor/Editor.vue";
import DDeiEnumOperateType from "../components/framework/js/enums/operate-type";

export default {
  props: {},
  data() {
    return {
      publishFileDialogShow: false,
      ddeiConfig: Object.freeze({
        EVENT_LOAD_FILE: this.openFile,
        EVENT_SAVE_FILE: this.saveFile,
        EVENT_GOBACK_FILE_LIST: this.goBackFileList,
        EVENT_PUBLISH_FILE: this.publishFile,
        AC_DESIGN_SELECT: false,
        AC_DESIGN_CREATE_DDeiRectangle: false,
        EVENT_CONTROL_SELECT_BEFORE: this.selectBefore,
        EVENT_CONTROL_SELECT_AFTER: this.selectAfter,
        EVENT_CONTROL_CREATE_BEFORE: this.createBefore,
        EVENT_CONTROL_CREATE_AFTER: this.createAfter,
      }),
    };
  },
  //注册组件
  components: {
    DDeiEditor,
  },
  created() {},
  mounted() {
    this.getUserInfo();
  },
  methods: {
    /**
     * 创建后
     */
    createAfter(operate, models, ddInstance, evt) {
      models.forEach((model) => {
        console.log("创建后:" + model.id);
      });
    },
    /**
     * 创建前
     */
    createBefore() {
      console.log("创建前");
      return true;
    },
    /**
     * 选择前
     */
    selectBefore() {
      console.log("选择前");
      return true;
    },

    /**
     * 选择后
     */
    selectAfter() {
      console.log("选择后");
    },
    /**
     * 打开文件
     */
    async openFile() {
      //获取参数
      let fileId = this.$route.params.id;
      //根据ID获取文件的设计以及文件的信息
      let fileData = await loadfile({ id: fileId });
      if (fileData.status == 200) {
        if (fileData.data.code == 0) {
          return fileData.data.data;
        }
      }
    },

    /**
     * 保存文件以及设计
     */
    async saveFile(designdata) {
      //根据ID获取文件的设计以及文件的信息
      if (designdata) {
        let postData = {
          id: designdata.id,
          name: designdata.name,
          code: designdata.code,
          desc: designdata.desc,
          content: JSON.stringify(designdata),
        };
        let fileData = await savefile(postData);
        if (fileData.status == 200) {
          if (fileData.data.code == 0) {
            return { result: 1, msg: "" };
          } else {
            return { result: 2, msg: "保存失败" };
          }
        }
      }
    },

    /**
     * 保存文件以及设计并发布文件
     */
    async publishFile(designdata) {
      //根据ID获取文件的设计以及文件的信息
      this.publishPostData = null;
      if (designdata) {
        let postData = {
          id: designdata.id,
          name: designdata.name,
          code: designdata.code,
          desc: designdata.desc,
          version: designdata.version,
          content: JSON.stringify(designdata),
        };
        this.publishPostData = Object.freeze(postData);
        //缓存数据，弹出确认框进行确认
        this.showPublishFileDialog();
        //等待弹出框确认
        let dialogResult = await this.waitingPublishDialog();
        if (dialogResult == 1) {
          if (this.publishPostData) {
            let fileData = await publishfile(this.publishPostData);
            if (fileData.status == 200) {
              if (fileData.data.code == 0) {
                this.showPublishFileDialog();
                return { result: 1, msg: "" };
              } else {
                return { result: 2, msg: "发布失败" };
              }
            }
          }
        } else {
          return { result: 3, msg: "发布取消" };
        }
      }
    },

    /**
     * 等待弹框确认
     */
    async waitingPublishDialog() {
      this.publishDialogState = 0;
      while (this.publishDialogState == 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      return this.publishDialogState;
    },

    /**
     * 确认发布文件
     */
    submitPublishFile() {
      this.publishDialogState = 1;
    },

    /**
     * 返回文件列表页
     */
    goBackFileList() {
      this.$router.push({
        path: "/",
      });
    },

    /**
     * 弹出发布文件弹出框
     */
    showPublishFileDialog() {
      this.publishFileDialogShow = !this.publishFileDialogShow;
      if (!this.publishFileDialogShow) {
        this.publishPostData = null;
        this.publishDialogState = -1;
      }
    },
    /**
     * 获取登录用户信息
     */
    getUserInfo() {
      userinfo()
        .then((response) => {
          let userJSON = response.data.data;
          let user = JSON.stringify(userJSON, null, 4);
          Cookies.set("user", user);
        })
        .catch((e) => {
          Cookies.remove("token");
          this.$router.push({
            path: this.$route.query.redirect || "/login",
          });
        });
    },
  },
};
</script>
<style lang="less" scoped>
/* .删除文件弹框 */
.publish_file_dialog {
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
    left: calc(50% - 150px);
    top: calc(50% - 90px);
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
</style>
