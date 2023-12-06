<template>
  <div :id="id" class="ddei_editor_canvasview" @mousedown="mouseDown($event)" ondragstart="return false;"
    @mousewheel="mouseWheel($event)" @dragover="createControlOver" @drop="createControlDrop"
    @dragleave="createControlCancel" @dblclick="canvasDBClick" @contextmenu.prevent>
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
import DDeiStage from "@/components/framework/js/models/stage";
import DDeiEditorUtil from "../js/util/editor-util";
import DDeiEnumKeyActionInst from "../js/enums/key-action-inst";

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
    ddInstance.applyConfig(this.editor.extConfig);
    //初始化编辑器bus
    ddInstance.bus.invoker = this.editor;
    this.editor.bus = ddInstance.bus;
    //基于参数打开一个文件或一组文件
    let loadFile = DDeiEditorUtil.getConfigValue(
      "EVENT_LOAD_FILE",
      this.editor
    );
    if (loadFile) {
      loadFile().then((fileData) => {
        //当前已打开的文件
        let file = null;
        //查看当前file是否已打开
        for (let x = 0; x < this.editor.files.length; x++) {
          if (this.editor.files[x].id == fileData.id) {
            file = this.editor.files[x];
          }
          this.editor.files[x].active = DDeiActiveType.NONE;
        }
        //加载文件
        if (!file) {
          if (fileData?.content) {
            file = DDeiFile.loadFromJSON(JSON.parse(fileData?.content), {
              currentDdInstance: this.editor.ddInstance,
            });
            file.id = fileData.id;
            file.publish = fileData.publish;
            file.name = fileData.name;
            file.path = fileData.path;
            file.desc = fileData.desc;
            file.version = fileData.version;
            file.extData = fileData.extData;
            file.busiData = fileData.busiData;
          } else {
            file = new DDeiFile({
              id: fileData.id,
              publish: fileData.publish,
              name: fileData.name,
              path: fileData.path,
              desc: fileData.desc,
              version: fileData.version,
              extData: fileData.extData,
              busiData: fileData.busiData,
              sheets: [
                new DDeiSheet({
                  name: "新建页面",
                  desc: "新建页面",
                  stage: DDeiStage.initByJSON(
                    { id: "stage_1" },
                    { currentDdInstance: ddInstance }
                  ),
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

        this.editor.currentFileIndex = this.editor.files.indexOf(file);
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
              x:
                -(
                  stage.width -
                  ddInstance.render.canvas.width / ddInstance.render.ratio
                ) / 2,
              y:
                -(
                  stage.height -
                  ddInstance.render.canvas.height / ddInstance.render.ratio
                ) / 2,
              z: 0,
            };
          }
          this.editor.changeState(DDeiEditorState.DESIGNING);
          ddInstance.bus.push(DDeiEditorEnumBusCommandType.ClearTemplateUI);
          ddInstance.bus.push(DDeiEnumBusCommandType.RefreshShape);
          ddInstance.bus.push(DDeiEditorEnumBusCommandType.RefreshEditorParts);
          ddInstance.bus.executeAll();
        }
      });
    }
  },
  methods: {
    /**
     * 画布双击
     */
    canvasDBClick(evt) {
      let middleCanvas = document.getElementById(this.id);
      let middleCanvasPos = DDeiUtil.getDomAbsPosition(middleCanvas);
      if (
        middleCanvasPos.left + 5 <= evt.clientX &&
        middleCanvasPos.left + middleCanvas.offsetWidth - 5 >= evt.clientX
      ) {
        DDeiEnumKeyActionInst.StartQuickEdit.action(
          evt,
          this.editor.ddInstance
        );
      }
    },
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
        evt.cancelBubble = true;
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
        if (this.editor.state == DDeiEditorState.QUICK_EDITING) {
          //判定落点是否在正在编辑的影子控件上，如果是则识别坐标，制作选中效果
          if (this.editor?.ddInstance?.stage?.render?.editorShadowControl) {
            let stage = this.editor?.ddInstance?.stage;
            let rat1 = stage.ddInstance.render.ratio;
            let ex = evt.offsetX;
            let ey = evt.offsetY;
            ex -= stage.wpv.x;
            ey -= stage.wpv.y;
            let shadowControl =
              this.editor?.ddInstance?.stage?.render?.editorShadowControl;
            if (shadowControl?.isInAreaLoose(ex, ey)) {
              let cx = (ex - shadowControl.cpv.x) * rat1;
              let cy = (ey - shadowControl.cpv.y) * rat1;
              //先判断行，再判断具体位置
              //textUsedArea记录的是基于中心点的偏移量
              let startIndex = 0;
              let sx = 0;
              let i = 0;
              for (; i < shadowControl.render.textUsedArea.length; i++) {
                let rowData = shadowControl.render.textUsedArea[i];
                if (cy >= rowData.y && cy <= rowData.y + rowData.height) {
                  if (cx >= rowData.x && cx <= rowData.x + rowData.width) {
                    //判断位于第几个字符，求出光标的开始位置
                    let endI = startIndex + rowData.text.length;
                    for (let x = startIndex; x < endI; x++) {
                      let fx = shadowControl.render.textUsedArea[0].textPosCache[x].x;
                      let lx = x < endI - 1 ? shadowControl.render.textUsedArea[0].textPosCache[x + 1].x : rowData.x + rowData.width
                      let halfW = (lx - fx) / 2
                      if (cx >= fx && cx < lx) {
                        if (cx > fx + halfW) {
                          sx = x + 1
                        } else {
                          sx = x;
                        }
                        break;
                      }
                    }
                  }
                  if (!sx) {
                    if (ex < shadowControl.cpv.x) {
                      sx = startIndex
                    } else {
                      sx = startIndex + rowData.text.length;
                    }
                  }
                  break;
                }
                startIndex += rowData.text.length
              }
              if (!sx) {
                if (ex < shadowControl.cpv.x) {
                  sx = 0
                } else {
                  sx = startIndex + shadowControl.render.textUsedArea[i - 1].text.length;
                }
              }
              let editorText = DDeiUtil.getEditorText();
              editorText.selectionStart = sx
              editorText.selectionEnd = sx
              setTimeout(() => {
                editorText.focus()
              }, 10);

              this.editor.bus.push(DDeiEnumBusCommandType.RefreshShape);
              this.editor.bus.executeAll();
              this.editor.ddInstance.stage.render.tempTextStart = editorText.selectionStart
              this.editor.ddInstance.stage.render.operateState = DDeiEnumOperateState.QUICK_EDITING_TEXT_SELECTING;
              return;
            }
          }
        }

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
            stage.render.currentOperateShape = control;
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
                let ex1 = e.offsetX;
                let ey1 = e.offsetY;
                let rat1 = ddInstance.render?.ratio;
                let canvasWidth = ddInstance.render.canvas.width / rat1;
                let canvasHeight = ddInstance.render.canvas.height / rat1;
                //判断是否在边缘
                if (ex1 < 50) {
                  ddInstance.render.inEdge = 4;
                } else if (ex1 > canvasWidth - 50) {
                  ddInstance.render.inEdge = 2;
                } else if (ey1 < 50) {
                  ddInstance.render.inEdge = 1;
                } else if (ey1 > canvasHeight - 50) {
                  ddInstance.render.inEdge = 3;
                } else {
                  ddInstance.render.inEdge = 0;
                }
                if (!ddInstance.render.inEdge) {
                  //显示辅助对齐线、坐标文本等图形
                  let selectedModels: Map<string, DDeiAbstractShape> =
                    new Map();
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
                      DDeiAbstractShape.findBottomContainersByArea(
                        layer,
                        ex,
                        ey
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

                  //渲染图形
                  this.editor?.bus?.push(DDeiEnumBusCommandType.RefreshShape);
                }
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
                }
              );
            }
          }
          //移除其他选中
          this.editor.bus.push(
            DDeiEnumBusCommandType.CancelCurLevelSelectedModels,
            { container: layer, curLevel: true }
          );

          this.editor.bus.push(DDeiEnumBusCommandType.ModelChangeSelect, [
            {
              id: this.editor.creatingControl.id,
              value: DDeiEnumControlState.SELECTED,
            },
          ]);
          this.editor.bus.push(DDeiEnumBusCommandType.StageChangeSelectModels);

          this.editor.bus.push(DDeiEnumBusCommandType.NodifyControlCreated, {
            models: [this.editor.creatingControl],
          });
          //清除临时变量
          this.editor.bus.push(DDeiEnumBusCommandType.ClearTemplateVars);
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
