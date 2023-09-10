import DDeiArrtibuteDefine from "@/components/framework/js/models/attribute/attribute-define"


/**
 * 属性定义，包含了编辑器额外的属性扩展
 */
class DDeiEditorArrtibute extends DDeiArrtibuteDefine {
  // ============================ 构造函数 ===============================
  constructor(props: object) {
    super(props);
    this.group = props.group;
    this.controlType = props.controlType ? props.controlType : "text";
    this.orderNo = props.orderNo;
    this.visiable = props.visiable == false ? false : true;
    this.value = props.value ? props.value : null;
    this.display = props.display ? props.display : "row";
    this.hiddenTitle = props.hiddenTitle ? props.hiddenTitle : false;
    this.step = props.step ? props.step : 1;
    this.itemStyle = props.itemStyle ? props.itemStyle : null;
    this.canSearch = props.canSearch ? props.canSearch : false;
  }
  // ============================ 属性 ===============================
  //属性所在分组
  group: string;
  //控件类型，用来编辑属性时的控件
  controlType: string;
  // 顺序号
  orderNo: number | null;
  //是否隐藏
  visiable: boolean;
  //当出现值不同时，记录由不同备选值
  diffValues: object[] = [];
  //隐藏标题，为true时不会显示属性标题，默认false不隐藏标题
  hiddenTitle: boolean;
  //控件显示模式，有row（横向排列）和column（纵向排列）两个选项，默认row
  display: string;
  //当前属性值
  value: object | null = null;

  //单个元素的样式，用于combox等控件控制样式
  itemStyle: object | null = null;
  //是否允许搜索
  canSearch: boolean = false;
  //数字框每次增加数
  step: number = 1;
  // ============================ 方法 ===============================
}




export default DDeiEditorArrtibute
