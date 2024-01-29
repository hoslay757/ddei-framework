<template>
  <div class="ddei_editor_right">
    <div class="header">
      <div class="h1"></div>
      <span class="iconfont icon-a-ziyuan124 h2"></span>
      <div class="h3"></div>
      <div class="userinfo">{{ userNameFirst }}</div>
      <div class="h4"></div>
      <div class="loginout" @click="loginout">注销</div>
      <div class="h5"></div>
    </div>
    <div class="content">
    </div>
    <div class="tail">
    </div>
  </div>
</template>
<script lang="ts">
import DDeiEditor from "../../js/editor";
import DDeiEditorUtil from "../../js/util/editor-util";
import Cookies from 'js-cookie'
export default {
  name: "DDei-Editor-Right",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      editor: null,
      file: {},
      fileNameEditing: false,
      fileDescEditing: false,
      userNameFirst: 'U'
    };
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    this.file = this.editor?.files[this.editor?.currentFileIndex];
    try {
      let userCookie = Cookies.get('user')
      // 初始化用户信息
      if (userCookie) {
        let user = JSON.parse(userCookie)
        if (user.name) {
          this.userNameFirst = user.name.charAt(0).toUpperCase();
        }
      }
    } catch (e) { }
  },
  methods: {

    loginout() {
      Cookies.remove('token')
      this.$router.push('/login')
    },

    goBackFileList() {
      //调用SPI进行保存
      let goBackFileList = DDeiEditorUtil.getConfigValue(
        "EVENT_GOBACK_FILE_LIST",
        this.editor
      );
      if (goBackFileList) {
        goBackFileList();
      }
    },

  },
};
</script>

<style lang="less" scoped>
.ddei_editor_right {
  height: 103px;
  display: grid;
  grid-template-rows: 50px 23px 23px;
  grid-template-columns: 1fr;

  .header {
    display: flex;
    justify-content: center;
    align-items: center;

    .h1 {
      flex: 1;
    }

    .h2 {
      flex: 0 0 21px;
      font-size: 22px;
      cursor: pointer;
    }

    .h3 {
      flex: 0 1 33px
    }

    .h4 {
      flex: 0 1 12px
    }

    .h5 {
      flex: 0 1 42px
    }

    .userinfo {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 28px;
      height: 28px;
      background: #176EFF;
      border-radius: 50%;
      text-align: center;
      flex: 0 0 28px;
      font-size: 16px;
      font-weight: 400;
      color: #FFFFFF;
      cursor: pointer;
    }

    .loginout {
      display: flex;
      white-space: nowrap;
      justify-content: center;
      align-items: center;
      flex: 0 1 28px;
      height: 14px;
      font-size: 16px;
      font-weight: 400;
      color: #000000;
      cursor: pointer;
    }

    .loginout:hover {
      text-decoration: underline;
    }
  }
}
</style>
