<template>
  <div :id="dialogId" class="user_registry_dialog">
    <form>
      <div class="content">
        <div class="header">
          <svg class="icon warn" aria-hidden="true">
            <use :xlink:href="icon"></use>
          </svg>
          <span class="msg">
          </span>
          <div style="flex:1"></div>
          <svg class="icon close" aria-hidden="true" @click="abort">
            <use xlink:href="#icon-a-ziyuan422"></use>
          </svg>
        </div>

        <div class="content_right_login_form">
          <div class="content_right_form_msg">
            {{ form.validMsg.mobile }}
          </div>
          <div class="content_right_login_form_input">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan412"></use>
            </svg>

            <input v-model="form.mobile" ref="reg_input_id" type="mobile" class="content_right_reg_form_input"
              placeholder="手机号" />
            <span class="content_right_reg_form_input_required">*</span>
          </div>
          <div class="content_right_form_msg">
            {{ form.validMsg.username }}
          </div>
          <div class="content_right_login_form_input">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan413"></use>
            </svg>

            <input v-model="form.username" class="content_right_reg_form_input" placeholder="用户名,4-20位中文、英文、数字、下划线" />
            <span class="content_right_reg_form_input_required">*</span>
          </div>
          <div class="content_right_form_msg">
            {{ form.validMsg.email }}
          </div>
          <div class="content_right_login_form_input">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-youjian-01-01"></use>
            </svg>

            <input v-model="form.email" class="content_right_reg_form_input" placeholder="邮箱地址" type="email" />
          </div>
          <div class="content_right_form_msg">
            {{ form.validMsg.password }}
          </div>
          <div class="content_right_login_form_input">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan415"></use>
            </svg>

            <input v-model="form.password" type="password" autocomplete="on" class="content_right_reg_form_input"
              placeholder="密码" />
            <span class="content_right_reg_form_input_required">*</span>
          </div>
          <div class="content_right_form_msg">
            {{ form.validMsg.password1 }}
          </div>
          <div class="content_right_login_form_input">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan414"></use>
            </svg>

            <input v-model="form.password1" type="password" autocomplete="on" class="content_right_reg_form_input"
              placeholder="确认密码" />
            <span class="content_right_reg_form_input_required">*</span>
          </div>

        </div>
        <div class="tail">
          <div class="button button-main" @click="ok">注册</div>
          <div class="button" @click="abort">取消</div>
        </div>

      </div>
    </form>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";
import { register, userinfo } from "@/lib/api/login";
import Cookies from "js-cookie";
export default {
  name: "ddei-core-dialog-userregistry",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'user_registry_dialog',
      icon: null,
      //当前编辑器
      editor: null,
      loginMessage: "",
      user: "",
      form: {
        mobile: "",
        username: "",
        email: "",
        password: "",
        password1: "",
        validMsg: {},
      },
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {



    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    if (this.editor?.tempDialogData && this.editor?.tempDialogData[this.dialogId]?.icon) {
      this.icon = this.editor?.tempDialogData[this.dialogId].icon
    }
    setTimeout(() => {
      this.$refs.reg_input_id.focus()
    }, 100);

  },
  methods: {

    ok() {
      this.registry()
    },

    abort() {
      if (this.editor?.tempDialogData[this.dialogId]?.callback?.abort) {
        this.editor.tempDialogData[this.dialogId].callback.abort();
      }
      DDeiEditorUtil.closeDialog('user_registry_dialog');
    },

    //注册并登录
    async registry() {
      //校验
      this.form.validMsg = {};
      if (!this.form.username) {
        this.form.validMsg.username = "请输入用户名";
      } else {
        let uPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_-]{4,20}$/;
        if (!uPattern.test(this.form.username)) {
          this.form.validMsg.username = "用户名为4至20位,请勿输入特殊字符";
        }
      }
      if (!this.form.mobile) {
        this.form.validMsg.mobile = "请输入手机号码";
      } else {
        let mPattern =
          /^1([3-9])\d{9}$/
        if (!mPattern.test(this.form.mobile)) {
          this.form.validMsg.mobile = "请输入正确的手机号码";
        }
      }
      if (this.form.email) {
        let ePattern =
          /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!ePattern.test(this.form.email)) {
          this.form.validMsg.email = "请输入正确的邮箱地址";
        }
      }

      if (
        !this.form.password ||
        this.form.password.length < 6 ||
        this.form.password.length > 20
      ) {
        this.form.validMsg.password = "请输入6-20位密码";
      } else if (this.form.password != this.form.password1) {
        this.form.validMsg.password1 = "前后输入的密码不一致";
      }
      if (JSON.stringify(this.form.validMsg) == "{}") {
        //执行注册并登录
        this.form.validMsg = {};
        let regData = await register(this.form);
        if (regData.status == 200) {
          //登录成功
          if (regData.data?.code == 0) {
            this.loginSuccess(regData.data.data);
          } else {
            this.form.validMsg = { username: regData.data.message };
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
      Cookies.set('token', response.token)
      Cookies.set('refreshToken', response.refreshToken)
      Cookies.set('tokenExp', response.tokenExp)
      this.getUserInfo().then(user => {
        if (user) {
          let files = this.editor.files;
          let ssLinks = user.sslinks
          //修改文件的owner状态

          files?.forEach(file => {
            if (file.extData?.owner != 1) {
              for (let i = 0; i < ssLinks?.length; i++) {
                if (ssLinks[i].file_id == file.id && ssLinks[i].owner == 1) {
                  file.extData.owner = 1
                  break;
                }
              }
            }
          });

          if (this.editor?.tempDialogData[this.dialogId]?.callback?.ok) {
            this.editor.tempDialogData[this.dialogId].callback.ok();
          }
          DDeiEditorUtil.closeDialog('user_registry_dialog');
        }
      })

    },

    /**
     * 获取登录用户信息
     */
    getUserInfo() {
      return new Promise((resolve, rejected) => {
        userinfo()
          .then((response) => {
            let userJSON = response.data.data;
            let user = JSON.stringify(userJSON, null, 4);
            Cookies.set("user", user);
            resolve(userJSON)

          })
          .catch((e) => {
            Cookies.remove("token");
            rejected()
          });
      })

    },
  }
};
</script>

<style lang="less" scoped>
/**以下为询问框的样式 */
.user_registry_dialog {
  width: 320px;
  height: 380px;
  background: #FFFFFF;
  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 12px;
  display: none;
  position: absolute;
  overflow: hidden;
  z-index: 999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .content {
    width: 320px;
    height: 380px;
    display: flex;
    flex-direction: column;
    padding: 0 24px;

    .header {
      flex: 0 0 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-family: "Microsoft YaHei";
      font-weight: 400;
      margin-top: 10px;
      color: #000000;

      >span {
        margin: 0 2px;
      }


      .close {
        font-size: 22px;
      }

      .warn {
        font-size: 20px !important;
      }
    }


    .content_right_login_form {
      height: 300px;
      background: #fff;
      border-radius: 10px;
      text-align: center;
    }

    .content_right_login_form_input {

      height: 30px;
      font-size: 18px;
      float: left;
      display: flex;
      justify-content: start;
      align-items: center;

      .icon {
        flex: 0 0 30px;
      }

      >input {
        flex: 0 0 220px;
      }

      >span {
        flex: 0 0 10px;
        color: red;
      }

    }

    .content_right_form_msg {
      width: 90%;
      height: 24px;
      font-size: 16px;
      color: red;
      text-align: right;
      margin-left: 36px;
      float: left;
      padding-right: 30px;
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


    .tail {
      flex: 0 0 65px;
      display: flex;
      align-items: center;
      text-align: center;
      justify-content: end;
    }

    .button {
      flex: 0 0 80px;
      height: 36px;
      background: #FFFFFF;
      border: 1px solid #E6E6E6;
      border-radius: 6px;
      font-size: 17px;
      font-family: "Microsoft YaHei";
      font-weight: 400;
      color: #040404;
      margin-left: 13px;
      display: flex;
      align-items: center;
      justify-content: center;

    }

    .button:hover {
      color: white;
      background: #176EFF;
      cursor: pointer;
    }

    .button-main {
      color: white;
      background: #176EFF;

    }
  }
}
</style>
