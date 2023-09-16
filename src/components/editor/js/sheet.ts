import DDeiActiveType from "./enums/active-type";
import type DDeiStage from "@/components/framework/js/models/stage";

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
}

export default DDeiSheet