<template>
  <DDeiEditor></DDeiEditor>
</template>

<script lang="ts">
import { userinfo } from "@/lib/api/login/index.js";
import Cookies from "js-cookie";
import DDeiEditor from "../components/editor/Editor.vue";

export default {
  props: {},
  data() {
    return {};
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
