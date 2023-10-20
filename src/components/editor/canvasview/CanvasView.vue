<template>
  <div :id="id"
       class="ddei_editor_canvasview"
       @mousedown="mouseDown($event)"
       ondragstart="return false;"
       @dragover="createControlOver"
       @drop="createControlDrop"
       @dragleave="createControlCancel"
       @contextmenu.prevent>
  </div>
</template>

<script lang="ts">
import DDei from "@/components/framework/js/ddei";
import DDeiEditor from "../js/editor";
import DDeiEditorState from "../js/enums/editor-state";
import DDeiConfig from "../../framework/js/config";
import DDeiEnumControlState from "../../framework/js/enums/control-state";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiKeyAction from "../js/hotkeys/key-action";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEnumState from "../../framework/js/enums/ddei-state";
import DDeiUtil from "../../framework/js/util";
import DDeiFile from "../js/file";
import DDeiSheet from "../js/sheet";
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiFileState from "../js/enums/file-state";
import DDeiActiveType from "../js/enums/active-type";
import { debounce } from "lodash";

export default {
  name: "DDei-Editor-CanvasView",
  extends: null,
  mixins: [],
  props: {
    id: {
      type: String,
      default: "ddei_editor_canvasview",
    },
  },
  data() {
    return {
      //当前编辑器
      editor: null,
    };
  },
  computed: {},
  watch: {},
  created() {
    // 监听obj对象中prop属性的变化
    this.$watch("editor.files.length", function (newVal, oldVal) {
      if (newVal == 0) {
        this.editor.ddInstance.render.hidden();
      } else {
        this.editor.ddInstance.render.show();
      }
    });
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //TODO基于参数打开一个文件或一组文件
    //创建一个新的文件
    let file = new DDeiFile({
      name: "新建文件",
      path: "/新建文件",
      sheets: [
        new DDeiSheet({
          name: "新建页面",
          desc: "新建页面",
          stage: DDeiStage.initByJSON({ id: "stage_1" }),
          active: DDeiActiveType.ACTIVE,
        }),
      ],
      currentSheetIndex: 0,
      state: DDeiFileState.NEW,
      active: DDeiActiveType.ACTIVE,
    });
    //添加文件
    this.editor.addFile(file);
    this.editor.currentFileIndex = 0;
    //初始化ddInstance,
    this.editor.ddInstance = DDei.newInstance(
      "ddei_editor_view",
      "ddei_editor_canvasview",
      file.sheets[file.currentSheetIndex].stage
    );
    file.sheets[file.currentSheetIndex].stage = this.editor.ddInstance.stage;
    //记录文件初始日志
    file.initHistroy();
    this.editor.ddInstance.bus.invoker = this.editor;
    this.editor.bus = this.editor.ddInstance.bus;
  },
  methods: {
    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.DESIGNING);
      return true;
    },

    mouseDown(evt) {
      let middleCanvas = document.getElementById(this.id);
      let middleCanvasPos = DDeiUtil.getDomAbsPosition(middleCanvas);
      if (
        middleCanvasPos.left + 5 <= evt.clientX &&
        middleCanvasPos.left + middleCanvas.offsetWidth - 5 >= evt.clientX
      ) {
        this.changeEditorFocus();
        this.editor.ddInstance.state = DDeiEnumState.NONE;
        this.editor.ddInstance.render.mouseDown(evt);
      }
    },

    /**
     * 拖拽元素移动
     */
    createControlOver(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        DDeiKeyAction.updateKeyState(e);
        if (this.editor.creatingControl) {
          let ddInstance = this.editor.ddInstance;
          //当前激活的图层
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          if (layer) {
            ddInstance.stage.render.currentOperateContainer = layer;
            ddInstance.stage.render.operateState =
              DDeiEnumOperateState.CONTROL_CREATING;
            let control = this.editor.creatingControl;
            //在画布上创建临时对象
            if (!layer.models.has(control.id)) {
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeContainer,
                { newContainer: layer, models: [control] },
                e
              );
              //给control设置stage，确保在初始化计算向量点时，可以获取当前stage的缩放因子
              control.stage = ddInstance.stage;
              // //计算向量点
              control.calRotatePointVectors();

              //记录当前的拖拽的x,y,写入dragObj作为临时变量
              let dragObj = {
                x: e.offsetX,
                y: e.offsetY,
                dx: 0, //鼠标在控件中心坐标的增量位置
                dy: 0,
                model: control,
              };
              this.editor.bus.push(
                DDeiEnumBusCommandType.UpdateDragObj,
                { dragObj: dragObj },
                e
              );
              //归零坐标
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangePosition,
                {
                  models: [control],
                  x: e.offsetX,
                  y: e.offsetY,
                  dx: dragObj.dx,
                  dy: dragObj.dy,
                },
                e
              );
              //设置新坐标
              //当前编辑器最外部容器的坐标 TODO 无限画布后需要转换为layer的视窗坐标
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangePosition,
                {
                  models: [control],
                  deltaX: e.offsetX - control.width * 0.5,
                  deltaY: e.offsetY - control.height * 0.5,
                },
                e
              );
              this.editor.bus.push(
                DDeiEnumBusCommandType.RefreshShape,
                null,
                e
              );
            } else {
              let dt = new Date().getTime();
              let isExec = true;
              //控制帧率
              if (!window.upTime) {
                window.upTime = dt;
              } else if (dt - window.upTime > 20) {
                window.upTime = dt;
              } else {
                isExec = false;
              }
              if (isExec) {
                this.editor.bus.push(
                  DDeiEnumBusCommandType.ModelChangePosition,
                  {
                    models: [control],
                    x: e.offsetX,
                    y: e.offsetY,
                    dx: 0,
                    dy: 0,
                  },
                  e
                );
                let isAlt = DDeiEditor.KEY_DOWN_STATE.get("alt");
                this.editor.bus.push(
                  DDeiEnumBusCommandType.ChangeSelectorPassIndex,
                  { passIndex: 10 },
                  e
                );
                let lastOnContainer = layer;
                if (isAlt) {
                  //寻找鼠标落点当前所在的容器
                  let mouseOnContainers =
                    DDeiAbstractShape.findBottomContainersByArea(
                      layer,
                      e.offsetX,
                      e.offsetY
                    );
                  if (mouseOnContainers && mouseOnContainers.length > 0) {
                    lastOnContainer =
                      mouseOnContainers[mouseOnContainers.length - 1];
                  }
                  //如果最小层容器不是当前容器，则修改鼠标样式，代表可能要移入
                  if (lastOnContainer != layer) {
                    this.editor.bus.push(
                      DDeiEnumBusCommandType.ChangeSelectorPassIndex,
                      { passIndex: 11 },
                      e
                    );
                  }
                }

                //显示辅助对齐线、坐标文本等图形
                let selectedModels: Map<string, DDeiAbstractShape> = new Map();
                selectedModels.set(control.id, control);

                //修改辅助线
                this.editor?.bus?.push(
                  DDeiEnumBusCommandType.SetHelpLine,
                  { models: selectedModels },
                  e
                );
                //渲染图形
                this.editor?.bus?.push(
                  DDeiEnumBusCommandType.RefreshShape,
                  null,
                  e
                );
              }
            }
            this.editor.bus.executeAll();
            e.preventDefault();
          }
        }
      }
    },

    /**
     * 拖拽元素放开
     */
    createControlDrop(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let isAlt = DDeiEditor.KEY_DOWN_STATE.get("alt");
          let ddInstance: DDei = this.editor.ddInstance;
          ddInstance.stage.idIdx++;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          //如果按下了alt键，则移入容器
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] =
              DDeiAbstractShape.findBottomContainersByArea(
                layer,
                e.offsetX,
                e.offsetY
              );
            let lastOnContainer = layer;
            if (mouseOnContainers && mouseOnContainers.length > 0) {
              lastOnContainer = mouseOnContainers[mouseOnContainers.length - 1];
            }
            //如果最小层容器不是当前容器，执行的移动容器操作
            if (lastOnContainer != layer) {
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeContainer,
                {
                  newContainer: lastOnContainer,
                  oldContainer: layer,
                  models: [this.editor.creatingControl],
                },
                e
              );
            }
          }
          //移除其他选中
          this.editor.bus.push(
            DDeiEnumBusCommandType.CancelCurLevelSelectedModels,
            { container: layer, curLevel: true },
            e
          );

          this.editor.bus.push(
            DDeiEnumBusCommandType.ModelChangeSelect,
            [
              {
                id: this.editor.creatingControl.id,
                value: DDeiEnumControlState.SELECTED,
              },
            ],
            e
          );

          //清除临时变量
          this.editor.bus.push(
            DDeiEnumBusCommandType.ClearTemplateVars,
            null,
            e
          );
          this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy, null, e);
          this.editor?.bus?.push(DDeiEnumBusCommandType.SetHelpLine, {}, e);
          //渲染图形
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, e);
          this.editor.creatingControl = null;
          //切换到设计器
          this.editor.state = DDeiEditorState.DESIGNING;
          this.editor.bus.executeAll();
        }
      }
    },

    /**
     * 拖拽元素离开，清空元素
     */
    createControlCancel(e) {
      if (this.editor.state == DDeiEditorState.CONTROL_CREATING) {
        if (this.editor.creatingControl) {
          let ddInstance: DDei = this.editor.ddInstance;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          //从layer中移除控件
          this.editor.bus.push(
            DDeiEnumBusCommandType.ModelChangeContainer,
            { oldContainer: layer, models: [this.editor.creatingControl] },
            e
          );
          //清除临时变量
          this.editor.bus.push(
            DDeiEnumBusCommandType.ClearTemplateVars,
            null,
            e
          );
          //渲染图形
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape, null, e);
          this.editor.bus.executeAll();
        }
      }
    },
  },
};
</script>

<style scoped>
.ddei_editor_canvasview {
  flex: 1;
}
</style>
