<template>
  <div class="header">
    <div class="header-logo"
         @click="handleLogoClick">
      <img class="header-logo-icon"
           src="@/assets/images/logo.png" />
      <span class="header-title">{{ title + (version ? ' - V' + version : '') }}</span>
    </div>
    <div class="header-center">
      <SearchInput></SearchInput>
    </div>
    <div class="header-right">
      <div class="header-right-avator">
        <img v-if="form.avator"
             :src="form.avator"
             class="header-right-avator-img" />
        <div v-else
             class="header-right-avator-img header-right-avator-text">{{form.username.substring(0, 1)}}</div>
      </div>
      <div class="header-right-username">{{ form.username }}</div>
      <div class="header-right-loginout"
           @click="loginout">注销</div>
    </div>
  </div>
</template>

<script lang="ts">
import Cookies from 'js-cookie'
import SearchInput from './SearchInput.vue'

export default {
  name: 'Header',
  components: {
    SearchInput
  },
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

<style lang="less" scoped>
.header {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  // background: #212121;
  // border-bottom: 1px solid #080808;
  border-bottom: 1px solid #DDDDDF;
}

.header-logo {
  margin-left: 20px;
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
  line-height: 0px;
  min-width: 260px;
}

.header-title {
  font-size: 14px;
  // color: #fff;
}

.header-logo-icon {
  width: 22px;
  height: 21px;
  margin-right: 10px;
  vertical-align: sub;
}

.header-center {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  padding-right: 20px;
}

.header-right-avator {
  width: 28px;
  height: 28px;
}

.header-right-avator-img {
  width: 100%;
  height: 100%;
  background: #176EFF;
  border-radius: 50%;
}

.header-right-avator-text {
  color: #fff;
  font-size: 24px;
  line-height: 24px;
  text-align: center;
}

.header-right-username {
  font-size: 14px;
  margin-left: 10px;
}

.header-right-loginout {
   margin-left: 10px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    color: #3662ec;
  }
}
</style>