<template>
  <div id="rotate_dialog" class="rotate_dialog">
    <div class="content">
      <div class="title">翻转</div>
      <div class="group">
        <div class="title">镜像:</div>
        <div class="group_content">
          <div :class="{ 'item': canMirror(), 'item_disabled': !canMirror() }" @click="canMirror() && doMirror()">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan441"></use>
            </svg>
          </div>
          <div :class="{ 'item': canMirror(), 'item_disabled': !canMirror() }" @click="canMirror() && doMirror()">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan442"></use>
            </svg>
          </div>
        </div>
      </div>
      <div class="group">
        <div class="title">旋转:</div>
        <div class="group_content">
          <div class="item" @click="doRotate(90)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan377"></use>
            </svg>
          </div>
          <div class="item" @click="doRotate(-90)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan382"></use>
            </svg>
          </div>
          <div class="item" @click="doRotate(-1)">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-a-ziyuan373"></use>
            </svg>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import DDeiEditor from "../js/editor.ts";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiUtil from "@/components/framework/js/util";
import DDeiConfig from "@/components/framework/js/config";
import { Matrix3 } from 'three';

export default {
  name: "DDei-Editor-Dialog-ChangeRotate",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      dialogId: 'rotate_dialog',
      //当前编辑器
      editor: null,
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

    //是否可以镜像
    canMirror() {
      return false;
    },






    doRotate(rotate) {
      let file = this.editor.files[this.editor.currentFileIndex];
      let sheet = file?.sheets[file?.currentSheetIndex];
      let stage = sheet?.stage;
      if (stage?.selectedModels?.size > 0) {
        stage.selectedModels.forEach((model) => {
          let oldRotate = model.rotate ? model.rotate : 0;
          let newRotate = (oldRotate ? oldRotate : 0) + rotate;
          if (rotate == -1) {
            newRotate = 0;
          }
          if (oldRotate != newRotate) {
            let m1 = new Matrix3()
            let move1Matrix = new Matrix3(
              1, 0, -model.cpv.x,
              0, 1, -model.cpv.y,
              0, 0, 1);
            m1.premultiply(move1Matrix)
            if (oldRotate) {
              let angle = (oldRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
              let rotateMatrix = new Matrix3(
                Math.cos(angle), Math.sin(angle), 0,
                -Math.sin(angle), Math.cos(angle), 0,
                0, 0, 1);
              m1.premultiply(rotateMatrix)
            }

            if (newRotate != 0) {
              let angle1 = (-newRotate * DDeiConfig.ROTATE_UNIT).toFixed(4);
              let rotate1Matrix = new Matrix3(
                Math.cos(angle1), Math.sin(angle1), 0,
                -Math.sin(angle1), Math.cos(angle1), 0,
                0, 0, 1);
              m1.premultiply(rotate1Matrix)
            }
            let move2Matrix = new Matrix3(
              1, 0, model.cpv.x,
              0, 1, model.cpv.y,
              0, 0, 1);
            m1.premultiply(move2Matrix)
            model.transVectors(m1)
          }
        });
        this.editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
        this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
        this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
        this.editor.bus.executeAll();
      }
    },
  }
};
</script>

<style lang="less" scoped>
.rotate_dialog {

  border: 1px solid #E6E6E6;
  box-shadow: 0px 2px 24px 0px #DBDBDB;
  border-radius: 6px;
  display: none;
  overflow: hidden;
  width: 180px;
  position: absolute;
  background-color: white;
  height: 150px;
  z-index: 999;

  .content {
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
    user-select: none;

    .title {
      color: black;
      font-weight: bold;
      flex: 0 0 30px;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 17px;

    }

    .group {
      color: black;
      flex: 1 1 40px;
      width: 100%;
      border-top: 1px solid rgb(240, 240, 240);

      .title {
        color: black;
        flex: 0 0 30px;
        width: 100%;
        display: flex;
        justify-content: start;
        align-items: center;
        padding-left: 10px;
        font-size: 15px;
        border: none;
      }

      .group_content {
        width: 100%;
        display: grid;
        gap: 10px;
        grid-template-columns: 1fr 1fr 1fr;
        padding: 3px 0px;

        .item {
          outline: none;
          width: 30px;
          height: 25px;
          margin: auto;
          background: transparent;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;


        }

        .item_disabled {
          color: rgb(210, 210, 210);
          outline: none;
          width: 30px;
          height: 25px;
          margin: auto;
          background: transparent;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          text-decoration: line-through;

          .icon {
            color: none;
          }
        }

        .item_disabled:hover {
          cursor: not-allowed !important;
        }

        .item:hover {
          background-color: rgb(233, 233, 238);
        }

        .text {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          width: 100%;
        }

        .icon {
          font-size: 28px;
        }

      }
    }
  }
}
</style>
