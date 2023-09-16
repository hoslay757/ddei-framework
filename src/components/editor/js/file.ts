
import DDeiUtil from "@/components/framework/js/util";
import DDeiActiveType from "./enums/active-type";
import type DDeiFileState from "./enums/file-state";
import DDeiSheet from "./sheet";

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
  }
  // ============================ 静态变量 ============================

  static loadFromJSON(json, tempData: object = {}): any {
    let model = new DDeiFile(json);
    let sheets = []
    for (let i = 0; i < model.sheets.length; i++) {
      sheets[i] = DDeiSheet.loadFromJSON(model.sheets[i], tempData);
    }
    model.sheets = sheets;
    return model;
  }
  // ============================ 属性 ============================
  //文件ID
  id: number;
  // 文件的名称，不包含扩展名
  name: string;
  // 当前实例的状态
  state: DDeiFileState;

  //激活状态
  active: DDeiActiveType;

  //文件的完整路径
  path: string;

  //文件包含的页签
  sheets: DDeiSheet[];

  //当前所在页签
  currentSheetIndex: number;

  //当前模型的类型
  modelType: string = "DDeiFile";

  // ============================ 方法 ============================
  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    for (let i in this) {
      if (i == 'active') {
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
        } else if (this[i].set) {
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
    return json;
  }
}

export default DDeiFile