<template>
  <div class="header">
    <div class="header-logo" @click="handleLogoClick">
      <img class="header-logo-icon" src="@/assets/images/logo.png" />
      <span class="header-title">{{ title + (version ? ' - V' + version : '') }}</span>
    </div>
    <div class="header-empty" />
    <div class="header-right">
      <div class="header-right-username">{{ form.username }}</div>
      <div class="header-right-loginout" @click="loginout">注销</div>
    </div>
  </div>
</template>

<script lang="ts">
import Cookies from 'js-cookie'
export default {
  name: 'Header',
  props: {
    title: { type: String, default: "DDei-在线设计器" },
    version: { type: String, default: "1.0.0" }
  },
  data() {
    return {
      form: {
        username: '',
        rolename: ''
      }
    }
  },
  created() { },
  mounted() {
    let userCookie = Cookies.get('user')
    // 初始化用户信息
    if (userCookie) {
      let user = JSON.parse(userCookie)
      this.form.username = user.name
    }
  },
  methods: {
    handleLogoClick() {
      this.$router.push('/')
    },
    loginout() {
      Cookies.remove('token')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  background: #212121;
  border-bottom: 1px solid #080808;
}

.header-logo {
  margin-left: 20px;
  display: inline-block;
  text-align: left;
  cursor: pointer;
  line-height: 0px;
}

.header-title {
  font-size: 19px;
  color: #fff;
}

.header-logo-icon {
  width: 29px;
  height: 21px;
  margin-right: 10px;
  vertical-align: sub;
}

.header-empty {
  flex: 1;
}

.header-right {
  flex: 0 0 130px;

  padding-right: 20px;
}

.header-right-username {
  float: left;
  font-size: 16px;
  color: #3662ec;
}

.header-right-loginout {
  float: left;
  margin-left: 10px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 2px;
  color: white;
}
</style>