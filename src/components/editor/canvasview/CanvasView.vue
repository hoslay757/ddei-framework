<template>
  <div :id="id"
       class="ddei_editor_canvasview"
       @mousedown="mouseDown($event)"
       ondragstart="return false;"
       @mousewheel="mouseWheel($event)"
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
import DDeiEnumControlState from "../../framework/js/enums/control-state";
import DDeiAbstractShape from "@/components/framework/js/models/shape";
import DDeiKeyAction from "../js/hotkeys/key-action";
import DDeiEnumOperateState from "@/components/framework/js/enums/operate-state";
import DDeiEnumBusCommandType from "../../framework/js/enums/bus-command-type";
import DDeiEnumState from "../../framework/js/enums/ddei-state";
import DDeiUtil from "../../framework/js/util";
import DDeiFile from "../js/file";
import DDeiSheet from "../js/sheet";
import { MODEL_CLS } from "../../framework/js/config";
import DDeiFileState from "../js/enums/file-state";
import DDeiActiveType from "../js/enums/active-type";
import { throttle } from "lodash";
import DDeiEditorEnumBusCommandType from "../js/enums/editor-command-type";

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
    this.mouseWheelThrottle = throttle(this.mouseWheelThrottle, 10);
  },
  mounted() {
    //获取编辑器
    this.editor = DDeiEditor.ACTIVE_INSTANCE;
    //初始化ddInstance
    let ddInstance = DDei.newInstance(
      "ddei_editor_view",
      "ddei_editor_canvasview"
    );
    this.editor.ddInstance = ddInstance;
    //初始化编辑器bus
    ddInstance.bus.invoker = this.editor;
    this.editor.bus = ddInstance.bus;
    //基于参数打开一个文件或一组文件

    DDeiEditor.loadFile().then((fileData) => {
      //当前已打开的文件
      let file = null;
      //查看当前file是否已打开
      for (let x = 0; x < this.editor.files.length; x++) {
        if (this.editor.files[x].id == fileData.id) {
          file = this.editor.files[x];
        }
        this.editor.files[x].active = DDeiActiveType.NONE;
      }
      //当前文件已存在
      if (!file) {
        if (fileData?.content) {
          file = DDeiFile.loadFromJSON(JSON.parse(fileData?.content), {
            currentDdInstance: this.editor.ddInstance,
          });
          file.id = fileData.id;
          file.name = fileData.name;
          file.path = fileData.path;
          file.desc = fileData.desc;
        } else {
          file = new DDeiFile({
            id: fileData.id,
            name: fileData.name,
            path: fileData.path,
            desc: fileData.desc,
            sheets: [
              new DDeiSheet({
                name: "新建页面",
                desc: "新建页面",
                stage: ddInstance.stage,
                active: DDeiActiveType.ACTIVE,
              }),
            ],
            currentSheetIndex: 0,
            state: DDeiFileState.NEW,
            active: DDeiActiveType.ACTIVE,
          });
        }

        this.editor.addFile(file);
        file.state = DDeiFileState.NONE;
      }
      this.editor.currentFileIndex = this.editor.files.length - 1;
      file.active = DDeiActiveType.ACTIVE;
      let sheets = file?.sheets;

      if (file && sheets && ddInstance) {
        file.changeSheet(file.currentSheetIndex);

        let stage = sheets[file.currentSheetIndex].stage;
        stage.ddInstance = ddInstance;
        //记录文件初始日志
        file.initHistroy();
        //刷新页面
        ddInstance.stage = stage;
        //加载场景渲染器
        stage.initRender();
        //设置视窗位置到中央
        if (!stage.wpv) {
          //缺省定位在画布中心点位置
          stage.wpv = {
            x: -(stage.width - ddInstance.render.container.clientWidth) / 2,
            y: -(stage.height - ddInstance.render.container.clientHeight) / 2,
            z: 0,
          };
        }
        this.editor.changeState(DDeiEditorState.DESIGNING);
        ddInstance.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
        ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
        ddInstance.bus.executeAll();
        this.editor.editorViewer?.forceRefreshBottomMenu();
        this.editor.editorViewer?.forceRefreshTopMenuView();
        this.editor.editorViewer?.forcePropertyView();
      }
    });
  },
  methods: {
    /**
     * 焦点进入当前区域
     */
    changeEditorFocus() {
      this.editor.changeState(DDeiEditorState.DESIGNING);
      this.editor.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
      this.editor.bus.executeAll();
      return true;
    },

    /**
     * 触控板滑动事件
     */
    mouseWheel(evt) {
      if (this.editor.state == DDeiEditorState.DESIGNING) {
        this.mouseWheelThrottle(evt);
        evt.preventDefault();
        return false;
      }
    },

    mouseWheelThrottle(evt) {
      this.editor.ddInstance.render.mouseWheel(evt);
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

        let ddInstance = this.editor.ddInstance;
        let stage = ddInstance.stage;
        let stageRatio = stage.getStageRatio();
        let ex = e.offsetX;
        let ey = e.offsetY;
        ex -= stage.wpv.x;
        ey -= stage.wpv.y;
        if (this.editor.creatingControl) {
          //当前激活的图层
          let layer = stage.layers[stage.layerIndex];
          if (layer) {
            stage.render.currentOperateContainer = layer;
            stage.render.operateState = DDeiEnumOperateState.CONTROL_CREATING;
            let control = this.editor.creatingControl;
            //在画布上创建临时对象
            if (!layer.models.has(control.id)) {
              this.editor.bus.push(
                DDeiEnumBusCommandType.ModelChangeContainer,
                { newContainer: layer, models: [control] },
                e
              );
              //记录当前的拖拽的x,y,写入dragObj作为临时变量

              let dragObj = {
                x: ex,
                y: ey,
                dx: 0, //鼠标在控件中心坐标的增量位置
                dy: 0,
                model: control,
                num: 0,
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
                  x: ex,
                  y: ey,
                  dx: dragObj.dx,
                  dy: dragObj.dy,
                  dragObj: dragObj,
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
                //显示辅助对齐线、坐标文本等图形
                let selectedModels: Map<string, DDeiAbstractShape> = new Map();
                selectedModels.set(control.id, control);

                //修改辅助线
                this.editor?.bus?.push(
                  DDeiEnumBusCommandType.SetHelpLine,
                  { models: selectedModels },
                  e
                );

                this.editor.bus.push(
                  DDeiEnumBusCommandType.ModelChangePosition,
                  {
                    models: [control],
                    x: ex,
                    y: ey,
                    dx: 0,
                    dy: 0,
                    dragObj: ddInstance.stage.render.dragObj,
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
                    DDeiAbstractShape.findBottomContainersByArea(layer, ex, ey);
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

                //渲染图形
                this.editor?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
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
        let ddInstance = this.editor.ddInstance;
        let stage = ddInstance.stage;
        let ex = e.offsetX;
        let ey = e.offsetY;
        let stageRatio = stage.getStageRatio();
        ex -= stage.wpv.x;
        ey -= stage.wpv.y;
        if (this.editor.creatingControl) {
          let isAlt = DDeiEditor.KEY_DOWN_STATE.get("alt");
          let ddInstance: DDei = this.editor.ddInstance;
          ddInstance.stage.idIdx++;
          let layer = ddInstance.stage.layers[ddInstance.stage.layerIndex];
          //如果按下了alt键，则移入容器
          if (isAlt) {
            //寻找鼠标落点当前所在的容器
            let mouseOnContainers: DDeiAbstractShape[] =
              DDeiAbstractShape.findBottomContainersByArea(layer, ex, ey);
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
          this.editor.bus.push(DDeiEnumBusCommandType.NodifyChange);
          this.editor.bus.push(DDeiEnumBusCommandType.AddHistroy);
          //渲染图形
          this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
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
          layer.removeModel(this.editor.creatingControl);

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
