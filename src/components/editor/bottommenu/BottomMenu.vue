<template>
  <div id="ddei_editor_bottommenu" class="ddei_editor_bottommenu">
    <div class="ddei_editor_bottommenu_preview">
      <div>
        <img width="25px" height="25px" src="../icons/icon-view.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_pagepreview">
      <div>
        <span>
          页-1
        </span>
        <img width="8px" height="8px" src="../icons/toolbox-expanded.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_addpage">
      <div>
        <img src="../icons/icon-add.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_pages">
      <div class="ddei_editor_bottommenu_page">
        页-1
      </div>
      <div class="ddei_editor_bottommenu_page_selected">
        页-2
      </div>
      <div class="ddei_editor_bottommenu_page">
        页-3
      </div>
      <div class="ddei_editor_bottommenu_page">
        页-4
      </div>
    </div>
    <div class="ddei_editor_bottommenu_shapecount">
      <div>
        形状数:32
      </div>
    </div>
    <div class="ddei_editor_bottommenu_layers">
      <div>
        <img src="../icons/icon-layers.png" />
      </div>
    </div>
    <div class="ddei_editor_bottommenu_other">
      <div class="ddei_editor_bottommenu_other_play">
        <div>
          <img src="../icons/icon-play.png" />
        </div>
      </div>
      <div class="ddei_editor_bottommenu_other_changesize">
        <div class="ddei_editor_bottommenu_other_changesize_combox">
          <span>
            100%
          </span>
          <img style="width:8px;height:8px;margin-top:9px;" width="8px" height="8px"
            src="../icons/toolbox-expanded.png" />
        </div>
        <div>
          <img src="../icons/icon-reduce.png" />
        </div>
        <input type="range" min="0" max="400" value="100" />
        <div>
          <img src="../icons/icon-add.png" />
        </div>
        <div>
          <img src="../icons/icon-screen-full.png" />
        </div>
        <div>
          <img src="../icons/icon-screen-width.png" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "DDei-Editor-BottomMenu",
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
.ddei_editor_bottommenu {
  background: rgb(225, 225, 225);
  display: flex;
  color: black;
}


.ddei_editor_bottommenu_preview {
  flex: 0 0 40px;
  height: 35px;
  padding-top: 5px;
}



.ddei_editor_bottommenu_preview div {
  height: 24px;
  margin-left: 15px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235)
}

.ddei_editor_bottommenu_preview img:hover {
  background-color: rgb(235, 235, 235);
  cursor: pointer;
}

.ddei_editor_bottommenu_preview img {
  width: 24px;
  height: 24px;
}


.ddei_editor_bottommenu_pagepreview {
  flex: 0 0 120px;
  height: 35px;
  padding-top: 5px;

}

.ddei_editor_bottommenu_pagepreview div {
  height: 24px;
  width: 100%;
  margin-left: 5px;
  padding-right: 5px;
  color: black;
  float: left;
  border-right: 1px solid rgb(235, 235, 235)
}


.ddei_editor_bottommenu_pagepreview span {

  padding-right: 5px;
  color: black;
  float: left;
}

.ddei_editor_bottommenu_pagepreview div:hover {
  background-color: rgb(235, 235, 235);
  cursor: pointer;
}

.ddei_editor_bottommenu_pagepreview img {
  float: right;
  width: 24px;
  height: 24px;
  width: 6px;
  height: 6px;
  margin-top: 9px;
}




.ddei_editor_bottommenu_addpage {
  flex: 0 0 40px;
  height: 35px;
  padding-top: 5px;
}



.ddei_editor_bottommenu_addpage div {
  height: 24px;
  margin-left: 12px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235)
}

.ddei_editor_bottommenu_addpage img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_editor_bottommenu_addpage img {
  filter: brightness(60%);
  margin-top: 3px;
  width: 18px;
  height: 18px;
}

.ddei_editor_bottommenu_pages {
  flex: 1;
  height: 35px;
  padding-top: 5px;
  display: block;
  font-size: 13px;
  text-align: center;
}


.ddei_editor_bottommenu_page {
  float: left;
  height: 24px;
  margin-left: 5px;
  padding-right: 10px;
  padding-left: 10px;
  border-right: 1px solid rgb(235, 235, 235);
  padding-top: 2px;
}

.ddei_editor_bottommenu_page:hover {
  color: #017fff;
  cursor: pointer;
}

.ddei_editor_bottommenu_page_selected {
  float: left;
  height: 24px;
  margin-left: 5px;
  padding-right: 5px;
  padding-left: 5px;
  color: #017fff;
  font-weight: bold;
  border-right: 1px solid rgb(235, 235, 235);
  padding-top: 2px;
}

.ddei_editor_bottommenu_shapecount {
  flex: 0 0 100px;
  height: 35px;
  padding-top: 5px;
  display: block;
  font-size: 14px;
  text-align: center;
}

.ddei_editor_bottommenu_shapecount div {
  height: 24px;
  padding-top: 1px;
  border-right: 1px solid rgb(235, 235, 235);
  border-left: 1px solid rgb(235, 235, 235);
}


.ddei_editor_bottommenu_layers {
  flex: 0 0 35px;
  height: 35px;
  padding-top: 5px;
}



.ddei_editor_bottommenu_layers div {
  height: 24px;
  margin-left: 5px;
  padding-right: 5px;
  border-right: 1px solid rgb(235, 235, 235)
}

.ddei_editor_bottommenu_layers img:hover {
  filter: brightness(40%);
  cursor: pointer;
}

.ddei_editor_bottommenu_layers img {
  margin-top: 2px;
  width: 22px;
  height: 22px;
}


.ddei_editor_bottommenu_other {
  flex: 0 0 330px;
  height: 35px;
  padding-top: 5px;
}

.ddei_editor_bottommenu_other_play {
  float: left;
}

.ddei_editor_bottommenu_other_play div {
  float: left;
  height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 2px;
  border-right: 1px solid rgb(235, 235, 235);
}

.ddei_editor_bottommenu_other_play img:hover {
  filter: brightness(20%);
  cursor: pointer;
}



.ddei_editor_bottommenu_other_play img {
  filter: brightness(40%);
  width: 20px;
  height: 20px;
}



.ddei_editor_bottommenu_other_changesize {
  float: left;
}

.ddei_editor_bottommenu_other_changesize span {
  float: left;
}

.ddei_editor_bottommenu_other_changesize div {
  float: left;
  padding-left: 5px;
  padding-right: 5px;
}

.ddei_editor_bottommenu_other_changesize_combox:hover {
  background-color: rgb(235, 235, 235);
  float: left;
  padding-left: 5px;
  padding-right: 5px;
  cursor: pointer;
}

.ddei_editor_bottommenu_other_changesize input {
  float: left;
  width: 100px;
  margin-top: 4px;
  border-radius: 4px;
}

.ddei_editor_bottommenu_other_changesize img {
  filter: brightness(40%);
  width: 20px;
  height: 20px;
  float: left;
  margin-top: 2px;
}

.ddei_editor_bottommenu_other_changesize img:hover {
  filter: brightness(20%);
  cursor: pointer;
}
</style>
