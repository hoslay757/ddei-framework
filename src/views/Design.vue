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

export default {
  props: {},
  data() {
    return {
      publishPostData: null,
      publishFileDialogShow: false,
      ddeiConfig: Object.freeze({
        EVENT_LOAD_FILE: this.openFile,
        EVENT_SAVE_FILE: this.saveFile,
        EVENT_GOBACK_FILE_LIST: this.goBackFileList,
        EVENT_PUBLISH_FILE: this.publishFile,
        // AC_DESIGN_SELECT: false,
        // AC_DESIGN_DRAG: false,
        // AC_DESIGN_EDIT: true,
        // AC_DESIGN_CREATE_DDeiRectangle: true,
        // AC_DESIGN_SELECT_DDeiRectangle: true,
        // AC_DESIGN_DRAG_DDeiRectangle: false,
        // AC_DESIGN_DEL_DDeiRectContainer: false,
        // "AC_DESIGN_VIEW_DDeiRectangle_fill.color": true,
        // AC_DESIGN_EDIT_DDeiRectangle: true,
        // AC_DESIGN_EDIT_DDeiRectangle_text: false,
        // EVENT_CONTROL_SELECT_BEFORE: this.selectBefore,
        // EVENT_CONTROL_SELECT_AFTER: this.selectAfter,
        // EVENT_CONTROL_CREATE_BEFORE: this.createBefore,
        // EVENT_CONTROL_CREATE_AFTER: this.createAfter,
        // EVENT_CONTROL_DRAG_AFTER: this.dragAfter,
        // EVENT_CONTROL_DEL_AFTER: this.removeAfter,
        // EVENT_CONTROL_EDIT_AFTER: this.editAfter,
        // EVENT_CONTROL_VIEW_AFTER: this.viewAfter,
        // EVENT_CONTROL_VIEW_BEFORE: this.viewBefore,
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
     * 查看前
     */
    viewBefore(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log(
          "查看前:" + model.id + " 属性——" + propName + " .  " + model[propName]
        );
      });
      return true;
    },
    /**
     * 查看后
     */
    viewAfter(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log(
          "查看:" + model.id + " 属性——" + propName + " .  " + model[propName]
        );
      });
    },
    /**
     * 编辑值前
     */
    editBefore(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log(
          "准备编辑:" +
            model.id +
            " 属性——" +
            propName +
            " .  " +
            model[propName]
        );
      });
      return true;
    },
    /**
     * 编辑值后
     */
    editAfter(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log(
          "编辑:" + model.id + " 属性——" + propName + " .  " + model[propName]
        );
      });
    },
    /**
     * 删除后
     */
    removeAfter(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log("删除:" + model.id);
      });
    },
    /**
     * 拖拽后
     */
    dragAfter(operate, models, propName, ddInstance, evt) {
      models.forEach((model) => {
        console.log("拖拽:" + model.id);
      });
    },

    /**
     * 创建后
     */
    createAfter(operate, models, propName, ddInstance, evt) {
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
          let returnData = fileData.data.data;
          //DEMO 保存的业务ID
          returnData.extData = { busiid: "busi_" + returnData.id };
          let busiData = await this.loadBusiData();
          returnData.busiData = busiData;
          //加载业务信息，以用于显示填充数据
          return returnData;
        }
      }
    },

    /**
     * 加载业务数据
     */
    async loadBusiData() {
      //加载业务数据并返回
      return {
        签名: "hoslay",
        日期: new Date().getTime(),
        发起人: "张三",
        类型: "差旅费报销",
        流程: [
          {
            名称: "发起",
            处理人: "张三",
            处理时间: "2023-01-01 23:12:12",
          },
          {
            名称: "审批",
            处理人: "李四",
            处理时间: "2023-01-02 09:13:13",
            意见: "同意",
          },
          {
            名称: "支付",
            处理人: "王五",
            处理时间: "2023-01-03 17:17:00",
            意见: "已打款至账户",
          },
          {
            名称: "办结",
            处理时间: "2023-01-03 17:17:00",
          },
        ],
        单据: [
          {
            开始日期: "12-15",
            结束日期: "12-15",
            餐费: 20,
            交通费: 36,
            备注: "07:35-21:30",
          },
          {
            开始日期: "12-16",
            结束日期: "12-16",
            餐费: 20,
            交通费: 37,
            备注: "09:00-23:00",
          },
          {
            开始日期: "12-17",
            结束日期: "12-17",
            餐费: 20,
            交通费: 40,
            备注: "09:00-22:00,送同事",
          },
          {
            开始日期: "12-18",
            结束日期: "12-18",
            餐费: 20,
            交通费: 35,
            备注: "08:30-21:30",
          },
          {
            开始日期: "12-19",
            结束日期: "12-20",
            餐费: 26,
            交通费: 30,
            备注: "09:00-00:00",
          },
          {
            开始日期: "12-21",
            结束日期: "12-21",
            餐费: 40,
            交通费: 38,
            备注: "09:00-23:00",
          },
        ],
      };
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
