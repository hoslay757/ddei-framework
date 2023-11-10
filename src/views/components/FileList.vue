<template>
  <div class="ddei_home_fileview">
    <div class="ddei_home_fileview_files">
      <div class="ddei_home_fileview_file">
        <div class="ddei_home_fileview_file_add">
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
            <img src="../../components/editor/icons/icon-copy.png" />
          </div>
          <div class="ddei_home_fileview_file_button_split">
          </div>
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-style-line.png" />
          </div>
          <div class="ddei_home_fileview_file_button_split">
          </div>
          <div class="ddei_home_fileview_file_button">
            <img src="../../components/editor/icons/icon-trash.png" />
          </div>
        </div>
      </div>
    </div>
    <div class="ddei_home_fileview_pages">
      <div class="ddei_home_fileview_pages_empty"></div>
      <div class="ddei_home_fileview_pages_up">
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
      <div class="ddei_home_fileview_pages_number">
        1
      </div>
      <div class="ddei_home_fileview_pages_number current">
        2
      </div>
      <div class="ddei_home_fileview_pages_number">
        3
      </div>
      <div class="ddei_home_fileview_pages_more">
        ...
      </div>
      <div class="ddei_home_fileview_pages_number">
        10
      </div>
      <div class="ddei_home_fileview_pages_number">
        11
      </div>
      <div class="ddei_home_fileview_pages_next">
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
      <div class="ddei_home_fileview_pages_empty"></div>
    </div>
  </div>
</template>

<script >
import Cookies from 'js-cookie'
export default {
  name: 'DDei-Home-Filelist',
  props: {

  },
  data () {
    return {
      files: [
        { name: "文件1", version: "1.0", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件2", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件3", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件4", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件5", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件6", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件7", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件8", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件9", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件10", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
        { name: "文件11", version: "1.2", desc: "这是一个文件的备注", code: "ddei.code.basic.shape", lastUpdateTime: new Date().getTime() },
      ]
    }
  },
  created () { },
  mounted () {

  },
  methods: {
    /**
     * 获取文件最后更新时间
     */
    getFileLastTime (file) {
      if (file?.lastUpdateTime) {
        let date = new Date(file?.lastUpdateTime);
        if (date) {
          return this.formatDate(date, "MM-dd hh:mm");
        }
      }
      return "";
    },

    formatDate (date, fmt) {
      let o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds() //秒 
      };
      if (/(y+)/.test(fmt)) { //根据y的长度来截取年
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
      return fmt;
    }
  }
}
</script>

<style scoped>
.ddei_home_fileview {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ddei_home_fileview_files {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
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
  cursor: pointer;
  color: #3662ec;
  border: 1px dashed #3662ec;
  border-radius: 6px;
  font-size: 60px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_home_fileview_file_name {
  grid-column: 2/6;
  padding-top: 4px;
  color: white;
}

.ddei_home_fileview_file_code {
  color: #d55e43;
  font-size: 12px;
  padding-top: 5px;
  grid-column: 2/5;
}

.ddei_home_fileview_file_update {
  color: #898989;
  font-size: 12px;
  grid-column: 5/7;
  padding-top: 5px;
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
}

.ddei_home_fileview_pages .current {
  cursor: default !important;
  color: #1890ff !important;
}

.ddei_home_fileview_pages div {
  height: 32px;
  flex: 0 0 32px;
  border: none;
  background: #212121;
  color: #fff;
  text-align: center;
}

.ddei_home_fileview_pages div:hover {
  cursor: pointer;
  color: #1890ff;
}

.ddei_home_fileview_pages_empty {
  height: 32px;
  flex: 1 !important;
  background: none !important;
}

.ddei_home_fileview_pages_number {
  margin-right: 10px;
  padding-top: 4px;
}

.ddei_home_fileview_pages_more {
  margin-right: 10px;
}

.ddei_home_fileview_pages_more:hover {
  cursor: default !important;
  color: white !important;
}

.ddei_home_fileview_pages_up {
  margin-right: 10px;
  padding-top: 6px !important;
}

.ddei_home_fileview_pages_next {
  padding-top: 6px !important;
}
</style>