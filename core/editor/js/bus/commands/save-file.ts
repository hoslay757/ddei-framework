
import type DDeiBus from '@ddei-core/framework/js/bus/bus';
import DDeiEditorEnumBusCommandType from '../../enums/editor-command-type';
import DDeiBusCommand from '@ddei-core/framework/js/bus/bus-command';
import DDeiActiveType from '../../enums/active-type';
import DDeiStoreLocal from '@ddei-core/framework/js/store/local-store';
import DDeiFileState from '../../enums/file-state';
import DDeiEditor from '../../editor';
import DDeiFile from '../../file';
import DDeiConfig from '@ddei-core/framework/js/config';
import DDeiEditorUtil from '../../util/editor-util';
import DDeiUtil from '@ddei-core/framework/js/util';
/**
 * 保存文件的总线Command
 */
class DDeiEditorCommandSaveFile extends DDeiBusCommand {
  // ============================ 构造函数 ============================

  // ============================ 静态方法 ============================

  // ============================ 属性 ===============================

  // ============================ 方法 ===============================
  /**
   * 前置行为，用于校验,本Command无需校验
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  before(data: object, bus: DDeiBus, evt: Event): boolean {
    return true;
  }

  /**
   * 具体行为，设置当前控件的选中状态
   * @param data bus分发后，当前承载的数据
   * @param bus 总线对象引用
   * @param evt 事件对象引用
   */
  action(data: object, bus: DDeiBus, evt: Event): boolean {
    let editor = bus.invoker;
    if (editor?.files.length > 0 && (editor.currentFileIndex == 0 || editor.currentFileIndex)) {
      let file = editor?.files[editor.currentFileIndex]
      if (file?.active == DDeiActiveType.ACTIVE) {
        if (file?.state == DDeiFileState.NEW || file?.state == DDeiFileState.MODIFY || data.publish == 1) {
          let oldState = file.state;
          file.lastUpdateTime = new Date().getTime()
          let json = file.toJSON();
          if (json) {
            //调用转换器，将输入内容转换为设计器能够识别的格式
            let converters = editor.getEnabledConverters(json,2);
            //依次调用converters
            converters?.forEach(converter => {
              json = converter.output(json)
            });
            json.state = DDeiFileState.NONE;
            let storeIns = new DDeiStoreLocal();
            //本地保存一份
            try {
              storeIns.save(file.id, json).then((data) => {

              });
            } catch (e) {
              console.error(e);
            }
            if (data.publish == 1) {
              file.state = DDeiFileState.PUBLISHING
              //调用SPI进行发布
              let publishFile = DDeiEditorUtil.getConfigValue(
                "EVENT_PUBLISH_FILE",
                editor
              );
              if (publishFile) {
                //生成缩略图
                DDeiUtil.stageScreenToImage(bus.ddInstance, 400, 240).then(thumbBase64 => {
                  if (thumbBase64) {
                    json.thumb = thumbBase64
                  }
                  publishFile(json).then(data => {
                    if (data.result == 1) {
                      file.state = DDeiFileState.NONE;
                      //遍历histroy，修改当前的histroy记录为最新状态，去掉其它最新状态标记
                      file.histroy.forEach(his => {
                        if (his.isNew == true) {
                          delete his.isNew
                        }
                      });
                      //将当前的设置
                      file.histroy[file.histroyIdx].isNew = true;
                    } else if (data.result != 4) {
                      file.state = oldState
                    }
                  });
                })


              }
            } else {
              file.state = DDeiFileState.SAVING
              //调用SPI进行保存
              let saveFile = DDeiEditorUtil.getConfigValue(
                "EVENT_SAVE_FILE",
                editor
              );
              if (saveFile) {
                //生成缩略图
                DDeiUtil.stageScreenToImage(bus.ddInstance, 400, 240).then(thumbBase64 => {
                  if (thumbBase64) {
                    json.thumb = thumbBase64
                  }
                  saveFile(json, file).then(data => {
                    if (data.result == 1) {
                      file.state = DDeiFileState.NONE;
                      //遍历histroy，修改当前的histroy记录为最新状态，去掉其它最新状态标记
                      file.histroy.forEach(his => {
                        if (his.isNew == true) {
                          delete his.isNew
                        }
                      });
                      //将当前的设置
                      file.histroy[file.histroyIdx].isNew = true;

                      bus?.insert(DDeiEditorEnumBusCommandType.RefreshEditorParts, { parts: ['openfiles'] }, evt);
                      bus.executeAll();
                    } else if (data.result != 4) {
                      file.state = oldState
                    }
                  });
                })


              }
            }
          }
        }
      }
    }

    return true;

  }

  /**
   * 后置行为，分发，修改当前editor的状态
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
    return new DDeiEditorCommandSaveFile({ code: DDeiEditorEnumBusCommandType.SaveFile, name: "", desc: "" })
  }
}


export default DDeiEditorCommandSaveFile
