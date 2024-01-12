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
    this.exmapping = props.exmapping;
    this.cascadeDisplay = props.cascadeDisplay;
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

  //特殊控件的值映射字段
  exmapping: string[];
  //单个元素的样式，用于combox等控件控制样式
  itemStyle: object | null = null;
  //是否允许搜索
  canSearch: boolean = false;
  //数字框每次增加数
  step: number = 1;
  //联动显示的配置
  cascadeDisplay: object | null = null;
  // ============================ 方法 ===============================


  /**
   * 根据当前的值,更新配置信息
   */
  doCascadeDisplayByValue(): void {
    let cascadeDisplayConfig = null;
    if (this.cascadeDisplay) {
      if (this.cascadeDisplay[this.value]) {
        cascadeDisplayConfig = this.cascadeDisplay[this.value]
      } else {
        if (this.value && this.value != '' && this.value != '0' && this.value != 0) {
          cascadeDisplayConfig = this.cascadeDisplay['notempty']
        } else if (this.value == null && this.defaultValue) {
          cascadeDisplayConfig = this.cascadeDisplay['default']
        } else {
          cascadeDisplayConfig = this.cascadeDisplay['empty']
        }

      }
    }
    //获取联动控件
    if (cascadeDisplayConfig?.show?.length > 0) {
      DDeiEditorArrtibute.showAttributesByCode(
        this.topGroup,
        cascadeDisplayConfig.show
      );
    }
    if (cascadeDisplayConfig?.hidden?.length > 0) {
      DDeiEditorArrtibute.hiddenAttributesByCode(
        this.topGroup,
        cascadeDisplayConfig.hidden
      );
    }

  }

  /**
   * 
   * @param propTopGroup 隐藏属性
   * @param paths 
   */
  static hiddenAttributesByCode(propTopGroup: object, ...paths: string): object | null {
    if (propTopGroup?.subGroups?.length > 0 && paths) {
      propTopGroup.subGroups.forEach(group => {
        if (group?.children?.length > 0) {
          group.children.forEach(item => {
            paths.forEach(path => {
              if (path.indexOf(item.code) != -1) {
                item.visiable = false;
              }
            });
          });
        }
      });
    }
  }

  /**
   * 显示属性
   * @param propTopGroup 
   * @param paths 
   */
  static showAttributesByCode(propTopGroup: object, ...paths: string): object | null {
    if (propTopGroup?.subGroups?.length > 0 && paths) {
      propTopGroup.subGroups.forEach(group => {
        if (group?.children?.length > 0) {
          group.children.forEach(item => {
            paths.forEach(path => {
              if (path.indexOf(item.code) != -1) {
                item.visiable = true;
              }
            });

          });
        }
      });
    }
  }



}





export default DDeiEditorArrtibute
