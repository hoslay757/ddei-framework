<template>
  <div class="ddei_editor_sdp">
    <div class="ddei_editor_sdp_item" style="grid-row:1/3">
      <div class="ddei_editor_sdp_item_box">
          <img width="16px" height="16px" src="../../icons/icon-save.png" />
          <div>保存</div>
        </div>
        <div class="ddei_editor_sdp_item_box">
          <img width="16px" height="16px" src="../../icons/icon-download.png" />
          <div>下载</div>
        </div>
        <div class="ddei_editor_sdp_item_box">
          <img width="16px" height="16px" src="../../icons/icon-publish.png" />
          <div>发布</div>
        </div>
    </div>
    <div class="ddei_editor_sdp_item">
      <div class="ddei_editor_sdp_item_text">
        保存
      </div>
    </div>
  </div>
</template>
<script lang="ts">


export default {
  name: "DDei-Editor-Quick-SDP",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {

  },
};
</script>

<style scoped>
.ddei_editor_sdp {
  width: 120px;
  height: 90px;
  border-right: 1px solid rgb(224, 224, 224);
  grid-template-rows: 30px 30px 20px;
  grid-template-columns: 1fr;
  display: grid;
  gap: 4px;
  padding-right: 4px;
}

.ddei_editor_sdp_item {
  margin: auto;
  display:grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;

}

.ddei_editor_sdp_item_text {
  text-align: center;
  font-family: "Microsoft YaHei";
  font-size: 12px;
  grid-column: 1/4;
  color: rgb(120, 120, 120)
}



.ddei_editor_sdp_item_box {
  width: 30px;
  height: 60px;
  color: black;
  border-radius: 4px;
  font-size: 12px;
  display: grid;
  grid-template-rows: 25px 25px 10px;
  grid-template-columns: 1fr;
}

.ddei_editor_sdp_item_box div {
  margin: auto;

}

.ddei_editor_sdp_item_box img {
  filter: brightness(45%) drop-shadow(0.2px 0px 0.2px #000);
  margin: auto;
}


.ddei_editor_sdp_item_box:hover {
  background-color: rgb(233, 233, 238);
  border-radius: 4px;
}
</style>
