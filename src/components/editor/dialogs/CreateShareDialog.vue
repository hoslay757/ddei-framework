<template>
  <div :id="dialogId" class="create_share_dialog">
    <div class="content">
      <div class="header">
        <svg class="icon warn" aria-hidden="true">
          <use xlink:href="#icon-a-ziyuan378"></use>
        </svg>
        <span>分享链接</span>
        <div style="flex:1"></div>
        <svg class="icon close" aria-hidden="true" @click="abort">
          <use xlink:href="#icon-a-ziyuan422"></use>
        </svg>
      </div>
      <div v-show="!linkData" class="fields">
        <div class="row">
          <div class="title">提取码：</div>
          <div class="field" v-for="data in ds1" @click="selectShareCode(data.value)">
            <input type="radio" :value="data.value" v-model="shareCode" name="ddei-share-code" autocomplete="off" />
            {{ data.text }}
          </div>
        </div>
        <div class="row">
          <div class="title">有效期：</div>
          <div class="field" v-for="data in ds2" @click="selectShareEnd(data.value)">
            <input type="radio" :value="data.value" v-model="shareDate" name="ddei-share-date" autocomplete="off" />
            {{ data.text }}
          </div>
        </div>
        <div class="row">
          <div class="title">权限：</div>
          <div class="field" @click="checkOrUnCheckView">
            <input type="checkbox" v-model="canView">查看
          </div>
          <div class="field" @click="checkOrUnCheckColl">
            <input type="checkbox" v-model="canColl">收藏
          </div>
          <div class="field" @click="checkOrUnCheckEdit">
            <input type="checkbox" v-model="canEdit">编辑
          </div>
        </div>
      </div>
      <div v-show="linkData" class="fields fields-large">
        <div class="row row-large">
          <div class="link-input">
            <input :value="linkData?.url" readonly="true">
            <svg class="icon" aria-hidden="true" @click="copy(linkData?.url)">
              <use xlink:href="#icon-a-ziyuan490"></use>
            </svg>
          </div>
        </div>
        <div class="row row-large">
          <div class="link-end">
            <!-- <span style="color:green">2024-01-01 过期</span> -->
            <span style="color:red">已过期</span>
          </div>
          <div class="link-code-title">提取码：</div>
          <div class="link-code">
            <input :value="linkData?.pwd" readonly="true">
            <svg class="icon" aria-hidden="true" @click="copy(linkData?.pwd)">
              <use xlink:href="#icon-a-ziyuan490"></use>
            </svg>
          </div>
        </div>
      </div>
      <div v-show="!linkData" class="tail">
        <div class="button button-main" @click="generateLink">确定</div>
        <div class="button" @click="abort">取消</div>
      </div>

      <div v-show="linkData" class="tail">
        <div class="button button-main" @click="copyLink">复制链接</div>
        <div class="button " @click="abort">关闭</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEditorUtil from "../js/util/editor-util.ts";
import { login, userinfo } from "@/lib/api/login";
import Cookies from "js-cookie";
export default {
  name: "DDei-Editor-Create-Share-Dialog",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'create_share_dialog',
      //当前编辑器
      editor: null,
      ds1: [
        { value: 1, text: '需要' },
        { value: 0, text: '不需要' }
      ],
      ds2: [
        { value: 1, text: '三天' },
        { value: 2, text: '一周' },
        { value: 3, text: '一月' },
        { value: 99, text: '永久' },
      ],
      canView: true,//查看权限
      canColl: false,//收藏权限
      canEdit: false,//编辑权限
      shareDate: 1,//分享日期
      shareCode: 1,//提取码
      linkData: null//生成后的短链接
    };
  },
  computed: {},
  components: {},
  watch: {},
  created() { },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
  },
  methods: {

    checkOrUnCheckView() {
      this.canView = !this.canView
    },
    checkOrUnCheckColl() {
      this.canColl = !this.canColl
    },
    checkOrUnCheckEdit() {
      this.canEdit = !this.canEdit
    },
    selectShareCode(code) {
      this.shareCode = code
    },

    selectShareEnd(code) {
      this.shareDate = code
    },
    /**
     * 生成链接
     */
    generateLink() {
      this.linkData = {
        url: "https://www.ddei.top/ss/4Bp2B1233",
        pwd: "1234"
      }
    },

    /**
     * 复制链接
     */
    async copyLink() {
      if (this.linkData) {
        let copyText = this.linkData.url + "\r\n" + "提取码:" + this.linkData.pwd
        await navigator.clipboard.writeText(copyText);
      }
    },

    async copy(value) {
      if (value) {
        await navigator.clipboard.writeText(value);
      }
    },
    abort() {
      DDeiEditorUtil.closeDialog('create_share_dialog');
    },
  }
};
</script>

<style lang="less" scoped>
/**以下为询问框的样式 */
.create_share_dialog {
  width: 420px;
  height: 260px;
  color: black;
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
    width: 420px;
    height: 260px;
    display: flex;
    flex-direction: column;
    padding: 0 24px;

    .header {
      flex: 0 0 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
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
        font-size: 24px !important;
      }


    }

    .fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 10px;
      text-align: center;

      .row {
        flex: 0 0 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        padding-right: 10px;

        .title {
          flex: 0 0 100px;
          height: 30px;

          text-align: right;
        }

        .field {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
        }
      }

      .row-large {
        flex: 0 0 70px;
        padding-right: 0px;
      }





      .link-input {
        flex: 1 1 100%;
        border: 1px solid #dedede;
        border-radius: 4px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-left: 10px;

        >input {
          flex: 1 1 100%;
          outline: none;
          background: none;
          border: none;
          font-size: 20px;
        }

        .icon {
          flex: 0 0 40px;
          cursor: pointer;
        }
      }

      .link-code-title {
        flex: 0 0 100px;
        height: 30px;
        padding-left: 10px;
        text-align: left;
      }

      .link-end {
        flex: 0 0 150px;
        padding-left: 10px;
        text-align: left;
        font-size: 16px;
      }

      .link-code {
        flex: 0 0 120px;
        border: 1px solid #dedede;
        border-radius: 4px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;

        >input {
          flex: 0 0 80px;
          outline: none;
          background: none;
          border: none;
          width: 80px;
          font-size: 20px;
        }

        .icon {
          flex: 0 0 40px;
          cursor: pointer;
        }
      }
    }

    .fields-large {
      margin-top: 10px;
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
