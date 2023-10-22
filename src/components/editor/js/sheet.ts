import DDeiActiveType from "./enums/active-type";
import DDeiStage from "@/components/framework/js/models/stage";

/**
 * DDei页签，文件包含了多个页签
 */
class DDeiSheet {
  // ============================ 构造函数 ============================
  constructor(props: object) {
    this.name = props.name
    this.desc = props.desc
    this.stage = props.stage;
    this.active = props.active ? props.active : DDeiActiveType.NONE
  }
  // ============================ 静态变量 ============================
  static loadFromJSON(json, tempData: object = {}): any {
    let sheet = new DDeiSheet(json);
    let stage = DDeiStage.loadFromJSON(sheet.stage, tempData)
    sheet.stage = stage;
    return sheet;
  }
  // ============================ 属性 ===============================
  //页签名称
  name: string;
  //页签描述
  desc: string;
  //舞台对象
  stage: DDeiStage;
  // 页签的激活状态
  active: DDeiActiveType;
  //当前模型的类型
  modelType: string = "DDeiSheet";


  // ============================ 方法 ============================

  // ============================ 方法 ============================
  /**
     * 将模型转换为JSON
     */
  toJSON(): Object {
    let json: Object = new Object();
    for (let i in this) {

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
    return json;
  }
}

export default DDeiSheet