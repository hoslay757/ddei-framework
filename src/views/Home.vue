<template>
  <div class="ddei_home">
    <div class="ddei_home_header">
      <Headers />
    </div>
    <div class="ddei_home_bar">

    </div>
    <div class="ddei_home_middle">

      <div class="ddei_home_middle_left">

      </div>
      <div class="ddei_home_middle_right">
        <FileList />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { userinfo } from "@/lib/api/login/index.js";
import Cookies from "js-cookie";
import Headers from "./components/Header.vue";
import FileList from "./components/FileList.vue";

export default {
  props: {},
  data() {
    return {};
  },
  //注册组件
  components: {
    Headers,
    FileList,
  },
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
<style scoped>
.ddei_home {
  width: 100%;
  height: calc(100vh);
  background: black;
  display: flex;
  flex-direction: column;
}
.ddei_home_header {
  flex: 0 0 48px;
}
.ddei_home_bar {
  flex: 0 0 48px;
  background: #2c2c2c;
}
.ddei_home_middle {
  flex: 1;
  background: #2c2c2c;
  display: flex;
}

.ddei_home_middle_left {
  flex: 0 0 300px;
  background: white;
}
.ddei_home_middle_right {
  flex: 1;
  display: flex;
}
</style>
