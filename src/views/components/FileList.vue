<template>
  <div class="ddei_home_fileview">
    <div class="ddei_home_fileview_files">
      <div class="ddei_home_fileview_file">
        <div class="ddei_home_fileview_file_add"
             @click="showFileDialog(null,1)">
          <span style="margin-top:-5px">+</span>
        </div>
      </div>
      <div class="ddei_home_fileview_file"
           v-for="(file) in files">
        <div class="ddei_home_fileview_file_info">
          <div class="ddei_home_fileview_file_icon">
            <img src="../../components/editor/icons/icon-basic-shape.png" />
          </div>
          <div class="ddei_home_fileview_file_name">
            {{file.name}}
          </div>
          <div class="ddei_home_fileview_file_version">
            v{{file.version}}
          </div>
          <div class="ddei_home_fileview_file_code">
            {{file.code}}
          </div>
          <div class="ddei_home_fileview_file_update">
            {{getFileLastTime(file)}}
          </div>
          <div class="ddei_home_fileview_file_desc">
            {{file.desc}}
          </div>
        </div>
        <div class="ddei_home_fileview_file_buttons">
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-file.png"
                 @click="showFileDialog(file,2)" />
          </div>
          <div class="ddei_home_fileview_file_button_split">
          </div>
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-style-line.png" />
          </div>
          <div class="ddei_home_fileview_file_button_split">
          </div>
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-copy.png"
                 @click="showDelFileDialog(file,3)" />
          </div>
          <div class="ddei_home_fileview_file_button_split">
          </div>
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-trash.png"
                 @click="showDelFileDialog(file,4)" />
          </div>
        </div>
      </div>
    </div>
    <div class="ddei_home_fileview_pages">
      <div class="empty"></div>
      <div class="up"
           @click="page.num > 1 && listFile(page.num-1)">
        <svg viewBox="64 64 896 896"
             data-icon="left"
             width="1em"
             height="1em"
             fill="currentColor"
             aria-hidden="true"
             focusable="false"
             class="">
          <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
        </svg>
      </div>
      <div :class="{'number':pInfo.type == 1,'more':pInfo.type == 2,'current':pInfo.idx == page.num}"
           v-for="pInfo in pages"
           @click="pInfo.idx != page.num && listFile(pInfo.idx)">
        {{pInfo.type == 1 ? pInfo.idx : '...'}}
      </div>
      <div class="next"
           @click="page.count > page.num && listFile(page.num+1)">
        <svg viewBox="64 64 896 896"
             data-icon="right"
             width="1em"
             height="1em"
             fill="currentColor"
             aria-hidden="true"
             focusable="false"
             class="">
          <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z"></path>
        </svg>
      </div>
      <div class="empty"></div>
    </div>
  </div>
  <div class="create_file_dialog"
       v-show="fileDialogShow">
    <div class="content">
      <div class="title">
        {{mod == 1 ? '创建' : '修改'}}文件
      </div>
      <div class="msg">
        {{cf.validMsg?.name}}
      </div>
      <input v-model="cf.name"
             id="create_file_input_id"
             type="text"
             class="content_input"
             placeholder="文件名" />
      <div class="msg">
        {{cf.validMsg?.code}}
      </div>
      <input v-model="cf.code"
             type="text"
             class="content_input"
             placeholder="编码" />
      <div class="msg">
        {{cf.validMsg?.desc}}
      </div>
      <textarea v-model="cf.desc"
                type="text"
                class="content_input"
                style="height:80px"
                placeholder="备注"></textarea>
      <div class="buttons">
        <div class="button_ok"
             style="margin-top:20px;"
             @click="submitFile()">
          <span>确定</span>
        </div>
        <div class="button_cancel"
             style="margin-top:20px;"
             @click="showFileDialog">
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>
  <div class="remove_file_dialog"
       v-show="delFileDialogShow">
    <div class="content">
      <div class="title">
        {{mod == 3?'复制':'删除'}}文件
      </div>
      <div style="margin-top:10px;padding:10px;">
        是否{{mod == 3?'复制':'删除'}}：【{{curFile?.name}}】？
      </div>
      <div class="buttons">
        <div class="button_ok"
             style="margin-top:20px;"
             @click="deleteFile()">
          <span>确定</span>
        </div>
        <div class="button_cancel"
             style="margin-top:20px;"
             @click="showDelFileDialog(null)">
          <span>取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script type="ts">
import Cookies from 'js-cookie'
import { listfile, createfile, savefilebasic, removefile, copyfile } from "@/lib/api/file";
import ICONS from '../../components/editor/js/icon';

export default {
  name: 'DDei-Home-Filelist',
  props: {

  },
  data () {
    return {
      fileDialogShow: false,
      delFileDialogShow: false,
      icons: ICONS,
      cf: {},
      files: [

      ],
      queryText: "",
      page: { size: 11, num: 1, total: 0 }
    }
  },
  created () { },
  mounted () {
    this.listFile();
  },
  methods: {

    async deleteFile () {
      if (this.curFile) {
        let fileData = null;
        if (this.mod == 3) {
          fileData = await copyfile({ id: this.curFile.id })
        } else {
          fileData = await removefile({ id: this.curFile.id })
        }

        if (fileData.status == 200) {
          //获取成功

          if (fileData.data?.code == 0) {
            this.listFile(this.page.num);
            this.delFileDialogShow = false;
          }
        }

      }
    },

    /**
    * 删除文件
    */
    showDelFileDialog (file, mod) {
      this.mod = mod
      this.delFileDialogShow = !this.delFileDialogShow;
      this.curFile = file;
    },

    /**
     * 计算分页信息
     */
    calPages () {
      let pageCount = parseInt(this.page.total / this.page.size) + (this.page.total % this.page.size == 0 ? 0 : 1)

      let pages = [];
      //计算开始页码和结束页码
      if (pageCount <= 7) {
        for (let i = 1; i <= pageCount; i++) {
          pages.push({ type: 1, idx: i })
        }
      } else {
        let left = this.page.num - 1;

        let basesize = 4;
        let appendRight = 0
        if (left > basesize) {
          pages.push({ type: 1, idx: 1 })
          pages.push({ type: 2 })
          for (let i = this.page.num - basesize + 2; i <= this.page.num - 1; i++) {
            pages.push({ type: 1, idx: i })
          }
        } else {
          for (let i = 1; i <= this.page.num - 1; i++) {
            pages.push({ type: 1, idx: i })
          }
          appendRight = basesize - left
        }
        for (let i = this.page.num; i <= this.page.num + appendRight; i++) {
          pages.push({ type: 1, idx: i })
        }
        let right = pageCount - this.page.num + appendRight
        if (right > basesize) {
          for (let i = this.page.num + appendRight + 1; i <= pageCount - 2; i++) {
            pages.push({ type: 1, idx: i })
          }
          pages.push({ type: 2 })
          pages.push({ type: 1, idx: pageCount })
        } else {
          for (let i = this.page.num + appendRight + 1; i <= pageCount; i++) {
            pages.push({ type: 1, idx: i })
          }
        }


      }
      this.page.count = pageCount
      this.pages = pages;
    },

    /**
     * 加载文件
     */
    async listFile (pageNumber) {
      if (pageNumber) {
        this.page.num = pageNumber;
      } else if (pageNumber > this.page.count) {
        this.page.num = this.page.count
      } else if (pageNumber < 1) {
        this.page.num = 1
      }
      let curFolder = this.$parent.$refs["dirTree"]?.getCurrentFolder()
      let fid = curFolder?.id ? curFolder.id : "0"
      let fileData = await listfile({ folder_id: fid, pageSize: this.page.size, pageNum: this.page.num, text: this.queryText })
      const listData = fileData.data.data.data
      this.files = listData
      this.page.total = fileData.data.data.count
      //计算分页和页码信息
      this.calPages();
    },

    /**
     * 创建/更新文件
     */
    async submitFile () {
      //校验
      this.cf.validMsg = {};
      if (!this.cf.name) {
        this.cf.validMsg.name = "请输入文件名";
      } else {
        let uPattern = /^[\u4e00-\u9fa5a-zA-Z0-9_-]{1,15}$/;
        if (!uPattern.test(this.cf.name)) {
          this.cf.validMsg.name = "文件名为1至15位中文、字母、数字下划线组合";
        }
      }
      if (this.cf.code) {
        let uPattern = /^[a-zA-Z0-9_.-]{0,20}$/;
        if (!uPattern.test(this.cf.code)) {
          this.cf.validMsg.code = "编码为0至20位字母、数字、_.组合";
        }
      }
      if (this.cf.desc && this.cf.desc.length > 50) {
        this.cf.validMsg.desc = "描述请稍微简短一点";
      }
      if (JSON.stringify(this.cf.validMsg) == "{}") {
        let fileData = null;
        if (this.mod == 1) {
          fileData = await createfile(this.cf)
        } else if (this.mod == 2) {
          fileData = await savefilebasic(this.cf)
        }
        if (fileData.status == 200) {
          //获取成功
          if (fileData.data?.code == 0) {
            //刷新列表
            this.listFile(this.page.num)
            this.fileDialogShow = false;
          }
        }

      }
    },

    /**
    * 弹出新文件的弹出框
    */
    showFileDialog (file, mod) {
      this.fileDialogShow = !this.fileDialogShow;
      if (mod == 1) {
        this.mod = mod
        this.cf.name = "";
      } else if (mod == 2) {
        this.mod = mod
        this.cf.name = file.name;
        this.cf.code = file.code;
        this.cf.desc = file.desc;
        this.cf.id = file.id
      }
      this.curFile = file;
      let curFolder = this.$parent.$refs["dirTree"]?.getCurrentFolder()
      let fid = curFolder?.id ? curFolder.id : "0"
      this.cf.folder_id = fid
      this.cf.validMsg = {};
      if (this.fileDialogShow) {
        setTimeout(() => {
          document.getElementById("create_file_input_id").focus();
        }, 20);
      }
    },
    /**
     * 获取文件最后更新时间
     */
    getFileLastTime (file) {
      if (file?.last_update_time) {
        let date = file.last_update_time;

        if (date && date.length > 10 && date.indexOf("-") != -1) {
          let d = date.substring(date.indexOf("-") + 1, date.indexOf("T"))
          if (date.indexOf("T") != -1 && date.indexOf(":", date.indexOf(":") + 1) != -1) {
            d += " " + date.substring(date.indexOf("T") + 1, date.indexOf(":", date.indexOf(":") + 1))
          }
          return d
        }
      }
      return "";
    },


  }
}
</script>

<style lang='less' scoped>
.ddei_home_fileview {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ddei_home_fileview_files {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 200px 200px 200px;
  padding: 0px 20px;
  gap: 10px;
}
.ddei_home_fileview_file {
  width: 280px;
  height: 180px;
  background-color: #212121;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 15px;
}

.ddei_home_fileview_file_info {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 30px 30px 30px 30px;
  gap: 2px;
}

.ddei_home_fileview_file_add {
  flex: 1;
  color: #3662ec;
  border: 1px dashed #3662ec;
  border-radius: 6px;
  font-size: 60px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_home_fileview_file_add:hover {
  cursor: pointer;
  filter: brightness(120%);
  border: 2px dashed #3662ec;
}

.ddei_home_fileview_file_name {
  grid-column: 2/6;
  padding-top: 4px;
  color: white;
}

.ddei_home_fileview_file_code {
  color: #d55e43;
  font-size: 12px;
  grid-column: 2/5;
}

.ddei_home_fileview_file_update {
  color: #898989;
  font-size: 12px;
  grid-column: 5/7;
  text-align: right;
}

.ddei_home_fileview_file_version {
  color: orange;
  text-align: right;
  padding-top: 4px;
}

.ddei_home_fileview_file_desc {
  grid-column: 1/7;
  grid-row: 3/5;
  font-size: 12px;
  color: grey;
  overflow: hidden;
  background: #2c2c2c;
  border-radius: 5px;
  padding: 2px;
}

.ddei_home_fileview_file_icon img {
  width: 36px;
  height: 36px;
  margin-top: 10px;
}

.ddei_home_fileview_file_buttons {
  flex: 0 0 40px;
  padding-top: 5px;
  display: flex;
}
.ddei_home_fileview_file_button_split {
  flex: 0 0 1px;
  height: 22px;
  background-color: #5c5c5c;
}
.ddei_home_fileview_file_button {
  flex: 1;
  margin-top: 2px;
  text-align: center;
}

.ddei_home_fileview_file_button img {
  width: 16px;
  height: 16px;
}

.ddei_home_fileview_file_button img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_home_fileview_pages {
  flex: 0 0 50px;
  display: flex;
  .current {
    cursor: default !important;
    color: #1890ff !important;
  }
  > div {
    height: 32px;
    flex: 0 0 32px;
    border: none;
    background: #212121;
    color: #fff;
    text-align: center;
    &:hover {
      cursor: pointer;
      color: #1890ff;
    }
  }
  .empty {
    height: 32px;
    flex: 1 !important;
    background: none !important;
  }
  .number {
    margin-right: 10px;
    padding-top: 4px;
  }
  .more {
    margin-right: 10px;
    &:hover {
      cursor: default !important;
      color: white !important;
    }
  }
  .up {
    margin-right: 10px;
    padding-top: 6px !important;
  }
  .next {
    padding-top: 6px !important;
  }
}

/* .创建文件弹框 */
.create_file_dialog {
  z-index: 99;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: calc(100vh);
  .content {
    position: absolute;
    width: 300px;
    height: 340px;
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

/* .删除文件弹框 */
.remove_file_dialog {
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