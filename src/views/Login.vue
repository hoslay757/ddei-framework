<template>
  <div class="login">
    <div class="content">
      <div class="content_left"></div>
      <div class="content_right">
        <div class="content_right_login_form">
          <div class="content_right_login_form_title">中天规则引擎</div>
          <div class="content_right_form_msg">
            {{ form.validMsg.username }}
          </div>
          <input v-model="form.username" class="content_right_login_form_input" placeholder="手机号/邮箱/账号" autofocus />
          <div class="content_right_form_msg">
            {{ form.validMsg.password }}
          </div>
          <input v-model="form.password" class="content_right_login_form_input" placeholder="请输入密码" type="password"
            @keydown.enter="login" />
          <div class="content_right_login_form_buttons" style="margin-top:40px;">
            <div class="content_right_login_form_login" @click="login">
              <span>登录</span>
            </div>
            <div class="content_right_login_form_register" @click="showRegDialog">
              <span>注册</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="register_dialog" v-show="regDialogShow">
      <div class="register_dialog_layer" />
      <div class="register_dialog_content">
        <div class="content_right_reg_form_title">
          新用户注册
        </div>
        <div class="content_right_form_msg">
          {{ reg.validMsg.mobile }}
        </div>
        <input v-model="reg.mobile" id="reg_input_id" type="mobile" class="content_right_reg_form_input"
          placeholder="手机号" />
        <span class="content_right_reg_form_input_required">*</span>
        <div class="content_right_form_msg">
          {{ reg.validMsg.username }}
        </div>
        <input v-model="reg.username" class="content_right_reg_form_input" placeholder="用户名,6-30位中文、英文、数字、下划线组合" />
        <span class="content_right_reg_form_input_required">*</span>
        <div class="content_right_form_msg">
          {{ reg.validMsg.email }}
        </div>
        <input v-model="reg.email" class="content_right_reg_form_input" placeholder="邮箱地址" type="email" />
        <div class="content_right_form_msg">
          {{ reg.validMsg.password }}
        </div>
        <input v-model="reg.password" type="password" class="content_right_reg_form_input" placeholder="密码" />
        <span class="content_right_reg_form_input_required">*</span>
        <div class="content_right_form_msg">
          {{ reg.validMsg.password1 }}
        </div>
        <input v-model="reg.password1" type="password" class="content_right_reg_form_input" placeholder="确认密码" />
        <span class="content_right_reg_form_input_required">*</span>
        <div class="content_right_login_form_buttons">
          <div class="content_right_login_form_login" style="margin-top:20px;" @click="userRegister">
            <span>注册并登陆</span>
          </div>
          <div class="content_right_login_form_register" style="margin-top:20px;" @click="showRegDialog">
            <span>取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { login, userinfo, register } from "@/lib/api/login";
import Cookies from "js-cookie";

export default {
  props: {},
  data() {
    return {
      loginMessage: "",
      user: "",
      form: {
        username: "",
        password: "",
        validMsg: {},
      },
      reg: {
        username: "",
        email: "",
        mobile: "",
        password: "",
        password1: "",
        validMsg: {},
      },
      regDialogShow: false,
    };
  },
  mounted() {
    this.getUserInfo();
  },
  methods: {
    showRegDialog() {
      this.regDialogShow = !this.regDialogShow;
      this.reg.username = "";
      this.reg.email = "";
      this.reg.mobile = "";
      this.reg.password = "";
      this.reg.password1 = "";
      this.reg.validMsg = {};
      if (this.regDialogShow) {
        setTimeout(() => {
          document.getElementById("reg_input_id").focus();
        }, 20);
      }
    },

    //注册并登录
    async userRegister() {
      //校验
      this.reg.validMsg = {};
      if (!this.reg.username) {
        this.reg.validMsg.username = "请输入用户名";
      } else {
        let uPattern = /^[a-zA-Z0-9_-]{6,20}$/;
        if (!uPattern.test(this.reg.username)) {
          this.reg.validMsg.username = "用户名为6至20位数字、字母下划线组合";
        }
      }
      if (!this.reg.mobile) {
        this.reg.validMsg.mobile = "请输入手机号码";
      } else {
        let mPattern =
          /^((13[0-9])|(14[0-9])|(15([0-9]))|(18[0-9])|(19[0-9]))\d{8}$/;
        if (!mPattern.test(this.reg.mobile)) {
          this.reg.validMsg.mobile = "请输入正确的手机号码";
        }
      }
      if (this.reg.email) {
        let ePattern =
          /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!ePattern.test(this.reg.email)) {
          this.reg.validMsg.email = "请输入正确的邮箱地址";
        }
      }

      if (
        !this.reg.password ||
        this.reg.password.length < 6 ||
        this.reg.password.length > 20
      ) {
        this.reg.validMsg.password = "请输入6-20位密码";
      } else if (this.reg.password != this.reg.password1) {
        this.reg.validMsg.password1 = "前后输入的密码不一致";
      }
      if (JSON.stringify(this.reg.validMsg) == "{}") {
        //执行注册并登录
        this.reg.validMsg = {};
        let regData = await register(this.reg);
        if (regData.status == 200) {
          //注册成功
          if (regData.data?.code == 0) {
            this.regDialogShow = false;
            this.loginSuccess(regData.data.data);
          } else {
            this.reg.validMsg = { mobile: regData.data.message };
          }
        } else {
          this.reg.validMsg = { mobile: "服务端请求失败，请联系管理员" };
        }
      }
    },

    //登录
    async login() {
      //校验
      this.form.validMsg = {};
      if (!this.form.username) {
        this.form.validMsg.username = "请输入用户名";
      } else {
        let uPattern = /^[a-zA-Z0-9_-]{6,20}$/;
        if (!uPattern.test(this.form.username)) {
          this.form.validMsg.username = "用户名为6至20位数字、字母下划线组合";
        }
      }
      //密码
      if (
        !this.form.password ||
        this.form.password.length < 6 ||
        this.form.password.length > 20
      ) {
        this.form.validMsg.password = "请输入6-20位密码";
      }

      if (JSON.stringify(this.form.validMsg) == "{}") {
        //执行登录
        this.form.validMsg = {};
        let loginData = await login(this.form);
        if (loginData.status == 200) {
          //登录成功
          if (loginData.data?.code == 0) {
            this.loginSuccess(loginData.data.data);
          } else {
            this.form.validMsg = { username: loginData.data.message };
          }
        } else {
          this.form.validMsg = {
            username: "服务端请求失败，请联系管理员",
          };
        }
      }
    },

    loginSuccess(response) {
      // 缓存 token
      Cookies.set("token", response.token);
      this.getUserInfo();
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
          this.$router.push({
            path: this.$route.query.redirect || "/",
          });
        })
        .catch((e) => {
          Cookies.remove("token");
        });
    },
  },
};
</script>

<style scoped>
.login {
  width: 100%;
  height: calc(100vh);
}

.content {
  width: 100%;
  height: calc(100vh);
  background: url("../assets/images/login-back.jpg");
  background-size: 100% 100%;
}

.content_left {
  width: 60%;
  height: calc(100vh);
  float: left;
}

.content_right {
  width: 40%;
  height: 100%;
  float: left;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.content_right_login_form {
  width: 70%;
  max-width: 500px;
  height: 450px;
  background: #fff;
  margin-right: 139px;
  border-radius: 10px;
  text-align: center;
}

.content_right_login_form_title {
  margin: 37px 0 17px 0;
  font-size: 36px;
  color: #3064e4;
  font-weight: bold;
  text-align: center;
}

.content_right_login_form_input {
  width: 80%;
  height: 65px;
  font-size: 18px;
}

.content_right_login_form_buttons {
  width: 80%;
  display: block;
  margin: auto;
}

.content_right_form_msg {
  width: 80%;
  height: 18px;
  font-size: 12px;
  color: red;
  text-align: right;
  margin-left: 36px;
}

.content_right_login_form_login {
  width: 45%;
  height: 50px;
  background-color: #3662ec;
  border-color: #3662ec;
  cursor: pointer;
  border-radius: 2px;
  text-align: center;
  float: left;
  padding-top: 15px;
}

.content_right_login_form_register {
  width: 45%;
  height: 50px;
  background-color: rgb(210, 210, 210);
  border-color: rgb(210, 210, 210);
  cursor: pointer;
  border-radius: 2px;
  text-align: center;
  float: right;
  padding-top: 15px;
}

.content_right_login_form_register span {
  font-size: 19px;
  color: black;
  text-align: center;
  pointer-events: none;
}

.content_right_login_form_login span {
  font-size: 19px;
  color: white;
  text-align: center;
  pointer-events: none;
}

/**
 * 注册弹框
 */
.register_dialog {
  z-index: 99;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: calc(100vh);
}

.register_dialog_layer {
  width: 100%;
  height: calc(100vh);
  background-color: black;
  opacity: 90%;
}

.register_dialog_content {
  position: absolute;
  width: 390px;
  height: 460px;
  left: calc(50% - 195px);
  top: calc(50% - 225px);
  background: #fff;
  margin-right: 139px;
  border-radius: 10px;
}

.content_right_reg_form_input_required {
  font-size: 19px;
  color: red;
  text-align: center;
  pointer-events: none;
}

.content_right_reg_form_title {
  width: 80%;
  height: 40px;
  font-size: 20px;
  color: #3662ec;
  text-align: center;
  margin-left: 36px;
  margin-top: 25px;
}

.content_right_reg_form_input {
  width: 80%;
  height: 40px;
  font-size: 14px;
  margin-left: 40px;
}
</style>
