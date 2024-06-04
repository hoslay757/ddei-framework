
import DDeiUtil from "../../framework/js/util";
import DDei from "../../framework/js/ddei";
import DDeiActiveType from "./enums/active-type";
import DDeiFileState from "./enums/file-state";
import DDeiSheet from "./sheet";
import { debounce } from "lodash";
/**
 * DDei文件，文件包含了多个页签
 */
class DDeiFile {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.id = props.id
    this.name = props.name
    this.path = props.path
    this.sheets = props.sheets ? props.sheets : []
    this.currentSheetIndex = props.currentSheetIndex || props.currentSheetIndex == 0 ? props.currentSheetIndex : -1;
    this.state = props.state ? props.state : DDeiFileState.NONE
    this.active = props.active ? props.active : DDeiActiveType.NONE
    this.lastUpdateTime = props.lastUpdateTime ? props.lastUpdateTime : new Date().getTime()
    this.publish = props.publish ? props.publish : "0"
    this.desc = props.desc ? props.desc : ""
    this.extData = props.extData ? props.extData : {}
    this.busiData = props.busiData

    this.closeLocalFile = debounce(this.closeLocalFile, 1000)
  }
  // ============================ 静态变量 ============================

  static loadFromJSON(json, tempData: object = {}): DDeiFile {
    let model: DDeiFile = new DDeiFile(json);
    let sheets = []
    //获取当前dpi缩放，不同终端编辑可能造成dpi不一致，因此需要对比还原
    let dpi;
    if(DDei.INSTANCE_POOL.size > 0){
      dpi = Array.from(DDei.INSTANCE_POOL.values())[0].dpi?.x
    }
    if (!dpi){
      dpi = DDeiUtil.getDPI().x;
    }
    for (let i = 0; i < model.sheets.length; i++) {
      //执行转换，将存储的标尺坐标转换为网页坐标
      // let dpi = model.sheets[i].stage.dpi;
      let unit = model.sheets[i].stage.unit;
      //只有保存了dpi和unit才需要转换,并且unit为像素也不需要转换
      if(dpi && unit && unit != 'px'){
        model.sheets[i]?.stage?.layers?.forEach(layer => {
          DDeiFile.convertChildrenJsonUnit(layer, model.sheets[i]?.stage,unit);
        });
      }
      sheets[i] = DDeiSheet.loadFromJSON(model.sheets[i], tempData);
    }
    model.sheets = sheets;
    model.calModelNumber()
    return model;
  }

  static convertChildrenJsonUnit(container:object,stage:object,unit:string):void{
    if (container.midList){
      for (let i = 0; i < container.midList.length;i++){
        if (container.models[container.midList[i]]){
          let model = container.models[container.midList[i]];
          if (model.cpv) {
            let cpv = DDeiUtil.toPageCoord({ x: model.cpv.x, y: model.cpv.y }, stage, unit)
            model.cpv.x = cpv.x
            model.cpv.y = cpv.y
          }

          if (model.bpv) {
            let bpv = DDeiUtil.toPageCoord({ x: model.bpv.x, y: model.bpv.y }, stage, unit)
            model.bpv.x = bpv.x
            model.bpv.y = bpv.y
          }
          if (model.hpv) {
            for (let k = 0; k < model.hpv.length; k++) {
              let hpv = DDeiUtil.toPageCoord({ x: model.hpv[k].x, y: model.hpv[k].y }, stage, unit)
              model.hpv[k].x = hpv.x
              model.hpv[k].y = hpv.y
            }
          }
          if (model.exPvs) {
            for (let k in model.exPvs) {
              let pv = DDeiUtil.toPageCoord({ x: model.exPvs[k].x, y: model.exPvs[k].y }, stage, unit)
              model.exPvs[k].x = pv.x
              model.exPvs[k].y = pv.y
            }
          }
          if (model.pvs) {
            for (let k = 0; k < model.pvs.length; k++) {
              let pv = DDeiUtil.toPageCoord({ x: model.pvs[k].x, y: model.pvs[k].y }, stage, unit)
              model.pvs[k].x = pv.x
              model.pvs[k].y = pv.y
            }
          }
          
          
          
          //如果是容器则递归处理其子控件
          DDeiFile.convertChildrenJsonUnit(model, stage, unit);
        }
      }
    }
    
  }
  // ============================ 属性 ============================
  //文件ID
  id: number;
  // 文件的名称，不包含扩展名
  name: string;
  // 文件的描述
  desc: string = "";
  //额外数据，存储额外的业务关键信息
  extData: object;
  //业务数据，用于替换显示内容，不会被存储
  busiData: object;
  // 当前实例的状态
  state: DDeiFileState;

  //激活状态
  active: DDeiActiveType;

  //发布状态
  publish: string = "0";

  //最后修改时间
  lastUpdateTime: number = new Date().getTime();

  //文件的完整路径
  path: string;

  //文件包含的页签
  sheets: DDeiSheet[];

  //当前所在页签
  currentSheetIndex: number;

  //当前模型的类型
  modelType: string = "DDeiFile";

  //操作日志，用于保存、撤销和恢复
  histroy: object[] = []

  //当前文件的模型数量
  modelNumber: number = 0;
  histroyIdx: number = -1;

  unicode: string = DDeiUtil.getUniqueCode()

  // ============================ 方法 ============================

  /**
   * 计算当前文件的模型总数量
   */
  calModelNumber(): number {
    let num = 0;
    //统计所有sheet下的所有数量
    this.sheets.forEach(sheet => {
      num += sheet.calModelNumber();
    })
    this.modelNumber = num
    return num;
  }

  /**
   * 切换sheet
   * @param index 下标
   */
  changeSheet(index: number): void {
    if (index < 0) {
      index = 0
    }
    for (let i = 0; i < this.sheets.length; i++) {
      let sheet = this.sheets[i]
      if (i != index) {
        sheet.active = DDeiActiveType.NONE;
      } else {
        sheet.active = DDeiActiveType.ACTIVE;
        this.currentSheetIndex = index
      }
    }
  }

  /**
   * 初始化日志，记录初始化状态
   */
  initHistroy() {
    if (this.histroy.length == 0 && this.histroyIdx == -1) {
      this.histroy.push({ time: new Date().getTime(), data: JSON.stringify(this.toJSON()) })
      this.histroyIdx = 0
    }
  }
  /**
   * 记录日志
   * @param layerIndex 图层下标
   */
  addHistroy(data: object) {
    //抛弃后面的记录
    if (this.histroyIdx == -1) {
      this.histroy = this.histroy.slice(0, 1)
      this.histroyIdx = 0
    } else {
      this.histroy = this.histroy.slice(0, this.histroyIdx + 1)
    }
    //插入新纪录，并设置下标到最后
    this.histroy.push({ time: new Date().getTime(), data: data });

    this.histroyIdx = this.histroy.length - 1;
  }

  /**
   * 返回上一个历史数据，并将下标-1
   * @param layerIndex 图层下标
   */
  revokeHistroyData() {
    //抛弃后面的记录
    if (this.histroyIdx != -1) {
      this.histroyIdx--;
      if (this.histroyIdx == -1) {
        this.histroyIdx = 0
        return this.histroy[0];
      } else {
        return this.histroy[this.histroyIdx];
      }
    }
  }

  /**
   * 撤销上一次撤销并将下标+1
   * @param layerIndex 图层下标
   */
  reRevokeHistroyData() {
    //抛弃后面的记录
    if (this.histroyIdx < this.histroy.length - 1) {
      this.histroyIdx++;
      return this.histroy[this.histroyIdx];
    }
  }

  /**
   * 写入本地文件
   */
  async writeLocalFile(data) {
    if (!this.writeLocalQueue) {
      this.writeLocalQueue = []
    }
    if (this.localWriteLock == 1) {
      this.writeLocalQueue.push(data)
    } else {
      if (!this.localFileWriter) {
        this.localFileWriter = await this.localFileHandler.createWritable();
      }
      await this.localFileWriter.write(data)
      this.closeLocalFile()
    }
  }

  async closeLocalFile() {

    if (this.localFileWriter) {
      this.localWriteLock = 1
      await this.localFileWriter.close();
      delete this.localFileWriter
      this.localWriteLock = 0
      if (this.writeLocalQueue.length > 0) {
        this.writeLocalFile(this.writeLocalQueue[this.writeLocalQueue.length - 1])
        this.writeLocalQueue = []
      }
    }

  }

  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    for (let i in this) {
      if (i == 'active' || i == 'histroy' || i == 'histroyIdx' || i == 'busiData') {
        continue;
      }
      if (this[i] || this[i] == 0) {
        if (Array.isArray(this[i])) {
          let array = [];
          this[i].forEach(element => {
            if (element?.toJSON) {
              array.push(element.toJSON());
            } else {
              array.push(element);
            }
          });
          json[i] = array;
        } else if (this[i].set && this[i].has) {
          let map = {};
          this[i].forEach((element, key) => {
            if (element?.toJSON) {
              map[key] = element.toJSON();
            } else {
              map[key] = element;
            }
          });
          json[i] = map;
        } else if (this[i].toJSON) {
          json[i] = this[i].toJSON();
        } else {
          json[i] = this[i];
        }
      }
    }
    //写入版本号
    json.ddeiVersion = 1237
    return json;
  }
}
export {DDeiFile}
export default DDeiFile