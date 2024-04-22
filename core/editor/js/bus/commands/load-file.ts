
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiUtil from '@ddei-core/framework/js/util';
import DDeiEditorUtil from '../../util/editor-util';
import DDeiActiveType from '../../enums/active-type';
import DDeiFile from '../../file';
import DDeiSheet from '../../sheet';
import DDeiStage from '@ddei-core/framework/js/models/stage';
import DDeiFileState from '../../enums/file-state';
import DDeiEditorState from '../../enums/editor-state';
import DDeiEnumBusCommandType from '@ddei-core/framework/js/enums/bus-command-type';
/**
 * 加载文件的总线Command
 */
class DDeiEditorCommandLoadFile extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let editor = bus.invoker
    let ddInstance = editor.ddInstance;
    //基于参数打开一个文件或一组文件
    let loadFile = DDeiEditorUtil.getConfigValue(
      "EVENT_LOAD_FILE",
      editor
    );
    if (loadFile) {
      loadFile().then((fileData) => {
        //调用转换器，将输入内容转换为设计器能够识别的格式
        let converters = editor.getEnabledConverters(fileData,1);
        //依次调用converters
        converters?.forEach(converter => {
          fileData = converter.input(fileData)
        });
        if (fileData) {
          //当前已打开的文件
          let file = null;
          //查看当前file是否已打开
          for (let x = 0; x < editor.files.length; x++) {
            if (editor.files[x].id == fileData.id) {
              file = editor.files[x];
            }
            editor.files[x].active = DDeiActiveType.NONE;
          }
          //加载文件
          if (!file) {
            if (fileData?.content) {
              file = DDeiFile.loadFromJSON(JSON.parse(fileData?.content), {
                currentDdInstance: editor.ddInstance,
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

            editor.addFile(file);
            file.state = DDeiFileState.NONE;
          }

          editor.currentFileIndex = editor.files.indexOf(file);
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
            editor.changeState(DDeiEditorState.DESIGNING);
            ddInstance.bus.insert(DDeiEditorEnumBusCommandType.ClearTemplateUI, 0);
            ddInstance.bus.insert(DDeiEnumBusCommandType.RefreshShape, 1);
            ddInstance.bus.insert(DDeiEditorEnumBusCommandType.RefreshEditorParts, 2);
            ddInstance.bus.executeAll();
          }
        }
      });
    }
    return true;

  }

  /**
   * 后置行为，分发
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  after(data: object, bus: DDeiBus, evt: Event): boolean {

    return true;
  }

  /**
   * 返回当前实例
   * @returns 
   */
  static newInstance(): DDeiBusCommand {
    return new DDeiEditorCommandLoadFile({ code: DDeiEditorEnumBusCommandType.LoadFile, name: "", desc: "" })
  }

}


export default DDeiEditorCommandLoadFile
