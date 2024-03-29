<template>
  <div id="ddei_editor_qcview" class="ddei_editor_qcview" v-show="show">
    <div class="ddei_editor_qcview_type" v-for="item in dataSource" v-show="item.value == mode"
      @click="showDialog($event)" :title="item.text">
      <svg class="icon" aria-hidden="true">
        <use :xlink:href="item.img"></use>
      </svg>
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-a-ziyuan466"></use>
      </svg>
    </div>
    <div :class="{ 'ddei_editor_qcview_color': true }" v-for="color in  colors "
      :style="{ 'background-color': '' + color }"
      @click="editor?.ddInstance?.stage?.selectedModels?.size > 0 && changeModelColor(color, $event)">
    </div>
  </div>
</template>

<script lang="ts">
import DDeiEnumBusCommandType from "@ddei-core/framework/js/enums/bus-command-type";
import DDeiEditor from "@ddei-core/editor/js/editor";
import DDeiEditorUtil from "@ddei-core/editor/js/util/editor-util";
export default {
  name: "panel-quickcolorview",
  extends: null,
  mixins: [],
  props: {},
  data() {
    return {
      colors: [],
      editor: null,
      //当前编辑的模式，1填充，2边框，3字体
      mode: 1,
      dataSource: [
        { value: 1, text: "填充", img: "#icon-a-ziyuan453" },
        { value: 2, text: "边框", img: "#icon-border-pencil" },
        { value: 3, text: "字体", img: "#icon-a-ziyuan463" },
      ],
      show: true,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.files.length", function (newVal, oldVal) {
      if (newVal == 0) {
        this.show = false;
      } else {
        this.show = true;
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;

    this.colors = [
      "#FFB6C1",
      "#FFC0CB",
      "#DC143C",
      "#FF0F55",
      "#DB7093",
      "#FF69B4",
      "#FF1493",
      "#C71585",
      "#DA70D6",
      "#D8BFD8",
      "#DDA0DD",
      "#EE82EE",
      "#FF00FF",
      "#FF00FF",
      "#8B008B",
      "#800080",
      "#BA55D3",
      "#9400D3",
      "#9932CC",
      "#4B0082",
      "#8A2BE2",
      "#9370DB",
      "#7B68EE",
      "#6A5ACD",
      "#483D8B",
      "#E6E6FA",
      "#F8F8FF",
      "#0000FF",
      "#0000FF",
      "#0000CD",
      "#191970",
      "#00008B",
      "#000080",
      "#4169E1",
      "#6495ED",
      "#B0C4DE",
      "#778899",
      "#708090",
      "#1E90FF",
      "#F0F8FF",
      "#4682B4",
      "#87CEFA",
      "#87CEEB",
      "#00BFFF",
      "#ADD8E6",
      "#B0E0E6",
      "#5F9EA0",
      "#F0FFFF",
      "#E1FFFF",
      "#AFEEEE",
      "#00FFFF",
      "#00FFFF",
      "#00CED1",
      "#2F4F4F",
      "#008B8B",
      "#008080",
      "#48D1CC",
      "#20B2AA",
      "#40E0D0",
      "#7FFFAA",
      "#00FA9A",
      "#00FF7F",
      "#F5FFFA",
      "#3CB371",
      "#2E8B57",
      "#F0FFF0",
      "#90EE90",
      "#98FB98",
      "#8FBC8F",
      "#32CD32",
      "#00FF00",
      "#228B22",
      "#008000",
      "#006400",
      "#7FFF00",
      "#7CFC00",
      "#ADFF2F",
      "#556B2F",
      "#F5F5DC",
      "#FAFAD2",
      "#FFFFF0",
      "#FFFFE0",
      "#FFFF00",
      "#808000",
      "#BDB76B",
      "#FFFACD",
      "#EEE8AA",
      "#F0E68C",
      "#FFD700",
      "#FFF8DC",
    ];
  },
  methods: {
    changeMode(m) {
      this.mode = m.value;
    },


    //打开弹出框
    showDialog(evt: Event) {
      let dataSource = []
      this.dataSource.forEach(ds => {
        if (ds.value != this.mode) {
          dataSource.push(ds)
        }
      });
      let el = evt.currentTarget;
      DDeiEditorUtil.showOrCloseDialog("qcview_dialog", {
        dataSource: dataSource,
        callback: {
          ok: this.changeMode,
        }
      },
        { type: 2, dy: -el.clientHeight }, el)
    },
    /**
     * 改变模型颜色
     */
    changeModelColor(color, evt) {
      let stage = this.editor.ddInstance.stage;
      if (stage && color) {
        let selectedModels = stage.selectedModels;
        if (selectedModels?.size > 0) {
          switch (this.mode) {
            case 1:
              selectedModels.forEach((element) => {
                //推送信息进入总线
                this.editor.bus.push(
                  DDeiEnumBusCommandType.ModelChangeValue,
                  { mids: [element.id], paths: ["fill.color"], value: color },
                  evt,
                  true
                );
              });
              break;
            case 2:
              selectedModels.forEach((element) => {
                //推送信息进入总线
                this.editor.bus.push(
                  DDeiEnumBusCommandType.ModelChangeValue,
                  {
                    mids: [element.id],
                    paths: [
                      "border.color",
                      "border.top.color",
                      "border.bottom.color",
                      "border.left.color",
                      "border.right.color",
                    ],
                    value: color,
                  },
                  evt,
                  true
                );
              });
              break;
            case 3:
              selectedModels.forEach((element) => {
                //推送信息进入总线
                this.editor.bus.push(
                  DDeiEnumBusCommandType.ModelChangeValue,
                  { mids: [element.id], paths: ["font.color"], value: color },
                  evt,
                  true
                );
              });
              break;
          }
          this.editor.bus.push(
            DDeiEnumBusCommandType.StageChangeSelectModels,
            null,
            evt
          );
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, evt);
          this.editor.bus.executeAll();
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
.ddei_editor_qcview {
  height: 16px;
  background: rgb(245, 245, 245);
  border: 0.5pt solid rgb(235, 235, 239);
  display: flex;
  position: relative;
}

.ddei_editor_qcview_type {
  flex: 0 0 30px;
  height: 14px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ddei_editor_qcview_type:hover {
  background: rgb(235, 235, 239);
  cursor: pointer;
}

.ddei_editor_qcview_type img {
  display: block;
  float: left;
}

.ddei_editor_qcview_color {
  flex: 1 1 15px;
  height: 13px;
  margin-left: 2px;
  margin-top: 1px;
}

.ddei_editor_qcview_color_disabled {
  background-color: grey !important;
}

.ddei_editor_qcview_color:hover {
  outline: 0.5px solid #017fff;
  box-sizing: border-box;
  outline-offset: 0.5px;
}
</style>
