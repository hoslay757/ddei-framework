<template>
  <DDeiEditor :config="ddeiConfig"></DDeiEditor>
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
      ddeiConfig: Object.freeze({
        loadFile: this.openFile,
        saveFile: this.saveFile,
        goBackFileList: this.goBackFileList,
        publishFile: this.publishFile,
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
            return fileData.data.data;
          }
        }
      }
    },

    /**
     * 保存文件以及设计并发布文件
     */
    async publishFile(designdata) {
      //根据ID获取文件的设计以及文件的信息
      if (designdata) {
        let postData = {
          id: designdata.id,
          name: designdata.name,
          code: designdata.code,
          desc: designdata.desc,
          content: JSON.stringify(designdata),
        };
        let fileData = await publishfile(postData);
        if (fileData.status == 200) {
          if (fileData.data.code == 0) {
            return fileData.data.data;
          }
        }
      }
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
